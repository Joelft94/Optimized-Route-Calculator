class Map {
    constructor(rows, cols) {
        this.rows = rows;
        this.cols = cols;
        this.grid = this.initializeGrid();
        this.startNode = null;
        this.endNode = null;
        this.settingStart = false;
        this.settingEnd = false;
        this.addingObstacle = false;

        this.drawGrid();
        this.addEventListeners(); //llamamos a las funciones importantes que se ejecutaran al cargar la pagina , las demas funciones se ejecutaran al hacer click en los botones
    }

    initializeGrid() {
        const grid = [];
        for (let i = 0; i < this.rows; i++) {
            grid[i] = [];
            for (let j = 0; j < this.cols; j++) {
                grid[i][j] = {
                    row: i,
                    col: j,
                    isStart: false,
                    isEnd: false,
                    isObstacle: false,
                    g: 0,
                    h: 0,
                    f: 0,
                    previous: null
                };
            }
        }
        return grid;
    }

    drawGrid() {
        const gridContainer = document.getElementById('grid-container');
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                const cell = document.createElement('div');
                cell.classList.add('grid-item');
                cell.dataset.row = i;
                cell.dataset.col = j;
                cell.addEventListener('click', (event) => this.handleCellClick(event));
                gridContainer.appendChild(cell);
            }
        }
    }

    addEventListeners() {
        document.getElementById('set-start').addEventListener('click', () => {
            this.settingStart = true;
            this.settingEnd = false;
            this.addingObstacle = false;
        });

        document.getElementById('set-end').addEventListener('click', () => {
            this.settingStart = false;
            this.settingEnd = true;
            this.addingObstacle = false;
        });

        document.getElementById('add-obstacle').addEventListener('click', () => {
            this.settingStart = false;
            this.settingEnd = false;
            this.addingObstacle = true;
        });
    }

    handleCellClick(event) {
        const row = event.target.dataset.row;
        const col = event.target.dataset.col;
        const cell = this.grid[row][col];

        if (this.settingStart) {
            if (this.startNode) {
                this.startNode.isStart = false;
                document.querySelector(`.grid-item[data-row="${this.startNode.row}"][data-col="${this.startNode.col}"]`).classList.remove('start');
            }
            cell.isStart = true;
            event.target.classList.add('start');
            this.startNode = cell;
            this.settingStart = false;
        } else if (this.settingEnd) {
            if (this.endNode) {
                this.endNode.isEnd = false;
                document.querySelector(`.grid-item[data-row="${this.endNode.row}"][data-col="${this.endNode.col}"]`).classList.remove('end');
            }
            cell.isEnd = true;
            event.target.classList.add('end');
            this.endNode = cell;
            this.settingEnd = false;
        } else if (this.addingObstacle) {
            cell.isObstacle = !cell.isObstacle;
            event.target.classList.toggle('obstacle');
        }
    }

    isAccessible(node) {
        return !node.isObstacle;
    }
}

class RouteCalculator {
    constructor(map) {
        this.map = map;
        document.getElementById('start-pathfinding').addEventListener('click', () => this.startPathfinding());
    }

    async startPathfinding() {
        const { startNode, endNode } = this.map;

        if (!startNode || !endNode) {
            alert('Por favor coloca un inicio y un final');
            return;
        }

        const openSet = [startNode];
        const closedSet = [];
        const path = [];

        while (openSet.length > 0) {
            let lowestIndex = 0;
            for (let i = 0; i < openSet.length; i++) {
                if (openSet[i].f < openSet[lowestIndex].f) {
                    lowestIndex = i;
                }
            }

            const current = openSet[lowestIndex];

            if (current === endNode) {
                let temp = current;
                path.push(temp);
                while (temp.previous) {
                    path.push(temp.previous);
                    temp = temp.previous;
                }

                document.querySelectorAll('.grid-item').forEach(item => {
                    item.classList.remove('current');
                    item.classList.remove('searched');
                });

                for (let i = 0; i < path.length; i++) {
                    const cell = path[i];
                    document.querySelector(`.grid-item[data-row="${cell.row}"][data-col="${cell.col}"]`).classList.add('path');
                    await this.sleep(50);
                }

                return;
            }

            openSet.splice(lowestIndex, 1);
            closedSet.push(current);

            const neighbors = this.getNeighbors(current);
            for (const neighbor of neighbors) {
                if (closedSet.includes(neighbor) || !this.map.isAccessible(neighbor)) {
                    continue;
                }

                const tentativeG = current.g + 1;

                if (!openSet.includes(neighbor)) {
                    openSet.push(neighbor);
                } else if (tentativeG >= neighbor.g) {
                    continue;
                }

                neighbor.g = tentativeG;
                neighbor.h = this.heuristic(neighbor, endNode);
                neighbor.f = neighbor.g + neighbor.h;
                neighbor.previous = current;

                document.querySelector(`.grid-item[data-row="${neighbor.row}"][data-col="${neighbor.col}"]`).classList.add('searched');
            }

            document.querySelector(`.grid-item[data-row="${current.row}"][data-col="${current.col}"]`).classList.add('current');
            await this.sleep(50);
        }

        alert('No se encontro ningun camino');
    }

    getNeighbors(node) {
        const neighbors = [];
        const { row, col } = node;
        const { rows, cols, grid } = this.map;

        if (row > 0) neighbors.push(grid[row - 1][col]);
        if (row < rows - 1) neighbors.push(grid[row + 1][col]);
        if (col > 0) neighbors.push(grid[row][col - 1]);
        if (col < cols - 1) neighbors.push(grid[row][col + 1]);

        return neighbors;
    }

    heuristic(a, b) {
        return Math.abs(a.row - b.row) + Math.abs(b.col - a.col);
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const map = new Map(12, 12);
    new RouteCalculator(map);
});


