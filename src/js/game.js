(function() {
    'use strict';

    var TILE_SIZE = 50 // Size of tile height & width in pixels
      , GAP_SIZE = 10 // Size of gap between tiles in pixels
      , HALF_GAP_SIZE = GAP_SIZE / 2
      , TILE_GAP_SIZE = TILE_SIZE + GAP_SIZE
      , MARKER_SIZE = 4
      , BOARD_WIDTH = 6 // Number of columns of icons
      , BOARD_HEIGHT = 5 // Number of rows of icons
      , WHITE    = 0xffffff
      , RED      = 0xff0000
      , GREEN    = 0x00ff00
      , BLUE     = 0x0000ff
      , YELLOW   = 0xffff00
      , ORANGE   = 0xff8000
      , PURPLE   = 0xff00ff
      , CYAN     = 0x00ffff
      , TILE_COLOR = WHITE
      , HIGHLIGHT_COLOR = GREEN
      , DONUT = 'donut'
      , SQUARE = 'square'
      , DIAMOND = 'diamond'
      , CROSS = 'cross'
      , OVAL = 'oval'
      , ALL_COLORS = [RED, GREEN, BLUE, YELLOW, ORANGE, PURPLE, CYAN]
      , ALL_SHAPES = [DONUT, SQUARE, DIAMOND, CROSS, OVAL];

    function Game() {
    }

    Game.prototype = {

        create: function () {
            this.xmargin = parseInt((this.world.width - (BOARD_WIDTH * TILE_GAP_SIZE)) / 2);
            this.ymargin = parseInt((this.world.height - (BOARD_HEIGHT * TILE_GAP_SIZE)) / 2);
            this.borderLeft = this.xmargin + HALF_GAP_SIZE;
            this.borderRight = this.world.width - this.xmargin - HALF_GAP_SIZE;
            this.borderTop = this.ymargin + HALF_GAP_SIZE;
            this.borderBottom = this.world.height - this.ymargin - HALF_GAP_SIZE;
            this.background = this.add.tileSprite(0, 0, this.world.width,
                                                  this.world.height,
                                                  'background');
            this.selectedTiles = []; // Stores the (x, y) of the tiles clicked
            this.createBoard();
            this.marker = this.add.graphics();
            this.marker.lineStyle(MARKER_SIZE, HIGHLIGHT_COLOR, 1);
            this.marker.drawRect(-MARKER_SIZE/2, -MARKER_SIZE/2,
                                 TILE_SIZE+MARKER_SIZE, TILE_SIZE+MARKER_SIZE);
            this.input.onDown.add(this.processClick, this);
        },

        createBoard: function () {
            this.mainBoard = this.getRandomizedBoard();
            this.drawIcons(this.mainBoard);
            this.drawTiles();
        },

        resetBoard: function () {
            this.mainBoard = this.getRandomizedBoard();
            this.icons.destroy();
            this.drawIcons(this.mainBoard);
            this.tiles.setAllChildren('visible', true);
            this.world.bringToTop(this.tiles);
        },

        getRandomizedBoard: function () {
            // Get a list of every possible shape in every possible color
            var icons = [];
            ALL_COLORS.forEach( function(color) {
                ALL_SHAPES.forEach( function(shape) {
                    icons.push({shape: shape, color: color});
                });
            });

            // Randomize the order of the icons list
            this.shuffle(icons);

            // Calculate how many icons are needed
            var numIconsUsed = parseInt(BOARD_WIDTH * BOARD_HEIGHT / 2);

            // Make two of each
            icons = icons.slice(0, numIconsUsed);
            icons = icons.concat(icons);
            this.shuffle(icons);

            // Create the board data structure, with randomly placed icons
            var board = [];
            for(var x = 0; x < BOARD_WIDTH; x++) {
                var column = [];
                for(var y = 0; y < BOARD_HEIGHT; y++) {
                    column.push(icons[0]);
                    icons.splice(0, 1);
                }
                board.push(column);
            }

            return board;
        },

        shuffle: function(array) {
            var currentIndex = array.length, temporaryValue, randomIndex ;

            // While there remain elements to shuffle
            while(0 !== currentIndex) {
                // Pick a remaining element
                randomIndex = Math.floor(Math.random() * currentIndex);
                currentIndex -= 1;

                // And swap it with the current element
                temporaryValue = array[currentIndex];
                array[currentIndex] = array[randomIndex];
                array[randomIndex] = temporaryValue;
            }

            return array;
        },

        drawIcons: function(board) {
            // Draw all the icons
            this.icons = this.add.group();
            for(var x = 0; x < BOARD_WIDTH; x++) {
                var column = this.add.group();
                for(var y = 0; y < BOARD_HEIGHT; y++) {
                    var leftTop = this.leftTopCoordsOfTile({x: x, y: y});
                    var icon = this.getShapeAndColor(board, {x: x, y: y});
                    column.add(this.drawIcon(icon, leftTop.x, leftTop.y));
                }
                this.icons.add(column);
            }
        },

        drawTiles: function() {
            // Draw all the tiles
            this.tiles = this.add.group();
            for(var x = 0; x < BOARD_WIDTH; x++) {
                var column = this.add.group();
                for(var y = 0; y < BOARD_HEIGHT; y++) {
                    var leftTop = this.leftTopCoordsOfTile({x: x, y: y});
                    var tile = this.add.graphics();
                    tile.beginFill(TILE_COLOR);
                    tile.lineStyle(1, TILE_COLOR, 1);
                    tile.drawRect(leftTop.x, leftTop.y, TILE_SIZE, TILE_SIZE);
                    tile.endFill();
                    column.add(tile);
                }
                this.tiles.add(column);
            }
        },

        getShapeAndColor: function(board, tile) {
            return board[tile.x][tile.y];
        },

        getTileAtPixel: function(x, y) {
            // Convert pixel coordinates to board coordinates
            if(x < this.borderLeft || x > this.borderRight ||
               y < this.borderTop || y > this.borderBottom) {
                return null;
            }
            return {
                x: parseInt((x - this.xmargin) / TILE_GAP_SIZE),
                y: parseInt((y - this.ymargin) / TILE_GAP_SIZE)
            };
        },

        leftTopCoordsOfTile: function(tile) {
            // Convert board coordinates to pixel coordinates
            return {
                x: tile.x * TILE_GAP_SIZE + this.xmargin + HALF_GAP_SIZE,
                y: tile.y * TILE_GAP_SIZE + this.ymargin + HALF_GAP_SIZE
            };
        },

        update: function () {
            var tile = this.getTileAtPixel(this.input.activePointer.worldX,
                                           this.input.activePointer.worldY);
            if(tile !== null && this.tiles.getAt(tile.x).getAt(tile.y).visible) {
                var leftTop = this.leftTopCoordsOfTile(tile);
                this.marker.x = leftTop.x;
                this.marker.y = leftTop.y;
                this.marker.visible = true;
            }
            else {
                this.marker.visible = false;
            }
        },

        processClick: function () {
            var tile = this.getTileAtPixel(this.input.activePointer.worldX,
                                           this.input.activePointer.worldY);
            // Check if the tile is not already flipped
            if(tile !== null && this.tiles.getAt(tile.x).getAt(tile.y).visible) {
                // Set the tile as "revealed"
                this.tiles.getAt(tile.x).getAt(tile.y).visible = false;
                this.selectedTiles.push(tile);
                if(this.selectedTiles.length > 1) {
                    // The current tile was the second tile clicked
                    // Check if there is a match between the two icons
                    var icon1 = this.getShapeAndColor(this.mainBoard, this.selectedTiles[0]);
                    var icon2 = this.getShapeAndColor(this.mainBoard, tile);
                    if(icon1.shape !== icon2.shape || icon1.color !== icon2.color) {
                        // Icons don't match. Wait half a second and recover up both selections
                        this.input.onDown.remove(this.processClick, this);
                        this.time.events.add(Phaser.Timer.SECOND * 0.5,
                                             this.resetSelection, this);
                    } else {
                        if(this.hasWon()) { // Check if all pairs found
                            // Show the fully unrevealed board for two seconds
                            this.time.events.add(Phaser.Timer.SECOND * 2.0,
                                                 this.resetBoard, this);
                        }
                        this.selectedTiles = []; // Reset variable
                    }
                }
            }
        },

        resetSelection: function () {
            for(var i = 0; i < this.selectedTiles.length; i++) {
                this.tiles.getAt(this.selectedTiles[i].x)
                          .getAt(this.selectedTiles[i].y).visible = true;
            }
            this.selectedTiles = []; // Reset variable
            this.input.onDown.add(this.processClick, this);
        },

        hasWon: function () {
            // Returns true if all the tiles have been revealed, otherwise false
            for(var x = 0; x < BOARD_WIDTH; x++) {
                for(var y = 0; y < BOARD_HEIGHT; y++) {
                    if(this.tiles.getAt(x).getAt(y).visible) {
                        return false; // Return false if any tiles are covered
                    }
                }
            }
            return true;
        },

        render: function () {
        },

        drawIcon: function(icon, x, y) {
            var quarter = parseInt(TILE_SIZE * 0.25)
              , half = parseInt(TILE_SIZE * 0.5)
              , g = this.add.graphics();

            // Draw the shapes
            if(icon.shape === DONUT) {
                g.lineStyle(5, icon.color, 1);
                g.drawCircle(x + half, y + half, half + 5);
            } else if(icon.shape === SQUARE) {
                g.lineStyle(1, icon.color, 1);
                g.beginFill(icon.color, 1);
                g.drawRect(x + quarter, y + quarter, TILE_SIZE - half, TILE_SIZE - half);
                g.endFill();
            } else if(icon.shape === DIAMOND) {
                g.beginFill(icon.color, 1);
                g.lineStyle(1, icon.color, 1);
                g.drawPolygon([x + half, y + 5, x + TILE_SIZE - 5, y + half, x + half, y + TILE_SIZE - 5, x + 5, y + half]);
                g.endFill();
            } else if(icon.shape === CROSS) {
                g.lineStyle(6, icon.color, 1);
                g.moveTo(x + half, y + 5);
                g.lineTo(x + half, y + TILE_SIZE - 5);
                g.moveTo(x + 5, y + half);
                g.lineTo(x + TILE_SIZE - 5, y + half);
            } else if(icon.shape === OVAL) {
                g.lineStyle(1, icon.color, 1);
                g.beginFill(icon.color, 1);
                g.moveTo(x + 5, y + half);
                g.bezierCurveTo(x + 5, y + 5, x + TILE_SIZE - 5, y + 5, x + TILE_SIZE - 5, y + half);
                g.bezierCurveTo(x + TILE_SIZE - 5, y + TILE_SIZE - 5, x + 5, y + TILE_SIZE - 5, x + 5, y + half);
                //g.drawEllipse(x, y + quarter, TILE_SIZE, half);
                g.endFill();
            }
            return g;
        }

    };

    window['memory'] = window['memory'] || {};
    window['memory'].Game = Game;

}());
