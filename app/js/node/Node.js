/**
 * Represents a Node in a grid
 */
export default class Node {
    /**
     * Constructs a new Node object
     * @param {number} row - The row index of the Node in the grid
     * @param {number} col - The column index of the Node in the grid
     * @param {boolean} is_start - Whether this Node is the start node
     * @param {boolean} is_finish - Whether this Node is the finish node
     */
    constructor(row, col, is_start, is_finish) {
        /** @type {number} */
        this.row = row;

        /** @type {number} */
        this.col = col;

        /** @type {boolean} */
        this.is_start = is_start;

        /** @type {boolean} */
        this.is_finish = is_finish;

        /** @type {boolean} */
        this.is_wall = false;

        /** @type {boolean} */
        this.is_visited = false;

        /** @type {number} */
        this.distance = Infinity;

        /** @type {number} */
        this.f = Infinity;

        /** @type {Node|null} */
        this.prev = null;
    }
}
