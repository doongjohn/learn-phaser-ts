type Scene = Phaser.Scene;
type Container = Phaser.GameObjects.Container;
type Rectangle = Phaser.GameObjects.Rectangle;
type Vector2 = Phaser.Math.Vector2;
const Vector2 = Phaser.Math.Vector2;


let currentClicked: Phaser.GameObjects.GameObject = null;
let clickCallBack = () => {};

// Grid settings
const gridSize = new Vector2(8, 8);
const gapSize = new Vector2(10, 10);
const tileSize = new Vector2(100, 100);
const cellSize = tileSize.clone().add(gapSize);


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

		// Create background
		const background = this.add.rectangle(
			0, 0,
			gridSize.x * cellSize.x + gapSize.x,
			gridSize.y * cellSize.y + gapSize.y,
			0x5088ff
		);

		// Create bg tiles
		let bgtiles: Rectangle[] = [];
		for (let i = 0; i < gridSize.x * gridSize.y; i++) {
			bgtiles.push(createBGTile(this, tileSize));
		}
		const bgtileContainer = this.add.container(0, 0, bgtiles);
		gridAlignCenter(bgtiles, gridSize, cellSize);

		// Create tiles
		let tiles: Container[] = [];
		for (let i = 0; i < gridSize.x * gridSize.y; i++) {
			tiles.push(createTile(this, tileSize, gapSize));
		}
		const tileContainer = this.add.container(0, 0, tiles);
		gridAlignCenter(tiles, gridSize, cellSize);

		// Create Mine Number array
		let numbers: integer[] = [];
		for (let i = 0; i < gridSize.x * gridSize.y; i++) {
			numbers.push(0);
		}
	
		// Create Mines
		let minePositions = [0, 5, 30, 62];
		let mines: Rectangle[] = [];
		for (let i of minePositions) {
			const mine = createMine(this, tileSize.clone().divide(new Vector2(2, 2)));
			mine.setPosition(tiles[i].x, tiles[i].y);
			numbers[i] = 10;
			mines.push(mine);
		}

		// Add GameObjects
		world.add(background);
		world.add(bgtileContainer);
		world.add(mines);
		world.add(tileContainer);

		// Handle input
		this.input.on('gameobjectup', (pointer: Phaser.Input.Pointer, obj: Phaser.GameObjects.GameObject) => {
			if (obj == currentClicked)
				clickCallBack();
			currentClicked = null;
			clickCallBack = () => {};
		});
	}
}

// TODO: make this function!
function getIndex(x: integer, y: integer, width: integer, height: integer): integer {
	return width * y + x;
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
	const tileVisual = scene.add.rectangle(0, 0, size.x, size.y, 0xffffff);
	const tileClick = scene.add.rectangle(0, 0, size.x + gapSize.x, size.y + gapSize.y, 0x000000, 0);
	const container = scene.add.container(0, 0, [tileVisual, tileClick]);

	// Handle Input
	tileClick.setInteractive();
	tileClick.on('pointerdown', () => {
		currentClicked = tileClick;
		clickCallBack = () => {
			tileVisual.destroy();
			tileClick.destroy();
		};
	});

	return container;
}

type PositionObject = Container | Rectangle;

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

