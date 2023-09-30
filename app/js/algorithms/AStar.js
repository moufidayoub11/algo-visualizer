import Node from "../node/Node.js";
import Algorithm from "./Algorithm.js";

export default class Astar extends Algorithm {
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
        this.nodes.forEach((node) => {
            node.distance = Infinity;
            node.f = Infinity;
            node.is_visited = false;
            node.prev = null;
        });

        this.startNode.distance = 0;
        this.startNode.f = this.heuristic(this.startNode, this.finishNode);

        this.openSet = this.nodes.slice();

        while (!!this.openSet.length) {
            this.sortByHeuristic(this.openSet);
            let closest = this.openSet.shift();
            if (closest == this.finishNode) break;

            let closestIndex = this.get_1d_index(closest.row, closest.col);

            if (closest.is_visited) continue;
            if (closest.is_wall) continue;

            if (closest.distance == Infinity) break;

            closest.is_visited = true;
            this.steps.push({
                type: "visited",
                indices: [closestIndex],
            });

            this.updateNeighbors(closest);
        }

        this.steps.push({
            type: "finish",
            indices: this.aStarGetPath(),
        });

        this.nodes.forEach((node) => {
            node.distance = Infinity;
            node.f = Infinity;
            node.is_visited = false;
            node.prev = null;
        });
        return this.steps;
    }

    heuristic(node1, node2) {
        return (
            Math.abs(node1.row - node2.row) + Math.abs(node1.col - node2.col)
        );
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
            const tentativeDistance = node.distance + 1;
            const tentativeHeuristic =
                tentativeDistance + this.heuristic(neighbor, this.finishNode);
            if (tentativeHeuristic < neighbor.f) {
                const index = this.get_1d_index(neighbor.row, neighbor.col);
                neighbor.distance = tentativeDistance;
                neighbor.prev = node;
                neighbor.f = tentativeHeuristic;

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

        return neighbors.filter((neighbor) => !neighbor.is_visited);
    }

    sortByHeuristic(nodes) {
        nodes.sort((node1, node2) => node1.f - node2.f);
    }
}
