// -----------------------
// Simple Minesweeper game
// -----------------------
// Features:
// - touch support
// - mouse support
// TODO:
// - right click flag (swap button for touch)
// - game menu and ui 
//   (https://blog.ourcade.co/posts/2020/phaser-3-google-fonts-webfontloader/)
// - configurable settings
// - save game sate


// Types
type Scene = Phaser.Scene;
const Scene = Phaser.Scene;

type Vector2 = Phaser.Math.Vector2;
const Vector2 = Phaser.Math.Vector2;

type GameObject = Phaser.GameObjects.GameObject;
type Text = Phaser.GameObjects.Text;
type Container = Phaser.GameObjects.Container;
type Rectangle = Phaser.GameObjects.Rectangle;
type PositionObject = Container | Rectangle;

enum GameState {
	Playing,
	GameEnd
}


// Globals
let gameSate: GameState = GameState.Playing;
let camMain: Phaser.Cameras.Scene2D.Camera;
let camCenter: () => Vector2;
let world: Container;
let flagContainer: Container;

// Grid settings
const gridSize = new Vector2(10, 10);
const gapSize = new Vector2(10, 10);
const tileSize = new Vector2(85, 85);
const cellSize = tileSize.clone().add(gapSize);
const mineCount = 10;
let tileLeft = gridSize.x * gridSize.y - mineCount;

// Colors
const tileVisualOriginalColor: integer = 0xffffff;
const tileVisualClickedColor: integer = 0x0066ff;
const backgroundColor: integer = 0x5088ff;

// Tile input
let curTileClicked: Rectangle = null;
let curTileVisual: Rectangle = null;
let clickCallBack = () => { };

// Tiles
let bgTileArray: Rectangle[] = [];
let tileArray: Container[] = [];
let mineArray: Text[] = [];
let numArray: integer[] = [];
let flagArray: Text[] = [];


//#region Game Scene
export default class MinesweeperScene extends Scene {
	constructor() {
		super('Minesweeper');
	}

	preload() {
		// Initialize globals
		camMain = this.cameras.main;
		camCenter = () => new Vector2(camMain.centerX, camMain.centerY);
		world = this.add.container(camCenter().x, camCenter().y);
		flagContainer = this.add.container(0, 0);

		// Initialize arrays
		initNumberArray();
		initFlagArray();
	}

	create() {
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
		world.add(flagContainer);

		// Handle input
		onTilePointerUp(this);
	}
}
//#endregion

//#region Utility
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

function gridAlignCenter(items: PositionObject[], gridSize: Vector2, cellSize: Vector2) {
	const initial_x = (cellSize.x - cellSize.x * gridSize.x) * 0.5;
	const initial_y = (cellSize.y - cellSize.y * gridSize.y) * 0.5;
	let curPosX = initial_x;
	let curPosY = initial_y;
	let index_x = 0;
	let index_y = 0;

	for (let item of items) {
		if (item == null)
			continue;

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

function getRandomIndices(count: integer): integer[] {
	var array: integer[] = [];
	for (let i = 0; i < gridSize.x * gridSize.y; i++)
		array.push(i);

	let curIndex = array.length;
	let tmpValue = 0;
	let randIndex = 0;
	while (0 != curIndex) {
		randIndex = Math.floor(Math.random() * curIndex);
		curIndex--;
		tmpValue = array[curIndex];
		array[curIndex] = array[randIndex];
		array[randIndex] = tmpValue;
	}

	return array.slice(0, count - 1);
}
//#endregion

//#region Initialize
function initNumberArray() {
	for (let i = 0; i < gridSize.x * gridSize.y; i++)
		numArray.push(0);
}

function initFlagArray() {
	for (let i = 0; i < gridSize.x * gridSize.y; i++)
		flagArray.push(null);
}
//#endregion

//#region Game Logic
function removeTileInteraction() {
	for (let item of tileArray) {
		item?.getAll().forEach((child: Rectangle) => {
			if (child) {
				if (child.alpha != 0) child.setAlpha(0.5);
				child.removeInteractive();
			}
		});
	}
}

function gameWin() {
	gameSate = GameState.GameEnd;
	// do stuff
	console.log("Game Win!");
	removeTileInteraction();
}

function gameLose() {
	gameSate = GameState.GameEnd;
	// do stuff
	console.log("Game Lose!");
	removeTileInteraction();
}
//#endregion

//#region Generate GameObjects
function generateBackground(scene: Scene): Rectangle {
	return scene.add.rectangle(
		0, 0,
		gridSize.x * cellSize.x + gapSize.x,
		gridSize.y * cellSize.y + gapSize.y,
		backgroundColor
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
		tileArray.push(createTile(scene, tileSize, gapSize, i));
	gridAlignCenter(tileArray, gridSize, cellSize);
	return scene.add.container(0, 0, tileArray);
}

function generateMines(scene: Scene): Container {
	for (let i of getRandomIndices(mineCount)) {
		const mine = createMine(scene, tileSize.clone().divide(new Vector2(2, 2))).
			setPosition(tileArray[i].x, tileArray[i].y);
		mineArray.push(mine);
		numArray[i] = 10;

		const pos = toCoord(i);
		const rightInBound = pos.x + 1 < gridSize.x;
		const leftInBound = pos.x - 1 >= 0;
		const upInBound = pos.y + 1 < gridSize.y;
		const downInBound = pos.y - 1 >= 0;

		if (rightInBound)
			numArray[toIndex(pos.clone().add(new Vector2(+1, +0)))] += 1;
		if (leftInBound)
			numArray[toIndex(pos.clone().add(new Vector2(-1, +0)))] += 1;

		if (upInBound)
			numArray[toIndex(pos.clone().add(new Vector2(+0, +1)))] += 1;
		if (downInBound)
			numArray[toIndex(pos.clone().add(new Vector2(+0, -1)))] += 1;

		if (upInBound && rightInBound)
			numArray[toIndex(pos.clone().add(new Vector2(+1, +1)))] += 1;
		if (upInBound && leftInBound)
			numArray[toIndex(pos.clone().add(new Vector2(-1, +1)))] += 1;

		if (downInBound && rightInBound)
			numArray[toIndex(pos.clone().add(new Vector2(+1, -1)))] += 1;
		if (downInBound && leftInBound)
			numArray[toIndex(pos.clone().add(new Vector2(-1, -1)))] += 1;
	}

	return scene.add.container(0, 0, mineArray);
}

function generateNumberText(scene: Scene): Container {
	const numberTexts: Text[] = [];
	for (let i = 0; i < gridSize.x * gridSize.y; i++) {
		if (numArray[i] == 0 || numArray[i] >= 10)
			continue;
		const txt = scene.add.text(tileArray[i].x, tileArray[i].y, numArray[i].toString());
		txt.setOrigin(0.5);
		txt.setFontSize(tileSize.y * 0.43);
		txt.setFontStyle('Bold');
		numberTexts.push(txt);
	}
	return scene.add.container(0, 0, numberTexts);
}
//#endregion

//#region Create GamObject
function createBGTile(scene: Scene, size: Vector2): Rectangle {
	const tile = scene.add.rectangle(0, 0, size.x, size.y, 0xffffff, 0.3);
	return tile;
}

function createTile(scene: Scene, size: Vector2, gapSize: Vector2, index: integer): Container {
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
	onTilePointerDown(scene, tileClick, tileVisual, index);

	return container;
}

function createMine(scene: Scene, size: Vector2): Text {
	const mine = scene.add.text(0, 0, "💣");
	mine.setOrigin(0.5);
	mine.setPadding(20);
	mine.setFontSize(tileSize.y * 0.65);
	return mine;
}

function createFlag(scene: Scene): Text {
	const flag = scene.add.text(0, 0, "🚩");
	flag.setOrigin(0.5);
	flag.setPadding(20);
	flag.setFontSize(tileSize.y * 0.65);
	flagContainer.add(flag);
	return flag;
}
//#endregion

//#region Tile logic
function removeTile(tileChildren: GameObject[]) {
	tileChildren.forEach(child => { child.destroy(); });
	if (--tileLeft == 0) {
		gameWin();
	}
}

function removeFlag(pos: Vector2) {
	if (flagArray[toIndex(pos)] != null) {
		flagArray[toIndex(pos)].destroy();
		flagArray[toIndex(pos)] = null
	}
}

function openTile(pos: Vector2) {
	const children = tileArray[toIndex(pos)].getAll();
	if (children.length == 0) return;
	removeTile(children);
	removeFlag(pos);
}

function openTileRecursive(pos: Vector2) {
	// TODO:
	// Do not use this stupid implementation
	// this is really really horrible...

	const children = tileArray[toIndex(pos)].getAll();
	if (children.length == 0) return;
	removeTile(children);
	removeFlag(pos);

	function openNext(nextPos: Vector2) {
		if (numArray[toIndex(nextPos)] == 0)
			openTileRecursive(nextPos);
		else if (numArray[toIndex(nextPos)] < 10)
			openTile(nextPos);
	}

	const rightInBound = pos.x + 1 < gridSize.x;
	const leftInBound = pos.x - 1 >= 0;
	const upInBound = pos.y + 1 < gridSize.y;
	const downInBound = pos.y - 1 >= 0;

	if (rightInBound)
		openNext(pos.clone().add(new Vector2(+1, +0)));
	if (leftInBound)
		openNext(pos.clone().add(new Vector2(-1, +0)));
	if (upInBound)
		openNext(pos.clone().add(new Vector2(+0, +1)));
	if (downInBound)
		openNext(pos.clone().add(new Vector2(+0, -1)));
	if (upInBound && rightInBound)
		openNext(pos.clone().add(new Vector2(+1, +1)));
	if (upInBound && leftInBound)
		openNext(pos.clone().add(new Vector2(-1, +1)));
	if (downInBound && rightInBound)
		openNext(pos.clone().add(new Vector2(+1, -1)));
	if (downInBound && leftInBound)
		openNext(pos.clone().add(new Vector2(-1, -1)));
}

function onTilePointerDown(scene: Scene, tileClick: Rectangle, tileVisual: Rectangle, index: integer) {
	function leftClick() {
		if (flagArray[index]) return;

		curTileClicked = tileClick;
		curTileVisual = tileVisual;
		curTileVisual.setFillStyle(tileVisualClickedColor);
		clickCallBack = () => {
			if (numArray[index] > 9) {
				gameLose();
				openTile(toCoord(index));
			} else {
				openTileRecursive(toCoord(index));
			}
		};
	}

	function rightClick() {
		if (curTileClicked) return;

		// Toggle flag
		if (flagArray[index]) {
			flagArray[index].destroy();
			flagArray[index] = null;
		}
		else {
			flagArray[index] = createFlag(scene);
			flagArray[index].setPosition(tileArray[index].x, tileArray[index].y);
		}
	}

	// Handle click event
	tileClick.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
		switch (pointer.button) {
			case 0:
				leftClick();
				break;
			case 2:
				rightClick();
				break;
		}
	});
}

function onTilePointerUp(scene: Scene) {
	function onPointerUp() {
		if (!curTileClicked) return;
		curTileVisual.setFillStyle(tileVisualOriginalColor);
		curTileVisual = null;
		curTileClicked = null;
		clickCallBack = () => { };
	}

	scene.input.on('gameout', onPointerUp);
	scene.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
		if (pointer.button == 0) onPointerUp();
	});

	scene.input.on('gameobjectup', (pointer: Phaser.Input.Pointer, obj: GameObject) => {
		if (pointer.button != 0)
			return;

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
//#endregion
