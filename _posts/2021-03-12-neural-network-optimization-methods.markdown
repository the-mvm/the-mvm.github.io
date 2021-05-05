---
layout: post
read_time: true
show_date: true
title:  Neural Network Optimization Methods and Algorithms
date:   2021-03-12 13:32:20 -0600
description: Some neural network optimization algorithms mostly to implement momentum when doing back propagation.
img: posts/20210312/nnet_optimization.jpg
tags: [coding, machine learning, optimization, deep Neural networks]
author: Armando Maynez
github: amaynez/TicTacToe/blob/7bf83b3d5c10adccbeb11bf244fe0af8d9d7b036/entities/Neural_Network.py#L199
mathjax: yes # leave empty or erase to prevent the mathjax javascript from loading
toc: yes # leave empty or erase for no TOC
---
For the seemingly small project I undertook of [creating a machine learning neural network that could learn by itself to play tic-tac-toe](./deep-q-learning-tic-tac-toe.html), I bumped into the necesity of implementing at least one momentum algorithm for the optimization of the network during backpropagation.

And since my original post for the TicTacToe project is quite large already, I decided to post separately these optimization methods and how did I implement them in my code.

### Adam
[source](https://ruder.io/optimizing-gradient-descent/index.html#adam)

<p>Adaptive Moment Estimation (Adam) is an optimization method that computes adaptive learning rates for each weight and bias. In addition to storing an exponentially decaying average of past squared gradients \(v_t\) and an exponentially decaying average of past gradients \(m_t\), similar to momentum. Whereas momentum can be seen as a ball running down a slope, Adam behaves like a heavy ball with friction, which thus prefers flat minima in the error surface. We compute the decaying averages of past and past squared gradients \(m_t\) and \(v_t\) respectively as follows:</p>
<p style="text-align:center">\(<br>
\begin{align}<br>
\begin{split}<br>
m_t &amp;= \beta_1 m_{t-1} + (1 - \beta_1) g_t \\<br>
v_t &amp;= \beta_2 v_{t-1} + (1 - \beta_2) g_t^2<br>
\end{split}<br>
\end{align}<br>
\)</p>
<p>\(m_t\) and \(v_t\) are estimates of the first moment (the mean) and the second moment (the uncentered variance) of the gradients respectively, hence the name of the method. As \(m_t\) and \(v_t\) are initialized as vectors of 0's, the authors of Adam observe that they are biased towards zero, especially during the initial time steps, and especially when the decay rates are small (i.e. \(\beta_1\) and \(\beta_2\) are close to 1).</p>
<p>They counteract these biases by computing bias-corrected first and second moment estimates:</p>
<p style="text-align:center">\(<br>
\begin{align}<br>
\begin{split}<br>
\hat{m}_t &amp;= \dfrac{m_t}{1 - \beta^t_1} \\<br>
\hat{v}_t &amp;= \dfrac{v_t}{1 - \beta^t_2} \end{split}<br>
\end{align}<br>
\)</p>
<p>We then use these to update the weights and biases which yields the Adam update rule:</p>
<p style="text-align:center">\(\theta_{t+1} = \theta_{t} - \dfrac{\eta}{\sqrt{\hat{v}_t} + \epsilon} \hat{m}_t\).</p>
<p>The authors propose defaults of 0.9 for \(\beta_1\), 0.999 for \(\beta_2\), and \(10^{-8}\) for \(\epsilon\).</p>
[view on github](https://github.com/amaynez/TicTacToe/blob/b429e5637fe5f61e997f04c01422ad0342565640/entities/Neural_Network.py#L243)

```python
# decaying averages of past gradients
self.v["dW" + str(i)] = ((c.BETA1
                        * self.v["dW" + str(i)])
                        + ((1 - c.BETA1)
                        * np.array(self.gradients[i])
                        ))
self.v["db" + str(i)] = ((c.BETA1
                        * self.v["db" + str(i)])
                        + ((1 - c.BETA1)
                        * np.array(self.bias_gradients[i])
                        ))

# decaying averages of past squared gradients
self.s["dW" + str(i)] = ((c.BETA2
                        * self.s["dW"+str(i)])
                        + ((1 - c.BETA2)
                        * (np.square(np.array(self.gradients[i])))
                         ))
self.s["db" + str(i)] = ((c.BETA2
                        * self.s["db" + str(i)])
                        + ((1 - c.BETA2)
                        * (np.square(np.array(
                                         self.bias_gradients[i])))
                         ))

if c.ADAM_BIAS_Correction:
    # bias-corrected first and second moment estimates
    self.v["dW" + str(i)] = self.v["dW" + str(i)]
                          / (1 - (c.BETA1 ** true_epoch))
    self.v["db" + str(i)] = self.v["db" + str(i)]
                          / (1 - (c.BETA1 ** true_epoch))
    self.s["dW" + str(i)] = self.s["dW" + str(i)]
                          / (1 - (c.BETA2 ** true_epoch))
    self.s["db" + str(i)] = self.s["db" + str(i)]
                          / (1 - (c.BETA2 ** true_epoch))

# apply to weights and biases
weight_col -= ((eta * (self.v["dW" + str(i)]
                      / (np.sqrt(self.s["dW" + str(i)])
                      + c.EPSILON))))
self.bias[i] -= ((eta * (self.v["db" + str(i)]
                        / (np.sqrt(self.s["db" + str(i)])
                        + c.EPSILON))))
```

### SGD Momentum
[source](https://ruder.io/optimizing-gradient-descent/index.html#momentum)

<p>Vanilla SGD has trouble navigating ravines, i.e. areas where the surface curves much more steeply in one dimension than in another, which are common around local optima. In these scenarios, SGD oscillates across the slopes of the ravine while only making hesitant progress along the bottom towards the local optimum.</p>
<p>Momentum is a method that helps accelerate SGD in the relevant direction and dampens oscillations. It does this by adding a fraction \(\gamma\) of the update vector of the past time step to the current update vector:</p>
<p style="text-align:center">\(<br>
\begin{align}<br>
\begin{split}<br>
v_t &amp;= \beta_1 v_{t-1} + \eta \nabla_\theta J( \theta) \\<br>
\theta &amp;= \theta - v_t<br>
\end{split}<br>
\end{align}<br>
\)</p>
<p>The momentum term \(\beta_1\) is usually set to 0.9 or a similar value.</p>
<p>Essentially, when using momentum, we push a ball down a hill. The ball accumulates momentum as it rolls downhill, becoming faster and faster on the way (until it reaches its terminal velocity if there is air resistance, i.e. \(\beta_1 &lt; 1\)). The same thing happens to our weight and biases updates: The momentum term increases for dimensions whose gradients point in the same directions and reduces updates for dimensions whose gradients change directions. As a result, we gain faster convergence and reduced oscillation.</p>
[view on github](https://github.com/amaynez/TicTacToe/blob/b429e5637fe5f61e997f04c01422ad0342565640/entities/Neural_Network.py#L210)

```python
self.v["dW"+str(i)] = ((c.BETA1*self.v["dW" + str(i)])
                       +(eta*np.array(self.gradients[i])
                       ))
self.v["db"+str(i)] = ((c.BETA1*self.v["db" + str(i)])
                       +(eta*np.array(self.bias_gradients[i])
                       ))

weight_col -= self.v["dW" + str(i)]
self.bias[i] -= self.v["db" + str(i)]
```

### Nesterov accelerated gradient (NAG)
[source](https://ruder.io/optimizing-gradient-descent/index.html#nesterovacceleratedgradient)

<p>However, a ball that rolls down a hill, blindly following the slope, is highly unsatisfactory. We'd like to have a smarter ball, a ball that has a notion of where it is going so that it knows to slow down before the hill slopes up again.</p>
<p>Nesterov accelerated gradient (NAG) is a way to give our momentum term this kind of prescience. We know that we will use our momentum term \(\beta_1 v_{t-1}\) to move the weights and biases \(\theta\). Computing \( \theta - \beta_1 v_{t-1} \) thus gives us an approximation of the next position of the weights and biases (the gradient is missing for the full update), a rough idea where our weights and biases are going to be. We can now effectively look ahead by calculating the gradient not w.r.t. to our current weights and biases \(\theta\) but w.r.t. the approximate future position of our weights and biases:</p>
<p style="text-align:center">\(<br>
\begin{align}<br>
\begin{split}<br>
v_t &amp;= \beta_1 v_{t-1} + \eta \nabla_\theta J( \theta - \beta_1 v_{t-1} ) \\<br>
\theta &amp;= \theta - v_t<br>
\end{split}<br>
\end{align}<br>
\)</p>
<p>Again, we set the momentum term \(\beta_1\) to a value of around 0.9. While Momentum first computes the current gradient and then takes a big jump in the direction of the updated accumulated gradient, NAG first makes a big jump in the direction of the previous accumulated gradient, measures the gradient and then makes a correction, which results in the complete NAG update. This anticipatory update prevents us from going too fast and results in increased responsiveness, which has significantly increased the performance of Neural Networks on a number of tasks.</p>
<p>Now that we are able to adapt our updates to the slope of our error function and speed up SGD in turn, we would also like to adapt our updates to each individual weight and bias to perform larger or smaller updates depending on their importance.</p>
[view on github](https://github.com/amaynez/TicTacToe/blob/b429e5637fe5f61e997f04c01422ad0342565640/entities/Neural_Network.py#L219)

```python
v_prev = {"dW" + str(i): self.v["dW" + str(i)],
          "db" + str(i): self.v["db" + str(i)]}

self.v["dW" + str(i)] =
            (c.NAG_COEFF * self.v["dW" + str(i)]
           - eta * np.array(self.gradients[i]))
self.v["db" + str(i)] =
            (c.NAG_COEFF * self.v["db" + str(i)]
           - eta * np.array(self.bias_gradients[i]))

weight_col += ((-1 * c.BETA1 * v_prev["dW" + str(i)])
               + (1 + c.BETA1) * self.v["dW" + str(i)])
self.bias[i] += ((-1 * c.BETA1 * v_prev["db" + str(i)])
               + (1 + c.BETA1) * self.v["db" + str(i)])
```

### RMSprop
[source](https://ruder.io/optimizing-gradient-descent/index.html#rmsprop)

<p>RMSprop is an unpublished, adaptive learning rate method proposed by Geoff Hinton in <a href="http://www.cs.toronto.edu/~tijmen/csc321/slides/lecture_slides_lec6.pdf">Lecture 6e of his Coursera Class</a>.</p>
<p>RMSprop was developed stemming from the need to resolve other method's radically diminishing learning rates.</p>
<p style="text-align:center">\(<br>
\begin{align}<br>
\begin{split}<br>
E[\theta^2]_t &amp;= \beta_1 E[\theta^2]_{t-1} + (1-\beta_1) \theta^2_t \\<br>
\theta_{t+1} &amp;= \theta_{t} - \dfrac{\eta}{\sqrt{E[\theta^2]_t + \epsilon}} \theta_{t}<br>
\end{split}<br>
\end{align}<br>
\)</p>
<p>RMSprop divides the learning rate by an exponentially decaying average of squared gradients. Hinton suggests \(\beta_1\) to be set to 0.9, while a good default value for the learning rate \(\eta\) is 0.001.</p>
[view on github](https://github.com/amaynez/TicTacToe/blob/b429e5637fe5f61e997f04c01422ad0342565640/entities/Neural_Network.py#L232)

```python
self.s["dW" + str(i)] = ((c.BETA1
                      * self.s["dW" + str(i)])
                      + ((1-c.BETA1)
                      * (np.square(np.array(self.gradients[i])))
                        ))
self.s["db" + str(i)] = ((c.BETA1
                      * self.s["db" + str(i)])
                      + ((1-c.BETA1)
                      * (np.square(np.array(self.bias_gradients[i])))
                        ))

weight_col -= (eta * (np.array(self.gradients[i])
              / (np.sqrt(self.s["dW"+str(i)]+c.EPSILON)))
              )
self.bias[i] -= (eta * (np.array(self.bias_gradients[i])
               / (np.sqrt(self.s["db"+str(i)]+c.EPSILON)))
                )
```

### Complete code
All in all the code ended up like this:
[view on github](https://github.com/amaynez/TicTacToe/blob/b429e5637fe5f61e997f04c01422ad0342565640/entities/Neural_Network.py#L1)

```python
@staticmethod
def cyclic_learning_rate(learning_rate, epoch):
    max_lr = learning_rate * c.MAX_LR_FACTOR
    cycle = np.floor(1 + (epoch / (2
                    * c.LR_STEP_SIZE))
                    )
    x = np.abs((epoch / c.LR_STEP_SIZE)
        - (2 * cycle) + 1)
    return learning_rate
        + (max_lr - learning_rate)
        * np.maximum(0, (1 - x))

def apply_gradients(self, epoch):
    true_epoch = epoch - c.BATCH_SIZE
    eta = self.learning_rate
            * (1 / (1 + c.DECAY_RATE * true_epoch))

    if c.CLR_ON:
        eta = self.cyclic_learning_rate(eta, true_epoch)

    for i, weight_col in enumerate(self.weights):

        if c.OPTIMIZATION == 'vanilla':
            weight_col -= eta
                        * np.array(self.gradients[i])
                        / c.BATCH_SIZE
            self.bias[i] -= eta
                        * np.array(self.bias_gradients[i])
                        / c.BATCH_SIZE

        elif c.OPTIMIZATION == 'SGD_momentum':
            self.v["dW"+str(i)] = ((c.BETA1
                                   *self.v["dW" + str(i)])
                                   +(eta
                                   *np.array(self.gradients[i])
                                   ))
            self.v["db"+str(i)] = ((c.BETA1
                                   *self.v["db" + str(i)])
                                   +(eta
                                   *np.array(self.bias_gradients[i])
                                   ))

            weight_col -= self.v["dW" + str(i)]
            self.bias[i] -= self.v["db" + str(i)]

        elif c.OPTIMIZATION == 'NAG':
            v_prev = {"dW" + str(i): self.v["dW" + str(i)],
                      "db" + str(i): self.v["db" + str(i)]}

            self.v["dW" + str(i)] =
                        (c.NAG_COEFF * self.v["dW" + str(i)]
                       - eta * np.array(self.gradients[i]))
            self.v["db" + str(i)] =
                        (c.NAG_COEFF * self.v["db" + str(i)]
                       - eta * np.array(self.bias_gradients[i]))

            weight_col += ((-1 * c.BETA1 * v_prev["dW" + str(i)])
                           + (1 + c.BETA1) * self.v["dW" + str(i)])
            self.bias[i] += ((-1 * c.BETA1 * v_prev["db" + str(i)])
                           + (1 + c.BETA1) * self.v["db" + str(i)])

        elif c.OPTIMIZATION == 'RMSProp':
            self.s["dW" + str(i)] =
                            ((c.BETA1
                            *self.s["dW" + str(i)])
                            +((1-c.BETA1)
                            *(np.square(np.array(self.gradients[i])))
                            ))
            self.s["db" + str(i)] =
                            ((c.BETA1
                            *self.s["db" + str(i)])
                            +((1-c.BETA1)
                            *(np.square(np.array(self.bias_gradients[i])))
                            ))

            weight_col -= (eta
                          *(np.array(self.gradients[i])
                          /(np.sqrt(self.s["dW"+str(i)]+c.EPSILON)))
                          )
            self.bias[i] -= (eta
                          *(np.array(self.bias_gradients[i])
                          /(np.sqrt(self.s["db"+str(i)]+c.EPSILON)))
                            )

        if c.OPTIMIZATION == "ADAM":
            # decaying averages of past gradients
            self.v["dW" + str(i)] = ((
                                c.BETA1
                              * self.v["dW" + str(i)])
                              + ((1 - c.BETA1)
                              * np.array(self.gradients[i])
                                    ))
            self.v["db" + str(i)] = ((
                                c.BETA1
                              * self.v["db" + str(i)])
                              + ((1 - c.BETA1)
                              * np.array(self.bias_gradients[i])
                                    ))

            # decaying averages of past squared gradients
            self.s["dW" + str(i)] = ((c.BETA2
                                    * self.s["dW"+str(i)])
                                    + ((1 - c.BETA2)
                                    * (np.square(
                                            np.array(
                                                self.gradients[i])))
                                     ))
            self.s["db" + str(i)] = ((c.BETA2
                                    * self.s["db" + str(i)])
                                    + ((1 - c.BETA2)
                                    * (np.square(
                                            np.array(
                                                self.bias_gradients[i])))
                                     ))

            if c.ADAM_BIAS_Correction:
                # bias-corrected first and second moment estimates
                self.v["dW" + str(i)] =
                                self.v["dW" + str(i)]
                              / (1 - (c.BETA1 ** true_epoch))
                self.v["db" + str(i)] =
                                self.v["db" + str(i)]
                              / (1 - (c.BETA1 ** true_epoch))
                self.s["dW" + str(i)] =
                                self.s["dW" + str(i)]
                              / (1 - (c.BETA2 ** true_epoch))
                self.s["db" + str(i)] =
                                self.s["db" + str(i)]
                              / (1 - (c.BETA2 ** true_epoch))

            # apply to weights and biases
            weight_col -= ((eta
                            * (self.v["dW" + str(i)]
                            / (np.sqrt(self.s["dW" + str(i)])
                            + c.EPSILON))))
            self.bias[i] -= ((eta
                            * (self.v["db" + str(i)]
                            / (np.sqrt(self.s["db" + str(i)])
                            + c.EPSILON))))

    self.gradient_zeros()
```

