import DemoScene from './demo_scene';

const config = {
    type: Phaser.AUTO,
    width: 1080,
    height: 1920,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    backgroundColor: '#4eaefc',
    scene: DemoScene
};

const game = new Phaser.Game(config);
