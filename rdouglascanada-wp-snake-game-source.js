"use strict";
var Game = {
	canvas:undefined,
	width:800, height:600,
	timeout:1000 / 60, colour:"black",
	elements:[], state:undefined
};

Game.createInstance = function(values) {
	var instance = Object.create(Game);
	Object.assign(instance, values);
	return instance;
};

Game.getCanvasContext = function() {
	return this.canvas.getContext("2d");
};

Game.fillBackground = function() {
	var context = this.getCanvasContext();
	context.fillStyle = this.colour;
	context.fillRect(0, 0, this.width, this.height);
};

Game.draw = function() {
	var context = this.getCanvasContext();
	this.fillBackground();
	for (var e of this.elements) {e.draw(context)};
	if (this.state) {this.state.draw(context)};
};

Game.update = function() {
	this.canvas.width = this.width;
	this.canvas.height = this.height;
	for (var e of this.elements) {e.update()};
	if (this.state) {this.state.update()};
};

var Grid = {
	rows:undefined, columns:undefined,
	x: 0, y: 0, width:undefined, height:undefined
};

Grid.createInstance = function(values) {
	var instance = Object.create(Grid);
	Object.assign(instance, values);
	return instance;
};

Grid.tileWidth = function() {
	return Math.trunc(this.width / this.columns);
};

Grid.tileHeight = function() {
	return Math.trunc(this.height / this.rows);
};

var GridElement = {
	grid:undefined
};

GridElement.createInstance = function(values) {
	var instance = Object.create(GridElement);
	Object.assign(instance, values);
	return instance;
};

GridElement.draw = function(context) {
	
};

GridElement.update = function() {
	
};

GridElement.tilesOccupied = function() {
	
};

GridElement.tileOccupiedHash = function(rowIndex, columnIndex) {
	return rowIndex.toString() + "," + columnIndex.toString();
}

var GridElementCollection = {
	gridElements:undefined
};

GridElementCollection.createInstance = function(values) {
	var instance = Object.create(GridElement);
	Object.assign(instance, GridElementCollection);
	Object.assign(instance, values);
	return instance;
};

GridElementCollection.draw = function(context) {
	for (var element of this.gridElements) {element.draw(context);};
};

GridElementCollection.update = function() {
	for (var element of this.gridElements) {
		element.grid = this.grid;
		element.update();
	};
};

GridElementCollection.tilesOccupied = function() {
	var set = new Set();
	for (var element of this.gridElements) {
		for (var tile of element.tilesOccupied()) {
			set.add(tile);
		}
	}
	return set;
};

var GridRectangle = {
	colour:"black"
};

GridRectangle.createInstance = function(values) {
	var instance = Object.create(GridElement);
	Object.assign(instance, GridRectElement);
	Object.assign(instance, GridRectangle);
	Object.assign(instance, values);
	return instance;
};

GridRectangle.draw = function(context) {
	context.fillStyle = this.colour;
	context.fillRect(this.x, this.y, this.width, this.height);
};

var GridRectElement = {
	rowIndex:undefined, columnIndex:undefined,
	rowTiles:1, columnTiles:1,
	x:0, y:0, width:undefined,height:undefined
};

GridRectElement.createInstance = function(values) {
	var instance = Object.create(GridElement);
	Object.assign(instance, GridRectElement);
	Object.assign(instance, values);
	return instance;
};

GridRectElement.update = function() {
	this.x = this.grid.x + this.columnIndex * this.grid.tileWidth();
	this.y = this.grid.y + this.rowIndex * this.grid.tileHeight();
	this.width = this.columnTiles * this.grid.tileWidth();
	this.height = this.rowTiles * this.grid.tileHeight();
};

GridRectElement.tilesOccupied = function() {
	var set = new Set();
	for (var r = this.rowIndex; r < this.rowIndex + this.rowTiles; r++) {
		for (var c = this.columnIndex; c < this.columnIndex + this.columnTiles; c++) {
			set.add(GridElement.tileOccupiedHash(r, c));
		};
	};
	return set;
};

var GridText = {
	colour:"black", font:"bold 16px Arial",
	text:"", verticalAlign:"middle", horizontalAlign:"left",
	TOP:"top", MIDDLE:"middle", BOTTOM:"bottom",
	LEFT:"left", CENTRE:"centre", RIGHT:"right"
};

GridText.createInstance = function(values) {
	var instance = Object.create(GridElement);
	Object.assign(instance, GridRectElement);
	Object.assign(instance, GridText);
	Object.assign(instance, values);
	return instance;
};

GridText.draw = function(context) {
	context.fillStyle = this.colour;
	context.font = this.font;
	context.textBaseline = this.verticalAlign;
	var fillTextX = this.x;
	var fillTextY = this.y;
	var textWidth = context.measureText(this.text).width;
	if (this.horizontalAlign == GridText.CENTRE) {
		fillTextX = this.x + (this.width - textWidth) / 2;
	} else if (this.horizontalAlign == GridText.RIGHT) {
		fillTextX = this.x + this.width - textWidth;
	};
	if (this.verticalAlign == GridText.MIDDLE) {
		fillTextY = this.y + this.height / 2;
	} else if (this.verticalAlign == GridText.BOTTOM) {
		fillTextY = this.y + this.height;
	};
	context.fillText(this.text, fillTextX, fillTextY);
};

var ScoreText = {
	score:0
};

ScoreText.createInstance = function(values) {
	var instance = Object.create(GridElement);
	Object.assign(instance, GridRectElement);
	Object.assign(instance, GridText);
	Object.assign(instance, ScoreText);
	Object.assign(instance, values);
	return instance;
};

ScoreText.computeText = function() {
	var prefix = "";
	if (this.score < 10) {
		prefix = "  ";
	} else if (this.score < 100) {
		prefix = " ";
	}
	return "Score: " + prefix + this.score;
}

ScoreText.update = function() {
	this.text = this.computeText(); 
	GridRectElement.update.call(this);
};

var SnakeDirection = {
	NONE:"none", UP:"up", DOWN:"down", LEFT:"left", RIGHT:"right" 
}

var Snake = {
	direction:SnakeDirection.UP
};

Snake.createInstance = function(values) {
	var instance = Object.create(GridElement);
	Object.assign(instance, GridElementCollection);
	Object.assign(instance, Snake);
	Object.assign(instance, values);
	return instance;
};

Snake.tileInFrontOfHead = function() {
	var headTile = this.gridElements[0];
	var front;
	if (this.direction == SnakeDirection.UP) {
		front = [headTile.rowIndex - 1, headTile.columnIndex];
	} else if (this.direction == SnakeDirection.DOWN) {
		front = [headTile.rowIndex + 1, headTile.columnIndex];
	} else if (this.direction == SnakeDirection.LEFT) {
		front = [headTile.rowIndex, headTile.columnIndex - 1];
	} else if (this.direction == SnakeDirection.RIGHT) {
		front = [headTile.rowIndex, headTile.columnIndex + 1];
	} else if (this.direction != SnakeDirection.NONE) {
		throw "Unexpected direction value encountered " + this.direction;
	};
	return front;
}

Snake.advanceOneTile = function() {
	var front = this.tileInFrontOfHead();
	var tailTile = this.gridElements.pop();
	tailTile.rowIndex = front[0];
	tailTile.columnIndex = front[1];
	this.gridElements.unshift(tailTile);
};

Snake.eat = function(rowIndex, columnIndex) {
	var tile = GridRectangle.createInstance({
		colour:"green", grid:this.grid,
		rowIndex:rowIndex, columnIndex:columnIndex,
      rowTiles:1, columnTiles:1
	});
	this.gridElements.unshift(tile);
};

"use strict";
var SnakeGame = {
	grid:undefined, walls:undefined, wallTiles:undefined,
	snake:undefined, floor:undefined, food:undefined,
	topBackgroundArea:undefined, scoreText:undefined,
	titleText:undefined, miniTitleText:undefined,
	subtitleText:undefined, gameOverText:undefined, gameOverSubtitleText:undefined,
	titleState:undefined, playState:undefined, gameOverState:undefined
};

SnakeGame.createInstance = function(values) {
	var instance = Object.create(Game);
	Object.assign(instance, SnakeGame);
	Object.assign(instance, values);
	return instance;
};

SnakeGame.onKeyDown = function(event) {
	if (event.key == "ArrowLeft" || event.key == "ArrowRight" ||
		event.key == "ArrowUp" || event.key == "ArrowDown" ||
		event.key == " " || event.key == "Spacebar") {
		event.preventDefault();
	};
	if (this.state) {this.state.onKeyDown(event)};
};

SnakeGame.initElements = function() {
	this.grid = this.initGrid();
	this.width = this.grid.width;
	this.height = this.grid.height;
	this.walls = this.initWalls();
	this.wallTiles = this.walls.tilesOccupied();
	this.floor = this.initFloor();
	this.topBackgroundArea = this.initTopBackgroundArea();
	this.scoreText = this.initScoreText();
	this.snake = this.initSnake();
	this.food = this.initFood();
	this.titleText = this.initTitleText();
	this.subtitleText = this.initSubtitleText();
	this.miniTitleText = this.initMiniTitleText();
	this.gameOverText = this.initGameOverText();
	this.gameOverSubtitleText = this.initGameOverSubtitleText();
	this.titleState = SnakeTitleState.createInstance({grid:this.grid, parent:this});
	this.playState = SnakePlayState.createInstance({grid:this.grid, parent:this});
	this.gameOverState = SnakeGameOverState.createInstance({grid:this.grid, parent:this});
};

SnakeGame.showTitleScreen = function() {
	this.titleState.recalculateElements();
	this.state = this.titleState;
};

SnakeGame.newGame = function() {
	this.playState.newGame();
	this.playState.recalculateElements();
	this.state = this.playState;
};

SnakeGame.showGameOverScreen = function() {
	this.gameOverState.recalculateElements();
	this.state = this.gameOverState;
};

SnakeGame.initGrid = function() {
	var grid = Grid.createInstance({
   	width:575, height:598, rows:26, columns:25
 	});
 	return grid;
};

SnakeGame.initWalls = function() {
	var topWall = GridRectangle.createInstance({
      grid:this.grid, colour:"black",
      rowIndex:1, columnIndex:0,
      rowTiles:1, columnTiles:25
    });
    var bottomWall = GridRectangle.createInstance({
      grid:this.grid, colour:"black",
      rowIndex:25, columnIndex:0,
      rowTiles:1, columnTiles:25
    });
    var leftWall = GridRectangle.createInstance({
      grid:this.grid, colour:"black",
      rowIndex:1, columnIndex:0,
      rowTiles:25, columnTiles:1
    });
    var rightWall = GridRectangle.createInstance({
      grid:this.grid, colour:"black",
      rowIndex:1, columnIndex:24,
      rowTiles:25, columnTiles:1
    });
    var walls = GridElementCollection.createInstance({
      grid:this.grid, gridElements:[topWall, bottomWall, leftWall, rightWall]
    });
    return walls;
};

SnakeGame.initFloor = function() {
	var floor = GridRectangle.createInstance({
		grid:this.grid, colour:"white",
	   rowIndex:2, columnIndex:1,
	   rowTiles:23, columnTiles:23
	});
   return floor;
};

SnakeGame.initTopBackgroundArea = function() {
	var topBackground = GridRectangle.createInstance({
      grid:this.grid, colour:"lightgray",
      rowIndex:0, columnIndex:0,
      rowTiles:1, columnTiles:25
    });
    return topBackground;
};

SnakeGame.initScoreText = function() {
	var scoreText = ScoreText.createInstance({
      grid:this.grid, colour:"black", 
      font:"18px Helvetica", verticalAlign:GridText.MIDDLE,
      rowIndex:0, columnIndex:20,
      rowTiles:1, columnTiles:4
    });
    return scoreText;
};

SnakeGame.initSnake = function() {
	var snake = Snake.createInstance({
		grid:this.grid, gridElements:[],
		direction:SnakeDirection.LEFT
	});

	var rowIndex = Math.trunc(this.floor.rowIndex + this.floor.rowTiles / 2);
	var columnIndex = this.floor.columnIndex + this.floor.columnTiles - 1;
	var numberOfTiles = 5;
	for (var i = 0; i < numberOfTiles; i++) {
		snake.eat(rowIndex, columnIndex - i);
	};

   return snake;
};

SnakeGame.initFood = function() {
	var snakeTiles = this.snake.tilesOccupied();

	var rowIndex = Math.trunc(Math.random() * (this.floor.rowTiles)) + this.floor.rowIndex;
	var columnIndex = Math.trunc(Math.random() * (this.floor.columnTiles)) + this.floor.columnIndex;
	var tileHash = GridElement.tileOccupiedHash(rowIndex, columnIndex);
	while (snakeTiles.has(tileHash)) {
		rowIndex = Math.trunc(Math.random() * this.floor.rowTiles) + this.floor.rowIndex;
		columnIndex = Math.trunc(Math.random() * this.floor.columnTiles) + this.floor.columnIndex;
		tileHash = GridElement.tileOccupiedHash(rowIndex, columnIndex);
	};
	
	var food = GridRectangle.createInstance({
		colour:"blue", grid:this.grid,
		rowIndex:rowIndex, columnIndex:columnIndex,
      rowTiles:1, columnTiles:1
	});
	return food;
};

SnakeGame.initTitleText = function() {
	var titleText = GridText.createInstance({
      grid:this.grid, colour:"black",
      font:"100px bold Helvetica", text:"SNAKE",
      horizontalAlign:GridText.CENTRE, verticalAlign:GridText.MIDDLE,
      rowIndex:8, columnIndex:6,
      rowTiles:4, columnTiles:12
    });
    return titleText;
};

SnakeGame.initSubtitleText = function() {
	var titleText = GridText.createInstance({
      grid:this.grid, colour:"black",
      font:"40px Arial", text:"Press Spacebar to start.",
      horizontalAlign:GridText.CENTRE, verticalAlign:GridText.MIDDLE,
      rowIndex:12, columnIndex:5,
      rowTiles:3, columnTiles:15
    });
    return titleText;
};

SnakeGame.initMiniTitleText = function() {
	var miniTitleText = GridText.createInstance({
	   grid:this.grid, colour:"black", verticalAlign:GridText.MIDDLE,
	   font:"bold 21px Helvetica", text:"Snake",
	   rowIndex:0, columnIndex:1,
	   rowTiles:1, columnTiles:3
	 });
	 return miniTitleText;
};

SnakeGame.initGameOverText = function() {
	var gameOverText = GridText.createInstance({
	   grid:this.grid, colour:"black", verticalAlign:GridText.MIDDLE,
	   font:"bold 21px Helvetica", text:"Game Over:",
	   rowIndex:0, columnIndex:1,
	   rowTiles:1, columnTiles:6
	 });
	 return gameOverText;
};

SnakeGame.initGameOverSubtitleText = function() {
	var gameOverSubtitleText = GridText.createInstance({
	   grid:this.grid, colour:"black", verticalAlign:GridText.MIDDLE,
	   font:"19px Arial", text:"Press spacebar to play again.",
	   rowIndex:0, columnIndex:7,
	   rowTiles:1, columnTiles:10
	 });
	 return gameOverSubtitleText;
};

var SnakeGameOverState = {
	parent:undefined
};

SnakeGameOverState.createInstance = function(values) {
	var instance = Object.create(GridElement);
	Object.assign(instance, GridElementCollection);
	Object.assign(instance, SnakeGameOverState);
	Object.assign(instance, values);
	return instance;
};

SnakeGameOverState.recalculateElements = function() {
	this.gridElements = [
		this.parent.walls, this.parent.floor, this.parent.topBackgroundArea,
		this.parent.snake, this.parent.food, this.parent.scoreText,
		this.parent.gameOverText, this.parent.gameOverSubtitleText
	];
};

SnakeGameOverState.onKeyDown = function(event) {
	if (event.key == " " || event.key == "Spacebar") {
       this.parent.newGame();
   }
};

var SnakePlayState = {
	parent:undefined, score:0, secondsPerTick:0.1,
	lastTick:new Date(), movementTick:true, gameOver:false
};

SnakePlayState.createInstance = function(values) {
	var instance = Object.create(GridElement);
	Object.assign(instance, GridElementCollection);
	Object.assign(instance, SnakePlayState);
	Object.assign(instance, values);
	return instance;
};

SnakePlayState.newGame = function() {
	this.parent.snake = this.parent.initSnake();
	this.parent.food = this.parent.initFood();
	this.lastTick = new Date();
	this.score = 0;
	this.movementTick = true;
	this.gameOver = false;
};

SnakePlayState.recalculateElements = function() {
	this.gridElements = [
		this.parent.walls, this.parent.floor, this.parent.topBackgroundArea,
		this.parent.snake, this.parent.food, this.parent.scoreText,
		this.parent.miniTitleText
	];
};

SnakePlayState.update = function() {
	if (this.gameOver) {this.parent.showGameOverScreen(); return;}
	var currentTime = new Date();
	if (Math.trunc(currentTime - this.lastTick) / 1000 >= this.secondsPerTick) {
		var tileInFrontOfHead = this.parent.snake.tileInFrontOfHead();
		var rowIndex = tileInFrontOfHead[0];
		var columnIndex = tileInFrontOfHead[1];
		var tileHash = GridElement.tileOccupiedHash(rowIndex, columnIndex);
		var snakeTiles = this.parent.snake.tilesOccupied();
		if (rowIndex == this.parent.food.rowIndex && columnIndex == this.parent.food.columnIndex) {
			this.parent.snake.eat(rowIndex, columnIndex);
			this.parent.food = this.parent.initFood();
			this.recalculateElements();
			this.score += 1;
		} else {
			this.parent.snake.advanceOneTile();
			if (this.parent.wallTiles.has(tileHash) || snakeTiles.has(tileHash)) {
				this.gameOver = true;
			};
		}
		this.lastTick = currentTime;
		this.movementTick = true;
	};
	this.parent.scoreText.score = this.score;
	GridElementCollection.update.call(this);
};

SnakePlayState.onKeyDown = function(event) {
	if (!this.movementTick) {
   	return;
   } else if (event.key == "ArrowLeft" && this.parent.snake.direction != SnakeDirection.RIGHT) {
       this.parent.snake.direction = SnakeDirection.LEFT;
       this.movementTick = false;
   }
   else if (event.key == "ArrowUp" && this.parent.snake.direction != SnakeDirection.DOWN) {
       this.parent.snake.direction = SnakeDirection.UP;
       this.movementTick = false;
   }
   else if (event.key == "ArrowRight" && this.parent.snake.direction != SnakeDirection.LEFT) {
       this.parent.snake.direction = SnakeDirection.RIGHT;
       this.movementTick = false;
   }
   else if (event.key == "ArrowDown" && this.parent.snake.direction != SnakeDirection.UP) {
       this.parent.snake.direction = SnakeDirection.DOWN;
       this.movementTick = false;
   };
};

var SnakeTitleState = {
	parent:undefined
};

SnakeTitleState.createInstance = function(values) {
	var instance = Object.create(GridElement);
	Object.assign(instance, GridElementCollection);
	Object.assign(instance, SnakeTitleState);
	Object.assign(instance, values);
	return instance;
};

SnakeTitleState.recalculateElements = function() {
	this.gridElements = [
		this.parent.walls, this.parent.floor, this.parent.topBackgroundArea,
		this.parent.titleText, this.parent.subtitleText
	];
};

SnakeTitleState.onKeyDown = function(event) {
	if (event.key == " " || event.key == "Spacebar") {
       this.parent.newGame();
   }
};

function main() {
  var canvas = document.getElementById("rdouglascanada-SnakeGameCanvas");
  var game = SnakeGame.createInstance({canvas:canvas});
  
  function mainLoop() {
	game.update();
	game.draw();
	window.setTimeout(mainLoop, game.timeout);
  }
  
  game.initElements();
  game.showTitleScreen();
  window.onkeydown = function (event) {
	game.onKeyDown(event);
  };
  window.setTimeout(mainLoop, game.timeout);
}
document.addEventListener("DOMContentLoaded", main);