import Node from "../node/Node.js";
import Algorithm from "./Algorithm.js";

export default class GreedyBestFirstSearch extends Algorithm {
    constructor(nodes) {
        super(nodes);
    }

    solve() {
        for (let node of this.nodes) {
            node.distance = Infinity;
            node.is_visited = false;
            node.prev = null;
            node.f = this.calculateHeuristic(node, this.finishNode); // Use f for heuristic in greedy
            node.in_open_set = false;
        }

        this.startNode.distance = 0;
        this.startNode.f = this.calculateHeuristic(this.startNode, this.finishNode);
        this.startNode.in_open_set = true;
        
        const openSet = [this.startNode];

        while (openSet.length > 0) {
            // Sort by heuristic only (greedy approach) - using f property
            openSet.sort((a, b) => a.f - b.f);
            
            const current = openSet.shift();
            current.in_open_set = false;
            
            const currentIndex = this.get_1d_index(current.row, current.col);

            if (current === this.finishNode) break;

            if (current.is_visited || current.is_wall) continue;

            current.is_visited = true;
            this.steps.push({
                type: "visited",
                indices: [currentIndex],
            });

            this.updateNeighbors(current, openSet);
        }

        this.steps.push({
            type: "finish",
            indices: this.getPath(),
        });

        return this.steps;
    }

    updateNeighbors(current, openSet) {
        const neighbors = this.getNeighbors(current);

        for (const neighbor of neighbors) {
            if (neighbor.is_visited || neighbor.is_wall) continue;

            const tentativeDistance = current.distance + 1;

            if (tentativeDistance < neighbor.distance) {
                neighbor.distance = tentativeDistance;
                neighbor.prev = current;
                neighbor.f = this.calculateHeuristic(neighbor, this.finishNode); // Use f property

                if (!neighbor.in_open_set) {
                    neighbor.in_open_set = true;
                    openSet.push(neighbor);
                }

                const neighborIndex = this.get_1d_index(neighbor.row, neighbor.col);
                this.steps.push({
                    type: "updated",
                    indices: [neighborIndex],
                });
            }
        }
    }

    getNeighbors(node) {
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
