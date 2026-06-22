---
title: "Lecture 3 Notes: LM Architecture and Training"
date: "2026-05-04"
description: "Architecture and training choices in modern LMs: pre-norm, RMSNorm, RoPE, gated FFNs, stability, and efficient attention."
---

## 0. Big Picture

This lecture studies modern language model architecture and training choices.  
The main theme is:

> Modern LMs look very similar at a high level, but differ in many small architectural and optimization details.

The lecture compares the original Transformer with modern LLaMA-like architectures, then discusses common variations in:

- normalization;
- activation functions and FFN design;
- positional embeddings;
- model hyperparameters;
- regularization;
- training stability tricks;
- attention variants for efficient inference.

---

## 1. From the Original Transformer to Modern LMs

The original Transformer used:

```text
Position embedding: sinusoidal embeddings
FFN activation: ReLU
Normalization: post-norm LayerNorm
Bias terms: usually included
```

A more modern Transformer variant often uses:

```text
Normalization: pre-norm
Position embedding: RoPE
FFN activation: SwiGLU / GeGLU
Bias terms: usually removed
Norm type: often RMSNorm instead of LayerNorm
```

The general trend is toward **LLaMA-like architectures**:

```text
Pre-norm
RMSNorm
RoPE
SwiGLU
No bias terms
```

However, there is still no complete consensus. Many architecture choices are empirical and partly driven by implementation efficiency.

---

## 2. Pre-Norm vs Post-Norm

### Post-Norm

The original Transformer used post-norm:

```text
x → sublayer → residual add → LayerNorm
```

Conceptually:

```text
x_{l+1} = LayerNorm(x_l + Sublayer(x_l))
```

### Pre-Norm

Modern LMs almost always use pre-norm:

```text
x → LayerNorm → sublayer → residual add
```

Conceptually:

```text
x_{l+1} = x_l + Sublayer(LayerNorm(x_l))
```

### Why Pre-Norm?

The key intuition is:

> Keep the main residual stream as clean as possible.

In pre-norm, the residual path is less disturbed by normalization. This improves gradient flow and makes deep models easier to optimize.

Observed advantages:

- better gradient propagation;
- fewer gradient spikes;
- more stable training;
- easier use of larger learning rates;
- warmup becomes less critical than in post-norm setups.

Almost all modern LMs use pre-norm. BERT used post-norm, and OPT-350M is mentioned as an unusual modern exception.

---

## 3. Double Norm / Extra Norms

Some recent models add additional normalization outside the residual stream.

The motivation is:

> If putting normalization directly inside the residual stream can hurt the residual signal, why not normalize outside the main residual path?

Examples mentioned:

```text
Grok
Gemma 2
OLMo 2
```

Important distinction:

```text
This is not simply returning to post-norm.
```

Instead, it is closer to adding extra non-residual normalization for stability.

---

## 4. LayerNorm vs RMSNorm

### LayerNorm

LayerNorm normalizes by subtracting the mean and dividing by the standard deviation:

```math
y = \frac{x - \mathbb{E}[x]}{\sqrt{\mathrm{Var}[x] + \epsilon}} \cdot \gamma + \beta
```

It has two learned parameters:

```text
γ: scale
β: bias
```

### RMSNorm

RMSNorm removes the mean subtraction and usually removes the bias term:

```math
y = \frac{x}{\sqrt{\mathrm{mean}(x^2) + \epsilon}} \cdot \gamma
```

So RMSNorm only rescales the vector according to its root mean square.

### Why RMSNorm?

Common explanation:

```text
RMSNorm is faster and works about as well.
```

Reasons:

- no mean calculation;
- no bias term;
- fewer parameters;
- less data movement.

Important caveat:

> FLOPs are not the same as runtime.

Even if normalization accounts for a small fraction of FLOPs, it can still matter for wall-clock time because normalization involves memory movement and non-matrix operations. Matrix multiplication dominates FLOPs, but normalization can still affect runtime efficiency.

### Practical Summary

Most modern LMs use RMSNorm because:

```text
It is simpler,
usually performs as well as LayerNorm,
and can be faster in practice.
```

---

## 5. Dropping Bias Terms

Most modern Transformers remove bias terms from:

```text
linear layers
normalization layers
```

A typical modern FFN without bias is:

```math
FFN(x) = \sigma(xW_1)W_2
```

instead of:

```math
FFN(x) = \sigma(xW_1 + b_1)W_2 + b_2
```

Reasons:

- fewer parameters;
- less memory movement;
- often no meaningful performance loss;
- possibly better optimization stability.

This is part of a broader trend:

> Modern LMs often remove architectural components that add cost but provide little empirical gain.

---

## 6. Activation Functions and FFN Variants

The lecture discusses several activation functions:

```text
ReLU
GeLU
Swish
GLU
GeGLU
ReGLU
SwiGLU
LiGLU
```

### ReLU FFN

Original Transformer-style FFN:

```math
FF(x) = \max(0, xW_1)W_2
```

### GeLU FFN

Used in GPT-style models:

```math
FF(x) = GELU(xW_1)W_2
```

where:

```math
GELU(x) = x\Phi(x)
```

Here `Φ(x)` is the standard normal CDF.

Intuition:

```text
GeLU is a smooth version of ReLU.
```

Instead of sharply cutting off negative values, it smoothly gates the input.

---

## 7. Gated Activations: GLU, GeGLU, SwiGLU

Gated activations modify the first part of the FFN.

A normal FFN has:

```math
FF(x) = \sigma(xW_1)W_2
```

A gated FFN adds another projection:

```math
FF(x) = (\sigma(xW_1) \odot xV)W_2
```

where:

```text
⊙ means element-wise multiplication.
```

The two branches have different roles:

```text
σ(xW₁): gate branch
xV: value branch
```

The gate controls how much of each value dimension passes through.

### ReGLU

```math
FF_{ReGLU}(x) = (\max(0, xW_1) \odot xV)W_2
```

### GeGLU

```math
FF_{GeGLU}(x) = (GELU(xW_1) \odot xV)W_2
```

### SwiGLU

Swish is:

```math
Swish(x) = x \cdot sigmoid(x)
```

SwiGLU uses Swish as the gate:

```math
FF_{SwiGLU}(x) = (Swish(xW_1) \odot xV)W_2
```

### Why GLU-style FFNs?

Empirical evidence suggests gated FFNs often give small but consistent gains.

Modern models often use:

```text
SwiGLU or GeGLU
```

Examples:

```text
LLaMA
PaLM
Mistral
OLMo
Gemma
T5 v1.1
```

However:

```text
GLU is not strictly necessary.
```

GPT-3 used GeLU and still worked very well. The gain from GLU variants is useful but usually not dramatic.

---

## 8. FFN Dimension: Why 4× or 8/3×

A standard Transformer often uses:

```math
d_{ff} = 4d_{model}
```

This is a very common rule.

For GLU-style FFNs, there is an extra projection branch, so models often reduce the FFN dimension by about `2/3`:

```math
d_{ff} \approx \frac{8}{3}d_{model}
```

This keeps parameter count and compute closer to the original 4× FFN.

Common choices:

```text
Non-gated FFN: d_ff ≈ 4 d_model
Gated FFN:     d_ff ≈ 2.5–3.5 d_model
```

T5 is an unusual exception: its 11B model used a very large FFN multiplier, but T5 v1.1 moved back toward a more standard GeGLU configuration.

---

## 9. Serial vs Parallel Transformer Blocks

A standard Transformer block is serial:

```text
x
→ attention
→ residual add
→ MLP
→ residual add
```

Some models use parallel layers:

```text
x
→ attention and MLP computed in parallel
→ outputs added together
```

Serial form:

```math
y = x + MLP(LN(x + Attention(LN(x))))
```

Parallel form:

```math
y = x + Attention(LN(x)) + MLP(LN(x))
```

Potential advantages:

- shared LayerNorm;
- fused matrix multiplications;
- faster training;
- simpler block scheduling.

Models using parallel layers include:

```text
GPT-J
PaLM
GPT-NeoX
Cohere Command A
Falcon 2 11B
Command R+
```

The evidence is not as strong as for pre-norm or RMSNorm, but parallel layers can provide compute advantages.

---

## 10. Position Embeddings

The lecture compares several types of positional embeddings.

### Sinusoidal Embeddings

Original Transformer:

```math
Embed(x, i) = v_x + PE_i
```

where `PE_i` is built from sine and cosine functions.

### Learned Absolute Embeddings

Used in GPT-style models:

```math
Embed(x, i) = v_x + u_i
```

where `u_i` is a learned position vector.

### Relative Position Embeddings

Used in models such as T5, Gopher, and Chinchilla.  
Instead of adding position vectors to embeddings, relative position information is added inside the attention computation.

### RoPE

RoPE is now common in modern LMs:

```text
GPT-J
PaLM
LLaMA
Most recent models
```

---

## 11. RoPE: Rotary Position Embeddings

RoPE injects position information by rotating query and key vectors.

The goal is:

```math
\langle f(x, i), f(y, j) \rangle = g(x, y, i - j)
```

That is, the attention score should depend on the relative position `i - j`, not the absolute positions alone.

### Core Idea

Instead of adding a position vector, RoPE applies a position-dependent rotation to `Q` and `K`:

```math
q_i' = RoPE(q_i, i)
```

```math
k_j' = RoPE(k_j, j)
```

Then attention uses:

```math
q_i' \cdot k_j'
```

Because rotations preserve inner products in a structured way, the resulting attention score naturally depends on relative position.

### Implementation Intuition

RoPE pairs dimensions:

```text
(x0, x1), (x2, x3), ...
```

and rotates each pair in 2D using sine and cosine terms.

The difference from sinusoidal embeddings:

```text
Sinusoidal embeddings are additive.
RoPE is multiplicative/rotational.
RoPE avoids unwanted cross-terms and better supports relative position behavior.
```

RoPE is applied inside every attention layer, usually to queries and keys, not values.

---

## 12. Attention Head Hyperparameters

A common question:

> Should `num_heads × head_dim = d_model`?

Most modern models follow this rule:

```math
num\_heads \times head\_dim \approx d_{model}
```

Typical head dimension is often:

```text
64 or 128
```

Some models deviate from this, especially certain Google models like T5 and PaLM, but most models stay near the 1:1 ratio.

The lecture notes that although papers have argued against this ratio, in practice there is not strong evidence of major low-rank bottlenecks in common LLM settings.

---

## 13. Model Aspect Ratio: Deep vs Wide

Another design question:

> Should the model be deeper or wider?

A useful rough statistic is:

```math
\frac{d_{model}}{n_{layers}}
```

Many modern models fall in a similar range, often around:

```text
100–200
```

Extremely deep models can be harder to parallelize and may have higher latency. Systems constraints often influence this choice as much as pure modeling considerations.

Practical takeaway:

```text
There is no single perfect depth/width ratio.
Good values exist in a broad range.
Systems concerns often dictate the final choice.
```

---

## 14. Vocabulary Size

Typical vocabulary sizes differ by model type.

### Monolingual models

Often around:

```text
30k–50k tokens
```

Examples:

```text
GPT-2/3: about 50k
LLaMA: about 32k
T5: about 32k
```

### Multilingual or production models

Often much larger:

```text
100k–250k tokens
```

Examples:

```text
mT5: 250k
PaLM: 256k
GPT-4: about 100k
Qwen: over 150k
```

Main takeaway:

```text
Monolingual models do not need very large vocabularies.
Multilingual and production systems often benefit from larger vocabularies.
```

---

## 15. Dropout and Regularization

A natural question:

> Do huge LMs need regularization during pretraining?

Arguments against dropout:

- pretraining uses trillions of tokens;
- data size can exceed parameter count;
- the model may only see each sample once;
- memorization is less of a concern than in small-data regimes.

In practice:

```text
Older models often used dropout.
Newer models often use little or no dropout.
```

Many modern LMs rely more on:

```text
weight decay
```

than dropout.

### Weight Decay

Weight decay is not only about preventing overfitting in LMs.  
It also interacts with optimization dynamics, especially learning rate schedules such as cosine decay.

Practical summary:

```text
Dropout is often reduced or removed in modern pretraining.
Weight decay is still common.
Regularization in LMs often affects optimization, not just overfitting.
```

---

## 16. Stability Tricks

Large model training can become unstable. A common warning is:

> Beware of softmaxes.

Softmax involves exponentials and normalization, which can be numerically unstable when logits become too large.

The lecture discusses several stability tricks.

---

## 17. Output Softmax Stability: z-loss

For softmax:

```math
P(r|x) = \frac{e^{U_r(x)}}{Z(x)}
```

where:

```math
Z(x) = \sum_{r'} e^{U_{r'}(x)}
```

Taking log:

```math
\log P(r|x) = U_r(x) - \log Z(x)
```

The problem is that `log Z(x)` can become large if logits grow too much.

### z-loss

z-loss adds a penalty on the softmax normalizer:

```math
z\text{-loss} = \alpha \log^2 Z(x)
```

If written as a minimization objective:

```math
L = -\log P(r|x) + \alpha \log^2 Z(x)
```

Purpose:

```text
Prevent output logits from blowing up.
Encourage log Z(x) to stay near 0.
Improve softmax stability.
```

PaLM used this trick, and later models such as Baichuan 2, DCLM, and OLMo 2 also used related ideas.

---

## 18. Attention Softmax Stability: QK Norm

Attention also uses softmax:

```math
softmax(QK^T / \sqrt{d})
```

If query and key vectors become too large, attention logits can become unstable.

QK norm normalizes queries and keys before attention:

```text
Q → norm(Q)
K → norm(K)
```

Then attention is computed using normalized queries and keys.

Used in models such as:

```text
DCLM
OLMo 2
Gemma 2
```

The idea originally appeared in vision and multimodal models.

---

## 19. Logit Soft-Capping

Another stability trick is to cap logits smoothly using `tanh`:

```math
logits' = c \cdot \tanh(logits / c)
```

This prevents logits from exceeding a certain effective magnitude.

Benefit:

```text
Prevents logits from blowing up.
```

Potential downside:

```text
May hurt performance if it overly restricts the model.
```

---

## 20. Attention Variants for Efficiency

Most models do not radically change attention, but there are important efficiency variants.

### MQA: Multi-Query Attention

In standard multi-head attention, each head has its own keys and values.

MQA uses:

```text
multiple query heads
but shared key/value heads
```

Main benefit:

```text
smaller KV cache
less memory movement during inference
faster autoregressive decoding
```

This matters because generation is step-by-step and heavily depends on reading from the KV cache.

> **Note**: The KV cache stores the per-layer Key/Value tensors for all past tokens during **inference-time generation**, avoiding recomputation of the prefix. It can significantly speed up decoding, but it also consumes a lot of GPU memory as batch size and sequence length grow.

### GQA: Grouped-Query Attention

GQA is a middle ground between MHA and MQA:

```text
multiple query heads
fewer key/value heads
```

It improves inference efficiency while preserving more expressiveness than MQA.

Tradeoff:

```text
MQA: maximum KV-cache reduction, possible quality hit
GQA: good efficiency-quality tradeoff
```

Many recent models use GQA.

---

## 21. Sparse and Sliding Window Attention

Full attention is quadratic in sequence length:

```math
O(n^2)
```

To reduce cost, some models use sparse or structured attention.

### Sparse Attention

Instead of attending to every token, attend to selected positions according to a sparse pattern.

### Sliding Window Attention

Each token attends only to a local window of previous tokens.

Used by models such as:

```text
Mistral
```

The idea is:

```text
short-range information is handled locally;
long-range information can be propagated through depth.
```

Some recent models interleave full attention layers with local/sliding-window attention layers.

Example:

```text
Every few layers use full attention;
other layers use local attention.
```

This gives a tradeoff between long-context ability and runtime efficiency.

---

## 22. High-Level Takeaways

### Architecture

Modern LMs commonly use:

```text
pre-norm
RMSNorm
RoPE
SwiGLU / GeGLU
no bias terms
```

### Hyperparameters

Common rules of thumb:

```text
d_ff ≈ 4 d_model for non-gated FFNs
d_ff ≈ 8/3 d_model for GLU-style FFNs
num_heads × head_dim ≈ d_model
vocab size ≈ 30k–50k for monolingual models
vocab size ≈ 100k–250k for multilingual / production models
```

### Regularization

Modern LMs often use:

```text
little or no dropout
weight decay
```

Weight decay affects optimization dynamics, not only overfitting.

### Stability

Important stability tricks include:

```text
z-loss for output softmax stability
QK norm for attention softmax stability
logit soft-capping
```

### Attention Efficiency

For inference efficiency, models may use:

```text
MQA
GQA
sliding window attention
sparse attention
interleaved full and local attention
```

---

## 23. Final Summary

Modern LM architecture is conservative in many ways.  
Most successful dense LMs share a similar backbone:

```text
decoder-only Transformer
pre-norm
RMSNorm
RoPE
SwiGLU or GeGLU
large FFN
no bias
AdamW-style optimization
weight decay
careful stability tricks
```

The biggest differences across models usually appear in:

```text
position embeddings
activation / FFN variants
vocabulary size and tokenizer
attention efficiency tricks
stability methods
systems-driven hyperparameter choices
```

The main lesson is:

> Modern LMs are not built from one magical architectural trick.  
> They are built from many small, empirically validated choices that together make training stable, efficient, and scalable.

