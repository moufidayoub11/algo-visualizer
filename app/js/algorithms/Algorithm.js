import StateManager from "../StateManager.js";
import Node from "../node/Node.js";

export default class Algorithm {
    /**@param {Node[]} nodes  */
    constructor(nodes) {
        this.stateManager = new StateManager();
        this.nodes = nodes;
        this.rows = this.stateManager.getRows();
        this.cols = this.stateManager.getCols();
        this.startNode = nodes.find((node) => node.is_start);
        this.finishNode = nodes.find((node) => node.is_finish);
        this.get_1d_index = (row, col) => row * this.cols + col;
        this.steps = [];
    }

    solve() {
        return this.steps;
    }
}
