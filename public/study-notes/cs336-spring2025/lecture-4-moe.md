---
title: "Lecture 4 Notes: Mixture of Experts (MoE)"
date: "2026-05-06"
description: "Sparse activation to scale capacity: routing, balancing, stability, and systems trade-offs in modern MoE LMs."
---

## 0. Big Picture

**Mixture of Experts (MoE)** is a way to scale model capacity through **sparse activation**.

The core idea is:

> Not every token needs to use the full model.  
> Instead, each token is routed to only a small number of experts.

This allows a model to have:

```text
large total parameters
smaller activated parameters per token
similar FLOPs to a much smaller dense model
```

So the main motivation is:

```text
increase model capacity without increasing per-token compute proportionally
```

---

## 1. What Is a MoE?

In a standard Transformer block, the main components are usually:

```text
Attention
FFN / MLP
```

A typical MoE replaces the dense FFN with:

```text
many FFN experts + a router
```

Dense FFN:

```math
h = FFN(x)
```

MoE FFN:

```math
h = \sum_{i \in \text{selected experts}} g_i(x) \cdot FFN_i(x)
```

where:

```text
FFN_i(x) = the i-th expert
g_i(x)   = the routing / gating weight for expert i
```

Intuitively:

```text
Dense model: every token goes through the same FFN.
MoE model: each token selects a few experts.
```

---

## 2. Why Are MoEs Becoming Popular?

### 2.1 Same FLOPs, More Parameters

MoE can increase the total number of parameters while keeping the activated compute relatively small.

```text
Dense model:
  each token uses all parameters

MoE model:
  the model contains many experts
  each token activates only top-k experts
```

Therefore:

```text
total parameters can be very large
activated parameters remain much smaller
FLOPs can stay close to a dense baseline
```

This gives MoE a strong compute-capacity tradeoff.

---

### 2.2 Faster Training to a Target Quality

MoE models can often reach a given loss or benchmark score faster than dense models.

Reason:

```text
Each token only activates a small number of experts,
but the model has much larger total capacity.
```

In practice, this can mean:

```text
less training time
fewer FLOPs
better performance for the same compute budget
```

---

### 2.3 Competitive with Dense Models

Many recent high-performing open models use MoE architectures, including:

```text
Mixtral
DBRX
DeepSeek-V2 / DeepSeek-V3
Grok
Qwen MoE
LLaMA 4 MoE variants
```

Recent evidence suggests that MoEs can be highly competitive with dense models, especially when compute and inference efficiency are considered.

---

### 2.4 Natural Parallelism Across Devices

Experts can be distributed across many GPUs or nodes:

```text
GPU 0: experts 0, 1, 2
GPU 1: experts 3, 4, 5
GPU 2: experts 6, 7, 8
...
```

This introduces another parallelism dimension:

```text
expert parallelism
```

which can be combined with:

```text
data parallelism
tensor parallelism
pipeline parallelism
```

MoEs are therefore attractive in large multi-node training systems.

---

## 3. Why Were MoEs Not Always Popular?

Despite their advantages, MoEs are harder to train and serve than dense models.

### 3.1 Infrastructure Complexity

MoE training requires handling:

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

A dense FFN is just a matrix multiplication.  
A MoE FFN requires dispatching tokens to different experts and then combining the outputs.

---

### 3.2 Heuristic Training Objectives

Routing is usually discrete:

```text
token → choose top-k experts
```

Discrete routing decisions are not directly differentiable.

In practice, MoE training relies on heuristics such as:

```text
top-k routing
load balancing loss
router z-loss
stochastic perturbation
expert capacity limits
token dropping
```

These methods work well empirically, but they are less clean than standard dense neural network training.

---

### 3.3 Stability Issues

MoEs can suffer from:

```text
router collapse
expert imbalance
training spikes
under-trained experts
overloaded experts
token dropping
fine-tuning overfitting
```

As a result, MoE training often requires additional stability tricks.

---

## 4. What Do MoEs Usually Look Like?

The most common MoE design is:

```text
Replace the MLP / FFN with a MoE layer.
```

The attention layer is usually left dense.

A less common design is:

```text
MoE over attention heads.
```

This appears in some research models, but the standard large-model recipe is FFN MoE.

---

## 5. Main Design Axes

MoE design mainly varies along three dimensions:

```text
1. Routing function
2. Expert size and number of experts
3. Training objectives and balancing strategy
```

---

## 6. Routing: How Tokens Choose Experts

The router decides which experts each token should use.

Common routing families include:

```text
Token chooses expert
Expert chooses token
Global routing via optimization
```

The dominant practical choice is:

```text
token-choice top-k routing
```

That means:

```text
each token chooses its own top-k experts
```

---

## 7. Top-k Routing

Top-k routing is the most common MoE routing method.

The basic procedure is:

```text
1. Feed the token hidden state into the router.
2. The router assigns a score to each expert.
3. Select the top-k experts.
4. Send the token to those selected experts.
5. Combine expert outputs using routing weights.
```

A simplified formulation is:

```math
h_t = \sum_{i=1}^{N} g_{i,t} FFN_i(u_t) + u_t
```

where:

```text
N       = total number of experts
u_t     = hidden state of token t
g_{i,t} = routing weight from token t to expert i
```

If expert `i` is not selected:

```math
g_{i,t} = 0
```

If it is selected:

```math
g_{i,t} = s_{i,t}
```

where `s_{i,t}` is the router score or normalized gate value.

---

## 8. Common Values of k

Different MoE models activate different numbers of experts per token.

Examples:

```text
Switch Transformer: k = 1
GShard:             k = 2
Grok:               k = 2
Mixtral:            k = 2
DBRX:               k = 4
Qwen MoE:           k = 4
DeepSeek:           k = 6/7/8 depending on version
```

Larger `k` means:

```text
more experts activated per token
more expressiveness
more compute and communication cost
```

Smaller `k` means:

```text
less compute
less communication
possibly less expressive routing
```

---

## 9. Router Score Normalization

Different models normalize router scores differently.

One approach:

```text
softmax over all experts
then select top-k
```

Another approach:

```text
select top-k first
then softmax only over selected experts
```

Examples mentioned in the lecture:

```text
DeepSeek V1/V2, Grok, Qwen:
  logistic-regression-style router

Mixtral, DBRX, DeepSeek V3:
  often softmax after top-k
```

The distinction is whether the probability mass is normalized over all experts or only over selected experts.

---

## 10. Hash Routing and Other Methods

### Hash Routing

Hash routing assigns tokens to experts using a hash function.

Advantages:

```text
simple
stable
no learned router required
```

Disadvantages:

```text
not adaptive
does not choose experts based on token content
```

So it is usually treated as a baseline.

---

### Reinforcement Learning Routing

Some early work tried to learn routing policies with reinforcement learning.

In principle, RL is natural because routing is a discrete decision.

However, in practice:

```text
high gradient variance
more complex training
not clearly better
```

So RL routing is not widely used in modern MoEs.

---

### Global Assignment / Matching

Another approach treats routing as a global matching problem:

```text
given a batch of tokens and experts,
solve an assignment problem
```

This can better control expert load, but it is more complex and not the dominant practical choice.

---

## 11. Fine-Grained Experts and Shared Experts

Recent MoE models, especially DeepSeek and Qwen variants, often introduce:

```text
fine-grained experts
shared experts
```

---

### 11.1 Fine-Grained Experts

Fine-grained experts are smaller but more numerous experts.

Instead of:

```text
a small number of large experts
```

the model uses:

```text
many smaller experts
```

Benefits:

```text
finer routing granularity
more expert specialization
more flexible composition of capabilities
```

---

### 11.2 Shared Experts

Shared experts are always active.

That means each token goes through:

```text
some routed experts
+
some shared experts
```

Intuition:

```text
routed experts learn specialized skills;
shared experts provide general capacity and stability.
```

DeepSeek and Qwen MoE variants have used shared experts.

---

## 12. Evidence from Ablations

DeepSeek ablations suggest:

```text
more experts generally help
fine-grained experts help
shared experts often help
```

OlMoE ablations suggest:

```text
fine-grained experts help
shared experts did not clearly help in their setup
```

Practical takeaway:

```text
fine-grained experts seem consistently useful;
shared experts may depend on model and training setup.
```

---

## 13. How Do We Train MoEs?

The central training difficulty is:

```text
We want sparse computation,
but sparse routing decisions are not differentiable.
```

Common solutions include:

```text
1. Reinforcement learning
2. Stochastic approximations
3. Heuristic balancing losses
```

In practice, the most widely used method is:

```text
heuristic balancing losses
```

---

## 14. The Load Balancing Problem

A MoE must use experts reasonably evenly.

If most tokens are routed to a small number of experts, then:

```text
some experts are overloaded
some experts receive little training
GPU utilization becomes uneven
all-to-all communication becomes inefficient
token dropping increases
training becomes unstable
```

Therefore, MoE training usually includes some form of load balancing.

---

## 15. Load Balancing Loss

The Switch Transformer introduced an auxiliary load balancing loss.

Its goal is:

```text
encourage tokens to be distributed evenly across experts
```

Intuitively:

```text
if an expert is used too often,
the objective applies pressure to reduce its usage
```

This is heuristic, but very useful in practice.

---

## 16. Per-Expert and Per-Device Balancing

DeepSeek V1/V2 use balancing objectives at multiple levels.

### Per-Expert Balancing

Goal:

```text
each expert should receive a reasonably balanced number of tokens
```

### Per-Device Balancing

If experts are distributed across devices, the model also needs:

```text
balanced token load across devices
```

This matters because device imbalance can create training bottlenecks.

---

## 17. DeepSeek V3: Auxiliary-Loss-Free Balancing

DeepSeek V3 introduces a per-expert bias mechanism.

Basic idea:

```text
each expert has a bias term;
if an expert is underused, increase its bias;
if an expert is overused, decrease its bias.
```

This changes routing probabilities online and encourages balanced expert usage.

DeepSeek calls this:

```text
auxiliary-loss-free balancing
```

However, the lecture notes that the method is not entirely free of auxiliary balancing mechanisms.

---

## 18. Stochastic Routing Tricks

Some MoE methods add noise or jitter to routing scores.

Examples:

```text
Gaussian noise
uniform multiplicative jitter
```

Motivation:

```text
make router decisions less brittle
encourage experts to be more robust
help the model learn expert rankings
```

These techniques appeared in earlier MoE systems, but are not always used in modern models.

---

## 19. Systems Side of MoE Training

MoE has both systems advantages and systems costs.

### Advantage

Experts can be placed on different devices:

```text
each expert FFN can fit on one device
```

This enables expert parallelism.

### Complexity

MoE training requires:

```text
dispatching tokens to experts
running experts on different devices
combining expert outputs
all-to-all communication
balancing load across devices
handling variable token counts per expert
```

Modern libraries such as MegaBlocks use sparse matrix multiplication and better batching strategies to make MoE training more efficient.

---

## 20. MoE Stochasticity and Token Dropping

MoE inference can introduce extra stochasticity.

One reason is that routing capacity is often batch-level.

If an expert is overloaded in a batch, some tokens may be dropped.

This leads to a surprising effect:

```text
other users' queries in the same batch can affect whether your token is dropped
```

This was one speculation about why some MoE-based systems might show additional output variability.

---

## 21. MoE Stability Issues

MoE routers can be numerically unstable.

Common solutions include:

```text
use float32 for the expert router
add router z-loss
use load balancing losses
control expert capacity
careful initialization
```

A common practical trick is:

```text
Use FP32 only for the router.
```

This keeps the routing computation more stable without making the whole model FP32.

---

## 22. Router z-loss

Router z-loss is similar in spirit to output softmax z-loss.

It penalizes large router normalizers or router logits.

Goal:

```text
prevent router logits from blowing up
avoid overly sharp routing distributions
improve MoE training stability
```

Removing z-loss can cause instability or routing collapse in some setups.

---

## 23. Fine-Tuning MoEs

Sparse MoEs may overfit during fine-tuning, especially when the fine-tuning dataset is small.

Reasons:

```text
MoEs have many parameters
each token updates only a subset of experts
some experts may be under-trained
small data can overfit routed experts
```

Possible solutions:

```text
fine-tune only non-MoE MLPs
use much larger SFT data
carefully regularize or freeze parts of the model
```

DeepSeek-style models often rely on large-scale SFT data.

---

## 24. Upcycling: Initializing a MoE from a Dense Model

Upcycling means:

```text
initialize a MoE model from a pretrained dense LM
```

Motivation:

```text
avoid training a MoE from scratch
reuse the capabilities of a dense base model
expand capacity by adding experts
```

A typical approach:

```text
copy dense FFN weights into multiple experts
add a router
continue training the MoE
```

---

## 25. Upcycling Examples

### MiniCPM MoE

MiniCPM MoE uses a pretrained MiniCPM model as initialization.

Approximate setup:

```text
top-k = 2
8 experts
about 4B active parameters
```

After continued training, it improves over the dense base model.

---

### Qwen MoE

Qwen MoE is an important confirmed upcycling success.

Approximate setup:

```text
initialized from Qwen 1.8B
top-k = 4
60 experts
4 shared experts
```

Its architecture is similar to DeepSeekMoE.

---

## 26. DeepSeek MoE Evolution

The lecture uses DeepSeek as a case study.

---

### 26.1 DeepSeek MoE V1

Approximate scale:

```text
16B total parameters
2.8B active parameters
```

Main design:

```text
standard top-k routing
2 shared experts
64 fine-grained experts
4-way fine-grained segmentation
standard auxiliary load balancing
expert + device balancing
```

---

### 26.2 DeepSeek MoE V2

Approximate scale:

```text
236B total parameters
21B active parameters
```

New features:

```text
2 shared experts
160 fine-grained experts
6 active experts
top-M device routing
communication balancing loss
```

Communication balancing aims to balance both incoming and outgoing communication across devices.

---

### 26.3 DeepSeek MoE V3

Approximate scale:

```text
671B total parameters
37B active parameters
```

Main features:

```text
1 shared expert
258 fine-grained routed experts
8 active experts
sigmoid + softmax top-k
top-M device routing
auxiliary-loss-free balancing
sequence-wise auxiliary loss
```

DeepSeek V3 is a strong example of combining MoE architecture, routing design, and systems engineering.

---

## 27. MLA: Multihead Latent Attention

The lecture briefly discusses **MLA**, which is used in DeepSeek V3.

MLA stands for:

```text
Multihead Latent Attention
```

The basic idea is:

```text
represent Q, K, and V as functions of a lower-dimensional latent activation
```

Instead of caching full K and V vectors, MLA caches a smaller latent representation:

```text
c_t^{KV}
```

Benefits:

```text
smaller KV cache
lower inference memory usage
lower memory bandwidth pressure
```

However, MLA interacts non-trivially with RoPE.

Problem:

```text
RoPE rotates Q and K using position-dependent transformations.
Latent KV caching changes how K is represented.
```

DeepSeek’s solution is to keep a small number of non-latent key dimensions that can still be rotated.

---

## 28. MTP: Multi-Token Prediction

The lecture also mentions **MTP**, or Multi-Token Prediction.

The idea is:

```text
train lightweight modules to predict multiple future tokens
```

Instead of only predicting the next token, the model receives additional training signals for future tokens.

Potential benefits:

```text
richer learning signal
better representation learning
possible decoding-related advantages
```

The lecture notes that DeepSeek V3 only uses a one-token-ahead version of MTP.

---

## 29. Advantages of MoE

MoE advantages include:

```text
same FLOPs with more total parameters
better compute-quality tradeoff
faster training to target quality
expert specialization
natural expert parallelism
strong results in recent open models
```

The central advantage is:

```text
MoE scales model capacity through sparse activation.
```

---

## 30. Disadvantages of MoE

MoE disadvantages include:

```text
discrete routing is hard to train
load balancing is required
systems implementation is complex
all-to-all communication can be expensive
expert imbalance can hurt efficiency
router instability
fine-tuning can overfit
serving can introduce batch-level stochasticity
```

So MoE is not just an architecture choice.  
It is also a systems and optimization challenge.

---

## 31. Dense vs MoE

### Dense Model

```text
all tokens use all parameters
simple training
stable inference
mature infrastructure
compute scales with total parameter count
```

### MoE Model

```text
each token activates only some parameters
large total parameter count
controlled activated FLOPs
more complex routing and infrastructure
```

Summary:

```text
Dense: simple but expensive at scale.
MoE: efficient capacity scaling but much more complex.
```

---

## 32. Key Takeaways

MoE uses sparsity:

```text
not every input needs the full model
```

Routing is difficult:

```text
discrete routing is hard,
but top-k heuristics work surprisingly well
```

Modern empirical evidence suggests:

```text
MoEs work,
and they are cost-effective
```

But good MoE training requires solving:

```text
routing
load balancing
stability
expert parallelism
communication
fine-tuning
serving
```

---

## 33. Final Summary

MoE can be summarized as:

```text
replace one dense FFN with many expert FFNs;
route each token to a small number of experts;
increase total capacity without increasing activated compute proportionally.
```

A modern MoE recipe often includes:

```text
FFN MoE
token-choice top-k routing
fine-grained experts
possibly shared experts
load balancing or bias balancing
FP32 router
router z-loss
expert parallelism
large-scale training data
```

The main value of MoE is:

```text
scaling capacity without scaling per-token compute proportionally
```

The main cost is:

```text
training and serving infrastructure becomes much more complex
```

One-sentence summary:

> MoE trades systems complexity for model capacity and compute efficiency. It does not necessarily make each token simpler, but it allows the model to have far more total parameters while activating only a small subset per token.

