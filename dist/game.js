
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
(function () {
	'use strict';

	var global = window;

	function preventHTMLContextMenu() {
	  document.body.oncontextmenu = function(e) {
	    e.preventDefault();
	  };
	}
	function initPage() {
	  preventHTMLContextMenu();
	}
	function initGame(scene) {
	  const config = {
	    type: Phaser.AUTO,
	    width: 1080,
	    height: 1920,
	    scale: {
	      mode: Phaser.Scale.FIT,
	      autoCenter: Phaser.Scale.CENTER_BOTH
	    },
	    backgroundColor: "#4eaefc",
	    scene
	  };
	  return new Phaser.Game(config);
	}

	const Scene = Phaser.Scene;
	const Vector2 = Phaser.Math.Vector2;
	var GameState;
	(function(GameState2) {
	  GameState2[GameState2["Playing"] = 0] = "Playing";
	  GameState2[GameState2["GameEnd"] = 1] = "GameEnd";
	})(GameState || (GameState = {}));
	let camMain;
	let camCenter;
	let world;
	let flagContainer;
	const gridSize = new Vector2(10, 10);
	const gapSize = new Vector2(10, 10);
	const tileSize = new Vector2(85, 85);
	const cellSize = tileSize.clone().add(gapSize);
	const mineCount = 15;
	let tileLeft = gridSize.x * gridSize.y - mineCount;
	const tileVisualOriginalColor = 16777215;
	const tileVisualClickedColor = 26367;
	const backgroundColor = 5277951;
	let curTileClicked = null;
	let curTileVisual = null;
	let clickCallBack = () => {
	};
	let bgTileArray = [];
	let tileArray = [];
	let mineArray = [];
	let numArray = [];
	let flagArray = [];
	class MinesweeperScene extends Scene {
	  constructor() {
	    super("Minesweeper");
	  }
	  preload() {
	    camMain = this.cameras.main;
	    camCenter = () => new Vector2(camMain.centerX, camMain.centerY);
	    world = this.add.container(camCenter().x, camCenter().y);
	    flagContainer = this.add.container(0, 0);
	    initNumberArray();
	    initFlagArray();
	  }
	  create() {
	    const background = generateBackground(this);
	    const bgtileContainer = generateBGTiles(this);
	    const tileContainer = generateTiles(this);
	    const minesContainer = generateMines(this);
	    const textContainer = generateNumberText(this);
	    world.add(background);
	    world.add(bgtileContainer);
	    world.add(minesContainer);
	    world.add(textContainer);
	    world.add(tileContainer);
	    world.add(flagContainer);
	    onTilePointerUp(this);
	  }
	}
	function toCoord(i) {
	  let result = new Vector2(-1, -1);
	  result.y = Math.floor(i / gridSize.x);
	  result.x = i - result.y * gridSize.x;
	  return result;
	}
	function toIndex(v) {
	  if (v.x < 0 || v.y < 0 || v.x >= gridSize.x || v.y >= gridSize.y)
	    return -1;
	  return gridSize.x * v.y + v.x;
	}
	function gridAlignCenter(items, gridSize2, cellSize2) {
	  const initial_x = (cellSize2.x - cellSize2.x * gridSize2.x) * 0.5;
	  const initial_y = (cellSize2.y - cellSize2.y * gridSize2.y) * 0.5;
	  let curPosX = initial_x;
	  let curPosY = initial_y;
	  let index_x = 0;
	  let index_y = 0;
	  for (let item of items) {
	    if (item == null)
	      continue;
	    item.setPosition(curPosX, curPosY);
	    if (index_x < gridSize2.x - 1) {
	      index_x += 1;
	      curPosX += cellSize2.x;
	      continue;
	    }
	    if (index_y < gridSize2.y - 1) {
	      index_x = 0;
	      curPosX = initial_x;
	      index_y += 1;
	      curPosY += cellSize2.y;
	    }
	  }
	}
	function getRandomIndices(count) {
	  var array = [];
	  for (let i = 0; i < gridSize.x * gridSize.y; i++)
	    array.push(i);
	  let curIndex = array.length;
	  let tmpValue = 0;
	  let randIndex = 0;
	  while (curIndex != 0) {
	    randIndex = Math.floor(Math.random() * curIndex);
	    curIndex--;
	    tmpValue = array[curIndex];
	    array[curIndex] = array[randIndex];
	    array[randIndex] = tmpValue;
	  }
	  return array.slice(0, count);
	}
	function initNumberArray() {
	  for (let i = 0; i < gridSize.x * gridSize.y; i++)
	    numArray.push(0);
	}
	function initFlagArray() {
	  for (let i = 0; i < gridSize.x * gridSize.y; i++)
	    flagArray.push(null);
	}
	function removeTileInteraction() {
	  for (let item of tileArray) {
	    item == null ? void 0 : item.getAll().forEach((child) => {
	      if (child) {
	        if (child.alpha != 0)
	          child.setAlpha(0.5);
	        child.removeInteractive();
	      }
	    });
	  }
	}
	function gameWin() {
	  console.log("Game Win!");
	  removeTileInteraction();
	}
	function gameLose() {
	  console.log("Game Lose!");
	  removeTileInteraction();
	}
	function generateBackground(scene) {
	  return scene.add.rectangle(0, 0, gridSize.x * cellSize.x + gapSize.x, gridSize.y * cellSize.y + gapSize.y, backgroundColor);
	}
	function generateBGTiles(scene) {
	  for (let i = 0; i < gridSize.x * gridSize.y; i++)
	    bgTileArray.push(createBGTile(scene, tileSize));
	  gridAlignCenter(bgTileArray, gridSize, cellSize);
	  return scene.add.container(0, 0, bgTileArray);
	}
	function generateTiles(scene) {
	  for (let i = 0; i < gridSize.x * gridSize.y; i++)
	    tileArray.push(createTile(scene, tileSize, gapSize, i));
	  gridAlignCenter(tileArray, gridSize, cellSize);
	  return scene.add.container(0, 0, tileArray);
	}
	function generateMines(scene) {
	  for (let i of getRandomIndices(mineCount)) {
	    const mine = createMine(scene, tileSize.clone().divide(new Vector2(2, 2))).setPosition(tileArray[i].x, tileArray[i].y);
	    mineArray.push(mine);
	    numArray[i] = 10;
	    const pos = toCoord(i);
	    const rightInBound = pos.x + 1 < gridSize.x;
	    const leftInBound = pos.x - 1 >= 0;
	    const upInBound = pos.y + 1 < gridSize.y;
	    const downInBound = pos.y - 1 >= 0;
	    if (rightInBound)
	      numArray[toIndex(pos.clone().add(new Vector2(1, 0)))] += 1;
	    if (leftInBound)
	      numArray[toIndex(pos.clone().add(new Vector2(-1, 0)))] += 1;
	    if (upInBound)
	      numArray[toIndex(pos.clone().add(new Vector2(0, 1)))] += 1;
	    if (downInBound)
	      numArray[toIndex(pos.clone().add(new Vector2(0, -1)))] += 1;
	    if (upInBound && rightInBound)
	      numArray[toIndex(pos.clone().add(new Vector2(1, 1)))] += 1;
	    if (upInBound && leftInBound)
	      numArray[toIndex(pos.clone().add(new Vector2(-1, 1)))] += 1;
	    if (downInBound && rightInBound)
	      numArray[toIndex(pos.clone().add(new Vector2(1, -1)))] += 1;
	    if (downInBound && leftInBound)
	      numArray[toIndex(pos.clone().add(new Vector2(-1, -1)))] += 1;
	  }
	  return scene.add.container(0, 0, mineArray);
	}
	function generateNumberText(scene) {
	  const numberTexts = [];
	  for (let i = 0; i < gridSize.x * gridSize.y; i++) {
	    if (numArray[i] == 0 || numArray[i] >= 10)
	      continue;
	    const txt = scene.add.text(tileArray[i].x, tileArray[i].y, numArray[i].toString());
	    txt.setOrigin(0.5);
	    txt.setFontSize(tileSize.y * 0.43);
	    txt.setFontStyle("Bold");
	    numberTexts.push(txt);
	  }
	  return scene.add.container(0, 0, numberTexts);
	}
	function createBGTile(scene, size) {
	  const tile = scene.add.rectangle(0, 0, size.x, size.y, 16777215, 0.3);
	  return tile;
	}
	function createTile(scene, size, gapSize2, index) {
	  const tileVisual = scene.add.rectangle(0, 0, size.x, size.y, tileVisualOriginalColor);
	  const tileClick = scene.add.rectangle(0, 0, size.x + gapSize2.x, size.y + gapSize2.y, 5592575, 0).setInteractive();
	  const container = scene.add.container(0, 0, [tileVisual, tileClick]);
	  function onOver() {
	    tileClick.setFillStyle(tileClick.fillColor, 0.3);
	  }
	  function onOut() {
	    tileClick.setFillStyle(tileClick.fillColor, 0);
	  }
	  tileClick.on("pointerover", onOver);
	  tileClick.on("pointerout", onOut);
	  scene.input.on("gameout", onOut);
	  onTilePointerDown(scene, tileClick, tileVisual, index);
	  return container;
	}
	function createMine(scene, size) {
	  const mine = scene.add.text(0, 0, "\u{1F4A3}");
	  mine.setOrigin(0.5);
	  mine.setPadding(20);
	  mine.setFontSize(tileSize.y * 0.65);
	  return mine;
	}
	function createFlag(scene) {
	  const flag = scene.add.text(0, 0, "\u{1F6A9}");
	  flag.setOrigin(0.5);
	  flag.setPadding(20);
	  flag.setFontSize(tileSize.y * 0.65);
	  flagContainer.add(flag);
	  return flag;
	}
	function removeTile(tileChildren) {
	  tileChildren.forEach((child) => {
	    child.destroy();
	  });
	  if (--tileLeft == 0) {
	    gameWin();
	  }
	}
	function removeFlag(pos) {
	  if (flagArray[toIndex(pos)] != null) {
	    flagArray[toIndex(pos)].destroy();
	    flagArray[toIndex(pos)] = null;
	  }
	}
	function openTile(pos) {
	  const children = tileArray[toIndex(pos)].getAll();
	  if (children.length == 0)
	    return;
	  removeTile(children);
	  removeFlag(pos);
	}
	function openTileRecursive(pos) {
	  const children = tileArray[toIndex(pos)].getAll();
	  if (children.length == 0)
	    return;
	  removeTile(children);
	  removeFlag(pos);
	  function openNext(nextPos) {
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
	    openNext(pos.clone().add(new Vector2(1, 0)));
	  if (leftInBound)
	    openNext(pos.clone().add(new Vector2(-1, 0)));
	  if (upInBound)
	    openNext(pos.clone().add(new Vector2(0, 1)));
	  if (downInBound)
	    openNext(pos.clone().add(new Vector2(0, -1)));
	  if (upInBound && rightInBound)
	    openNext(pos.clone().add(new Vector2(1, 1)));
	  if (upInBound && leftInBound)
	    openNext(pos.clone().add(new Vector2(-1, 1)));
	  if (downInBound && rightInBound)
	    openNext(pos.clone().add(new Vector2(1, -1)));
	  if (downInBound && leftInBound)
	    openNext(pos.clone().add(new Vector2(-1, -1)));
	}
	function onTilePointerDown(scene, tileClick, tileVisual, index) {
	  function leftClick() {
	    if (flagArray[index])
	      return;
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
	    if (curTileClicked)
	      return;
	    if (flagArray[index]) {
	      flagArray[index].destroy();
	      flagArray[index] = null;
	    } else {
	      flagArray[index] = createFlag(scene);
	      flagArray[index].setPosition(tileArray[index].x, tileArray[index].y);
	    }
	  }
	  tileClick.on("pointerdown", (pointer) => {
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
	function onTilePointerUp(scene) {
	  function onPointerUp() {
	    if (!curTileClicked)
	      return;
	    curTileVisual.setFillStyle(tileVisualOriginalColor);
	    curTileVisual = null;
	    curTileClicked = null;
	    clickCallBack = () => {
	    };
	  }
	  scene.input.on("gameout", onPointerUp);
	  scene.input.on("pointerup", (pointer) => {
	    if (pointer.button == 0)
	      onPointerUp();
	  });
	  scene.input.on("gameobjectup", (pointer, obj) => {
	    if (pointer.button != 0)
	      return;
	    if (obj == curTileClicked)
	      clickCallBack();
	    if (curTileVisual != null) {
	      curTileVisual.setFillStyle(tileVisualOriginalColor);
	      curTileVisual = null;
	    }
	    curTileClicked = null;
	    clickCallBack = () => {
	    };
	  });
	}

	initPage();
	initGame(new MinesweeperScene());

}());
//# sourceMappingURL=game.js.map
