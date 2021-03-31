type Scene = Phaser.Scene;
type Container = Phaser.GameObjects.Container;
type Rectangle = Phaser.GameObjects.Rectangle;
type PositionObject = Container | Rectangle;
type Vector2 = Phaser.Math.Vector2;
const Vector2 = Phaser.Math.Vector2;


// Grid settings
const gridSize = new Vector2(8, 8);
const gapSize = new Vector2(10, 10);
const tileSize = new Vector2(100, 100);
const cellSize = tileSize.clone().add(gapSize);

// Tile settings
let curTileClicked: Rectangle = null;
let curTileVisual: Rectangle = null;
let tileVisualOriginalColor: integer = 0xffffff;
let tileVisualClickedColor: integer = 0x0066ff;
let clickCallBack = () => { };

// Tiles
let numbers: integer[] = [];
let bgtiles: Rectangle[] = [];
let tiles: Container[] = [];
let mines: Rectangle[] = [];


export default class GameScene extends Phaser.Scene {
	constructor() {
		super('GameScene');
	}

	preload() {

	}

	create() {
		const camMain = this.cameras.main;
		const camCenter = () => new Vector2(camMain.centerX, camMain.centerY);
		const world = this.add.container(camCenter().x, camCenter().y);

		// Initialize Mine Number array
		initializeNumberArray();

		// Generate Objects
		const background = generateBackground(this);
		const bgtileContainer = generateBGTiles(this);
		const tileContainer = generateTiles(this);
		const minesContainer = generateMines(this);
		const textContainer = generateNumberText(this);

		// Add Objects
		world.add(background);
		world.add(bgtileContainer);
		world.add(minesContainer);
		world.add(textContainer);
		world.add(tileContainer);

		// Handle input
		onTilePointerUp(this);
	}
}

function toCoord(i: integer): Vector2 {
	let result = new Vector2(-1, -1);
	result.y = Math.floor(i / gridSize.x);
	result.x = i % gridSize.x;
	return result;
}

function toIndex(x: integer, y: integer): integer {
	if (x < 0
		|| y < 0
		|| x >= gridSize.x
		|| y >= gridSize.y)
		return -1;
	return gridSize.x * y + x;
}

function initializeNumberArray() {
	for (let i = 0; i < gridSize.x * gridSize.y; i++)
		numbers.push(0);
}

function generateNumberText(scene: Scene): Container {
	const numberTexts: Phaser.GameObjects.Text[] = [];
	for (let i = 0; i < gridSize.x * gridSize.y; i++) {
		if (numbers[i] >= 10) continue;
		const txt = scene.add.text(tiles[i].x, tiles[i].y, numbers[i].toString());
		txt.setOrigin(0.5);
		txt.setFontSize(40);
		txt.setFontStyle('Bold');
		numberTexts.push(txt);
	}
	return scene.add.container(0, 0, numberTexts);
}

function generateBackground(scene: Scene): Rectangle {
	return scene.add.rectangle(
		0, 0,
		gridSize.x * cellSize.x + gapSize.x,
		gridSize.y * cellSize.y + gapSize.y,
		0x5088ff
	);
}

function generateBGTiles(scene: Scene): Container {
	for (let i = 0; i < gridSize.x * gridSize.y; i++)
		bgtiles.push(createBGTile(scene, tileSize));
	gridAlignCenter(bgtiles, gridSize, cellSize);
	return scene.add.container(0, 0, bgtiles);
}

function generateTiles(scene: Scene): Container {
	for (let i = 0; i < gridSize.x * gridSize.y; i++)
		tiles.push(createTile(scene, tileSize, gapSize));
	gridAlignCenter(tiles, gridSize, cellSize);
	return scene.add.container(0, 0, tiles);
}

function generateMines(scene: Scene): Container {
	let minePositions = [
		toIndex(0, 0),
		toIndex(5, 2),
		toIndex(3, 4),
		toIndex(4, 5),
		toIndex(6, 6)
	];
	for (let i of minePositions) {
		const mine = createMine(scene, tileSize.clone().divide(new Vector2(2, 2)));
		mine.setPosition(tiles[i].x, tiles[i].y);
		mines.push(mine);

		let coord = toCoord(i);
		let rightInBound = coord.x + 1 < gridSize.x;
		let leftInBound = coord.x - 1 >= 0;
		let upInBound = coord.y + 1 < gridSize.y;
		let downInBound = coord.y - 1 >= 0;
		numbers[i] = 10;
		if (rightInBound)
			numbers[toIndex(coord.x + 1, coord.y)] += 1;
		if (leftInBound)
			numbers[toIndex(coord.x - 1, coord.y)] += 1;
		if (upInBound)
			numbers[toIndex(coord.x, coord.y + 1)] += 1;
		if (downInBound)
			numbers[toIndex(coord.x, coord.y - 1)] += 1;
		if (upInBound && rightInBound)
			numbers[toIndex(coord.x + 1, coord.y + 1)] += 1;
		if (upInBound && leftInBound)
			numbers[toIndex(coord.x - 1, coord.y + 1)] += 1;
		if (downInBound && rightInBound)
			numbers[toIndex(coord.x + 1, coord.y - 1)] += 1;
		if (downInBound && leftInBound)
			numbers[toIndex(coord.x - 1, coord.y - 1)] += 1;
	}

	return scene.add.container(0, 0, mines);
}

function createBGTile(scene: Scene, size: Vector2): Rectangle {
	const tileVisual = scene.add.rectangle(0, 0, size.x, size.y, 0xffffff, 0.3);
	return tileVisual;
}

function createMine(scene: Scene, size: Vector2): Rectangle {
	const tileVisual = scene.add.rectangle(0, 0, size.x, size.y, 0x000000);
	return tileVisual;
}

function createTile(scene: Scene, size: Vector2, gapSize: Vector2): Container {
	const tileVisual = scene.add.rectangle(0, 0, size.x, size.y, tileVisualOriginalColor);
	const tileClick = scene.add.rectangle(0, 0, size.x + gapSize.x, size.y + gapSize.y, 0x000000, 0);
	const container = scene.add.container(0, 0, [tileVisual, tileClick]);

	// Handle Input
	tileClick.setInteractive();
	// Hover effect
	tileClick.on('pointerover', () => {
		tileClick.setFillStyle(tileClick.fillColor, 0.1);
	});
	tileClick.on('pointerout', () => {
		tileClick.setFillStyle(tileClick.fillColor, 0);
	});
	scene.input.on('gameout', () => {
		tileClick.setFillStyle(tileClick.fillColor, 0);
	});
	// On Click
	onTilePointerDown(tileClick, tileVisual);

	return container;
}

function onTilePointerDown(tileClick: Rectangle, tileVisual: Rectangle) {
	tileClick.on('pointerdown', () => {
		curTileClicked = tileClick;
		curTileVisual = tileVisual;
		curTileVisual.setFillStyle(tileVisualClickedColor);
		clickCallBack = () => {
			tileVisual.destroy();
			tileClick.destroy();
		};
	});
}

function onTilePointerUp(scene: Scene) {
	function onPointerUp() {
		if (curTileClicked) {
			curTileVisual.setFillStyle(tileVisualOriginalColor);
			curTileVisual = null;
			curTileClicked = null;
			clickCallBack = () => { };
		}
	}
	scene.input.on('gameout', onPointerUp);
	scene.input.on('pointerup', onPointerUp);
	scene.input.on('gameobjectup', (pointer: Phaser.Input.Pointer, obj: Phaser.GameObjects.GameObject) => {
		if (obj == curTileClicked) {
			clickCallBack();
		}
		if (curTileVisual != null) {
			curTileVisual.setFillStyle(tileVisualOriginalColor);
		}
		curTileClicked = null;
		curTileVisual = null;
		clickCallBack = () => { };
	});
}

function gridAlignCenter(items: PositionObject[], gridSize: Vector2, cellSize: Vector2) {
	const initial_x = (-cellSize.x * gridSize.x + cellSize.x) * 0.5;
	const initial_y = (-cellSize.y * gridSize.y + cellSize.y) * 0.5;
	let curPosX = initial_x;
	let curPosY = initial_y;

	let index_x = 0;
	let index_y = 0;

	// Set positions
	for (var item of items) {
		item.setPosition(curPosX, curPosY);
		if (index_x < gridSize.x - 1) {
			index_x += 1;
			curPosX += cellSize.x;
			continue;
		}
		if (index_y < gridSize.y - 1) {
			index_x = 0;
			curPosX = initial_x;
			index_y += 1;
			curPosY += cellSize.y;
		}
	}
}
