import Node from "../node/Node.js";
import Algorithm from "./Algorithm.js";

export default class Dijkstra extends Algorithm {
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
        this.startNode.distance = 0;

        let unvisited_list = this.nodes.slice();

        while (!!unvisited_list.length) {
            this.sortByDistance(unvisited_list);
            let closest = unvisited_list.shift();
            let closestIndex = this.get_1d_index(closest.row, closest.col);

            if (closest.is_wall) continue;
            if (closest.distance == Infinity) break;

            closest.is_visited = true;

            this.steps.push({ type: "visited", indices: [closestIndex] });

            if (closest == this.finishNode) break;

            this.updateNeighbors(closest, this.nodes);
        }

        this.steps.push({ type: "finish", indices: this.dijkstraGetPath() });

        for (let node of this.nodes) {
            node.distance = Infinity;
            node.is_visited = false;
            node.prev = null;
        }
        return this.steps;
    }

    dijkstraGetPath(current = this.finishNode) {
        const shortestPath = [];
        let curr = current;

        while (curr !== null) {
            shortestPath.unshift(this.get_1d_index(curr.row, curr.col));
            curr = curr.prev;
        }
        return shortestPath;
    }

    /**
     * @param {Node} node - Node to update neighbors
     * @param {Node[]} nodes - The nodes array
     */
    updateNeighbors(node, nodes) {
        let neighbors = this.getNeighbors(node, nodes);

        for (let neigh of neighbors) {
            let new_distance = node.distance + 1;
            if (new_distance < neigh.distance) {
                const index = this.get_1d_index(neigh.row, neigh.col);
                neigh.distance = node.distance + 1;
                neigh.prev = node;
                this.steps.push({ type: "updated", indices: [index] });
            }
        }
    }

    /**
     * @param {Node} node - Node to update neighbors
     * @param {Node[]} nodes - The nodes array
     */
    getNeighbors(node, nodes) {
        const neighbors = [];
        let row = node.row;
        let col = node.col;
        let rows = this.rows;
        let cols = this.cols;

        if (row > 0) neighbors.push(nodes[this.get_1d_index(row - 1, col)]);
        if (row < rows - 1)
            neighbors.push(nodes[this.get_1d_index(row + 1, col)]);

        if (col > 0) neighbors.push(nodes[this.get_1d_index(row, col - 1)]);
        if (col < cols - 1)
            neighbors.push(nodes[this.get_1d_index(row, col + 1)]);

        return neighbors.filter(
            (ng_node) => !ng_node.is_visited && !ng_node.is_wall
        );
    }

    /**
     * @param {Node[]} nodes - The nodes array
     */
    sortByDistance(nodes) {
        nodes.sort((node1, node2) => node1.distance - node2.distance);
    }
}
