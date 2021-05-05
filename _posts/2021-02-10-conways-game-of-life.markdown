---
layout: post
read_time: true
show_date: true
title:  Conway's Game of Life 
date:   2021-02-10 13:32:20 -0600
description: Taking on the challenge of picking up coding again through interesting small projects, this time it is the turn of Conway's Game of Life.
img: posts/20210210/Game_of_Life.jpg
tags: [coding, python]
author: Armando Maynez
github: amaynez/GameOfLife/
---
<p>I&nbsp;am lately trying to take on coding again. It had always been a part of my life since my early years when I&nbsp;learned to program a Tandy Color Computer at the age of 8, the good old days.</p>

<img src="./assets/img/posts/20210210/300px-TRS-80_Color_Computer_3.jpg" alt="Tandy Color Computer TRS80 III"/><small>Tandy Color Computer TRS80 III</small>

<p>Having already programed in Java, C# and of course BASIC, I&nbsp;thought it would be a great idea to learn Python since I&nbsp;have great interest in data science and machine learning, and those two topics seem to have an avid community within Python coders.</p>

<p>For one of my starter quick programming tasks, I&nbsp;decided to code Conway's Game of Life, a very simple cellular automata that basically plays itself.</p>

<p>The game consists of a grid of n size, and within each block of the grid a cell could either be dead or alive according to these rules:</p>

<ul><li>If a cell has less than 2 neighbors, meaning contiguous alive cells, the cell will die of loneliness</li><li>If a cell has more than 3 neighbors, it will die of overpopulation</li><li>If an empty block has exactly 3 contiguous alive neighbors, a new cell will be born in that spot</li><li>If an alive cell has 2 or 3 alive neighbors, it continues to live</li></ul>

<img src="./assets/img/posts/20210210/GameOfLife.gif" alt="Conway's rules for the Game of Life"/><small>Conway's rules for the Game of Life</small>

<p>To make it more of a challenge I&nbsp;also decided to implement an <em>"sparse" </em>method of recording the game board, this means that instead of the typical 2d array representing the whole board, I&nbsp;will only record the cells which are alive. Saving a lot of memory space and processing time, while adding some spice to the challenge.</p>

<p>The trickiest part was figuring out how to calculate which empty blocks had exactly 3 alive neighbors so that a new cell will spring to life there, this is trivial in the case of recording the whole grid, because we just iterate all over the board and find the alive neighbors of ALL&nbsp;the blocks in the grid, but in the case of only keeping the alive cells proved quite a challenge.</p>

<p>In the end the algorithm ended up as follows:</p>

<ol><li>Iterate through all the alive cells and get all of their neighbors</li></ol>

```python
def get_neighbors(self, cell):
    neighbors = []

    for x in range(-1, 2, 1):
        for y in range(-1, 2, 1):
            if not (x == 0 and y == 0):
                if (0 &lt;= (cell[0] + x) &lt;= self.size_x) and (0 &lt;= (cell[1] + y) &lt;= self.size_y):
                    neighbors.append((cell[0] + x, cell[1] + y))
    return neighbors
```

<ol start="2"><li>Mark all the neighboring blocks as having +1 neighbor each time a particular cell is encountered. This way, for each neighboring alive cell the counter of the particular block will increase, and in the end it will contain the total number of live cells which are contiguous to it.</li></ol>

```python
def next_state(self):
    alive_neighbors = {}

    for cell in self.alive_cells:
        if cell not in alive_neighbors:
            alive_neighbors[cell] = 0

        neighbors = self.get_neighbors(cell)

        for neighbor in neighbors:
            if neighbor not in alive_neighbors:
                alive_neighbors[neighbor] = 1
            else:
                alive_neighbors[neighbor] += 1
```

<p>The trick was using a dictionary to keep the record of the blocks that have alive neighbors and the cells who are alive in the current state but have zero alive neighbors (thus will die).</p>

<p>With the dictionary it became easy just to add cells and increase their neighbor counter each time it was encountered as a neighbor of an alive cell.</p>

<p>Having the dictionary now filled with all the cells that have alive neighbors and how many they have, it was just a matter of applying the rules of the game:</p>


```python
for cell in alive_neighbors:
    if alive_neighbors[cell] &lt; 2 or alive_neighbors[cell] > 3:
        self.alive_cells.discard(cell)
    
    elif alive_neighbors[cell] == 3:
        self.alive_cells.add(cell)
```

<p>Notice that since I am keeping an array of the coordinates of only the cells who are alive, I could apply just 3 rules, die of loneliness, die of overpopulation and become alive from reproduction (exactly 3 alive neighbors) because the ones who have 2 or 3 neighbors and are already alive, can remain alive in the next iteration.</p>

<p>I&nbsp;found it very interesting to implement the Game of Life like this, it was quite a refreshing challenge and I am beginning to feel my coding skills ramping up again.</p>