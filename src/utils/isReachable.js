/**
 * 有向图，使用邻接表(adjacency list)存储节点关系。支持通过广度优先遍历(BFS)算法来判断两个节点是否可达
 * ref：https://www.geeksforgeeks.org/find-if-there-is-a-path-between-two-vertices-in-a-given-graph/
 */
class Graph {
  constructor() {
    this.adj = {}; // Adjacency List
  }

  // add an edge into the graph
  addEdge(source, target) {
    if (!(source && target)) {
      return;
    }

    if (!this.adj[source]) {
      this.adj[source] = [];
    }

    this.adj[source].push(target);
  }

  isReachable(source, target) {
    // Mark all the vertices as not visited(By default set as false)
    const visited = [];
    // Create a queue for BFS
    const queue = [];

    // Mark the current node as visited and enqueue it
    visited[source] = true;
    queue.push(source);

    while (queue.length !== 0) {
      // Dequeue a vertex from queue
      const src = queue.shift();
      // nextArr will be used to get all adjacent vertices of a vertex
      const nextArr = this.adj[src] || [];

      // Get all adjacent vertices of the dequeued vertex source
      // If a adjacent has not been visited, then mark it
      // visited and enqueue it
      for (let i = 0, len = nextArr.length; i < len; i++) {
        const next = nextArr[i];

        // If this adjacent node is the destination node, indicate that source and target are reachable
        if (next === target) {
          return true;
        }

        // Else, continue to do BFS
        if (!visited[next]) {
          visited[next] = true;
          queue.push(next);
        }
      }
    }

    // If BFS is complete without visited target
    return false;
  }
}

/**
 * 判断在给定的连线中，是否存在一条路径让 source 可到达 target
 * @param {string} source 源节点 ID
 * @param {string} target 目标节点 ID
 * @param {array} edges 连线数组
 */
export default function isReachable(source, target, edges = []) {
  const graph = new Graph();

  edges.forEach(edge => {
    graph.addEdge(edge.source, edge.target);
  });

  return graph.isReachable(source, target);
}
