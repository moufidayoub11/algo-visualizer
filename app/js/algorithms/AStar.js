import Node from "../node/Node.js";
import Algorithm from "./Algorithm.js";

export default class Astar extends Algorithm {
    /**@param {Node[]} nodes  */
    constructor(nodes) {
        super(nodes);
    }

    solve() {
        // Initialize all nodes
        this.nodes.forEach((node) => {
            node.distance = Infinity;
            node.f = Infinity;
            node.g = Infinity;
            node.is_visited = false;
            node.in_open_set = false;
            node.prev = null;
        });

        // Initialize start node
        this.startNode.distance = 0;
        this.startNode.g = 0;
        const startH = this.heuristic(this.startNode, this.finishNode);
        this.startNode.f = this.startNode.g + startH;
        this.startNode.in_open_set = true;

        // Open set contains only unvisited nodes to be evaluated
        this.openSet = [this.startNode];

        while (this.openSet.length > 0) {
            // Find node with lowest f score
            this.sortByHeuristic(this.openSet);
            let current = this.openSet.shift();
            
            // Remove from open set
            current.in_open_set = false;
            
            let currentIndex = this.get_1d_index(current.row, current.col);
            
            // Check if we reached the goal
            if (current === this.finishNode) break;
            
            // Skip walls and already visited nodes
            if (current.is_wall || current.is_visited) continue;
            
            // Add to closed set (mark as visited)
            current.is_visited = true;

            // Add visualization step
            this.steps.push({
                type: "visited",
                indices: [currentIndex],
            });

            // Update neighbors
            this.updateNeighbors(current);
        }

        this.steps.push({
            type: "finish",
            indices: this.aStarGetPath(),
        });

        // Clean up node properties
        this.nodes.forEach((node) => {
            node.distance = Infinity;
            node.f = Infinity;
            node.g = Infinity;
            node.is_visited = false;
            node.in_open_set = false;
            node.prev = null;
        });
        return this.steps;
    }

    heuristic(node1, node2) {
        // Manhattan distance heuristic with slight emphasis to show A* behavior
        const manhattanDistance = Math.abs(node1.row - node2.row) + Math.abs(node1.col - node2.col);
        return manhattanDistance * 1.05; // Very slight emphasis on heuristic to make A* more goal-directed
    }

    aStarGetPath(current = this.finishNode) {
        const shortestPath = [];
        let curr = current;

        while (curr !== null) {
            shortestPath.unshift(this.get_1d_index(curr.row, curr.col));
            curr = curr.prev;
        }
        return shortestPath;
    }

    updateNeighbors(node) {
        const neighbors = this.getNeighbors(node);

        for (const neighbor of neighbors) {
            // Skip walls and visited nodes
            if (neighbor.is_wall || neighbor.is_visited) continue;
            
            // Calculate tentative g score
            const tentativeG = node.g + 1;
            
            // If this path to neighbor is better than any previous one
            if (tentativeG < neighbor.g) {
                const index = this.get_1d_index(neighbor.row, neighbor.col);
                
                // Update neighbor
                neighbor.prev = node;
                neighbor.g = tentativeG;
                neighbor.distance = tentativeG; // Keep for compatibility
                neighbor.f = tentativeG + this.heuristic(neighbor, this.finishNode);

                // Add to open set if not already there
                if (!neighbor.in_open_set) {
                    neighbor.in_open_set = true;
                    this.openSet.push(neighbor);
                }

                this.steps.push({ type: "updated", indices: [index] });
            }
        }
    }

    getNeighbors(node) {
        /**@type {Node[]} */
        const neighbors = [];
        const { row, col } = node;
        const { rows, cols } = this;

        if (row > 0)
            neighbors.push(this.nodes[this.get_1d_index(row - 1, col)]);
        if (row < rows - 1)
            neighbors.push(this.nodes[this.get_1d_index(row + 1, col)]);
        if (col > 0)
            neighbors.push(this.nodes[this.get_1d_index(row, col - 1)]);
        if (col < cols - 1)
            neighbors.push(this.nodes[this.get_1d_index(row, col + 1)]);

        return neighbors; // Return all neighbors, filtering happens in updateNeighbors
    }

    sortByHeuristic(nodes) {
        nodes.sort((node1, node2) => {
            // Primary sort by f-score (g + h)
            if (node1.f !== node2.f) {
                return node1.f - node2.f;
            }
            // Tie-breaker: prefer nodes closer to goal (lower h)
            const h1 = this.heuristic(node1, this.finishNode);
            const h2 = this.heuristic(node2, this.finishNode);
            return h1 - h2;
        });
    }
}
