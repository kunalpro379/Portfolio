Bro these topics are the mathematical foundation of:

- Machine Learning
- Deep Learning
- Reinforcement Learning
- Transformers
- Recommendation Systems
- Statistics
- Data Science

If you understand these deeply, almost every AI concept becomes much easier.

---

# PART 1: Probability Distributions

# What is Probability?

Probability measures:

> “How likely an event is to happen.”

Range:

$$
0 \le P(A) \le 1
$$

- $0$ -> impossible
- $1$ -> certain

Example:

For a fair dice:

$$
P(3) = \frac{1}{6}
$$

---

# Random Variable

A random variable represents outcomes numerically.

Example:

Let:

$$
X = \text{number obtained on dice}
$$

Then:

$$
X \in \{1, 2, 3, 4, 5, 6\}
$$

---

# Probability Distribution

A probability distribution tells us:

> “What probabilities are assigned to all possible values of a random variable.”

Example (fair dice):

| x | P(X=x) |
| - | ------ |
| 1 | 1/6    |
| 2 | 1/6    |
| 3 | 1/6    |
| 4 | 1/6    |
| 5 | 1/6    |
| 6 | 1/6    |

This table itself is the probability distribution.

---

# Types of Probability Distributions

---

# 1. Discrete Distribution

Values are countable.

Examples:

- Dice outcomes
- Number of students
- Number of heads

Uses PMF (Probability Mass Function).

---

# 2. Continuous Distribution

Values can be infinitely many.

Examples:

- Height
- Weight
- Temperature

Uses PDF (Probability Density Function).

---

# PMF (Probability Mass Function)

For discrete variables:

$$
P(X=x)
$$

Example:

$$
P(X=2) = \frac{1}{6}
$$

---

# PDF (Probability Density Function)

For continuous variables.

Important idea:

Probability at an exact point is almost zero.

Instead we compute probability over intervals.

Example:

$$
P(20 < X < 25)
$$

This equals area under the curve.

---

# CDF (Cumulative Distribution Function)

Probability up to a point.

$$
F(x) = P(X \le x)
$$

Example:

$$
F(3) = P(X \le 3)
$$

For a dice:

$$
= \frac{1}{6} + \frac{1}{6} + \frac{1}{6}
$$

$$
= \frac{1}{2}
$$

---

# Important Probability Distributions

---

# 1. Bernoulli Distribution

Only two outcomes:

- Success = 1
- Failure = 0

Examples:

- Pass/fail
- Spam/not spam
- Click/no click

Probabilities:

$$
P(X=1) = p
$$

$$
P(X=0) = 1-p
$$

---

# 2. Binomial Distribution

Multiple Bernoulli trials.

Example:

10 coin tosses.

“What is the probability of exactly 7 heads?”

Formula:

$$
P(X=k)=\binom{n}{k}p^k(1-p)^{n-k}
$$

Where:

- $n$ = number of trials
- $k$ = number of successes
- $p$ = success probability

---

# 3. Uniform Distribution

All outcomes equally likely.

Example:

Fair dice.

---

# 4. Normal Distribution (Very Important)

Bell-shaped curve.

Most important distribution in ML.

$$
f(x)=\frac{1}{\sqrt{2\pi\sigma^2}}e^{-\frac{(x-\mu)^2}{2\sigma^2}}
$$

Where:

- $\mu$ = mean
- $\sigma$ = standard deviation

Properties:

- Symmetric
- Most values near the mean
- Extreme values are rare

Examples:

- Human height
- IQ scores
- Measurement errors

---

# Expected Value (Mean)

Expected value is the long-run average.

---

# Formula

$$
E[X] = \sum xP(x)
$$

---

# Dice Example

$$
E[X] = 1\cdot\frac{1}{6} + 2\cdot\frac{1}{6} + \dots + 6\cdot\frac{1}{6}
$$

$$
= \frac{21}{6} = 3.5
$$

Interesting point:

A dice never shows 3.5,
but over many throws the average approaches 3.5.

---

# Intuition of Expected Value

Expected value tells:

> “What average outcome should we expect over many repetitions?”

Used everywhere:

- Reinforcement learning rewards
- Loss functions
- Statistical estimation
- Finance
- Game theory

---

# Variance

Variance measures spread.

$$
Var(X) = E[(X-\mu)^2]
$$

Large variance:

-> data spread out more.

Small variance:

-> data concentrated near mean.

---

# Standard Deviation

Square root of variance.

$$
\sigma = \sqrt{Var(X)}
$$

Standard deviation is easier to interpret because units remain same as original data.

---

# Why Probability Matters in AI/ML

Used in:

- Naive Bayes
- Hidden Markov Models
- Bayesian Learning
- Reinforcement Learning
- Diffusion Models
- Language Models
- Uncertainty estimation

---

# PART 2: Basic Linear Algebra

Linear algebra is the language of AI.

Neural networks are basically giant matrix operations.

---

# Scalar

A single number.

Example:

$$
5
$$

---

# Vector

An ordered list of numbers.

Example:

$$
v=[2,3]
$$

Can represent:

- features
- embeddings
- positions
- images

---

# Matrix

A rectangular grid of numbers.

$$
A=
\begin{bmatrix}
1 & 2 \\
3 & 4
\end{bmatrix}
$$

Used for:

- datasets
- neural network weights
- image processing
- transformations

---

# Vector Operations

---

# 1. Vector Addition

$$
[1,2]+[3,4]=[4,6]
$$

---

# 2. Scalar Multiplication

$$
2[1,2]=[2,4]
$$

---

# Inner Product / Dot Product (Very Important)

Most important operation in ML.

---

# Formula

$$
a\cdot b=\sum_i a_ib_i
$$

---

# Example

$$
a=[1,2,3]
$$

$$
b=[4,5,6]
$$

Then:

$$
a\cdot b = 1(4)+2(5)+3(6)
$$

$$
= 4+10+18=32
$$

---

# Geometric Meaning of Dot Product

Dot product measures similarity between vectors.

---

# Angle Interpretation

$$
a\cdot b = |a||b|\cos\theta
$$

---

# Cases

## Same direction

$$
\theta=0
$$

$$
\cos 0 = 1
$$

Large positive similarity.

---

## Perpendicular

$$
\theta=90^\circ
$$

$$
\cos 90 = 0
$$

No similarity.

---

## Opposite direction

Negative similarity.

---

# Why Dot Product is Important

Used in:

- Neural networks
- Transformers attention
- Embeddings
- Recommendation systems
- Search engines
- Cosine similarity

Transformers heavily rely on dot products.

---

# Vector Magnitude

Length of vector.

$$
|v| = \sqrt{\sum_i v_i^2}
$$

Example:

$$
[3,4]
$$

Magnitude:

$$
\sqrt{3^2+4^2} = 5
$$

---

# Unit Vector

A vector with length 1.

Normalization:

$$
\hat v = \frac{v}{||v||}
$$

Used heavily in ML preprocessing.

---

# Cosine Similarity

Very important in embeddings and NLP.

$$
\cos\theta = \frac{a\cdot b}{|a||b|}
$$

Measures similarity independent of magnitude.

Applications:

- Semantic search
- ChatGPT embeddings
- Recommendation systems

---

# Matrix Multiplication

Core operation in deep learning.

Example:

$$
A=
\begin{bmatrix}
1 & 2 \\
3 & 4
\end{bmatrix}
$$

$$
B=
\begin{bmatrix}
5 \\
6
\end{bmatrix}
$$

Then:

$$
AB=
\begin{bmatrix}
17 \\
39
\end{bmatrix}
$$

Because:

$$
1(5)+2(6)=17
$$

$$
3(5)+4(6)=39
$$

---

# Why Matrices Matter

Matrices represent:

- datasets
- neural network weights
- transformations
- graph relationships
- attention scores

Deep learning is mostly optimized matrix multiplication.

---

# Linear Transformations

Matrices transform vectors.

Examples:

- scaling
- rotation
- stretching

Neural networks learn transformations of data.

---

# Eigenvalues and Eigenvectors (Basic Intuition)

Very important later in ML.

Equation:

$$
Av=\lambda v
$$

Meaning:

Vector direction remains same,
only magnitude changes.

Used in:

- PCA
- dimensionality reduction
- spectral methods

---

# Connection Between Probability and Linear Algebra

AI combines both.

| Area | Probability | Linear Algebra |
| --- | --- | --- |
| Neural Networks | uncertainty | matrices |
| Transformers | token probabilities | dot products |
| RL | expected rewards | vector states |
| Recommenders | likelihood | embeddings |
| PCA | variance | eigenvectors |

---

# Most Important Concepts to Master

## Probability

- Random variables
- PMF/PDF
- Expected value
- Variance
- Normal distribution
- Conditional probability
- Bayes theorem

---

## Linear Algebra

- vectors
- matrices
- dot product
- cosine similarity
- matrix multiplication
- eigenvalue intuition

---

# Final Big Intuition

## Linear Algebra

= language for representing data.

## Probability

= language for handling uncertainty.

## AI/ML

= optimization + probability + linear algebra.
