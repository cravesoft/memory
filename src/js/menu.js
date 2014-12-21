var Menu = function () {};

module.exports = Menu;

var TILE_SIZE = 20 // Size of tile height & width in pixels
  , TILE_RADIUS = 3
  , GAP_SIZE = 4 // Size of gap between tiles in pixels
  , HALF_GAP_SIZE = GAP_SIZE * 0.5
  , TILE_GAP_SIZE = TILE_SIZE + GAP_SIZE
  , TILE_COLOR = 0xffffff // White
  , HIGHLIGHT_COLOR = 0x00ff00 // Green
  , TITLE_Y = 170
  , INSTRUCTIONS_Y = 280
  , SMALL_BOARD_SIZE = 4
  , MEDIUM_BOARD_SIZE = 6
  , LARGE_BOARD_WIDTH = 10
  , LARGE_BOARD_HEIGHT = 7
  , MARKER_SIZE = 4
  , Utils = require('./utils');

Menu.prototype = {

    init: function () {
        this.randomBoard = null;
    },

    create: function () {
        this.background = this.add.tileSprite(0, 0, this.world.width,
                                              this.world.height,
                                              'background');
        var text = 'Memory'
          , style = { font: '50px Arial', fill: '#ffffff', align: 'center' }
          , t = this.add.text(this.world.centerX, TITLE_Y, text, style);
        t.anchor.set(0.5);

        text = 'Choose a board to start';
        style = { font: '40px Arial', fill: '#ffffff', align: 'center' };
        t = this.add.text(this.world.centerX, INSTRUCTIONS_Y, text, style);
        t.anchor.set(0.5);

        this.ymargin = this.world.height * 0.5;
        var size = (this.world.width - (SMALL_BOARD_SIZE + MEDIUM_BOARD_SIZE + LARGE_BOARD_WIDTH * 2) * TILE_GAP_SIZE) / 5;

        this.game.boards = [];
        this.drawAndPositionBoard(SMALL_BOARD_SIZE, SMALL_BOARD_SIZE, size);
        this.drawAndPositionBoard(MEDIUM_BOARD_SIZE, MEDIUM_BOARD_SIZE, size * 2 + SMALL_BOARD_SIZE * TILE_GAP_SIZE);
        this.drawAndPositionBoard(LARGE_BOARD_WIDTH, LARGE_BOARD_HEIGHT, size * 3 + (SMALL_BOARD_SIZE + MEDIUM_BOARD_SIZE) * TILE_GAP_SIZE);
        this.drawAndPositionRandomBoard(size * 4 + (SMALL_BOARD_SIZE + MEDIUM_BOARD_SIZE + LARGE_BOARD_WIDTH) * TILE_GAP_SIZE);
        this.time.events.loop(Phaser.Timer.SECOND * 0.5,
                              this.drawAndPositionRandomBoard, this, size * 4 + (SMALL_BOARD_SIZE + MEDIUM_BOARD_SIZE + LARGE_BOARD_WIDTH) * TILE_GAP_SIZE);
        t = this.add.text(size * 4 + (SMALL_BOARD_SIZE + MEDIUM_BOARD_SIZE + LARGE_BOARD_WIDTH * 1.5) * TILE_GAP_SIZE, this.ymargin +
                          (LARGE_BOARD_HEIGHT * TILE_GAP_SIZE) + 30,
                          'Random', { font: '30px Arial', fill: '#ffffff',
                                      align: 'center' });
        t.anchor.set(0.5, 0);

        this.marker = this.add.graphics();

        this.input.onDown.add(this.onDown, this);
    },

    drawBoard: function(x, y, width, height) {
        var board = this.add.graphics();
        for(var i = 0; i < width; i++) {
            for(var j = 0; j < height; j++) {
                var leftTop = this.leftTopCoordsOfTile({x: i, y: j});
                board.beginFill(TILE_COLOR);
                board.lineStyle(0, TILE_COLOR, 1);
                board.drawRoundedRect(leftTop.x, leftTop.y, TILE_SIZE, TILE_SIZE, TILE_RADIUS);
                board.endFill();
            }
        }
        board.x = x;
        board.y = y;
        return board;
    },

    drawAndPositionBoard: function(width, height, x) {
        var sizex = width * TILE_GAP_SIZE
          , sizey = height * TILE_GAP_SIZE
          , xmargin = x/* + parseInt((this.world.width * 0.25 - sizex) * 0.5)*/;
        this.drawBoard(xmargin, this.ymargin + (LARGE_BOARD_HEIGHT * TILE_GAP_SIZE - sizey) * 0.5, width, height);
        this.game.boards.push(new Phaser.Rectangle(xmargin, this.ymargin + (LARGE_BOARD_HEIGHT * TILE_GAP_SIZE - sizey) * 0.5, sizex, sizey));
        this.drawBestScore(xmargin + sizex * 0.5, this.ymargin + LARGE_BOARD_HEIGHT * TILE_GAP_SIZE + 30, width);
    },

    drawBestScore: function(x, y, width) {
        if(!!localStorage) {
            var bestScore = localStorage.getItem('memory.bestScore' + width + 'x' + width);
            if(bestScore) {
                var text = 'Best\n\n' + bestScore
                  , t = this.add.text(x, y, text, { font: '30px Arial',
                                                    fill: '#ffffff',
                                                    align: 'center' });
                t.anchor.set(0.5, 0);
            }
        }
    },

    drawAndPositionRandomBoard: function(x) {
        if(this.randomBoard !== null) {
            this.randomBoard.destroy();
            this.game.boards.pop();
        }
        var board = Utils.getRandomBoard();
        var sizex = board.width * TILE_GAP_SIZE
          , sizey = board.height * TILE_GAP_SIZE
          , xmargin = x;
        this.game.boards.push(new Phaser.Rectangle(xmargin + (LARGE_BOARD_WIDTH * TILE_GAP_SIZE - sizex) * 0.5, this.ymargin + (LARGE_BOARD_HEIGHT * TILE_GAP_SIZE - sizey) * 0.5, sizex, sizey));
        this.randomBoard = this.drawBoard(xmargin + (LARGE_BOARD_WIDTH * TILE_GAP_SIZE - sizex) * 0.5, this.ymargin + (LARGE_BOARD_HEIGHT * TILE_GAP_SIZE - sizey) * 0.5, board.width, board.height);
    },

    leftTopCoordsOfTile: function(tile) {
        // Convert board coordinates to pixel coordinates
        return {
            x: tile.x * TILE_GAP_SIZE + HALF_GAP_SIZE,
            y: tile.y * TILE_GAP_SIZE + HALF_GAP_SIZE
        };
    },

    update: function () {
        var board = this.getBoardAtPixel(this.input.activePointer.worldX,
                                         this.input.activePointer.worldY);
        if(board !== null) {
            this.marker.x = board.x;
            this.marker.y = board.y;
            this.marker.clear();
            this.marker.lineStyle(MARKER_SIZE, HIGHLIGHT_COLOR, 1);
            this.marker.drawRoundedRect(-MARKER_SIZE * 0.5, -MARKER_SIZE * 0.5,
                                 board.width + MARKER_SIZE,
                                 board.height + MARKER_SIZE, TILE_RADIUS);
            this.marker.visible = true;
        }
        else {
            this.marker.visible = false;
        }
    },

    getBoardAtPixel: function(x, y) {
        for(var i = 0; i < this.game.boards.length; i++) {
            if(this.game.boards[i].contains(x, y)) {
                return this.game.boards[i];
            }
        }
        return null;
    },

    getBoardIdxAtPixel: function(x, y) {
        for(var i = 0; i < this.game.boards.length; i++) {
            if(this.game.boards[i].contains(x, y)) {
                return i;
            }
        }
        return null;
    },

    onDown: function () {
        var idx = this.getBoardIdxAtPixel(this.input.activePointer.worldX,
                                          this.input.activePointer.worldY);
        if(idx !== null) {
            if(idx === 0) {
                this.game.randomBoard = false;
                this.game.boardWidth = SMALL_BOARD_SIZE;
                this.game.boardHeight = SMALL_BOARD_SIZE;
            } else if(idx === 1) {
                this.game.randomBoard = false;
                this.game.boardWidth = MEDIUM_BOARD_SIZE;
                this.game.boardHeight = MEDIUM_BOARD_SIZE;
            } else if(idx === 2) {
                this.game.randomBoard = false;
                this.game.boardWidth = LARGE_BOARD_WIDTH;
                this.game.boardHeight = LARGE_BOARD_HEIGHT;
            } else if(idx === 3) {
                this.game.randomBoard = true;
            }
            this.game.state.start('Game');
        }
    }
};
