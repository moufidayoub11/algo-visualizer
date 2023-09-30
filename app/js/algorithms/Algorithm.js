import StateManager from "../StateManager.js";
import Node from "../node/Node.js";

export default class Algorithm {
    /**@param {Node[]} nodes  */
    constructor(nodes) {
        this.stateManager = new StateManager();
        this.nodes = nodes;
        this.steps = [];
    }

    solve() {
        return this.steps;
    }
}
