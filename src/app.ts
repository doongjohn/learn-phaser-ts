function preventHTMLContextMenu() {
	document.body.oncontextmenu = function (e) {
		e.preventDefault();
	};
}

export function initPage() {
	preventHTMLContextMenu();
}

export function initGame(scene: Phaser.Scene): Phaser.Game {
	const config = {
		type: Phaser.AUTO,
		width: 1080,
		height: 1920,
		scale: {
			mode: Phaser.Scale.FIT,
			autoCenter: Phaser.Scale.CENTER_BOTH,
		},
		backgroundColor: '#4eaefc',
		scene: scene
	};

	return new Phaser.Game(config);
}
