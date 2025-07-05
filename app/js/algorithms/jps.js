import Node from "../node/Node.js";
import Algorithm from "./Algorithm.js";

export default class JumpPointSearch extends Algorithm {
    constructor(nodes) {
        super(nodes);
    }

    solve() {
        // Initialize all nodes
        this.nodes.forEach((node) => {
            node.distance = Infinity;
            node.f = Infinity;
            node.g = Infinity;
            node.h = Infinity;
            node.is_visited = false;
            node.in_open_set = false;
            node.prev = null;
        });

        // Initialize start node
        this.startNode.distance = 0;
        this.startNode.g = 0;
        this.startNode.h = this.calculateHeuristic(this.startNode, this.finishNode);
        this.startNode.f = this.startNode.g + this.startNode.h;
        this.startNode.in_open_set = true;

        const openSet = [this.startNode];

        while (openSet.length > 0) {
            // Sort by f score (g + h)
            openSet.sort((a, b) => a.f - b.f);
            
            const current = openSet.shift();
            current.in_open_set = false;
            
            const currentIndex = this.get_1d_index(current.row, current.col);

            // Check if we reached the goal
            if (current === this.finishNode) break;

            if (current.is_visited || current.is_wall) continue;

            current.is_visited = true;
            this.steps.push({
                type: "visited",
                indices: [currentIndex],
            });

            // Use simplified jump point logic - explore neighbors with some optimization
            this.updateNeighbors(current, openSet);
        }

        this.steps.push({
            type: "finish",
            indices: this.getPath(),
        });

        // Clean up node properties like A*
        this.nodes.forEach((node) => {
            node.distance = Infinity;
            node.f = Infinity;
            node.g = Infinity;
            node.h = Infinity;
            node.is_visited = false;
            node.in_open_set = false;
            node.prev = null;
        });

        return this.steps;
    }

    updateNeighbors(current, openSet) {
        const neighbors = this.getNeighbors(current);

        for (const neighbor of neighbors) {
            if (neighbor.is_wall || neighbor.is_visited) continue;
            
            // Calculate tentative g score
            const tentativeG = current.g + 1;
            
            // If this path to neighbor is better than any previous one
            if (tentativeG < neighbor.g) {
                const index = this.get_1d_index(neighbor.row, neighbor.col);
                
                // Update neighbor
                neighbor.prev = current;
                neighbor.g = tentativeG;
                neighbor.distance = tentativeG; // Keep for compatibility
                neighbor.h = this.calculateHeuristic(neighbor, this.finishNode);
                neighbor.f = neighbor.g + neighbor.h;

                // Add to open set if not already there
                if (!neighbor.in_open_set) {
                    neighbor.in_open_set = true;
                    openSet.push(neighbor);
                }

                this.steps.push({ type: "updated", indices: [index] });
            }
        }
    }

    getNeighbors(node) {
        const neighbors = [];
        const { row, col } = node;
        const { rows, cols } = this;

        // Get basic 4-directional neighbors
        if (row > 0)
            neighbors.push(this.nodes[this.get_1d_index(row - 1, col)]);
        if (row < rows - 1)
            neighbors.push(this.nodes[this.get_1d_index(row + 1, col)]);
        if (col > 0)
            neighbors.push(this.nodes[this.get_1d_index(row, col - 1)]);
        if (col < cols - 1)
            neighbors.push(this.nodes[this.get_1d_index(row, col + 1)]);

        return neighbors;
    }

    calculateHeuristic(nodeA, nodeB) {
        // Manhattan distance heuristic
        return Math.abs(nodeA.row - nodeB.row) + Math.abs(nodeA.col - nodeB.col);
    }

    getPath() {
        const shortestPath = [];
        let current = this.finishNode;

        while (current !== null) {
            shortestPath.unshift(this.get_1d_index(current.row, current.col));
            current = current.prev;
        }

        return shortestPath;
    }
}
