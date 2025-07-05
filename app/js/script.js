import GridManager from "./grid/GridManager.js";
import StateManager from "./StateManager.js";

document.addEventListener("DOMContentLoaded", async () => {
    const gridElement = document.querySelector("#grid");
    const visualizeButton = document.querySelector(".navbar-buttons-visualize");
    const pauseButton = document.querySelector(".navbar-buttons-pause");
    const stepBackButton = document.querySelector(".navbar-buttons-step-back");
    const stepForwardButton = document.querySelector(".navbar-buttons-step-forward");
    const clearButton = document.querySelector(".navbar-buttons-clear");
    const random_button = document.querySelector(".navbar-buttons-random");
    const algorithm_select = document.querySelector("#algorithm-select");
    const wallAlgorithm_select = document.querySelector("#wall-algorithm-select");
    const animationSpeed_select = document.querySelector("#animation-speed-select");

    let currentAlgo = "dijkstra";
    let currentWallAlgo = "random";
    let currentAnimationSpeed = "normal";

    if (!gridElement) return;

    const grid = new GridManager(gridElement);
    const stateManager = new StateManager();
    grid.createGrid();

    // Initialize speed in global state
    stateManager.setAnimationSpeed(currentAnimationSpeed);

    // Update button states based on global state
    function updateButtonStates() {
        const globalState = stateManager.getState();
        clearButton.disabled = globalState;
        random_button.disabled = globalState;
        algorithm_select.disabled = globalState;
        wallAlgorithm_select.disabled = globalState;
        // Don't disable speed selector - allow real-time changes
        
        const visualizeIcon = visualizeButton.querySelector('i');
        const visualizeText = visualizeButton.querySelector('span');
        
        if (globalState) {
            if (visualizeText) visualizeText.textContent = "Stop";
            if (visualizeIcon) {
                visualizeIcon.setAttribute('data-lucide', 'square');
                if (typeof lucide !== 'undefined') {
                    lucide.createIcons();
                }
            }
            visualizeButton.style.background = "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)";
            grid.gridAnimator.showControlButtons();
        } else {
            if (visualizeText) visualizeText.textContent = "Visualize";
            if (visualizeIcon) {
                visualizeIcon.setAttribute('data-lucide', 'play');
                if (typeof lucide !== 'undefined') {
                    lucide.createIcons();
                }
            }
            visualizeButton.style.background = "";
            grid.gridAnimator.hideControlButtons();
        }
    }

    clearButton.addEventListener("click", () => {
        const globalState = stateManager.getState();
        if (!globalState) {
            // Stop any ongoing wall generation before clearing
            grid.gridCreator.stopWallGeneration();
            grid.clearGrid();
        }
    });

    algorithm_select.addEventListener("change", function (e) {
        const globalState = stateManager.getState();
        if (!globalState) {
            const oldAlgo = currentAlgo;
            const newAlgo = this.value;
            
            grid.handleAlgoChange(newAlgo, oldAlgo);
            currentAlgo = newAlgo;
        }
    });

    visualizeButton.addEventListener("click", async () => {
        const globalState = stateManager.getState();
        if (globalState) {
            // When manually stopping, just clear everything except walls
            
            // Stop the animation first to prevent race conditions
            grid.gridAnimator.reset();
            
            // Wait a frame to ensure all pending animations are cancelled
            await new Promise(resolve => requestAnimationFrame(resolve));
            
            // Clear all paths and visualizations, keep only walls
            grid.gridCreator.clearPaths();
            
            // Force update button states
            setTimeout(() => updateButtonStates(), 10);
        } else {
            try {
                // Set animation speed before starting visualization
                grid.setAnimationSpeed(currentAnimationSpeed);
                await grid.visualize(currentAlgo);
            } catch (error) {
                console.error("Visualization error:", error);
            } finally {
                // Update button states when done
                setTimeout(() => updateButtonStates(), 10);
            }
        }
    });

    // Single pause/resume button functionality
    pauseButton.addEventListener("click", (e) => {
        e.preventDefault();
        grid.gridAnimator.togglePauseResume();
    });

    stepBackButton.addEventListener("click", (e) => {
        e.preventDefault();
        grid.gridAnimator.stepBack();
    });

    stepForwardButton.addEventListener("click", (e) => {
        e.preventDefault();
        grid.gridAnimator.stepForward();
    });

    random_button.addEventListener("click", async () => {
        const globalState = stateManager.getState();
        if (!globalState) {
            await grid.addRandomWalls();
        }
    });

    wallAlgorithm_select.addEventListener("change", function (e) {
        const globalState = stateManager.getState();
        if (!globalState) {
            currentWallAlgo = this.value;
            console.log("Wall algorithm changed to:", currentWallAlgo);
        }
    });

    animationSpeed_select.addEventListener("change", function (e) {
        const newSpeed = this.value;
        currentAnimationSpeed = newSpeed;
        
        // Update global state for real-time speed changes
        stateManager.setAnimationSpeed(newSpeed);
        
        // Update grid animator speed
        grid.setAnimationSpeed(newSpeed);
        
        console.log("Animation speed changed to:", newSpeed);
    });

    // Initialize button states
    updateButtonStates();
    
    // Listen for state changes
    const originalSetState = stateManager.setState.bind(stateManager);
    stateManager.setState = function(newState) {
        originalSetState(newState);
        updateButtonStates();
    };
});
