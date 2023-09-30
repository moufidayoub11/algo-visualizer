import Node from "../node/Node.js";
import Algorithm from "./Algorithm.js";

export default class DepthFirstSearch extends Algorithm {
    /**@param {Node[]} nodes  */
    constructor(nodes) {
        super(nodes);

        this.rows = this.stateManager.getRows();
        this.cols = this.stateManager.getCols();
        this.startNode = nodes.find((node) => node.is_start);
        this.finishNode = nodes.find((node) => node.is_finish);
        this.get_1d_index = (row, col) => row * this.cols + col;
    }

    solve() {
        for (let node of this.nodes) {
            node.distance = Infinity;
            node.is_visited = false;
            node.prev = null;
        }
        this.openSet = [this.startNode];

        while (!!this.openSet.length) {
            let closest = this.openSet.pop();
            if (closest == this.finishNode) break;

            let closestIndex = this.get_1d_index(closest.row, closest.col);

            if (closest.is_visited || closest.is_wall) continue;

            closest.is_visited = true;
            this.steps.push({
                type: "visited",
                indices: [closestIndex],
            });

            this.updateNeighbors(closest);
        }

        this.steps.push({
            type: "finish",
            indices: this.dfsGetPath(),
        });

        return this.steps;
    }

    dfsGetPath(current = this.finishNode) {
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
            const index = this.get_1d_index(neighbor.row, neighbor.col);
            neighbor.prev = node;
            neighbor.distance = -12;
            this.steps.push({ type: "updated", indices: [index] });
            this.openSet.push(neighbor);
        }
    }

    getNeighbors(node) {
        /**@type {Node[]} */
        const neighbors = [];
        const { row, col } = node;
        const { rows, cols } = this;

        if (col > 0)
            neighbors.push(this.nodes[this.get_1d_index(row, col - 1)]);
        if (col < cols - 1)
            neighbors.push(this.nodes[this.get_1d_index(row, col + 1)]);
        if (row > 0)
            neighbors.push(this.nodes[this.get_1d_index(row - 1, col)]);
        if (row < rows - 1)
            neighbors.push(this.nodes[this.get_1d_index(row + 1, col)]);

        return neighbors.filter(
            (neighbor) => !neighbor.is_visited && !neighbor.is_wall
        );
    }
}
