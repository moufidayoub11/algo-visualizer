import Algorithm from "./Algorithm.js";
import Node from "../node/Node.js";

export default class GameOfLife extends Algorithm {
    constructor(nodes) {
        super(nodes);
        this.rows = this.stateManager.getRows();
        this.cols = this.stateManager.getCols();
        this.get_1d_index = (row, col) => row * this.cols + col;
    }

    solve() {
        const generation = [];
        for (let i = 0; i < 10; i++) {
            const nextState = this.nodes.map((node) => {
                return new Node(node.row, node.col, false, false);
            });
            for (let row = 0; row < this.rows; row++) {
                for (let col = 0; col < this.cols; col++) {
                    const currentCell = this.nodes[this.get_1d_index(row, col)];
                    const aliveNeighbors = this.countAliveNeighbors(row, col);

                    if (currentCell.is_wall) {
                        if (aliveNeighbors < 2 || aliveNeighbors > 3) {
                            nextState[
                                this.get_1d_index(row, col)
                            ].is_wall = false;
                            generation.push({
                                type: "kill",
                                index: this.get_1d_index(row, col),
                            });
                        } else {
                            nextState[
                                this.get_1d_index(row, col)
                            ].is_wall = true;
                            generation.push({
                                type: "unkill",
                                index: this.get_1d_index(row, col),
                            });
                        }
                    } else {
                        if (aliveNeighbors === 3) {
                            nextState[
                                this.get_1d_index(row, col)
                            ].is_wall = true;
                            generation.push({
                                type: "unkill",
                                index: this.get_1d_index(row, col),
                            });
                        }
                    }
                }
            }

            this.steps.push({ type: "golGeneration", generation });

            this.nodes = nextState;
        }

        return this.steps;
    }

    countAliveNeighbors(row, col) {
        let count = 0;

        for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
                if (dx === 0 && dy === 0) {
                    continue;
                }

                const newRow = (row + dx + this.rows) % this.rows;
                const newCol = (col + dy + this.cols) % this.cols;

                const neighborCell =
                    this.nodes[this.get_1d_index(newRow, newCol)];

                if (neighborCell.is_wall) {
                    count++;
                }
            }
        }

        return count;
    }
}
