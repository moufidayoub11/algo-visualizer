export default class WallGenerator {
  constructor(nodes, rows, cols) {
    this.nodes = nodes;
    this.rows = rows;
    this.cols = cols;
  }

  generateWalls(algorithm) {
    switch (algorithm) {
      case "recursive-division":
        return this.generateRecursiveDivision();
      case "recursive-backtracking":
        return this.generateRecursiveBacktracking();
      case "kruskals":
        return this.generateKruskalsMaze();
      default:
        return this.generateRandomWalls();
    }
  }
  
  generateRecursiveDivision() {
    const walls = new Set();
    this.addBorderWalls(walls);
    this.divideArea(1, 1, this.cols - 2, this.rows - 2, walls);
    return [...walls];
  }

  divideArea(x1, y1, x2, y2, walls) {
    const width = x2 - x1 + 1;
    const height = y2 - y1 + 1;
    if (width < 3 || height < 3) return;

    // choose orientation
    const horizontal = height > width || (height === width && Math.random() > 0.5);
    if (horizontal) {
      // pick an even row for the wall
      const possibleYs = [];
      for (let y = y1 + 1; y <= y2 - 1; y++) if (y % 2 === 0) possibleYs.push(y);
      const wallY = possibleYs[Math.floor(Math.random() * possibleYs.length)];

      // draw horizontal wall
      for (let x = x1; x <= x2; x++) {
        const idx = wallY * this.cols + x;
        if (!this.nodes[idx].is_start && !this.nodes[idx].is_finish) walls.add(idx);
      }
      // carve one passage at odd column
      const possibleXs = [];
      for (let x = x1; x <= x2; x++) if (x % 2 === 1) possibleXs.push(x);
      const passageX = possibleXs[Math.floor(Math.random() * possibleXs.length)];
      walls.delete(wallY * this.cols + passageX);

      this.divideArea(x1, y1, x2, wallY - 1, walls);
      this.divideArea(x1, wallY + 1, x2, y2, walls);
    } else {
      // pick an even column for the wall
      const possibleXs = [];
      for (let x = x1 + 1; x <= x2 - 1; x++) if (x % 2 === 0) possibleXs.push(x);
      const wallX = possibleXs[Math.floor(Math.random() * possibleXs.length)];

      // draw vertical wall
      for (let y = y1; y <= y2; y++) {
        const idx = y * this.cols + wallX;
        if (!this.nodes[idx].is_start && !this.nodes[idx].is_finish) walls.add(idx);
      }
      // carve one passage at odd row
      const possibleYs = [];
      for (let y = y1; y <= y2; y++) if (y % 2 === 1) possibleYs.push(y);
      const passageY = possibleYs[Math.floor(Math.random() * possibleYs.length)];
      walls.delete(passageY * this.cols + wallX);

      this.divideArea(x1, y1, wallX - 1, y2, walls);
      this.divideArea(wallX + 1, y1, x2, y2, walls);
    }
  }

  generateRecursiveBacktracking() {
    const walls = new Set();
    this.addBorderWalls(walls);
    // start with every inner cell as wall
    for (let r = 1; r < this.rows - 1; r++)
      for (let c = 1; c < this.cols - 1; c++) {
        const idx = r * this.cols + c;
        if (!this.nodes[idx].is_start && !this.nodes[idx].is_finish) walls.add(idx);
      }

    const visited = Array.from({ length: this.rows }, () => Array(this.cols).fill(false));
    const stack = [];
    // pick random odd start
    let sr = 1 + 2 * Math.floor(Math.random() * ((this.rows - 2) / 2));
    let sc = 1 + 2 * Math.floor(Math.random() * ((this.cols - 2) / 2));
    if (this.nodes[sr * this.cols + sc].is_start || this.nodes[sr * this.cols + sc].is_finish) {
      for (let r = 1; r < this.rows - 1; r += 2)
        for (let c = 1; c < this.cols - 1; c += 2)
          if (!this.nodes[r * this.cols + c].is_start && !this.nodes[r * this.cols + c].is_finish) {
            sr = r; sc = c; break;
          }
    }
    visited[sr][sc] = true;
    walls.delete(sr * this.cols + sc);
    stack.push({ r: sr, c: sc });

    while (stack.length) {
      const { r, c } = stack[stack.length - 1];
      const neighbors = this.getUnvisitedNeighbors(r, c, visited, 2);
      if (neighbors.length) {
        const { row: nr, col: nc } = neighbors[Math.floor(Math.random() * neighbors.length)];
        visited[nr][nc] = true;
        // remove wall between
        walls.delete(nr * this.cols + nc);
        walls.delete((r + nr) / 2 * this.cols + (c + nc) / 2);
        stack.push({ r: nr, c: nc });
      } else stack.pop();
    }
    return [...walls];
  }

  generateKruskalsMaze() {
    const walls = new Set();
    this.addBorderWalls(walls);
    for (let r = 1; r < this.rows - 1; r++)
      for (let c = 1; c < this.cols - 1; c++) {
        const idx = r * this.cols + c;
        if (!this.nodes[idx].is_start && !this.nodes[idx].is_finish) walls.add(idx);
      }

    const sets = Array.from({ length: this.rows }, () => Array(this.cols).fill(null));
    let setId = 0;
    for (let r = 1; r < this.rows - 1; r += 2)
      for (let c = 1; c < this.cols - 1; c += 2) {
        sets[r][c] = setId++;
        walls.delete(r * this.cols + c);
      }

    const edges = [];
    for (let r = 1; r < this.rows - 1; r += 2)
      for (let c = 1; c < this.cols - 1; c += 2) {
        if (c + 2 < this.cols - 1) edges.push({ r1: r, c1: c, r2: r, c2: c + 2, wr: r, wc: c + 1 });
        if (r + 2 < this.rows - 1) edges.push({ r1: r, c1: c, r2: r + 2, c2: c, wr: r + 1, wc: c });
      }
    edges.sort(() => Math.random() - 0.5);

    for (const e of edges) {
      const setA = sets[e.r1][e.c1];
      const setB = sets[e.r2][e.c2];
      if (setA !== setB) {
        walls.delete(e.wr * this.cols + e.wc);
        for (let r = 1; r < this.rows - 1; r++)
          for (let c = 1; c < this.cols - 1; c++)
            if (sets[r][c] === setB) sets[r][c] = setA;
      }
    }

    return [...walls];
  }

  addBorderWalls(walls) {
    for (let r = 0; r < this.rows; r++)
      for (let c = 0; c < this.cols; c++) {
        if (r === 0 || r === this.rows - 1 || c === 0 || c === this.cols - 1) {
          const idx = r * this.cols + c;
          if (!this.nodes[idx].is_start && !this.nodes[idx].is_finish) walls.add(idx);
        }
      }
  }

  getUnvisitedNeighbors(r, c, visited, dist) {
    const dirs = [[-dist,0],[dist,0],[0,-dist],[0,dist]];
    return dirs.reduce((arr,[dr,dc]) => {
      const nr = r+dr, nc = c+dc;
      const idx = nr*this.cols+nc;
      if (nr>0 && nr<this.rows-1 && nc>0 && nc<this.cols-1 && !visited[nr][nc]
        && !this.nodes[idx].is_start && !this.nodes[idx].is_finish)
        arr.push({row:nr,col:nc});
      return arr;
    }, []);
  }
}
