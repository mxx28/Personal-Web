---
title: 从 Slurm 到 PyTorch DDP：一次 Pretraining 中的分布式训练流程记录
date: "2026-05-04"
description: "多机多卡 DDP 主线笔记：Slurm 启进程、NCCL 组网、按 rank 分片、DDP 梯度同步、累积与 no_sync、rank 0 与指标 all_reduce。"
---

这次 pretraining 使用的是比较标准的 **多机多卡 Distributed Data Parallel（DDP）** 训练结构。整体思路是：由 Slurm 启动多个 Python 进程，每个进程绑定一张 GPU，读取不同的数据 shard，并在反向传播时通过 DDP 自动同步梯度。

整体流程可以概括为：

```text
Slurm 启动多个训练进程
        ↓
每个进程获得 rank / local_rank / world_size
        ↓
每个进程绑定一张 GPU
        ↓
每个进程读取不同的数据 shard
        ↓
DDP 包装模型，并在 backward 时同步梯度
        ↓
rank 0 负责日志、checkpoint 等全局副作用
```

本文记录 `train.py` 中和分布式训练相关的主要逻辑，方便之后回顾整个 pretraining pipeline 是如何在多节点、多 GPU 环境下运行的。

---

## 1. 整体结构：一个 GPU 对应一个进程

这份训练代码采用的是典型的 DDP 数据并行模式：

```text
每张 GPU 对应一个 Python 进程；
每个进程运行同一份 train.py；
每个进程持有一份完整模型副本；
不同进程读取不同数据；
DDP 在 backward 阶段自动同步梯度。
```

例如使用：

```text
4 nodes × 4 GPUs/node = 16 GPUs
```

那么 Slurm 会启动 16 个 Python 训练进程：

```text
world_size = 16
rank = 0, 1, ..., 15
local_rank = 0, 1, 2, 3  # 每台机器内部重新编号
```

其中：

```text
rank       = 当前进程在整个训练集群中的全局编号
local_rank = 当前进程在本机上的编号，通常对应本机第几张 GPU
world_size = 总训练进程数，通常也等于总 GPU 数
```

以 `4 nodes × 4 GPUs/node` 为例，rank 映射大致如下：

```text
Node 0:
  local_rank 0 → rank 0  → GPU 0
  local_rank 1 → rank 1  → GPU 1
  local_rank 2 → rank 2  → GPU 2
  local_rank 3 → rank 3  → GPU 3

Node 1:
  local_rank 0 → rank 4  → GPU 0
  local_rank 1 → rank 5  → GPU 1
  local_rank 2 → rank 6  → GPU 2
  local_rank 3 → rank 7  → GPU 3

Node 2:
  local_rank 0 → rank 8  → GPU 0
  local_rank 1 → rank 9  → GPU 1
  local_rank 2 → rank 10 → GPU 2
  local_rank 3 → rank 11 → GPU 3

Node 3:
  local_rank 0 → rank 12 → GPU 0
  local_rank 1 → rank 13 → GPU 1
  local_rank 2 → rank 14 → GPU 2
  local_rank 3 → rank 15 → GPU 3
```

也就是说，所有进程运行的是同一份代码，但因为环境变量不同，每个进程会获得不同的身份和 GPU 绑定。

---

## 2. 初始化分布式通信环境

在 `train.py` 中，分布式训练首先通过 `torch.distributed` 初始化：

```python
dist.init_process_group("nccl")

rank = dist.get_rank()
world_size = dist.get_world_size()
local_rank = int(os.environ.get("LOCAL_RANK", 0))
```

这里的核心是：

```python
dist.init_process_group("nccl")
```

它会把所有训练进程连接成一个通信组。`nccl` 是 NVIDIA 提供的 GPU 通信后端，适合多 GPU 之间高效同步梯度和统计量。

这一步依赖外部脚本提前设置好的环境变量，例如：

```text
RANK
WORLD_SIZE
LOCAL_RANK
MASTER_ADDR
MASTER_PORT
```

这些变量通常由 Slurm 脚本根据节点编号和本地 task 编号计算得到。`train.py` 本身不负责启动多进程，而是负责在进程启动后，把这些进程接入同一个分布式通信组。

---

## 3. 每个进程绑定自己的 GPU

初始化通信组后，每个进程会根据 `local_rank` 绑定自己的 GPU：

```python
if torch.cuda.device_count() == 1:
    local_rank = 0

device = torch.device(f"cuda:{local_rank}")
torch.cuda.set_device(device)
```

这一步的作用是确保每个 Python 进程只在自己负责的 GPU 上运行模型和计算梯度。

需要注意的是，这不是一个进程设置 16 次 GPU，而是 16 个进程各自执行一次：

```text
rank 0 进程：local_rank = 0 → cuda:0
rank 1 进程：local_rank = 1 → cuda:1
rank 2 进程：local_rank = 2 → cuda:2
...
```

如果外部脚本里设置了：

```bash
CUDA_VISIBLE_DEVICES=$LOCAL_RANK
```

那么每个进程实际上只“看得到”一张物理 GPU。此时 PyTorch 进程内部可见的 GPU 通常会被重新编号为 `cuda:0`。因此代码中有：

```python
if torch.cuda.device_count() == 1:
    local_rank = 0
```

这个判断可以兼容“每个进程只暴露一张 GPU”的启动方式。

---

## 4. 数据按 rank 切分

在 DDP 中，每个进程不应该读取完全相同的数据。否则多张 GPU 只是在重复计算同一个 batch，无法真正提升有效 batch size。

这份代码没有使用 PyTorch 标准的 `DistributedSampler`，而是在自定义数据集内部按 `rank / world_size` 切分数据 shard。

在 `train.py` 中构建 dataloader 时，会把 rank 信息传入：

```python
dataloader = build_dataloader(
    ...,
    rank=rank,
    world_size=world_size,
)
```

数据集内部的核心逻辑类似：

```python
self.shard_files = shard_files[rank::world_size]
```

也就是说：

```text
rank 0  读取 shard 0, 16, 32, ...
rank 1  读取 shard 1, 17, 33, ...
rank 2  读取 shard 2, 18, 34, ...
...
rank 15 读取 shard 15, 31, 47, ...
```

这样每个进程天然读取不同的数据分片。

这一部分可以理解为手动实现了 data sharding：

```text
不同 rank 读取不同数据；
不同 GPU 计算不同 local batch；
DDP 在 backward 时同步梯度；
整体等价于使用更大的 global batch。
```

---

## 5. 用 DDP 包装模型

模型构建完成后，代码使用 PyTorch 的 `DistributedDataParallel` 包装模型：

```python
model = DDP(model, device_ids=[local_rank], find_unused_parameters=True)
```

这是分布式训练的核心。

![四卡 DDP 示意：各卡权重一致、各自反传得到局部梯度、跨卡聚合梯度后再同步更新](/images/blog/ddp-four-gpu-flow.png)

DDP 的工作方式是：

```text
每个进程持有一份完整模型副本；
每个进程读取自己的 local batch；
每个进程独立 forward / backward；
backward 期间，DDP 自动对梯度做 all-reduce；
所有进程得到相同的平均梯度；
每个进程各自执行 optimizer.step()；
最终所有模型参数保持一致。
```

可以把它理解为：

```text
各个 GPU 分别计算自己的梯度；
DDP 把所有 GPU 的梯度平均；
每个 GPU 用同一份平均梯度更新模型。
```

例如 16 个 rank 分别得到：

```text
grad_0, grad_1, ..., grad_15
```

DDP 会自动同步成：

```text
grad = average(grad_0, grad_1, ..., grad_15)
```

然后每个 rank 都用这个平均梯度执行：

```python
optimizer.step()
```

由于所有 rank 初始参数一致，梯度同步后也一致，因此更新后的模型参数仍然保持一致。

---

## 6. `find_unused_parameters=True`

DDP 初始化时使用了：

```python
find_unused_parameters=True
```

这个参数表示允许某些参数在某些 forward pass 中没有参与计算。

如果模型中存在条件分支、可选模块，或者某些配置下部分参数没有被使用，DDP 默认可能会因为这些参数没有梯度而报错。设置 `find_unused_parameters=True` 后，DDP 会额外检查哪些参数在当前 forward 中没有被使用，并允许这种情况发生。

这个设置更安全，但会带来一定额外开销。

---

## 7. 梯度累积与 `model.no_sync()`

训练循环中还使用了 gradient accumulation。核心逻辑是：

```python
is_last = micro_step == args.gradient_accumulation_steps - 1
ctx = contextlib.nullcontext() if is_last else model.no_sync()

with ctx:
    ...
    loss.backward()
```

这段代码的含义是：

```text
如果当前不是最后一个 accumulation micro-step，就暂时不同步梯度；
等到最后一个 micro-step，再进行一次跨卡梯度同步。
```

例如 `gradient_accumulation_steps = 4`：

```text
micro-step 1: forward + backward，不同步梯度
micro-step 2: forward + backward，不同步梯度
micro-step 3: forward + backward，不同步梯度
micro-step 4: forward + backward，同步梯度
optimizer.step()
```

如果不用 `model.no_sync()`，每个 micro-step 的 backward 都会触发一次梯度 all-reduce。多机训练时，这会带来很大的通信开销。

因此，这里的设计是：

```text
用 gradient accumulation 增大有效 batch size；
用 no_sync 避免每个 micro-step 都跨卡通信；
只在真正 optimizer step 前同步一次梯度。
```

---

## 8. 有效 global batch size

在 DDP + gradient accumulation 中，真正的 batch size 需要按全局计算：

```text
global_batch_size
= local_batch_size × world_size × gradient_accumulation_steps
```

例如：

```text
local_batch_size = 4
world_size = 16
gradient_accumulation_steps = 8
```

那么：

```text
global_batch_size = 4 × 16 × 8 = 512
```

因此分析训练配置时，不能只看单卡 batch size，还需要同时考虑 GPU 数量和 gradient accumulation steps。

---

## 9. rank 0 负责全局副作用

在分布式训练中，并不是所有操作都应该由所有进程执行。比如创建目录、写日志、保存 checkpoint，如果每个 rank 都做一遍，可能会造成重复写入甚至文件冲突。

因此代码中很多逻辑只由 `rank == 0` 执行：

```python
if rank == 0:
    ...
```

常见的 rank 0 操作包括：

```text
创建输出目录；
打印配置；
初始化 wandb；
保存 checkpoint；
写训练日志。
```

可以把 `rank 0` 理解为主进程：

```text
rank 0 负责 side effects；
其他 rank 主要负责训练计算。
```

由于 DDP 会保持所有 rank 的模型参数同步，checkpoint 通常只需要由 rank 0 保存一份即可。

---

## 10. 日志和评估指标需要手动聚合

DDP 会自动同步梯度，但不会自动同步训练日志或评估指标。因此代码中需要手动使用 `all_reduce` 聚合统计量。

训练日志中类似：

```python
dist.all_reduce(loss_tensor, op=dist.ReduceOp.AVG)
```

表示对所有 rank 的 loss 求平均，得到全局平均 loss。

评估时类似：

```python
dist.all_reduce(stats, op=dist.ReduceOp.SUM)
```

表示把所有 rank 上统计到的样本数、正确数、loss sum 等累加起来。

原因是每个 rank 只看到了自己负责的数据。如果只记录 rank 0 的 loss 或 accuracy，它只能代表 rank 0 的局部数据，而不是全局训练状态。

因此可以区分为：

```text
梯度同步：DDP 自动完成；
日志指标：代码手动 all-reduce；
评估统计：代码手动 all-reduce。
```

---

## 11. `barrier` 与 `broadcast`

代码中还使用了两个常见的分布式协作原语：`barrier` 和 `broadcast_object_list`。

### `dist.barrier()`

`barrier` 会让所有进程在某个位置等待，直到所有 rank 都到达后再继续执行。

它通常用于：

```text
等待 rank 0 创建目录；
checkpoint 保存前后同步；
确保某个文件已经准备完成；
让所有进程在关键位置对齐。
```

可以理解为：

```text
所有 rank 在这里集合一下，确认大家都到齐了，再继续。
```

### `dist.broadcast_object_list(...)`

`broadcast` 用来让某个 rank，通常是 rank 0，把对象同步给其他所有 rank。

例如：

```text
rank 0 决定输出目录；
rank 0 解析 checkpoint 路径；
然后 broadcast 给所有其他 rank。
```

这样可以避免不同进程各自计算出不同的全局配置。

---

## 12. 执行主线

把上面的逻辑串起来，这份 `train.py` 的分布式执行流程如下：

```text
1. Slurm 启动多个 Python 训练进程
        ↓
2. 每个进程获得 RANK / LOCAL_RANK / WORLD_SIZE 等环境变量
        ↓
3. train.py 调用 dist.init_process_group("nccl")
        ↓
4. 每个进程根据 local_rank 绑定自己的 GPU
        ↓
5. 构建模型，并移动到对应 GPU
        ↓
6. 使用 DDP 包装模型
        ↓
7. 构建 dataloader，并按 rank/world_size 切分数据 shard
        ↓
8. 每个 rank 读取自己的 batch
        ↓
9. 每个 rank 独立 forward / loss / backward
        ↓
10. DDP 在 backward 时自动同步梯度
        ↓
11. 每个 rank 执行 optimizer.step()
        ↓
12. rank 0 负责 logging 和 checkpoint
        ↓
13. eval / logging 统计通过 all_reduce 聚合
```

---

## 13. 总结

这份 `train.py` 的分布式训练逻辑可以概括为：

```text
Slurm 负责启动多个训练进程，并设置 rank 相关环境变量；
train.py 负责初始化 torch.distributed 通信组；
每个进程根据 local_rank 绑定一张 GPU；
每个进程根据 rank/world_size 读取不同数据 shard；
DDP 在 backward 阶段自动同步梯度；
gradient accumulation 阶段使用 no_sync 减少通信开销；
rank 0 负责日志、目录和 checkpoint；
训练和评估指标通过 all_reduce 做全局聚合。
```

这套结构的本质是 **Distributed Data Parallel**：

```text
同一个模型复制到多张 GPU；
不同 GPU 处理不同数据；
梯度在 backward 阶段同步；
所有进程保持相同参数。
```

因此，它不是简单地“让代码用多张 GPU”，而是一套完整的多机多卡训练流程，涉及：

```text
Slurm 任务调度
环境变量 rank 管理
CUDA 设备绑定
NCCL 跨 GPU 通信
PyTorch DDP 梯度同步
数据 shard 分发
日志与 checkpoint 的 rank 协调
```

这也是大模型 pretraining、SFT 和 post-training 中最基础、最常见的分布式训练模式之一。
