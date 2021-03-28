
function spawnTile(scene: Phaser.Scene): Phaser.GameObjects.GameObject
{
    return scene.add.rectangle(0, 0, 150, 150, 0xffffff);
}

export default class DemoScene extends Phaser.Scene
{
    constructor ()
    {
        super('demo');
    }

    preload ()
    {

    }

    create ()
    {
        const world = this.add.container(
            this.cameras.main.centerX,
            this.cameras.main.centerY
        );
        
        const rectangles = this.add.container(
            0, 0, 
            [
                spawnTile(this),
                spawnTile(this),
                spawnTile(this),
                spawnTile(this),
                spawnTile(this),
                spawnTile(this),
                spawnTile(this),
                spawnTile(this),
                spawnTile(this)
            ]
        );

        // Align
        Phaser.Actions.GridAlign(
            rectangles.getAll(), {
            width: 3,
            height: 3,
            cellWidth: 180,
            cellHeight: 180,
            position: Phaser.Display.Align.CENTER
        });
        
        const rectsbound = rectangles.getBounds();
        rectangles.x += rectsbound.x * 2;
        rectangles.y += rectsbound.y * 2;

        // rectangles.setPosition(500, 500);
        
        world.add(rectangles);
    }
}
