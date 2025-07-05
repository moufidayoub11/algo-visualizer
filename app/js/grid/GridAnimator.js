import StateManager from "../StateManager.js";
import AlgorithmsManager from "../algorithms/AlgorithmsManager.js";
import Utils from "../utils/Utils.js";

const VISITED_COLOR = "rgba(0, 0, 66, 0.75)";
const CLOSED_COLOR = "rgba(0, 190, 218, 0.75)";

export default class GridAnimator {
    constructor() {
        this.stateManager = new StateManager();
        this.isAutoPlaying = false;
        this.isPaused = false;
        this.currentStep = 0;
        this.steps = [];
        this.animationSpeed = 10; // milliseconds between steps
        this.lastFrameTime = 0;
        this.animationFrameId = null;
        this.isActive = false;
    }

    async visualize(type) {
        this.state = this.stateManager.getState();
        this.nodes = this.stateManager.getNodes();
        this.nodesElements = this.stateManager.getNodeElements();

        if (this.state || !this.nodes.length || !this.nodesElements.length)
            return;

        this.stateManager.setState(true);
        this.isActive = true;
        this.isAutoPlaying = true;
        this.isPaused = false;
        this.currentStep = 0;
        this.lastFrameTime = 0;
        this.showControlButtons();

        const algorithmsManager = new AlgorithmsManager(
            this.stateManager.getNodes()
        );

        switch (type) {
            case "dijkstra":
                this.steps = algorithmsManager.dijkstra();
                break;
            case "astar":
                this.steps = algorithmsManager.aStar();
                break;
            case "dfs":
                this.steps = algorithmsManager.depthFS();
                break;
            case "bfs":
                this.steps = algorithmsManager.breadthFS();
                break;
        }

        this.updateControlButtons();
        this.animate();
    }

    animate(currentTime = 0) {
        if (!this.isActive) {
            this.cleanup();
            return;
        }

        // Only proceed if enough time has passed and we're auto-playing and not paused
        if (this.isAutoPlaying && !this.isPaused && currentTime - this.lastFrameTime >= this.animationSpeed) {
            if (this.currentStep < this.steps.length) {
                this.executeStep(this.currentStep);
                this.currentStep++;
                this.lastFrameTime = currentTime;
                
                // Only update buttons when we reach the end
                if (this.currentStep >= this.steps.length) {
                    this.updateControlButtons();
                }
            } else {
                // Animation complete
                this.cleanup();
                return;
            }
        }

        this.animationFrameId = requestAnimationFrame((time) => this.animate(time));
    }

    executeStep(stepIndex) {
        if (stepIndex < 0 || stepIndex >= this.steps.length) return;
        
        const step = this.steps[stepIndex];
        console.count("step");
        this.performStep(step);
    }

    performStep(step) {
        const { type, indices } = step;

        if (type === "visited") {
            this.animateVisited(indices[0]);
        } else if (type === "updated") {
            this.animateUpdated(indices[0]);
        } else if (type === "finish") {
            this.animateFinish(indices);
        }
    }

    animateVisited(indice) {
        let node = this.nodes[indice];
        let nodeElement = this.nodesElements[indice];

        if (node.is_finish || node.is_start) return;
        nodeElement.style.backgroundColor = VISITED_COLOR;
    }

    animateUpdated(indice) {
        let node = this.nodes[indice];
        let nodeElement = this.nodesElements[indice];

        if (!node || node.is_finish || node.is_start || node.is_wall) return;
        nodeElement.style.backgroundColor = CLOSED_COLOR;
    }

    animateFinish(indices) {
        let delay = 0;
        let originalStart = null;
        
        for (let i = 0; i < indices.length; i++) {
            const index = indices[i];
            const nodeElement = this.nodesElements[index];
            
            if (nodeElement.classList.contains("node-start")) {
                originalStart = nodeElement;
            }
            
            setTimeout(() => {
                Utils.manipulateClasses(nodeElement, ["node-path"]);
                if (!nodeElement.classList.contains("node-finish")) {
                    Utils.manipulateClasses(nodeElement, ["node-start"]);
                }
                
                // Remove start class from previous node
                if (i > 0) {
                    const prevNodeElement = this.nodesElements[indices[i-1]];
                    if (!prevNodeElement.classList.contains("node-finish")) {
                        Utils.manipulateClasses(prevNodeElement, [], ["node-start"]);
                    }
                }
                
                // Restore original start if this is the last step
                if (i === indices.length - 1 && originalStart) {
                    setTimeout(() => {
                        Utils.manipulateClasses(nodeElement, [], ["node-start"]);
                        Utils.manipulateClasses(originalStart, ["node-start"]);
                    }, this.animationSpeed);
                }
            }, delay);
            
            delay += this.animationSpeed;
        }
    }

    cleanup() {
        this.isActive = false;
        this.isAutoPlaying = false;
        this.isPaused = false;
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
        this.hideControlButtons();
        
        // Use setTimeout to ensure state update happens after animation cleanup
        setTimeout(() => {
            this.stateManager.setState(false);
        }, 0);
    }

    // Reset method for stopping animation
    reset() {
        this.isActive = false;
        this.isAutoPlaying = false;
        this.isPaused = false;
        this.currentStep = 0;
        this.steps = [];
        
        // Ensure animation frame is cancelled immediately
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
        
        this.hideControlButtons();
        
        // Use setTimeout to ensure state update happens after current execution
        setTimeout(() => {
            this.stateManager.setState(false);
        }, 0);
    }

    // Control button management
    showControlButtons() {
        const controlGroup = document.querySelector('.button-group.control-actions');
        const pauseBtn = document.querySelector('.navbar-buttons-pause');
        const stepBackBtn = document.querySelector('.navbar-buttons-step-back');
        const stepForwardBtn = document.querySelector('.navbar-buttons-step-forward');
        
        // Enable the control group
        if (controlGroup) {
            controlGroup.classList.remove('disabled');
        }
        
        // Enable all control buttons
        if (pauseBtn) {
            pauseBtn.disabled = false;
            const icon = pauseBtn.querySelector('i');
            if (icon) {
                icon.setAttribute('data-lucide', 'pause');
                if (typeof lucide !== 'undefined') {
                    lucide.createIcons();
                }
            }
            pauseBtn.title = 'Pause';
        }
        
        if (stepBackBtn) {
            stepBackBtn.disabled = !this.canStepBack();
        }
        
        if (stepForwardBtn) {
            stepForwardBtn.disabled = !this.canStep();
        }
    }

    hideControlButtons() {
        const controlGroup = document.querySelector('.button-group.control-actions');
        const pauseBtn = document.querySelector('.navbar-buttons-pause');
        const stepBackBtn = document.querySelector('.navbar-buttons-step-back');
        const stepForwardBtn = document.querySelector('.navbar-buttons-step-forward');
        
        // Disable the control group
        if (controlGroup) {
            controlGroup.classList.add('disabled');
        }
        
        // Disable all control buttons
        if (pauseBtn) {
            pauseBtn.disabled = true;
        }
        
        if (stepBackBtn) {
            stepBackBtn.disabled = true;
        }
        
        if (stepForwardBtn) {
            stepForwardBtn.disabled = true;
        }
    }

    updateControlButtons() {
        const pauseBtn = document.querySelector('.navbar-buttons-pause');
        const stepBackBtn = document.querySelector('.navbar-buttons-step-back');
        const stepForwardBtn = document.querySelector('.navbar-buttons-step-forward');

        if (pauseBtn) {
            if (this.isPaused || !this.isAutoPlaying) {
                pauseBtn.title = 'Resume';
                pauseBtn.innerHTML = '<i data-lucide="play"></i>';
            } else if (this.isAutoPlaying) {
                pauseBtn.title = 'Pause';
                pauseBtn.innerHTML = '<i data-lucide="pause"></i>';
            }
            
            // Recreate the icon after setting innerHTML
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }
        }

        // Enable/disable step buttons based on current position and active state
        if (stepBackBtn) {
            stepBackBtn.disabled = !this.canStepBack();
        }
        if (stepForwardBtn) {
            stepForwardBtn.disabled = !this.canStep();
        }
    }

    // Pause/Resume functionality
    pause() {
        if (!this.isActive) return;
        this.isPaused = true;
        this.isAutoPlaying = false;
        this.updateControlButtons();
    }

    resume() {
        if (!this.isActive) return;
        this.isPaused = false;
        this.isAutoPlaying = true;
        this.updateControlButtons();
    }

    togglePauseResume() {
        if (!this.isRunning()) return;
        
        if (this.isPaused) {
            this.resume();
        } else {
            this.pause();
        }
    }

    // Step functionality
    stepForward() {
        if (!this.canStep()) return;
        
        // Pause auto-playing when manually stepping
        this.isAutoPlaying = false;
        this.isPaused = true;
        this.updateControlButtons();
        
        this.executeStep(this.currentStep);
        this.currentStep++;
        
        // Only update buttons if we've reached the end or beginning
        if (this.currentStep >= this.steps.length || this.currentStep === 1) {
            this.updateControlButtons();
        }
    }

    stepBack() {
        if (!this.canStepBack()) return;
        
        // Pause auto-playing when manually stepping
        this.isAutoPlaying = false;
        this.isPaused = true;
        this.updateControlButtons();
        
        this.currentStep--;
        this.undoStep(this.currentStep);
        
        // Only update buttons if we've reached the beginning or moved from end
        if (this.currentStep <= 0 || this.currentStep === this.steps.length - 1) {
            this.updateControlButtons();
        }
    }

    undoStep(stepIndex) {
        if (stepIndex < 0 || stepIndex >= this.steps.length) return;
        
        const step = this.steps[stepIndex];
        const { type, indices } = step;

        // Undo the visual effects of this step
        if (type === "visited") {
            this.undoVisited(indices[0]);
        } else if (type === "updated") {
            this.undoUpdated(indices[0]);
        } else if (type === "finish") {
            this.undoFinish(indices);
        }
    }

    undoVisited(indice) {
        let node = this.nodes[indice];
        let nodeElement = this.nodesElements[indice];

        if (node.is_finish || node.is_start) return;
        nodeElement.style.backgroundColor = "";
    }

    undoUpdated(indice) {
        let node = this.nodes[indice];
        let nodeElement = this.nodesElements[indice];

        if (!node || node.is_finish || node.is_start || node.is_wall) return;
        nodeElement.style.backgroundColor = "";
    }

    undoFinish(indices) {
        // Remove path visualization
        for (let i = indices.length - 1; i >= 0; i--) {
            const index = indices[i];
            const nodeElement = this.nodesElements[index];
            Utils.manipulateClasses(nodeElement, [], ["node-path", "node-start"]);
        }
        
        // Restore original start node
        if (indices.length > 0) {
            const originalStartIndex = indices[0];
            const originalStart = this.nodesElements[originalStartIndex];
            Utils.manipulateClasses(originalStart, ["node-start"]);
        }
    }

    // Speed control methods
    setSpeed(speed) {
        const speedMap = {
            'slow': 50,     // Slower but not too slow - 50ms between steps
            'normal': 8,    // Much faster normal - 8ms between steps  
            'fast': 1       // Ultra fast - 1ms between steps (almost instant)
        };
        this.animationSpeed = speedMap[speed] || 8;
    }

    setAnimationSpeed(speed) {
        this.setSpeed(speed);
    }

    // Helper methods for better state management
    isRunning() {
        return this.isActive;
    }

    canStep() {
        return this.isActive && this.currentStep < this.steps.length;
    }

    canStepBack() {
        return this.isActive && this.currentStep > 0;
    }

    getProgress() {
        if (!this.steps.length) return 0;
        return Math.min(this.currentStep / this.steps.length, 1);
    }
}
