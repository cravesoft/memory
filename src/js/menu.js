(function() {
    'use strict';

    var TILE_SIZE = 20 // Size of tile height & width in pixels
      , GAP_SIZE = 4 // Size of gap between tiles in pixels
      , HALF_GAP_SIZE = GAP_SIZE * 0.5
      , TILE_GAP_SIZE = TILE_SIZE + GAP_SIZE
      , TILE_COLOR = 0xffffff // White
      , HIGHLIGHT_COLOR = 0x00ff00 // Green
      , ICON_SIZE = 100
      , ICON_MARGIN = 10
      , ICON_SHAPE = '\uf128' // Question
      , TITLE_Y = 170
      , INSTRUCTIONS_Y = 280
      , SMALL_BOARD_SIZE = 4
      , MEDIUM_BOARD_SIZE = 6
      , LARGE_BOARD_WIDTH = 10
      , LARGE_BOARD_HEIGHT = 7
      , MARKER_SIZE = 4;

    function Menu() {
    }

    Menu.prototype = {

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
            var size = this.world.width * 0.25;

            this.game.boards = [];
            this.drawAndPositionBoard(SMALL_BOARD_SIZE, SMALL_BOARD_SIZE, 0);
            this.drawAndPositionBoard(MEDIUM_BOARD_SIZE, MEDIUM_BOARD_SIZE, size * 1);
            this.drawAndPositionBoard(LARGE_BOARD_WIDTH, LARGE_BOARD_HEIGHT, size * 2);
            this.drawAndPositionIcon(ICON_SIZE, size * 3);

            this.marker = this.add.graphics();

            this.input.onDown.add(this.onDown, this);
        },

        drawBoard: function(width, height) {
            var tile = this.add.graphics();
            for(var x = 0; x < width; x++) {
                for(var y = 0; y < height; y++) {
                    var leftTop = this.leftTopCoordsOfTile({x: x, y: y});
                    tile.beginFill(TILE_COLOR);
                    tile.lineStyle(0, TILE_COLOR, 1);
                    tile.drawRect(leftTop.x, leftTop.y, TILE_SIZE, TILE_SIZE);
                    tile.endFill();
                }
            }
            return tile;
        },

        drawAndPositionBoard: function(width, height, x) {
            var sizex = width * TILE_GAP_SIZE
              , sizey = height * TILE_GAP_SIZE
              , xmargin = x + parseInt((this.world.width * 0.25 - sizex) * 0.5)
              , board3 = this.drawBoard(width, height);
            board3.x = xmargin;
            board3.y = this.ymargin;
            this.game.boards.push(new Phaser.Rectangle(xmargin, this.ymargin, sizex, sizey));
            if(!!localStorage) {
                var bestScore = localStorage.getItem('memory.bestScore' + width + 'x' + width);
                if(bestScore) {
                    var text = 'Best\n\n' + bestScore
                      , t = this.add.text(xmargin + sizex * 0.5,
                            this.ymargin + sizey + 30, text,
                            { font: '30px Arial', fill: '#ffffff',
                              align: 'center' });
                    t.anchor.set(0.5, 0);
                }
            }
        },

        drawIcon: function(icon, x, y) {
            var half = parseInt(ICON_SIZE * 0.5)
              , text = icon.shape
              , style = { font: (ICON_SIZE - ICON_MARGIN) + 'px FontAwesome',
                          fill: icon.color, align: 'center'}
              , t = this.add.text(x + half, y + half + 5, text, style);
            t.anchor.set(0.5);
            return t;
        },

        drawAndPositionIcon: function(width, x) {
            var size = width
              , xmargin = x + parseInt((this.world.width * 0.25 - size) * 0.5);
            this.drawIcon({shape: ICON_SHAPE, color: '#ffffff'}, xmargin, this.ymargin);
            this.game.boards.push(new Phaser.Rectangle(xmargin, this.ymargin, size, size));
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
                this.marker.drawRect(-MARKER_SIZE * 0.5, -MARKER_SIZE * 0.5,
                                     board.width + MARKER_SIZE,
                                     board.height + MARKER_SIZE);
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
                this.game.state.start('game');
            }
        }
    };

    window['memory'] = window['memory'] || {};
    window['memory'].Menu = Menu;

}());
