import Dijkstra from "./dijkstra.js";
import Node from "../node/Node.js";
import Astar from "./AStar.js";
import DepthFirstSearch from "./dfs.js";
import BreadthFirstSearch from "./bfs.js";
import GreedyBestFirstSearch from "./greedy.js";
import JumpPointSearch from "./jps.js";

export default class AlgorithmsManager {
    /**@param {Node[]} nodes  */
    constructor(nodes) {
        this.nodes = nodes;
    }

    dijkstra() {
        const dijkstra = new Dijkstra(this.nodes);

        return dijkstra.solve();
    }

    aStar() {
        const astar = new Astar(this.nodes);

        return astar.solve();
    }

    depthFS() {
        const dfs = new DepthFirstSearch(this.nodes);

        return dfs.solve();
    }

    breadthFS() {
        const bfs = new BreadthFirstSearch(this.nodes);

        return bfs.solve();
    }

    greedyBestFirst() {
        const greedy = new GreedyBestFirstSearch(this.nodes);

        return greedy.solve();
    }

    jumpPointSearch() {
        const jps = new JumpPointSearch(this.nodes);

        return jps.solve();
    }
}
