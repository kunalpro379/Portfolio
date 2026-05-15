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

At time step $t$:

- State: $S_t$
- Action: $A_t$
- Reward: $R_{t+1}$
- Next state: $S_{t+1}$

Transition sequence:

$$
S_t \rightarrow A_t \rightarrow (R_{t+1}, S_{t+1})
$$

---

## 2. Key Features of Reinforcement Learning

### A. Trial-and-Error Learning

The agent does not know the correct behavior initially. It improves by repeated interaction.

Policy:

$$
\pi(a \mid s)
$$

where:

- $\pi$: policy
- $\pi(a \mid s)$: probability of taking action $a$ in state $s$

Goal: find the optimal policy $\pi^*$.

### B. Delayed Reward

An action may affect rewards much later (for example, strategic sacrifices in chess).

Cumulative reward (return):

$$
G_t = R_{t+1} + \gamma R_{t+2} + \gamma^2 R_{t+3} + \cdots
$$

Compact form:

$$
G_t = \sum_{k=0}^{\infty} \gamma^k R_{t+k+1}
$$

Discount factor:

$$
0 \le \gamma \le 1
$$

- If $\gamma = 0$, only immediate reward matters.
- If $\gamma$ is close to 1, future rewards matter strongly.

Example:

$$
R_1 = 5,\quad R_2 = 10,\quad \gamma = 0.9
$$

$$
G_0 = 5 + 0.9 \times 10 = 14
$$

### C. Sequential Decision Making

Current actions influence future states.

Transition probability:

$$
P(S_{t+1} \mid S_t, A_t)
$$

### D. Exploration vs Exploitation

- Exploitation: choose the best known action.
- Exploration: try new actions to discover better long-term behavior.

Epsilon-greedy strategy:

- With probability $\epsilon$: choose random action (explore).
- With probability $1 - \epsilon$: choose best known action (exploit).

Example: if $\epsilon = 0.1$, then 10% exploration and 90% exploitation.

### E. No Labeled Data

RL relies on reward signals, not ground-truth labels.

### F. Goal-Oriented Optimization

The objective is to maximize expected return:

$$
\max \mathbb{E}[G_t]
$$

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

$$
P(s', r \mid s, a)
$$

This is the probability of reaching next state $s'$ and receiving reward $r$, given current state $s$ and action $a$.

### 3) State

Current situation representation:

$$
s \in S
$$

where $S$ is the state space.

### 4) Action

Available decisions:

$$
a \in A
$$

### 5) Reward

Scalar feedback signal, commonly denoted $R_t$.

- Positive reward: $+10$
- Penalty: $-5$

### 6) Policy

Behavior mapping from states to actions.

Stochastic policy:

$$
\pi(a \mid s) = P(A_t = a \mid S_t = s)
$$

Deterministic policy:

$$
a = \pi(s)
$$

### 7) Value Function

Measures expected long-term usefulness.

State-value function:

$$
V^{\pi}(s) = \mathbb{E}_{\pi}[G_t \mid S_t = s]
$$

Action-value (Q) function:

$$
Q^{\pi}(s, a) = \mathbb{E}_{\pi}[G_t \mid S_t = s, A_t = a]
$$

Bellman expectation equation:

$$
V^{\pi}(s) = \sum_a \pi(a\mid s) \sum_{s',r} P(s',r\mid s,a) \left[r + \gamma V^{\pi}(s')\right]
$$

### 8) Model of Environment

A model predicts transitions and rewards:

$$
P(s', r \mid s, a)
$$

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

Positive reinforcement: good action leads to added reward ($R_t > 0$), encouraging repetition.

Negative reinforcement: a bad condition is removed after correct behavior.

Important: negative reinforcement is not punishment. Punishment applies negative reward.

### Type 2: Model-Based RL

Agent has (or learns) environment dynamics, often using:

$$
P(s' \mid s, a)
$$

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

$$
Q(s,a) \leftarrow Q(s,a) + \alpha \left[r + \gamma \max_{a'}Q(s',a') - Q(s,a)\right]
$$

where:

- $\alpha$: learning rate
- $\gamma$: discount factor

#### B) Policy-Based Methods

Directly optimize policy parameters:

$$
\pi_\theta(a \mid s)
$$

Objective:

$$
J(\theta) = \mathbb{E}[G_t]
$$

Gradient update:

$$
\theta \leftarrow \theta + \alpha \nabla_\theta J(\theta)
$$

### Type 4: Actor-Critic Methods

Combine policy learning (actor) and value estimation (critic).

Examples:

- A2C
- A3C
- PPO

### Type 5: On-Policy vs Off-Policy

On-policy methods learn from actions produced by the current policy.

Example: SARSA

$$
Q(s,a) \leftarrow Q(s,a) + \alpha \left[r + \gamma Q(s',a') - Q(s,a)\right]
$$

Off-policy methods can learn from behavior different from the target policy.

Example: Q-learning, using:

$$
\max_a Q(s', a)
$$

---

## 5. Rewards in Reinforcement Learning

Reward is the core learning signal.

Reward function:

$$
R(s, a, s')
$$

It maps $(state, action, next\ state) \rightarrow reward$.

Global objective:

$$
\max \mathbb{E}\left[\sum_{t=0}^{\infty} \gamma^t R_{t+1}\right]
$$

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

$$
(S, A, P, R, \gamma)
$$

where:

- $S$: states
- $A$: actions
- $P$: transition probabilities
- $R$: reward function
- $\gamma$: discount factor

### Markov Property

Future depends only on current state (not full history):

$$
P(S_{t+1} \mid S_t)
$$

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

$$
G_t = \sum_{k=0}^{\infty} \gamma^k R_{t+k+1}
$$

### State Value

$$
V^{\pi}(s) = \mathbb{E}_{\pi}[G_t \mid S_t = s]
$$

### Q-Value

$$
Q^{\pi}(s,a) = \mathbb{E}_{\pi}[G_t \mid S_t = s, A_t = a]
$$

### Bellman Optimality

$$
V^*(s) = \max_a \sum_{s',r} P(s',r\mid s,a) \left[r + \gamma V^*(s')\right]
$$

### Q-Learning Update

$$
Q(s,a) \leftarrow Q(s,a) + \alpha \left[r + \gamma \max_{a'}Q(s',a') - Q(s,a)\right]
$$
