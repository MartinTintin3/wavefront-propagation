import { Cell } from "./cell";
import { CellType } from "./enums/cellType";

export class Board {
	private ctx: CanvasRenderingContext2D;

	width: number;
	height: number;
	rows: number;
	columns: number;

	public readonly cellLength: number;
	public readonly grid: Cell[][];

	constructor(ctx: CanvasRenderingContext2D, cellLength: number) {
		this.width = ctx.canvas.width;
		this.height = ctx.canvas.height;
		this.columns = Math.floor(this.width / cellLength);
		this.rows = Math.floor(this.height / cellLength);
		this.ctx = ctx;
		this.cellLength = cellLength;
		this.grid = new Array<Array<Cell>>();

		for(let x = 0; x < this.columns; x++) {
			this.grid.push([]);
			for(let y = 0; y < this.rows; y++) {
				let type: CellType = CellType.AIR;
				if(x == 0 && y == 0) {
					type = CellType.START;
				} else if(x == this.columns - 1 && y == this.rows - 1) {
					type = CellType.FINISH;
				}

				this.grid[x][y] = new Cell(type, x, y, this);
			}
		}
	}

	// eslint-disable-next-line no-unused-vars
	public forEachCell(callback: (cell: Cell) => any) : void {
		this.grid.forEach((column, x) => column.forEach((row, y) => callback(this.grid[x][y])));
	}

	public clearBoard(filteredOut: Array<CellType>) : void {
		this.fillBoard(CellType.AIR, filteredOut);
		this.forEachCell(cell => cell.number = 0);
	}

	public fillBoard(type: CellType, filteredOut: Array<CellType>) : void {
		this.forEachCell(cell => {
			if(!filteredOut.includes(cell.type)) {
				cell.wasPath = type == CellType.PATH;
				cell.type = type;
			}
		});
	}

	// eslint-disable-next-line no-unused-vars
	public findCells(callback: (cell: Cell) => boolean) : Array<Cell> {
		const result: Array<Cell> = new Array<Cell>();
		this.grid.forEach(column => column.filter(callback).forEach(item => result.push(item)));
		return result;
	}

	public renderCell(x: number, y: number) : void {
		/* eslint-disable indent */
		let textStyle = "";
		switch(this.grid[x][y].type) {
			case CellType.AIR:
				this.ctx.fillStyle = "white";
				textStyle = "black";
				break;
			case CellType.WALL:
				this.ctx.fillStyle = "black";
				textStyle = "white";
				break;
			case CellType.START:
				this.ctx.fillStyle = "red";
				textStyle = "white";
				break;
			case CellType.FINISH:
				this.ctx.fillStyle = "green";
				textStyle = "black";
				break;
			case CellType.PATH:
				this.ctx.fillStyle = "yellow";
				textStyle = "black";
				break;
		}
		/* eslint-enable indent */
		// Clear the cell, then fill the cell, then outline the cell, then draw the cell's number
		this.ctx.clearRect(x * this.cellLength, y * this.cellLength, this.cellLength, this.cellLength);
		this.ctx.strokeStyle = "gray";
		this.ctx.fillRect(x * this.cellLength, y * this.cellLength, this.cellLength, this.cellLength);
		this.ctx.strokeRect(x * this.cellLength, y * this.cellLength, this.cellLength, this.cellLength);
		this.ctx.fillStyle = textStyle;
		let textX = x * this.cellLength;
		/* eslint-disable indent */
		switch(this.grid[x][y].number.toString().length) {
			case 1:
				textX += this.cellLength / 3;
				break;
			case 2:
				textX += this.cellLength / 4;
				break;
			case 4:
				textX += this.cellLength / 5.5;
				break;
		}
		/* eslint-enable indent */
		this.ctx.fillText(this.grid[x][y].number.toString(), textX, y * this.cellLength + 3 * (this.cellLength / 4.5), this.cellLength);
	}

	public render() : void {
		const start: number = Date.now();
		this.forEachCell(cell => {
			this.renderCell(cell.x, cell.y);
		});
		const end: number = Date.now();

		console.log(`Rendered all cells in: ${(end - start) / 1000} seconds`);
	}

	public export() : string {
		this.import(this.grid.map(column => column.map(cell => cell.type).join(",")).join(":"));
		return this.grid.map(column => column.map(cell => cell.type).join(",")).join(":");
	}

	public import(data: string) : boolean {
		const valid = [",", ":", ...Object.keys(CellType).filter(key => !isNaN(parseInt(key)))];
		if(!data.split("").every(char => valid.includes(char))) return false;

		const columns = data.split(":");
		if(columns.length != this.columns) return false;
		if(!columns.every(column => column.includes(",") && column.split(",").length == this.rows)) return false;

		columns.forEach((column, x) => column.split(",").forEach((row, y) => {
			this.grid[x][y] = new Cell(CellType[CellType[parseInt(row)]], x, y, this);
		}));

		this.render();
		return true;
	}
}