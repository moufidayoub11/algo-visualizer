import GridManager from "./grid/GridManager.js";

document.addEventListener("DOMContentLoaded", async () => {
    const gridElement = document.querySelector("#grid");
    const visualizeButton = document.querySelector(".navbar-buttons-visualize");
    const clearButton = document.querySelector(".navbar-buttons-clear");
    const random_button = document.querySelector(".navbar-buttons-random");
    const algorithm_select = document.querySelector("#algorithm-select");

    let currentAlgo = "dijkstra";

    if (!gridElement) return;

    const grid = new GridManager(gridElement);
    grid.createGrid();

    clearButton.addEventListener("click", async () => {
        await grid.clearGrid();
    });

    algorithm_select.addEventListener("change", function (e) {
        grid.handleAlgoChange(this.value, currentAlgo);
        currentAlgo = this.value;
    });

    visualizeButton.addEventListener("click", async () => {
        await grid.visualize(currentAlgo);
    });

    random_button.addEventListener("click", async () => {
        await grid.addRandomWalls();
    });
});
