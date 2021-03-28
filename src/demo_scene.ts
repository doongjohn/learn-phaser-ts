type Scene = Phaser.Scene;
type GameObject = Phaser.GameObjects.GameObject;
type Vector2 = Phaser.Math.Vector2;
const Vector2 = Phaser.Math.Vector2;

export default class DemoScene extends Phaser.Scene {
	constructor() {
		super('demo');
	}

	preload() {

	}

	create() {
		const mainCam = this.cameras.main;
		const center = new Vector2(mainCam.centerX, mainCam.centerY);
		const world = this.add.container(center.x, center.y);

		const gridSize = new Vector2(3, 3);
		const cellSize = new Vector2(150, 150);
		const tileSize = new Vector2(130, 130);
		const gapSize = new Vector2(
			cellSize.x - tileSize.x,
			cellSize.y - tileSize.y
		);

		const background = this.add.rectangle(
			0, 0,
			(gridSize.x * cellSize.x) + (gapSize.x * 0.5),
			(gridSize.y * cellSize.y) + (gapSize.y * 0.5),
			0x555fff
		);

		let tiles: Array<GameObject> = [];
		for (let i = 0; i < gridSize.x; i++)
			for (let i = 0; i < gridSize.y; i++)
				tiles.push(createTile(this, tileSize));

		// FIXME!!!
		// Can't center container
		const tileContainer = this.add.container(0, 0, tiles);
		tileContainer.x = -150 * 3 * 0.5;
		tileContainer.y = -150 * 3 * 0.5;

		Phaser.Actions.GridAlign(
			tiles, {
			width: gridSize.x,
			height: gridSize.y,
			cellWidth: cellSize.x,
			cellHeight: cellSize.y,
			position: Phaser.Display.Align.CENTER,
		});

		world.add([
			background,
			tileContainer
		]);
	}
}

function createTile(scene: Scene, size: Vector2): GameObject {
	return scene.add.rectangle(0, 0, size.x, size.y, 0xffffff);
}
