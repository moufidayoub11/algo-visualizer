import Node from "./node/Node.js";

export default class StateManager {
    constructor() {
        if (StateManager.instance) {
            return StateManager.instance;
        }

        /** @type {boolean} state */
        this.state = false;

        /** @type {HTMLElement} gridElement */
        this.gridElement = null;

        /** @type {number} rows */
        this.rows = 0;

        /** @type {number} cols */
        this.cols = 0;

        /** @type {Node[]} nodes */
        this.nodes = [];

        /** @type {HTMLElement[]} nodeElements */
        this.nodeElements = [];

        StateManager.instance = this;
    }

    setState(newState) {
        this.state = newState;
    }
    getState() {
        return this.state;
    }

    setGridElement(newGE) {
        this.gridElement = newGE;
    }
    getGridElement() {
        return this.gridElement;
    }

    setRows(newRows) {
        this.rows = newRows;
    }
    getRows() {
        return this.rows;
    }

    setCols(newCols) {
        this.cols = newCols;
    }
    getCols() {
        return this.cols;
    }

    setNodes(newnodes) {
        this.nodes = newnodes;
    }
    getNodes() {
        return this.nodes;
    }

    setNodeElements(newCE) {
        this.nodeElements = newCE;
    }
    getNodeElements() {
        return this.nodeElements;
    }
}
