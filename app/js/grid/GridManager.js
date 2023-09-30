import StateManager from "../StateManager.js";
import GridAnimator from "./GridAnimator.js";
import GridCreator from "./GridCreator.js";

export default class GridManager {
    /** @param {HTMLElement} gridElement  */
    constructor(gridElement) {
        this.DIM = 25;
        this.yOffset = gridElement.getBoundingClientRect().top;
        this.rows = Math.floor((window.innerHeight - this.yOffset) / this.DIM);
        this.cols = Math.floor(window.innerWidth / this.DIM);

        const stateManager = new StateManager();
        stateManager.setGridElement(gridElement);
        stateManager.setRows(this.rows);
        stateManager.setCols(this.cols);

        this.gridCreator = new GridCreator();
        this.gridAnimator = new GridAnimator();

        gridElement.addEventListener("mousedown", (e) =>
            this.gridCreator.handleEvents(e, "mousedown")
        );
        gridElement.addEventListener("mousemove", (e) =>
            this.gridCreator.handleEvents(e, "mousemove")
        );
        gridElement.addEventListener("mouseup", (e) =>
            this.gridCreator.handleEvents(e, "mouseup")
        );
    }

    createGrid() {
        this.gridCreator.createGrid();
    }

    async visualize(type) {
        this.gridCreator.clearPaths();
        await this.gridAnimator.visualize(type);
    }

    handleAlgoChange(newAlgo, currentAlgo) {
        this.gridCreator.handleAlgoChange(newAlgo, currentAlgo);
    }

    async addRandomWalls() {
        await this.gridCreator.addRandomWalls();
    }

    async clearGrid() {
        await this.gridCreator.clearGrid();
    }
}
