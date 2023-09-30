export default class Utils {
    /**
     * Pauses the execution for a certain amount of milliseconds
     * @param {number} ms - The time to pause in milliseconds
     * @returns {Promise<void>}
     */
    static sleep(ms) {
        return new Promise((res) => setTimeout(res, ms));
    }

    /**
     * Manipulates the class list of an element
     * @param {HTMLElement} element - The element to manipulate
     * @param {String[]} addClasses - The classes to add
     * @param {String[]} removeClasses - The classes to remove
     *
     * @returns {void}
     */
    static manipulateClasses(element, addClasses = [], removeClasses = []) {
        element.classList.add(...addClasses);
        element.classList.remove(...removeClasses);
    }

    static weightedRandom(data) {
        let total = 1;
        for (let i = 0; i < data.length; ++i) {
            total += data[i][1];
        }
        const threshold = Math.floor(Math.random() * total);

        total = 0;
        for (let i = 0; i < data.length; ++i) {
            total += data[i][1];
            if (total >= threshold) {
                return data[i][0] == "obstacle";
            }
        }
    }
}
