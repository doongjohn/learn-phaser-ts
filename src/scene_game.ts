// Simple Minesweeper game
// 

// Types
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
let numArray: integer[] = [];
let bgTileArray: Rectangle[] = [];
let tileArray: Container[] = [];
let mineArray: Rectangle[] = [];

// Game Scene
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
	result.x = i - (result.y * gridSize.x);
	return result;
}

function toIndex(v: Vector2): integer {
	if (v.x < 0 || v.y < 0 || v.x >= gridSize.x || v.y >= gridSize.y)
		return -1;
	return gridSize.x * v.y + v.x;
}

function initializeNumberArray() {
	for (let i = 0; i < gridSize.x * gridSize.y; i++)
		numArray.push(0);
}

function generateNumberText(scene: Scene): Container {
	const numberTexts: Phaser.GameObjects.Text[] = [];
	for (let i = 0; i < gridSize.x * gridSize.y; i++) {
		if (numArray[i] == 0 || numArray[i] >= 10)
			continue;
		const txt = scene.add.text(tileArray[i].x, tileArray[i].y, numArray[i].toString());
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
		bgTileArray.push(createBGTile(scene, tileSize));
	gridAlignCenter(bgTileArray, gridSize, cellSize);
	return scene.add.container(0, 0, bgTileArray);
}

function generateTiles(scene: Scene): Container {
	for (let i = 0; i < gridSize.x * gridSize.y; i++)
		tileArray.push(createTile(scene, tileSize, gapSize));
	gridAlignCenter(tileArray, gridSize, cellSize);
	return scene.add.container(0, 0, tileArray);
}

function generateMines(scene: Scene): Container {
	let minePositions = [
		toIndex(new Vector2(0, 0)),
		toIndex(new Vector2(5, 2)),
		toIndex(new Vector2(3, 4)),
		toIndex(new Vector2(4, 5)),
		toIndex(new Vector2(6, 6))
	];

	for (let i of minePositions) {
		const mine = createMine(scene, tileSize.clone().divide(new Vector2(2, 2))).
			setPosition(tileArray[i].x, tileArray[i].y);
		mineArray.push(mine);

		const coord = toCoord(i);
		const rightInBound = coord.x + 1 < gridSize.x;
		const leftInBound = coord.x - 1 >= 0;
		const upInBound = coord.y + 1 < gridSize.y;
		const downInBound = coord.y - 1 >= 0;

		numArray[i] = 10;

		if (rightInBound)
			numArray[toIndex(coord.clone().add(new Vector2(+1, +0)))] += 1;
		if (leftInBound)
			numArray[toIndex(coord.clone().add(new Vector2(-1, +0)))] += 1;

		if (upInBound)
			numArray[toIndex(coord.clone().add(new Vector2(+0, +1)))] += 1;
		if (downInBound)
			numArray[toIndex(coord.clone().add(new Vector2(+0, -1)))] += 1;

		if (upInBound && rightInBound)
			numArray[toIndex(coord.clone().add(new Vector2(+1, +1)))] += 1;
		if (upInBound && leftInBound)
			numArray[toIndex(coord.clone().add(new Vector2(-1, +1)))] += 1;

		if (downInBound && rightInBound)
			numArray[toIndex(coord.clone().add(new Vector2(+1, -1)))] += 1;
		if (downInBound && leftInBound)
			numArray[toIndex(coord.clone().add(new Vector2(-1, -1)))] += 1;
	}

	return scene.add.container(0, 0, mineArray);
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
	const tileVisual = scene.add.
		rectangle(0, 0, size.x, size.y, tileVisualOriginalColor);

	const tileClick = scene.add.
		rectangle(0, 0, size.x + gapSize.x, size.y + gapSize.y, 0x000000, 0).
		setInteractive();

	const container = scene.add.
		container(0, 0, [tileVisual, tileClick]);

	// Hover effect
	function onOver() { tileClick.setFillStyle(tileClick.fillColor, 0.1); }
	function onOut() { tileClick.setFillStyle(tileClick.fillColor, 0); }
	tileClick.on('pointerover', onOver);
	tileClick.on('pointerout', onOut);
	scene.input.on('gameout', onOut);

	// On Click
	onTilePointerDown(tileClick, tileVisual);

	return container;
}

function onTilePointerDown(tileClick: Rectangle, tileVisual: Rectangle) {
	tileClick.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
		if (pointer.button != 0)
			return
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
		if (!curTileClicked) return
		curTileVisual.setFillStyle(tileVisualOriginalColor);
		curTileVisual = null;
		curTileClicked = null;
		clickCallBack = () => { };
	}

	scene.input.on('gameout', onPointerUp);
	scene.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
		if (pointer.button != 0) return
		onPointerUp();
	});

	scene.input.on('gameobjectup', (pointer: Phaser.Input.Pointer, obj: Phaser.GameObjects.GameObject) => {
		if (pointer.button != 0) return

		if (obj == curTileClicked)
			clickCallBack();

		if (curTileVisual != null) {
			curTileVisual.setFillStyle(tileVisualOriginalColor);
			curTileVisual = null;
		}
		
		curTileClicked = null;
		clickCallBack = () => { };
	});
}

function gridAlignCenter(items: PositionObject[], gridSize: Vector2, cellSize: Vector2) {
	const initial_x = (cellSize.x - cellSize.x * gridSize.x) * 0.5;
	const initial_y = (cellSize.y - cellSize.y * gridSize.y) * 0.5;
	let curPosX = initial_x;
	let curPosY = initial_y;
	let index_x = 0;
	let index_y = 0;

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
