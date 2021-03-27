// This is not ok
// import * as Phaser from 'phaser';

// This is important!
import 'phaser';

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
        // white rectangle at center
        var r1 = this.add.rectangle(400, 300, 148, 148, 0xffffff);
    }
}

const config = {
    type: Phaser.AUTO,
    backgroundColor: '#4eaefc',
    width: 800,
    height: 600,
    scene: DemoScene
};

const game = new Phaser.Game(config);
