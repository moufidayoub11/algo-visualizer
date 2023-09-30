import StateManager from "../StateManager.js";
import AlgorithmsManager from "../algorithms/AlgorithmsManager.js";
import Utils from "../utils/Utils.js";

const VISITED_COLOR = "rgba(0, 0, 66, 0.75)";
const CLOSED_COLOR = "rgba(0, 190, 218, 0.75)";

export default class GridAnimator {
    constructor() {
        this.stateManager = new StateManager();
    }

    async visualize(type) {
        this.state = this.stateManager.getState();
        this.nodes = this.stateManager.getNodes();
        this.nodesElements = this.stateManager.getNodeElements();
        this.dynamicSleepTime = 500 / this.nodes.length;

        if (this.state || !this.nodes.length || !this.nodesElements.length)
            return;

        this.stateManager.setState(true);

        const algorithmsManager = new AlgorithmsManager(
            this.stateManager.getNodes()
        );
        let steps = [];

        switch (type) {
            case "dijkstra":
                steps = algorithmsManager.dijkstra();
                break;
            case "astar":
                steps = algorithmsManager.aStar();
                break;
            case "dfs":
                steps = algorithmsManager.depthFS();
                break;
            case "bfs":
                steps = algorithmsManager.breadthFS();
                break;
            case "gol":
                steps = algorithmsManager.gol();
                break;
        }

        for (const step of steps) {
            console.count("step");
            await this.performStep(step);
        }

        this.stateManager.setState(false);
    }

    async performStep(step) {
        const { type, indices } = step;

        if (type === "visited") {
            await this.animateVisited(indices[0]);
        } else if (type == "updated") {
            await this.animateUpdated(indices[0]);
        } else if (type === "golGeneration") {
            await this.animateGolGeneration(step.generation);
        } else if (type === "finish") {
            await this.animateFinish(indices);
        }
    }

    async animateVisited(indice) {
        let node = this.nodes[indice];
        let nodeElement = this.nodesElements[indice];

        if (node.is_finish || node.is_start) return;
        nodeElement.style.backgroundColor = VISITED_COLOR;
        await Utils.sleep(this.dynamicSleepTime);
    }

    async animateGolGeneration(generation) {
        for (let i = 0; i < generation.length; i++) {
            const { type, index } = generation[i];
            let node = this.nodes[index];
            if (node.is_finish || node.is_start) continue;
            let nodeElement = this.nodesElements[index];
            Utils.sleep(this.dynamicSleepTime * i * 2).then(() => {
                nodeElement.classList.toggle("node-wall", type != "kill");
            });
        }
    }

    async animateUpdated(indice) {
        let node = this.nodes[indice];
        let nodeElement = this.nodesElements[indice];

        if (!node || node.is_finish || node.is_start || node.is_wall) return;
        nodeElement.style.backgroundColor = CLOSED_COLOR;
    }
    async animateFinish(indices) {
        let originalStart = null;
        let lastElement = null;
        for (let i = 0; i < indices.length; i++) {
            const index = indices[i];
            const node = this.nodesElements[index];
            if (node.classList.contains("node-start")) {
                originalStart = node;
            }
            Utils.manipulateClasses(node, ["node-path"]);
            if (!node.classList.contains("node-finish")) {
                Utils.manipulateClasses(node, ["node-start"]);
            }

            if (lastElement) {
                Utils.manipulateClasses(lastElement, [], ["node-start"]);
            }

            lastElement = node;
            await Utils.sleep(this.dynamicSleepTime * 10);
        }

        if (lastElement && originalStart) {
            await Utils.sleep(this.dynamicSleepTime * 10);
            Utils.manipulateClasses(lastElement, [], ["node-start"]);
            Utils.manipulateClasses(originalStart, ["node-start"]);
        }
    }
}
