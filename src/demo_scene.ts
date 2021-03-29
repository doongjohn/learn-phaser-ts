type Scene = Phaser.Scene;
type GameObject = Phaser.GameObjects.GameObject;
type Rectangle = Phaser.GameObjects.Rectangle;
type Vector2 = Phaser.Math.Vector2;
const Vector2 = Phaser.Math.Vector2;

export default class DemoScene extends Phaser.Scene {
	constructor() {
		super('demo');
	}

	preload() {

	}

	create() {
		const camMain = this.cameras.main;
		const camCenter = () => new Vector2(camMain.centerX, camMain.centerY);
		const world = this.add.container(camCenter().x, camCenter().y);

		// Grid settings
		const gridSize = new Vector2(8, 8);
		const gapSize = new Vector2(10, 10);
		const tileSize = new Vector2(100, 100);
		const cellSize = tileSize.clone().add(gapSize);

		// Create background
		const background = this.add.rectangle(
			0, 0,
			gridSize.x * cellSize.x + gapSize.x,
			gridSize.y * cellSize.y + gapSize.y,
			0x5088ff
		);

		// Create tiles
		let tiles: Rectangle[] = [];
		for (let i = 0; i < gridSize.x * gridSize.y; i++) {
			tiles.push(createTile(this, tileSize));
		}
		const tileContainer = this.add.container(0, 0, tiles);

		// Grid Align
		gridAlignCenter(tiles, gridSize, cellSize);

		// Add GameObjects to world container
		world.add([
			background,
			tileContainer
		]);
	}
}

function createTile(scene: Scene, size: Vector2): Rectangle {
	return scene.add.rectangle(0, 0, size.x, size.y, 0xffffff);
}

function gridAlignCenter(items: Rectangle[], gridSize: Vector2, cellSize: Vector2) {
	const initial_x = -cellSize.x * gridSize.x / 2 + cellSize.x / 2;
	const initial_y = -cellSize.y * gridSize.y / 2 + cellSize.y / 2;
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