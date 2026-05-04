---
title: Distributed Pretraining with Slurm and PyTorch DDP
date: "2026-05-04"
description: "A training pipeline note on multi-node DDP — NCCL init, per-rank GPU binding, manual sharding, gradient sync, accumulation with no_sync, and metric aggregation."
---

This pretraining run uses a standard **multi-node, multi-GPU Distributed Data Parallel (DDP)** setup. At a high level, Slurm launches multiple Python processes, each process binds to one GPU, reads a different data shard, and DDP automatically synchronizes gradients during the backward pass.

The overall flow is:

```text
Slurm launches multiple training processes
        ↓
Each process gets rank / local_rank / world_size
        ↓
Each process binds to one GPU
        ↓
Each process reads different data shards
        ↓
DDP wraps the model and synchronizes gradients during backward
        ↓
rank 0 handles logging, checkpointing, and other global side effects
```

This note summarizes the distributed training logic in `train.py` and records how the pretraining pipeline runs across multiple nodes and GPUs.

---

## 1. Overall Structure: One Process per GPU

The training code follows the standard DDP data-parallel pattern:

```text
Each GPU corresponds to one Python process;
each process runs the same train.py script;
each process holds a full copy of the model;
different processes read different data;
DDP synchronizes gradients during the backward pass.
```

For example, with:

```text
4 nodes × 4 GPUs/node = 16 GPUs
```

Slurm launches 16 Python training processes:

```text
world_size = 16
rank = 0, 1, ..., 15
local_rank = 0, 1, 2, 3  # re-indexed within each node
```

The key concepts are:

```text
rank       = the global process ID across the whole training job
local_rank = the process ID within the current node, usually mapped to a local GPU
world_size = the total number of training processes, usually equal to the total number of GPUs
```

For `4 nodes × 4 GPUs/node`, the mapping looks roughly like this:

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

All processes run the same code, but because their environment variables are different, each process gets a different identity and GPU assignment.

---

## 2. Initializing Distributed Communication

In `train.py`, distributed training starts by initializing `torch.distributed`:

```python
dist.init_process_group("nccl")

rank = dist.get_rank()
world_size = dist.get_world_size()
local_rank = int(os.environ.get("LOCAL_RANK", 0))
```

The key line is:

```python
dist.init_process_group("nccl")
```

This connects all training processes into one communication group. `nccl` is NVIDIA’s GPU communication backend, commonly used for efficient multi-GPU gradient and metric synchronization.

This step relies on environment variables that are prepared by the external Slurm script, such as:

```text
RANK
WORLD_SIZE
LOCAL_RANK
MASTER_ADDR
MASTER_PORT
```

In other words, `train.py` does not launch the distributed processes itself. Slurm launches the processes first, and `train.py` then connects them into the same distributed process group.

---

## 3. Binding Each Process to One GPU

After initializing the process group, each process selects its own GPU according to `local_rank`:

```python
if torch.cuda.device_count() == 1:
    local_rank = 0

device = torch.device(f"cuda:{local_rank}")
torch.cuda.set_device(device)
```

This ensures that each Python process runs its model and gradient computation on the GPU assigned to it.

Importantly, this is not one process setting 16 GPUs. Instead, 16 different processes each execute this once:

```text
rank 0 process: local_rank = 0 → cuda:0
rank 1 process: local_rank = 1 → cuda:1
rank 2 process: local_rank = 2 → cuda:2
...
```

If the external launch script sets:

```bash
CUDA_VISIBLE_DEVICES=$LOCAL_RANK
```

then each process only sees one physical GPU. In that case, PyTorch may re-index the visible GPU as `cuda:0` inside the process. This is why the code includes:

```python
if torch.cuda.device_count() == 1:
    local_rank = 0
```

This makes the code compatible with launch setups where each process is only exposed to a single GPU.

---

## 4. Sharding Data by Rank

In DDP, different processes should not read exactly the same data. Otherwise, multiple GPUs would simply repeat the same computation, which would waste compute and fail to increase the effective batch size.

This code does not use PyTorch’s standard `DistributedSampler`. Instead, the custom dataset directly shards data by `rank` and `world_size`.

When building the dataloader in `train.py`, the rank information is passed in:

```python
dataloader = build_dataloader(
    ...,
    rank=rank,
    world_size=world_size,
)
```

Inside the dataset, the core logic is similar to:

```python
self.shard_files = shard_files[rank::world_size]
```

This means:

```text
rank 0  reads shard 0, 16, 32, ...
rank 1  reads shard 1, 17, 33, ...
rank 2  reads shard 2, 18, 34, ...
...
rank 15 reads shard 15, 31, 47, ...
```

As a result, each process naturally reads a different subset of the data.

This is a manual form of data sharding:

```text
Different ranks read different data;
different GPUs compute different local batches;
DDP synchronizes gradients during backward;
the overall effect is similar to training with a larger global batch.
```

---

## 5. Wrapping the Model with DDP

After the model is constructed, it is wrapped with PyTorch’s `DistributedDataParallel`:

```python
model = DDP(model, device_ids=[local_rank], find_unused_parameters=True)
```

This is the core of distributed training.

![Four-GPU illustration: identical weights on each GPU, local gradients after backward, aggregate gradients across GPUs, then a synchronized update](/images/blog/ddp-four-gpu-flow.png)

DDP works as follows:

```text
Each process holds a full copy of the model;
each process reads its own local batch;
each process independently runs forward and backward;
during backward, DDP automatically all-reduces gradients;
all processes receive the same averaged gradients;
each process runs optimizer.step();
the model parameters remain synchronized across all ranks.
```

Conceptually:

```text
Each GPU computes its own gradients;
DDP averages gradients across all GPUs;
each GPU updates its model using the same averaged gradients.
```

For example, suppose 16 ranks compute:

```text
grad_0, grad_1, ..., grad_15
```

DDP automatically synchronizes them into:

```text
grad = average(grad_0, grad_1, ..., grad_15)
```

Then each rank runs:

```python
optimizer.step()
```

Since all ranks start from the same parameters and use the same synchronized gradients, their parameters remain identical after the update.

---

## 6. Why `find_unused_parameters=True` Is Used

The model is wrapped with:

```python
find_unused_parameters=True
```

This tells DDP that some parameters may not participate in every forward pass.

This can happen when the model contains conditional branches, optional modules, or configuration-dependent components. Without this option, DDP may expect gradients for all parameters and raise an error if some parameters are unused in the current pass.

Setting `find_unused_parameters=True` makes the training safer for dynamic computation graphs, although it introduces some extra overhead.

---

## 7. Gradient Accumulation and `model.no_sync()`

The training loop also uses gradient accumulation. The key logic is:

```python
is_last = micro_step == args.gradient_accumulation_steps - 1
ctx = contextlib.nullcontext() if is_last else model.no_sync()

with ctx:
    ...
    loss.backward()
```

This means:

```text
If the current micro-step is not the last accumulation step, do not synchronize gradients yet;
only synchronize gradients on the final micro-step before optimizer.step().
```

For example, with `gradient_accumulation_steps = 4`:

```text
micro-step 1: forward + backward, no gradient synchronization
micro-step 2: forward + backward, no gradient synchronization
micro-step 3: forward + backward, no gradient synchronization
micro-step 4: forward + backward, synchronize gradients
optimizer.step()
```

Without `model.no_sync()`, every backward pass would trigger a gradient all-reduce. In multi-node training, this would cause unnecessary communication overhead.

So the design is:

```text
Use gradient accumulation to increase the effective batch size;
use no_sync to avoid cross-GPU communication at every micro-step;
synchronize gradients only once before the optimizer update.
```

---

## 8. Effective Global Batch Size

With DDP and gradient accumulation, the true batch size should be computed globally:

```text
global_batch_size
= local_batch_size × world_size × gradient_accumulation_steps
```

For example:

```text
local_batch_size = 4
world_size = 16
gradient_accumulation_steps = 8
```

Then:

```text
global_batch_size = 4 × 16 × 8 = 512
```

Therefore, when analyzing the training configuration, it is not enough to look only at the per-GPU batch size. The number of GPUs and the number of accumulation steps must also be considered.

---

## 9. rank 0 Handles Global Side Effects

In distributed training, not every operation should be performed by every process. For example, creating directories, writing logs, and saving checkpoints from all ranks can cause duplicate outputs or even file conflicts.

Therefore, many operations are restricted to `rank == 0`:

```python
if rank == 0:
    ...
```

Typical rank 0 responsibilities include:

```text
creating output directories;
printing configuration;
initializing wandb;
saving checkpoints;
writing training logs.
```

In this setup, `rank 0` acts as the main process:

```text
rank 0 handles side effects;
other ranks mainly perform training computation.
```

Since DDP keeps model parameters synchronized across ranks, usually only one checkpoint needs to be saved by rank 0.

---

## 10. Logging and Evaluation Metrics Need Manual Aggregation

DDP automatically synchronizes gradients, but it does not automatically synchronize training logs or evaluation metrics. Therefore, the code manually aggregates statistics using `all_reduce`.

For training loss, the code uses something like:

```python
dist.all_reduce(loss_tensor, op=dist.ReduceOp.AVG)
```

This averages the loss across all ranks and gives the global training loss.

For evaluation, the code uses something like:

```python
dist.all_reduce(stats, op=dist.ReduceOp.SUM)
```

This sums statistics such as the number of examples, number of correct predictions, or total loss across all ranks.

This is necessary because each rank only sees its own shard of data. If we only logged rank 0’s loss or accuracy, it would only represent rank 0’s local data, not the full distributed run.

A useful distinction is:

```text
Gradient synchronization: handled automatically by DDP;
training logs: manually aggregated with all_reduce;
evaluation statistics: manually aggregated with all_reduce.
```

---

## 11. `barrier` and `broadcast`

The code also uses two common distributed coordination primitives: `barrier` and `broadcast_object_list`.

### `dist.barrier()`

`barrier` makes all processes wait at a specific point until every rank has reached it.

It is commonly used to:

```text
wait for rank 0 to create directories;
synchronize before or after checkpoint saving;
ensure a required file is ready;
align all ranks at a critical point.
```

Conceptually:

```text
All ranks gather here, wait for everyone to arrive, and then continue together.
```

### `dist.broadcast_object_list(...)`

`broadcast` is used to send an object from one rank, usually rank 0, to all other ranks.

For example:

```text
rank 0 determines the output directory;
rank 0 resolves the checkpoint path;
rank 0 broadcasts this information to all other ranks.
```

This ensures all processes use the same global configuration instead of independently computing potentially different values.

---

## 12. Execution Flow

Putting everything together, the distributed execution flow of `train.py` is:

```text
1. Slurm launches multiple Python training processes
        ↓
2. Each process receives RANK / LOCAL_RANK / WORLD_SIZE
        ↓
3. train.py calls dist.init_process_group("nccl")
        ↓
4. Each process binds to its assigned GPU
        ↓
5. The model is built and moved to the corresponding GPU
        ↓
6. The model is wrapped with DDP
        ↓
7. The dataloader is built and data shards are split by rank/world_size
        ↓
8. Each rank reads its own batch
        ↓
9. Each rank independently runs forward / loss / backward
        ↓
10. DDP automatically synchronizes gradients during backward
        ↓
11. Each rank runs optimizer.step()
        ↓
12. rank 0 handles logging and checkpointing
        ↓
13. Evaluation and logging statistics are aggregated with all_reduce
```

---

## 13. Summary

The distributed training logic in `train.py` can be summarized as:

```text
Slurm launches multiple training processes and sets rank-related environment variables;
train.py initializes the torch.distributed process group;
each process binds to one GPU according to local_rank;
each process reads different data shards according to rank/world_size;
DDP automatically synchronizes gradients during backward;
gradient accumulation uses no_sync to reduce communication overhead;
rank 0 handles logging, directories, and checkpoints;
training and evaluation statistics are aggregated with all_reduce.
```

The essence of this setup is **Distributed Data Parallel**:

```text
The same model is replicated across multiple GPUs;
different GPUs process different data;
gradients are synchronized during backward;
all processes keep identical model parameters.
```

Therefore, this is not simply “using multiple GPUs.” It is a complete multi-node, multi-GPU training pipeline involving:

```text
Slurm job scheduling
rank-related environment variables
CUDA device binding
NCCL communication
PyTorch DDP gradient synchronization
data shard distribution
rank coordination for logging and checkpointing
```

This pattern is one of the most common foundations for large-scale pretraining, SFT, and post-training.
