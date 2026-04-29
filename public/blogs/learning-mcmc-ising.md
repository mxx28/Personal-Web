---
title: Learning MCMC through the Ising Model
date: '2026-01-23'
description: 'A practical, visual introduction to Metropolis, Gibbs sampling, and exact sampling (CFTP) using the Ising model.'
---

## Context

I’ve been self-studying Markov Chain Monte Carlo (MCMC) recently, and the most useful “mental model” I found didn’t come from statistics textbooks — it came from statistical physics. The Ising model is a deceptively small toy that makes MCMC feel concrete: you can literally watch a sampler move through a giant configuration space, and you can understand why certain updates are accepted, why chains mix slowly near phase transitions, and (in special cases) how **exact sampling** becomes possible.

This post is a rigorous-but-readable walkthrough: no proofs, but also no hand-waving.

---

## The Ising model in one page

Start with an undirected graph $G=(V,E)$. At every vertex $v\in V$ we place a binary variable $x_v\in\{+1,-1\}$. A full configuration is $x=(x_v)_{v\in V}\in\{+1,-1\}^{|V|}$. If you like metaphors, think of each spin as a coin: heads is $+1$, tails is $-1$. The model says each spin wants to agree with its neighbors (ferromagnetism), and it may also be influenced by an external field.

We encode that preference using an energy (Hamiltonian):

$$
H(x) = -\sum_{(u,v)\in E} J_{uv}\,x_u x_v \;-\; \sum_{v\in V} h_v\,x_v.
$$

Here $J_{uv}$ controls how strongly neighboring spins interact (positive $J_{uv}$ encourages alignment), and $h_v$ is the external field at vertex $v$. Lower energy means "more likely," but at nonzero temperature the system still fluctuates. The standard probabilistic model is the Gibbs distribution:

$$
\pi_\beta(x)=\frac{\exp(-\beta H(x))}{Z_\beta},\qquad Z_\beta=\sum_{x\in\{+1,-1\}^{|V|}}\exp(-\beta H(x)),\qquad \beta = 1/T.
$$

The problem is immediate: $Z_\beta$ is a sum over $2^{|V|}$ states, so exact normalization is infeasible except for tiny graphs. What we actually want is **samples** $x\sim\pi_\beta$. This is exactly where MCMC shines: we build a Markov chain whose stationary distribution is $\pi_\beta$, then simulate the chain.

---

## Metropolis: propose a flip, accept or reject

The simplest MCMC idea for Ising is local: change one spin at a time. From the current state $x$, pick a vertex $u$ uniformly at random and propose flipping that spin: $y_u=-x_u$ and $y_v=x_v$ for all $v\neq u$. Then accept the proposed move with

$$
a(x,y)=\min\{1,\exp(-\beta(H(y)-H(x)))\}.
$$

If you accept, move to $y$; if you reject, stay at $x$. This "reject = stay" detail is important: it makes the chain aperiodic in practice and ensures the Markov chain is well-defined even when proposed moves are frequently rejected (e.g., low temperature).

What makes this algorithm feel less like magic is that for a single-spin flip, the energy difference can be written using a **local field**. Define

$$
h_u^{(\mathrm{loc})}(x)=\sum_{v\sim u} J_{uv}\,x_v + h_u.
$$

Then flipping $x_u$ changes the energy by

$$
H(y)-H(x)=2x_u\,h_u^{(\mathrm{loc})}(x),
$$

so the acceptance probability is completely local:

- if the spin agrees with its local field ($x_u h_u^{(\mathrm{loc})}>0$), flipping increases energy and is unlikely at large $\beta$;
- if the spin disagrees ($x_u h_u^{(\mathrm{loc})}<0$), flipping decreases energy and is always accepted.

This is the first “aha” moment: **the sampler is just local physics**.

---

## Gibbs sampling (Glauber dynamics): resample instead of reject

Metropolis proposes a flip and sometimes rejects. Gibbs sampling removes rejection by sampling the spin directly from its conditional distribution given the neighbors. Pick a vertex $u$ uniformly and set $x_u$ to $+1$ with probability

$$
\mathbb{P}(x_u=+1\mid x_{V\setminus\{u\}})=\frac12\Bigl(1+\tanh(\beta\,h_u^{(\mathrm{loc})}(x))\Bigr),
$$

otherwise set it to $-1$. Everything else stays the same. Conceptually it's still "one local update at a time," but the chain often mixes better because it avoids wasting steps on rejected proposals.

If you only remember one thing: **Metropolis and Gibbs are two ways to implement local moves that target the same Gibbs distribution**.

---

## Where MCMC becomes tricky: mixing and temperature

At high temperature (small $\beta$), thermal noise is strong and the chain explores many configurations quickly. At low temperature (large $\beta$), the model strongly prefers aligned states, and local updates can get "stuck" in one mode for a long time. This is the classic MCMC story: the stationary distribution exists, but reaching it can be slow. In Ising, this slow mixing is most dramatic near phase transitions.

This is also why the Ising model is such a good teaching tool: you can actually see mixing slow down.

---

## Exact sampling: Coupling From The Past (CFTP)

Most of the time, MCMC gives approximate samples — you run for a while and hope you've mixed. But for ferromagnetic Ising models ($J_{uv}\ge 0$), something special can happen: the dynamics is **monotone** under a natural partial order. Informally, if one configuration has "more $+1$ spins" than another and both are updated using the same randomness, they never cross.

That monotonicity enables **perfect sampling** via Coupling From The Past (CFTP). The idea is to run the chain from time $-T$ up to time $0$, not from an arbitrary initial state, but simultaneously from the two extreme states: all $-1$ and all $+1$. If those two trajectories coalesce by time 0, monotonicity implies _every_ initial state would also map to the same final state, and that final state is an **exact draw from $\pi_\beta$**. No burn-in. No diagnostics. Zero bias.

In practice, you increase $T$ (often doubling it) until coalescence occurs. When it does, you return the state at time 0 and you're done.

---

## Closing thoughts

Ising is a rare model where MCMC is both intuitive and deep: local energy differences explain acceptance rules; temperature explains mixing behavior; and in special ferromagnetic settings, monotonicity unlocks exact sampling through coupling. Once you view MCMC through this lens, Metropolis and Gibbs stop being abstract algorithms and start looking like what they are: carefully designed stochastic dynamics.

