---
title: "Lecture 4 Notes: Mixture of Experts (MoE)"
date: "2026-05-06"
description: "MoE：通过稀疏激活扩展模型容量（路由、负载均衡、稳定性与系统代价）。"
---

## 0. Big Picture

Mixture of Experts，简称 **MoE**，是一类利用 **sparsity** 扩展模型参数量的方法。

核心思想是：

> 不是每个 token 都经过整个大模型，而是让每个 token 只激活其中一小部分 expert。

这样可以做到：

```text
总参数量很大；
每个 token 实际激活的参数量较小；
训练 / 推理 FLOPs 不随总 expert 数线性增长。
```

所以 MoE 的目标是：

```text
在相似计算量下，获得更大的模型容量。
```

---

## 1. What Is a MoE?

在标准 Transformer 里，每一层通常有：

```text
Attention
FFN / MLP
```

MoE 通常做的事情是：

```text
把普通 FFN 替换成多个 FFN experts + 一个 router。
```

普通 dense FFN：

```math
h = FFN(x)
```

MoE FFN：

```math
h = \sum_{i \in \text{selected experts}} g_i(x) \cdot FFN_i(x)
```

其中：

```text
FFN_i(x) = 第 i 个 expert
g_i(x)   = router 给 expert i 的 gating weight
```

直观理解：

```text
普通模型：每个 token 都走同一个 FFN
MoE 模型：每个 token 选择少数几个 experts
```

---

## 2. Why Are MoEs Popular?

### 2.1 Same FLOPs, More Parameters

MoE 可以在几乎相同的计算量下增加模型总参数量。

例如：

```text
Dense model:
  每个 token 用全部参数

MoE model:
  模型有很多 experts
  但每个 token 只激活 top-k 个 experts
```

所以：

```text
total parameters 很大
activated parameters 较小
FLOPs 接近 dense baseline
```

这使得 MoE 可以在固定 compute budget 下获得更高容量。

---

### 2.2 Faster Training to a Given Quality

MoE 通常可以更快达到某个 loss / performance 水平。

原因是：

```text
每个 token 只用少量 expert，所以计算量可控；
但模型总容量更大，所以拟合能力更强。
```

因此在很多实验中，MoE 可以用更少训练时间或更少 FLOPs 达到 dense model 的效果。

---

### 2.3 Competitive with Dense Models

近年的高性能开源模型中，很多都是 MoE 架构，例如：

```text
Mixtral
DBRX
DeepSeek-V2 / V3
Grok
Qwen MoE
LLaMA 4 MoE variants
```

MoE 在性能上已经可以和 dense equivalents 竞争，甚至在某些设置下更有性价比。

---

### 2.4 Easier to Parallelize Across Many Devices

MoE 的 experts 可以自然分布在不同设备上：

```text
GPU 0: experts 0, 1, 2
GPU 1: experts 3, 4, 5
GPU 2: experts 6, 7, 8
...
```

这带来了新的并行方式：

```text
data parallelism
tensor parallelism
pipeline parallelism
expert parallelism
```

尤其在多节点训练时，MoE 可以利用更多设备承载更多 expert 参数。

---

## 3. Why Were MoEs Not Always Popular?

MoE 虽然有吸引力，但也有不少问题。

### 3.1 Infrastructure Is Complex

MoE 需要处理：

```text
routing
expert dispatch
expert parallelism
all-to-all communication
load balancing
token dropping
sparse matrix multiplication
distributed expert placement
```

这比普通 dense Transformer 复杂很多。

---

### 3.2 Training Objective Is Heuristic

MoE 的 routing decision 通常是离散的：

```text
token → choose top-k experts
```

离散选择本身不可微，所以训练 router 不像普通神经网络那样直接。

实际做法通常依赖 heuristic，例如：

```text
top-k routing
load balancing loss
router z-loss
stochastic perturbation
expert capacity
token dropping
```

这些方法有效，但不是非常 clean 的理论最优解。

---

### 3.3 Stability Can Be Worse

MoE 可能出现：

```text
router collapse
expert imbalance
training spikes
some experts under-trained
some experts overloaded
token dropping
fine-tuning overfitting
```

所以 MoE 训练通常需要更多稳定性技巧。

---

## 4. What Do MoEs Usually Look Like?

最常见的 MoE 结构是：

```text
Replace MLP/FFN with MoE layer
```

也就是 attention 层保持普通 dense attention，只把 FFN 换成多个 experts。

---

## 5. What Varies in MoE Design?

MoE 主要有三个设计维度：

```text
1. Routing function
2. Expert size / number of experts
3. Training objectives and balancing strategy
```

---

## 6. Routing: How Tokens Choose Experts

Routing 是 MoE 的核心。

Router 的作用是：

```text
对每个 token，决定它应该送到哪些 experts。
```

现代 MoE 中最常见的是：

```text
token-choice top-k routing
```

---

## 7. Top-k Routing

Top-k routing 是最常见的 MoE routing 方法。

流程：

```text
1. token hidden state 输入 router
2. router 给每个 expert 打分
3. 选择分数最高的 top-k experts
4. token 被送到这些 experts
5. expert 输出按 gating weight 加权求和
```

数学上可以写成：

```math
h_t = \sum_{i=1}^{N} g_{i,t} FFN_i(u_t) + u_t
```

其中：

```text
N       = expert 总数
u_t     = token t 的 hidden state
g_{i,t} = token t 分配给 expert i 的 gate weight
```

一句话：\(e_l^i\) 是第 \(l\) 层第 \(i\) 个 expert 的可学习 router 向量，用来和 token hidden state 做点积，得到这个 token 选择该 expert 的分数。

---

## 8. Common k Values

不同 MoE 模型的 active experts 数不同。常见例子：

```text
Switch Transformer: k = 1
GShard:             k = 2
Grok:               k = 2
Mixtral:            k = 2
DBRX:               k = 4
Qwen MoE:           k = 4
DeepSeek:           k = 6/7/8 depending on version
```

更大的 k：

```text
优点：表达能力更强，routing 更平滑
缺点：FLOPs 和通信成本更高
```

---

## 9. Router Score: Softmax Before or After Top-k

不同模型对 router score 的处理略有不同：

```text
先 softmax 再选 top-k
vs
先选 top-k 再在 selected experts 上 softmax
```

核心区别：归一化是在所有 experts 上，还是只在 selected experts 上。

---

## 10. Hash Routing and Other Routing Methods

### Hash Routing

优点：简单稳定，不需要训练 router。缺点：不够 adaptive，不能根据 token 内容动态选择 expert。

---

## 11. Fine-Grained Experts and Shared Experts

近期一些 MoE（如 DeepSeek / Qwen 系列）引入：

```text
fine-grained experts
shared experts
```

---

## 12. Evidence from Ablations

经验结论大致是：

```text
fine-grained experts 较稳定有用；
shared experts 是否有用可能依赖具体模型和训练设置。
```

---

## 13. How Do We Train MoEs?

核心困难：

```text
想要 sparse computation；
但 sparse routing decision 不可微。
```

实践中最常用的是：

```text
heuristic balancing losses
```

---

## 14. Load Balancing Problem

关键系统问题：

> experts 必须被比较均匀地使用。

否则会导致过载、欠训练、通信效率下降和 token dropping 增加。

---

## 15. Load Balancing Loss

Switch Transformer 等常用 auxiliary load balancing loss 来鼓励 tokens 均匀分配到 experts。

---

## 16. Per-Expert and Per-Device Balancing

除了 per-expert 之外，多节点还需要 per-device 负载均衡，避免某些设备成为瓶颈。

---

## 17. DeepSeek V3: Auxiliary-Loss-Free Balancing

通过为每个 expert 引入 bias，动态调节其被选中的概率以保持 balance（但并非完全 “无 aux”）。

---

## 18. Stochastic Routing Tricks

例如对 router score 加噪声（Gaussian / jitter）以减少 brittle routing，但现代实现不一定都会保留。

---

## 19. Systems Side of MoE Training

MoE 的系统代价主要来自：

```text
dispatch / combine
all-to-all communication
variable token counts per expert
```

---

## 20. MoE Stochasticity and Token Dropping

capacity 是 batch-level 的；某个 expert 过载时可能会 drop tokens，从而引入服务层面的随机性。

---

## 21. MoE Stability Issues

常见技巧：

```text
router 用 float32
router z-loss
capacity control
careful init
```

---

## 22. Router z-loss

用于稳定 router logits，避免极端 routing 分布与 collapse。

---

## 23. Fine-Tuning MoEs

MoE 在小数据 SFT 时可能更容易过拟合；解决思路包括使用更大 SFT 数据、冻结部分模块等。

---

## 24. Upcycling: Turning Dense Models into MoEs

通过复制 dense FFN 权重初始化多个 experts，加入 router 后继续训练，以复用 dense 模型能力并扩展容量。

---

## 33. Final Summary

一句话总结：

> MoE 是一种用系统复杂度换模型容量和计算效率的架构。它不一定让单个 token 更便宜，但能让模型在相同激活计算量下拥有更大的总容量。

