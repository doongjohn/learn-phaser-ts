import GameScene from './scene_game';

const config = {
	type: Phaser.AUTO,
	width: 1080,
	height: 1920,
	scale: {
		mode: Phaser.Scale.FIT,
		autoCenter: Phaser.Scale.CENTER_BOTH,
	},
	backgroundColor: '#4eaefc',
	scene: GameScene
};

// Initialize phaser app
const game = new Phaser.Game(config);
