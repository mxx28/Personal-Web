---
title: "Speculative Decoding: Let the Small Model Guess, Let the Big Model Judge"
date: "2026-06-22"
description: "A self-study note on why speculative decoding can speed up autoregressive generation without changing the target model's output distribution."
---

Lately I have been reading more about **LLM inference**, and one idea I kept coming back to is **speculative decoding**.

It is one of those rare tricks that feels simple in hindsight: let a smaller, faster model guess a few future tokens first, then let the larger model verify them in parallel. If the guesses are good, generation moves forward by multiple tokens after a single expensive pass.

What makes the method especially elegant is that the small model does not get to change the final answer. It only proposes. The large model still decides what survives.

---

## 1. The Basic Problem: Autoregressive Decoding Is Sequential

For a language model, generation is usually autoregressive:

```text
x_1, x_2, ..., x_t  ->  x_{t+1}
```

Then the generated token is appended:

```text
x_1, x_2, ..., x_t, x_{t+1}  ->  x_{t+2}
```

Mathematically, the model samples tokens according to:

```math
p(x_{t+1} \mid x_1, ..., x_t)
```

Then:

```math
p(x_{t+2} \mid x_1, ..., x_t, x_{t+1})
```

and so on.

The annoying part is that the next token depends on the previous generated token, so decoding seems inherently serial.

For a large model, each forward pass is expensive. Even worse, during inference, especially at small batch sizes, decoding can be **memory-bound**: the bottleneck is often moving model weights and KV cache through GPU memory, not just doing arithmetic. This means that asking the large model to score several positions in one forward pass may not be much more expensive than asking it to score only one.

This is exactly where speculative decoding becomes interesting.

---

## 2. Main Idea

Speculative decoding uses two models:

- **Draft model**: a smaller, faster model that proposes several candidate tokens.
- **Target model**: the original large model that verifies the proposed tokens.

The draft model is like an assistant who quickly says:

> “I think the next few tokens are probably these.”

The target model then checks:

> “Good, good, good... wait, not that one.”

If several draft tokens are accepted, we move forward several tokens with only one large-model verification pass.

The key idea is:

```text
Small model drafts multiple tokens.
Large model verifies them in parallel.
Accepted tokens are appended to the output.
Rejected tokens are corrected using the large model.
```

So the large model still controls the final distribution. The small model only helps propose candidates.

This is why speculative decoding is not just “use a smaller model instead.” It is more like:

> Use the small model as a cheap guesser, and the large model as the final judge.

---

## 3. A Simple Example

Suppose the current context is:

```text
The cat is
```

The draft model proposes three tokens:

```text
sitting on the
```

So we have:

```text
The cat is sitting on the
```

The large model then verifies these draft tokens in one forward pass.

Although this is one forward pass, the large model effectively evaluates:

```math
p_L(\text{sitting} \mid \text{The cat is})
```

```math
p_L(\text{on} \mid \text{The cat is sitting})
```

```math
p_L(\text{the} \mid \text{The cat is sitting on})
```

This is important: the contexts are **not the same** for all draft tokens.

Because of the causal mask, each token is evaluated with the correct prefix. The model can compute these conditional probabilities in parallel, but each position still only sees the tokens before it.

If all three tokens are accepted, the output advances by three tokens after only one large-model pass.

If only the first two are accepted, then we keep:

```text
The cat is sitting on
```

and resample from the rejected position.

---

## 4. Drafting Is Still Autoregressive

A common misunderstanding is to think that the draft model predicts all future tokens from exactly the same context.

That is usually not true.

The draft model also generates autoregressively. If the current context is `x`, and the draft tokens are:

```math
y_1, y_2, ..., y_\gamma
```

then the draft model samples:

```math
y_1 \sim p_S(\cdot \mid x)
```

```math
y_2 \sim p_S(\cdot \mid x, y_1)
```

```math
y_3 \sim p_S(\cdot \mid x, y_1, y_2)
```

and in general:

```math
y_i \sim p_S(\cdot \mid x, y_{<i})
```

So the draft model still walks step by step.

The acceleration comes from the fact that the draft model is much cheaper than the target model, and the target model can verify multiple draft tokens in a single pass.

---

## 5. Verification Uses Different Contexts

Another important point is that the target model does **not** verify every draft token under the same context.

For draft tokens:

```math
y_1, y_2, y_3
```

the target model computes:

```math
p_L(y_1 \mid x)
```

```math
p_L(y_2 \mid x, y_1)
```

```math
p_L(y_3 \mid x, y_1, y_2)
```

So when verifying later tokens, the target model conditions on the earlier draft tokens.

In implementation, this does not require running the target model repeatedly. We can feed the whole sequence:

```text
x, y_1, y_2, y_3
```

into the target model once, and the causal mask ensures that every position sees the correct prefix.

This is the magical part:

> The computation is parallel, but the probabilities are still autoregressive.

---

## 6. Accept or Reject?

Speculative decoding is not just checking whether the draft token is the top-1 token of the large model.

Instead, it uses a rejection-sampling-style correction so that the final samples follow the target model distribution.

For a draft token `y_i`, suppose:

```math
p_S(y_i \mid x, y_{<i})
```

is the probability assigned by the small draft model, and:

```math
p_L(y_i \mid x, y_{<i})
```

is the probability assigned by the large target model.

Then a common acceptance probability is:

```math
\min \left(1, \frac{p_L(y_i \mid x, y_{<i})}{p_S(y_i \mid x, y_{<i})} \right)
```

Intuitively:

- If the large model likes the token at least as much as the small model does, accept it.
- If the large model likes it less, accept it only with some probability.
- If a token is rejected, sample a replacement from a corrected distribution.

This correction step is what makes standard speculative decoding exact: it can speed up decoding without changing the target model's sampling distribution.

In other words:

> The draft model may guess, but it does not get to secretly change the rules.

---

## 7. Why Can This Be Faster?

Let:

- `γ` be the number of draft tokens proposed each round;
- `T_S` be the time for the small model to generate one token;
- `T_L` be the time for the large model to run one verification pass;
- `α` be the average acceptance rate of draft tokens.

A speculative decoding round costs approximately:

```math
\gamma T_S + T_L
```

because the small model generates `γ` tokens, and then the large model verifies them once.

If the average number of accepted draft tokens is:

```math
\alpha \gamma
```

and the target model can usually produce one additional token after verification, then one round advances about:

```math
\alpha \gamma + 1
```

tokens.

Without speculative decoding, generating that many tokens would cost roughly:

```math
(\alpha \gamma + 1)T_L
```

So speculative decoding is beneficial when:

```math
\gamma T_S + T_L < (\alpha \gamma + 1)T_L
```

Simplifying:

```math
\gamma T_S < \alpha \gamma T_L
```

```math
\frac{T_S}{T_L} < \alpha
```

This condition is very intuitive:

> The draft model must be faster than the target model by enough margin, and its guesses must be accepted often enough.

If the draft model is fast but inaccurate, most tokens are rejected.

If the draft model is accurate but too slow, the drafting overhead kills the speedup.

The sweet spot is:

```math
T_S \ll T_L
```

and:

```math
\alpha \approx 1
```

That is, the draft model should be both fast and surprisingly good.

---

## 8. Why Draft Quality Matters

Speculative decoding is like asking a junior assistant to pre-fill a form before a senior expert reviews it.

If the assistant is usually right, the expert can approve many entries quickly.

If the assistant is usually wrong, the expert spends all the time correcting mistakes, and the whole process may become slower than doing it directly.

For LLMs, this means the draft model should be well aligned with the target model. A tiny model that predicts very different tokens may not help much. A slightly larger but much better aligned model may be faster overall.

This creates an interesting engineering trade-off:

```text
Smaller drafter:
    faster per token
    but lower acceptance rate

Larger drafter:
    slower per token
    but higher acceptance rate
```

The best drafter is not necessarily the smallest one. It is the one that gives the best speed-quality trade-off.

---

## 9. Speculative Decoding vs. Multi-Token Prediction

Speculative decoding and multi-token prediction both talk about “multiple future tokens,” but they are not the same thing.

### Speculative decoding

Speculative decoding is mainly an **inference-time acceleration algorithm**.

It uses a draft model to propose multiple tokens, and the target model verifies them.

The original target model does not need to be retrained or structurally modified.

### Multi-token prediction

Multi-token prediction is usually a **training objective or architectural design**.

A model may be trained to predict several future tokens from one position or one hidden state:

```math
x_{t+1}, x_{t+2}, ..., x_{t+k}
```

This can improve representations or support special decoding heads.

So the difference is:

```text
Speculative decoding:
    small model proposes, large model verifies

Multi-token prediction:
    one model learns to predict several future tokens
```

Speculative decoding is about reducing the number of expensive target-model decoding steps. Multi-token prediction is more about what the model learns or how its heads are designed.

---

## 10. Related Variants

The basic speculative decoding idea has inspired many follow-up methods.

### Speculative Sampling

Speculative sampling is a closely related formulation that uses a faster draft model and a modified rejection sampling scheme to preserve the target distribution. It showed that large-model decoding can be accelerated without compromising sample quality.

### Medusa

Medusa takes a different route: instead of using a separate draft model, it adds multiple decoding heads to the LLM. These heads predict multiple future tokens, and then a tree-based attention mechanism verifies multiple candidates in parallel.

This feels like giving the model several “future-looking heads” and asking them to propose possible continuations.

### Lookahead Decoding

Lookahead decoding tries to break the sequential dependency of LLM inference without requiring an auxiliary draft model. It explores future n-grams and verifies candidates in parallel, trading extra computation per step for fewer total decoding steps.

These methods all share a similar motivation:

> The GPU is good at parallel work. The decoding algorithm should not waste that parallelism.

---

## 11. Common Misunderstandings

### Misunderstanding 1: The draft model predicts all tokens from the same context

Not quite.

The draft model usually generates tokens autoregressively:

```math
p_S(y_1 \mid x), \quad
p_S(y_2 \mid x, y_1), \quad
p_S(y_3 \mid x, y_1, y_2)
```

So each drafted token uses the previous draft tokens as context.

### Misunderstanding 2: The target model verifies all tokens under the same context

Also not quite.

The target model verifies:

```math
p_L(y_1 \mid x), \quad
p_L(y_2 \mid x, y_1), \quad
p_L(y_3 \mid x, y_1, y_2)
```

The contexts are different, but the probabilities are computed in one parallel forward pass.

### Misunderstanding 3: Speculative decoding lowers output quality

Standard speculative decoding is designed to preserve the target model distribution.

If implemented exactly, the output distribution should match normal decoding from the target model.

However, approximate engineering variants may trade exactness for speed.

### Misunderstanding 4: A smaller drafter is always better

Not necessarily.

A very small drafter may be fast but inaccurate, leading to low acceptance rates. A slightly larger drafter may be better if it produces much more acceptable tokens.

The real goal is not just a small drafter. The goal is a drafter with a good ratio of speed to acceptance rate.

---

## 12. The One-Sentence Summary

Speculative decoding speeds up LLM generation by letting a small model cheaply draft several tokens and letting the large model verify them in parallel, so that one expensive large-model forward pass can sometimes advance multiple tokens.

Or, more casually:

> Let the small model make a bold guess. Let the big model approve the good parts. Move faster when the guess is right.

---

## References

- Leviathan, Y., Kalman, M., & Matias, Y. **Fast Inference from Transformers via Speculative Decoding**. arXiv:2211.17192, 2022.
- Chen, C., Borgeaud, S., Irving, G., Lespiau, J.-B., Sifre, L., & Jumper, J. **Accelerating Large Language Model Decoding with Speculative Sampling**. arXiv:2302.01318, 2023.
- Cai, T., Li, Y., Geng, Z., Peng, H., Lee, J. D., Chen, D., & Dao, T. **Medusa: Simple LLM Inference Acceleration Framework with Multiple Decoding Heads**. arXiv:2401.10774, 2024.
- Fu, Y., Bailis, P., Stoica, I., & Zhang, H. **Break the Sequential Dependency of LLM Inference Using Lookahead Decoding**. arXiv:2402.02057, 2024.
