import StateManager from "../StateManager.js";
import Node from "../node/Node.js";
import Utils from "../utils/Utils.js";
import WallGenerator from "../walls/WallGenerator.js";

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

        // Track wall generation state and timeouts for cancellation
        this.wallGenerationTimeouts = [];
        this.isGeneratingWalls = false;
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
        this.clearGrid();
        this.isGeneratingWalls = true;
        
        // Get the selected wall algorithm from the dropdown
        const wallAlgorithmSelect = document.getElementById('wall-algorithm-select');
        const selectedAlgorithm = wallAlgorithmSelect ? wallAlgorithmSelect.value : 'random';
        
        // Generate walls using the selected algorithm
        const wallGenerator = new WallGenerator(this.nodes, this.rows, this.cols);
        const wallIndices = wallGenerator.generateWalls(selectedAlgorithm);
        
        // Use a simpler approach for wall generation that's more stable with speed changes
        this.animateWallsSequentially(wallIndices, 0);
    }

    animateWallsSequentially(wallIndices, currentIndex) {
        if (!this.isGeneratingWalls || currentIndex >= wallIndices.length) {
            // Animation completed or cancelled
            this.isGeneratingWalls = false;
            this.wallGenerationTimeouts = [];
            return;
        }
        
        // Get current speed settings for this batch
        const config = this.getWallAnimationConfig();
        const batchEnd = Math.min(currentIndex + config.batchSize, wallIndices.length);
        
        // Process current batch
        requestAnimationFrame(() => {
            if (!this.isGeneratingWalls) return;
            
            for (let i = currentIndex; i < batchEnd; i++) {
                const index = wallIndices[i];
                const node = this.nodes[index];
                const nodeElement = this.nodesElements[index];
                
                node.is_wall = true;
                nodeElement.classList.add("node-wall");
                // Add animation class based on frequency
                if ((i - currentIndex) % config.animationFrequency === 0) {
                    nodeElement.classList.add("node-wall-animation");
                }
            }
            
            // Schedule next batch - get fresh config for delay
            const timeoutId = setTimeout(() => {
                this.animateWallsSequentially(wallIndices, batchEnd);
            }, config.batchDelay);
            
            this.wallGenerationTimeouts.push(timeoutId);
        });
    }

    stopWallGeneration() {
        this.isGeneratingWalls = false;
        // Clear all pending timeouts
        this.wallGenerationTimeouts.forEach(timeoutId => clearTimeout(timeoutId));
        this.wallGenerationTimeouts = [];
    }

    getWallAnimationConfig() {
        // Read speed from StateManager for real-time updates
        const speed = this.stateManager.getAnimationSpeed();
        
        switch (speed) {
            case 'slow':
                return {
                    batchSize: 2,
                    batchDelay: 120,
                    animationFrequency: 1  // Animate every wall
                };
            case 'normal':
                return {
                    batchSize: 10,
                    batchDelay: 40,
                    animationFrequency: 2  // Animate every 2nd wall
                };
            case 'fast':
                return {
                    batchSize: 50,
                    batchDelay: 8,
                    animationFrequency: 5  // Animate every 5th wall
                };
            default:
                return {
                    batchSize: 10,
                    batchDelay: 40,
                    animationFrequency: 2
                };
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

        startNodeEl.classList.add("node-start");
        finishNodeEl.classList.add("node-finish");

        console.log(newAlgo);
        console.log(currentAlgo);
    }
    /**
     * clear all walls
     */
    clearGrid() {
        if (this.stateManager.getState()) return;
        
        // Stop any ongoing wall generation
        this.stopWallGeneration();
        
        this.clearPaths();

        // Remove all walls instantly without animation
        for (let i = 0; i < this.nodes.length; i++) {
            const node = this.nodes[i];
            const nodeElement = this.nodesElements[i];
            if (node.is_wall) {
                node.is_wall = false;
                nodeElement.classList.remove("node-wall", "node-wall-animation");
            }
        }
    }

    clearPaths() {
        if (!this.nodes) return;

        for (let i = 0; i < this.nodes.length; i++) {
            const nodeElement = this.nodesElements[i];
            // Check if the element has visited or updated colors and reset them
            const bgColor = nodeElement.style.backgroundColor;
            if (bgColor && (bgColor.includes("0, 0, 66") || bgColor.includes("0, 190, 218"))) {
                nodeElement.style.backgroundColor = "";
            }
            // Remove path classes
            nodeElement.classList.remove("node-path", "node-path-animation", 
                "node-visited-animation", "node-updated-animation", 
                "node-current", "node-current-animation", 
                "node-backtrack", "node-backtrack-animation");
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
