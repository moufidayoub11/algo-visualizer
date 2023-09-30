import StateManager from "../StateManager.js";
import Node from "../node/Node.js";
import Utils from "../utils/Utils.js";

const VISITED_COLOR = "rgba(0, 0, 66, 0.75)";
const CLOSED_COLOR = "rgba(0, 190, 218, 0.75)";

/**
 * Represents the creation part of the grid
 */
export default class GridCreator {
    constructor() {
        this.stateManager = new StateManager();

        this.gridElement = this.stateManager.getGridElement();

        /** @type {Node[]} */
        this.nodes = [];
        /** @type {HTMLElement[]} */
        this.nodesElements = [];

        /**
         * These are for handling the drawing on the grid
         */
        /** @type {boolean} */
        this.is_mouse_pressed = false;
        /** @type {boolean} */
        this.add_wall = false;
        /** @type {string|null} */
        this.currently_moving = null;
        /** @type {HTMLElement|null} */
        this.last_hoverd_node = null;
    }

    /**
     * Creates the grid
     */
    createGrid() {
        if (this.stateManager.getState()) return;
        this.stateManager.setState(true);
        this.rows = this.stateManager.getRows();
        this.cols = this.stateManager.getCols();

        this.createNodes();

        const gridElement = this.gridElement;

        gridElement.innerHTML = "";
        this.nodesElements = [];

        for (let row = 0; row < this.rows; row++) {
            const newRow = document.createElement("tr");
            for (let col = 0; col < this.cols; col++) {
                const nodeElement = document.createElement("td");

                nodeElement.id = `node-${row}-${col}`;
                nodeElement.className = "node";

                const node = this.nodes[row * this.cols + col];
                if (node.is_start || node.is_finish) {
                    Utils.sleep(250).then(() => {
                        nodeElement.classList.add(
                            node.is_start ? "node-start" : "node-finish"
                        );
                    });
                }

                this.nodesElements.push(nodeElement);
                newRow.appendChild(nodeElement);
            }

            gridElement.appendChild(newRow);
        }

        this.stateManager.setState(false);
        this.stateManager.setNodeElements(this.nodesElements);
    }

    /**
     * Initializes nodes
     */
    createNodes() {
        this.nodes = [];

        const halfRow = Math.floor(this.rows / 2);
        const quarterCol = Math.floor(this.cols / 4);
        const twoThirdCol = Math.floor((this.cols * 2) / 3);
        for (let i = 0; i < this.rows * this.cols; i++) {
            let row = Math.floor(i / this.cols);
            let col = i % this.cols;
            let is_start = row === halfRow && col == quarterCol;
            let is_finish = row === halfRow && col == twoThirdCol;
            const new_node = new Node(row, col, is_start, is_finish);
            this.nodes.push(new_node);
        }

        this.stateManager.setNodes(this.nodes);
    }

    async addRandomWalls() {
        await this.clearGrid();
        let weights = [
            ["obstacle", 30],
            ["nonobstacle", 100],
        ];
        for (let i = 0; i < this.cols * this.rows; i++) {
            const node = this.nodes[i];
            const nodeElement = this.nodesElements[i];
            if (node.is_start || node.is_finish) continue;

            let decision = Utils.weightedRandom(weights);
            if (decision) {
                node.is_wall = true;
                Utils.manipulateClasses(nodeElement, ["node-wall"]);
            }
        }
    }

    handleAlgoChange(newAlgo, currentAlgo) {
        if (this.stateManager.getState()) return;
        this.clearPaths();

        const startNode = this.nodes.find((node) => node.is_start);
        const finishNode = this.nodes.find((node) => node.is_finish);

        const startNodeEl =
            this.nodesElements[startNode.row * this.cols + startNode.col];
        const finishNodeEl =
            this.nodesElements[finishNode.row * this.cols + finishNode.col];

        startNodeEl.classList.toggle("node-start", !["gol"].includes(newAlgo));
        finishNodeEl.classList.toggle(
            "node-finish",
            !["gol"].includes(newAlgo)
        );

        console.log(newAlgo);
        console.log(currentAlgo);

        if (["gol"].includes(currentAlgo) && !["gol"].includes(newAlgo)) {
            this.clearGrid();
        }
    }
    /**
     * clear all walls
     */
    async clearGrid() {
        if (this.stateManager.getState()) return;
        this.stateManager.setState(true);

        this.clearPaths();

        let wallPromises = [];
        for (let i = 0; i < this.nodes.length; i++) {
            const node = this.nodes[i];
            const nodeElement = this.nodesElements[i];
            if (!node.is_wall && !nodeElement.classList.contains("node-wall"))
                continue;
            console.log("found wall");
            node.is_wall = false;
            let classList = nodeElement.classList;

            wallPromises.push(
                Utils.sleep(Math.floor(i)).then(() => {
                    classList.remove("node-wall");
                })
            );
        }
        await Promise.all(wallPromises);

        this.stateManager.setState(false);
    }

    clearPaths() {
        if (!this.nodes) return;

        for (let i = 0; i < this.nodes.length; i++) {
            const nodeElement = this.nodesElements[i];
            if (
                [VISITED_COLOR, CLOSED_COLOR].includes(
                    nodeElement.style.backgroundColor
                )
            ) {
                nodeElement.style.backgroundColor = "var(--ghost-white)";
            }
            nodeElement.classList.remove("node-path");
        }
    }

    /**
     * Handle events of the grid
     * @param {MouseEvent} e - The Event object
     * @param {string} event -  Name of the event ("mousedown", "mousemove", "mouseup")
     */
    async handleEvents(e, event) {
        if (this.stateManager.getState()) return;
        e.preventDefault();

        const target = e.target;
        if (!target || target.nodeName !== "TD") return;

        let row = parseInt(target.id.split("-")[1]);
        let col = parseInt(target.id.split("-")[2]);
        let node = this.nodes[row * this.cols + col];

        const classList = target.classList;

        switch (event) {
            case "mousedown":
                this.is_mouse_pressed = true;
                this.clearPaths();
                if (classList.contains("node-start")) {
                    node.is_start = false;
                    classList.remove("node-start");
                    this.currently_moving = "node-start";
                    this.last_hoverd_node = target;
                } else if (classList.contains("node-finish")) {
                    node.is_finish = false;
                    classList.remove("node-finish");
                    this.currently_moving = "node-finish";
                    this.last_hoverd_node = target;
                } else {
                    this.add_wall = !classList.contains("node-wall");
                    classList.toggle("node-wall", this.add_wall);
                    node.is_wall = this.add_wall;
                }
                break;

            case "mousemove":
                if (!this.is_mouse_pressed) return;
                if (this.currently_moving) {
                    if (this.last_hoverd_node) {
                        this.last_hoverd_node.classList.remove(
                            this.currently_moving
                        );
                    }
                    classList.add(this.currently_moving);
                    this.last_hoverd_node = target;
                } else if (
                    !(
                        classList.contains("node-start") ||
                        classList.contains("node-finish")
                    )
                ) {
                    node.is_wall = this.add_wall;
                    classList.toggle("node-wall", this.add_wall);
                }
                break;

            case "mouseup":
                this.is_mouse_pressed = false;
                this.add_wall = false;

                if (this.currently_moving && this.last_hoverd_node) {
                    let lrow = parseInt(this.last_hoverd_node.id.split("-")[1]);
                    let lcol = parseInt(this.last_hoverd_node.id.split("-")[2]);
                    const lnode = this.nodes[lrow * this.cols + lcol];
                    if (this.last_hoverd_node.classList.contains("node-wall")) {
                        lnode.is_wall = false;
                        this.last_hoverd_node.classList.remove("node-wall");
                    }
                    lnode.is_start = this.currently_moving == "node-start";
                    lnode.is_finish = this.currently_moving == "node-finish";
                    this.last_hoverd_node.classList.add(this.currently_moving);
                }

                this.currently_moving = null;
                this.last_hoverd_node = null;

                break;
        }
    }
}
