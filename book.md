# Reinforcement Learning (RL)

Reinforcement Learning (RL) is a branch of Machine Learning where an agent learns by interacting with an environment and improving through rewards.

Unlike supervised learning, RL does not learn from labeled input-output pairs. It learns through:

- trial and error
- delayed feedback
- exploration of actions

---

## 1. Core Idea of RL

Imagine a robot learning to walk:

- It tries actions.
- It falls many times.
- It gets a penalty when falling.
- It gets a reward for stable walking.

Over time, it learns behavior that maximizes reward.

### RL Interaction Cycle

1. Agent observes current state.
2. Agent chooses an action.
3. Environment transitions to a new state.
4. Agent receives reward.
5. Repeat.

### Mathematical Step

At time step t:

- State: S_t
- Action: A_t
- Reward: R_(t+1)
- Next state: S_(t+1)

Transition sequence:

```text
S_t -> A_t -> (R_(t+1), S_(t+1))
```

---

## 2. Key Features of Reinforcement Learning

### A. Trial-and-Error Learning

The agent does not know the correct behavior initially. It improves by repeated interaction.

Policy:

```text
π(a | s)
```

where:

- π: policy
- π(a | s): probability of taking action a in state s

Goal: find the optimal policy π*.

### B. Delayed Reward

An action may affect rewards much later (for example, strategic sacrifices in chess).

Cumulative reward (return):

```text
Gₜ = R₍t+1₎ + γR₍t+2₎ + γ²R₍t+3₎ + ...
```

Compact form:

```text
Gₜ = Σ(k=0 to ∞) [ γᵏ · R₍t+k+1₎ ]
```

Discount factor:

```text
0 ≤ γ ≤ 1
```

- If γ = 0, only immediate reward matters.
- If γ is close to 1, future rewards matter strongly.

Example:

```text
R₁ = 5, R₂ = 10, γ = 0.9
G₀ = 5 + 0.9×10 = 14
```

### C. Sequential Decision Making

Current actions influence future states.

Transition probability:

```text
P(S₍t+1₎ | Sₜ, Aₜ)
```

### D. Exploration vs Exploitation

- Exploitation: choose the best known action.
- Exploration: try new actions to discover better long-term behavior.

Epsilon-greedy strategy:

- With probability ε: choose random action (explore).
- With probability (1 − ε): choose best known action (exploit).

Example: if ε = 0.1, then 10% exploration and 90% exploitation.

### E. No Labeled Data

RL relies on reward signals, not ground-truth labels.

### F. Goal-Oriented Optimization

The objective is to maximize expected return:

```text
maximize 𝔼[Gₜ]
```

---

## 3. Main Elements of Reinforcement Learning

1. Agent
2. Environment
3. State
4. Action
5. Reward
6. Policy
7. Value function
8. Model

### 1) Agent

The learner or decision-maker.

Examples:

- robot
- game AI
- self-driving car controller

### 2) Environment

Everything outside the agent.

Environment dynamics:

```text
P(s', r | s, a)
```

This is the probability of reaching next state s' and receiving reward r, given current state s and action a.

### 3) State

Current situation representation:

```text
s in S
```

where S is the state space.

### 4) Action

Available decisions:

```text
a in A
```

### 5) Reward

Scalar feedback signal, commonly denoted R_t.

- Positive reward: +10
- Penalty: -5

### 6) Policy

Behavior mapping from states to actions.

Stochastic policy:

```text
π(a | s) = P(Aₜ = a | Sₜ = s)
```

Deterministic policy:

```text
a = π(s)
```

### 7) Value Function

Measures expected long-term usefulness.

State-value function:

```text
V^π(s) = 𝔼_π[ Gₜ | Sₜ = s ]
```

Action-value (Q) function:

```text
Q^π(s, a) = 𝔼_π[ Gₜ | Sₜ = s, Aₜ = a ]
```

Bellman expectation equation:

```text
V^π(s) = Σₐ π(a|s) · Σ_(s',r) P(s',r|s,a) · [ r + γV^π(s') ]
```

### 8) Model of Environment

A model predicts transitions and rewards:

```text
P(s', r | s, a)
```

This leads to two major families:

- model-based RL
- model-free RL

---

## 4. Types of Reinforcement Learning

Common classifications:

1. Positive vs negative reinforcement
2. Model-based vs model-free
3. Value-based vs policy-based
4. On-policy vs off-policy

### Type 1: Positive and Negative Reinforcement

Positive reinforcement: good action leads to added reward (R_t > 0), encouraging repetition.

Negative reinforcement: a bad condition is removed after correct behavior.

Important: negative reinforcement is not punishment. Punishment applies negative reward.

### Type 2: Model-Based RL

Agent has (or learns) environment dynamics, often using:

```text
P(s' | s, a)
```

Pros:

- sample efficient
- supports planning

Cons:

- model can be hard to build accurately

### Type 3: Model-Free RL

Agent does not rely on an explicit environment model.

#### A) Value-Based Methods

Learn value functions directly.

Examples:

- Q-learning
- DQN

Q-learning update:

```text
Q(s,a) ← Q(s,a) + α · [ r + γ · max_(a') Q(s',a') − Q(s,a) ]
```

where:

- α: learning rate
- γ: discount factor

#### B) Policy-Based Methods

Directly optimize policy parameters:

```text
πθ(a | s)
```

Objective:

```text
J(θ) = 𝔼[Gₜ]
```

Gradient update:

```text
θ ← θ + α · ∇θ J(θ)
```

### Type 4: Actor-Critic Methods

Combine policy learning (actor) and value estimation (critic).

Examples:

- A2C
- A3C
- PPO

### Type 5: On-Policy vs Off-Policy

On-policy methods learn from actions produced by the current policy.

Example: SARSA

```text
Q(s,a) ← Q(s,a) + α · [ r + γQ(s',a') − Q(s,a) ]
```

Off-policy methods can learn from behavior different from the target policy.

Example: Q-learning, using:

```text
maxₐ Q(s', a)
```

---

## 5. Rewards in Reinforcement Learning

Reward is the core learning signal.

Reward function:

```text
R(s, a, s')
```

It maps (state, action, next state) -> reward.

Global objective:

```text
maximize 𝔼[ Σ(t=0 to ∞) γᵗ · R₍t+1₎ ]
```

### Sparse Rewards

Reward is rare (for example, win/loss only in chess), making learning harder.

### Dense Rewards

Frequent feedback (for example, lane-keeping bonus in driving), making learning easier.

### Reward Shaping

Add intermediate rewards to speed up learning, while preserving final goal behavior.

### Reward Hacking

Agent exploits loopholes in reward design instead of solving the intended task.

---

## 6. Markov Decision Process (MDP)

RL is commonly formalized as an MDP:

```text
(S, A, P, R, γ)
```

where:

- S: states
- A: actions
- P: transition probabilities
- R: reward function
- γ: discount factor

### Markov Property

Future depends only on current state (not full history):

```text
P(S₍t+1₎ | Sₜ)
```

---

## 7. RL Workflow Summary

```text
Agent observes state
    -> chooses action
    -> environment transitions
    -> reward is received
    -> policy/value updated
    -> repeat
```

---

## 8. Real-World Applications

- game playing (for example, AlphaGo)
- robotics
- autonomous driving
- trading systems
- recommendation systems
- dialogue and chatbot optimization
- resource scheduling

---

## 9. Important Equation Summary

### Return

```text
Gₜ = Σ(k=0 to ∞) [ γᵏ · R₍t+k+1₎ ]
```

### State Value

```text
V^π(s) = 𝔼_π[ Gₜ | Sₜ = s ]
```

### Q-Value

```text
Q^π(s,a) = 𝔼_π[ Gₜ | Sₜ = s, Aₜ = a ]
```

### Bellman Optimality

```text
V*(s) = maxₐ Σ_(s',r) P(s',r|s,a) · [ r + γV*(s') ]
```

### Q-Learning Update

```text
Q(s,a) ← Q(s,a) + α · [ r + γmax_(a') Q(s',a') − Q(s,a) ]
```
