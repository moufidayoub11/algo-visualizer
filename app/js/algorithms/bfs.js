import Node from "../node/Node.js";
import Algorithm from "./Algorithm.js";

export default class BreadthFirstSearch extends Algorithm {
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
        this.queue = [this.startNode];

        while (!!this.queue.length) {
            let current = this.queue.shift();

            if (current === this.finishNode) break;

            let currentIndex = this.get_1d_index(current.row, current.col);

            if (current.is_visited || current.is_wall) continue;

            current.is_visited = true;
            this.steps.push({
                type: "visited",
                indices: [currentIndex],
            });

            this.updateNeighbors(current);
        }

        this.steps.push({
            type: "finish",
            indices: this.bfsGetPath(),
        });

        return this.steps;
    }

    bfsGetPath() {
        const shortestPath = [];
        let current = this.finishNode;

        while (current !== null) {
            shortestPath.unshift(this.get_1d_index(current.row, current.col));
            current = current.prev;
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
            this.queue.push(neighbor);
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

        return neighbors.filter(
            (neighbor) => !neighbor.is_visited && !neighbor.is_wall
        );
    }
}
