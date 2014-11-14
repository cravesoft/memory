(function() {
    'use strict';

    var TILE_SIZE = 90 // Size of tile height & width in pixels
      , GAP_SIZE = 10 // Size of gap between tiles in pixels
      , HALF_GAP_SIZE = GAP_SIZE * 0.5
      , TILE_GAP_SIZE = TILE_SIZE + GAP_SIZE
      , ICON_SIZE = 70
      , MARKER_SIZE = 4
      , BUTTON_SIZE = 70
      , BUTTON_MARGIN = 10
      , TILE_COLOR = 0xffffff // White
      , HIGHLIGHT_COLOR = 0x00ff00 // Green
      , RED         = '#ff0000'
      , GREEN       = '#00ff00'
      , BLUE        = '#0086ff'
      , YELLOW      = '#ffff00'
      , ORANGE      = '#ff8000'
      , MAGENTA     = '#ff00ff'
      , CYAN        = '#00ffff'
      , ANCHOR      = '\uf13d'
      , BELL        = '\uf0f3'
      , BICYCLE     = '\uf206'
      , BINOCULARS  = '\uf1e5'
      , BOLT        = '\uf0e7'
      , BOMB        = '\uf1e2'
      , BUS         = '\uf207'
      , CAMERA      = '\uf030'
      , CAR         = '\uf1b9'
      , CHILD       = '\uf1ae'
      , CLOSE       = '\uf00d'
      , COFFEE      = '\uf0f4'
      , CUTLERY     = '\uf0f5'
      , ENVELOPE    = '\uf0e0'
      , EYE         = '\uf06e'
      , FLAG        = '\uf024'
      , FLASK       = '\uf0c3'
      , FROWN       = '\uf119'
      , GLASS       = '\uf000'
      , HOME        = '\uf015'
      , KEY         = '\uf084'
      , LEAF        = '\uf06c'
      , MAGNET      = '\uf076'
      , PAPER_PLANE = '\uf1d8'
      , HEART       = '\uf004'
      , MEH         = '\uf11a'
      , MUSIC       = '\uf001'
      , PAINT_BRUSH = '\uf1fc'
      , PAW         = '\uf1b0'
      , PLANE       = '\uf072'
      , PLUG        = '\uf1e6'
      , PLUS        = '\uf067'
      , REPEAT      = '\uf01e'
      , ROCKET      = '\uf135'
      , STAR        = '\uf005'
      , TROPHY      = '\uf091'
      , TRUCK       = '\uf0d1'
      , SMILE       = '\uf118'
      , UMBRELLA    = '\uf0e9'
      , WRENCH      = '\uf0ad'
      , ALL_COLORS = [RED, GREEN, BLUE, YELLOW, ORANGE, MAGENTA, CYAN]
      , ALL_SHAPES = [ANCHOR, BELL, BICYCLE, BINOCULARS, BOLT, BOMB, BUS,
                      CAMERA, CAR, CHILD, CLOSE, COFFEE, ENVELOPE, EYE, FLAG,
                      FLASK, FROWN, GLASS, HEART, HOME, KEY, LEAF, CUTLERY,
                      MAGNET, MEH, MUSIC, PAPER_PLANE, PAINT_BRUSH, PAW, PLANE,
                      PLUG, PLUS, ROCKET, TROPHY, SMILE, STAR, TRUCK, UMBRELLA,
                      WRENCH];

    function Game() {
    }

    Game.prototype = {

        create: function () {
            this.xmargin = parseInt((this.world.width - (this.game.boardWidth *
                                    TILE_GAP_SIZE)) * 0.5);
            this.ymargin = parseInt((this.world.height -
                                     (this.game.boardHeight * TILE_GAP_SIZE)) *
                                    0.5);
            this.borderLeft = this.xmargin + HALF_GAP_SIZE;
            this.borderRight = this.world.width - this.xmargin - HALF_GAP_SIZE;
            this.borderTop = this.ymargin + HALF_GAP_SIZE;
            this.borderBottom = this.world.height - this.ymargin - HALF_GAP_SIZE;
            this.background = this.add.tileSprite(0, 0, this.world.width,
                                                  this.world.height,
                                                  'background');
            this.selectedTiles = []; // Stores the (x, y) of the tiles clicked
            this.createBoard();
            this.createMenu();
            this.marker = this.add.graphics();
            this.marker.lineStyle(MARKER_SIZE, HIGHLIGHT_COLOR, 1);
            this.marker.drawRect(-MARKER_SIZE * 0.5, -MARKER_SIZE * 0.5,
                                 TILE_SIZE + MARKER_SIZE,
                                 TILE_SIZE + MARKER_SIZE);

            this.score = 0;
            var text = 'Tries\n\n' + this.score;
            this.textStyle = { font: '30px Arial', fill: '#ffffff',
                               align: 'center' };
            this.scoreText = this.add.text(15, this.world.height - 60, text,
                                           this.textStyle);
            this.scoreText.anchor.set(0, 0.5);
            if(!!localStorage) {
                this.memoryBestScoreText = 'memory.bestScore' +
                                           this.game.boardWidth + 'x' +
                                           this.game.boardHeight;
                this.bestScore = localStorage.getItem(this.memoryBestScoreText);
                if(this.bestScore !== null) {
                    text = 'Best\n\n' + this.bestScore;
                } else {
                    text = 'Best\n\n?';
                }
                this.bestText = this.add.text(this.world.width - 15,
                                              this.world.height - 60, text,
                                              this.textStyle);
                this.bestText.anchor.set(1.0, 0.5);
            }

            this.input.onDown.add(this.processClick, this);
        },

        createMenu: function () {
            var x = this.world.width - BUTTON_SIZE - 15
              , y = 10;

            this.buttons = [];
            this.buttonIcons = this.add.group();

            this.buttonIcons.add(this.drawButton({shape: HOME,
                                                  color: 'gray'}, x, y));
            this.buttons.push(new Phaser.Rectangle(x, y, BUTTON_SIZE,
                                                         BUTTON_SIZE));

            y = BUTTON_SIZE + 15 + 10;
            this.buttonIcons.add(this.drawButton({shape: REPEAT, color: 'gray'},
                                                 x, y));
            this.buttons.push(new Phaser.Rectangle(x, y, BUTTON_SIZE,
                                                         BUTTON_SIZE));
        },

        drawButton: function(icon, x, y) {
            var half = parseInt(BUTTON_SIZE * 0.5)
              , text = icon.shape
              , style = { font: (BUTTON_SIZE - BUTTON_MARGIN) + 'px FontAwesome',
                          fill: icon.color, stroke: '#00ff00', align: 'center'}
              , t = this.add.text(x + half, y + half + 5, text, style);
            t.anchor.set(0.5);
            return t;
        },

        getButtonAtPixel: function(x, y) {
            for(var i = 0; i < this.buttons.length; i++) {
                if(this.buttons[i].contains(x, y)) {
                    return i;
                }
            }
            return null;
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
            this.score = 0;
            this.scoreText.setText('Tries\n\n' + this.score);
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
            var numIconsUsed = parseInt(this.game.boardWidth *
                                        this.game.boardHeight * 0.5);

            // Make two of each
            icons = icons.slice(0, numIconsUsed);
            icons = icons.concat(icons);
            this.shuffle(icons);

            // Create the board data structure, with randomly placed icons
            var board = [];
            for(var x = 0; x < this.game.boardWidth; x++) {
                var column = [];
                for(var y = 0; y < this.game.boardHeight; y++) {
                    column.push(icons[0]);
                    icons.splice(0, 1);
                }
                board.push(column);
            }

            return board;
        },

        shuffle: function(array) {
            var currentIndex = array.length, temporaryValue, randomIndex;

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
            for(var x = 0; x < this.game.boardWidth; x++) {
                var column = this.add.group();
                for(var y = 0; y < this.game.boardHeight; y++) {
                    var leftTop = this.leftTopCoordsOfTile({x: x, y: y})
                      , icon = this.getShapeAndColor(board, {x: x, y: y});
                    column.add(this.drawIcon(icon, leftTop.x, leftTop.y));
                }
                this.icons.add(column);
            }
        },

        drawTiles: function() {
            // Draw all the tiles
            this.tiles = this.add.group();
            for(var x = 0; x < this.game.boardWidth; x++) {
                var column = this.add.group();
                for(var y = 0; y < this.game.boardHeight; y++) {
                    var leftTop = this.leftTopCoordsOfTile({x: x, y: y})
                      , tile = this.add.graphics();
                    tile.beginFill(TILE_COLOR);
                    tile.lineStyle(0, TILE_COLOR, 1);
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
            if(tile !== null &&
               this.tiles.getAt(tile.x).getAt(tile.y).visible) {
                var leftTop = this.leftTopCoordsOfTile(tile);
                this.marker.x = leftTop.x;
                this.marker.y = leftTop.y;
                this.marker.visible = true;
            }
            else {
                this.marker.visible = false;

                // Check if a mouse is over menu button
                var button = this.getButtonAtPixel(
                    this.input.activePointer.worldX,
                    this.input.activePointer.worldY);
                if(button !== null) {
                    //this.buttonIcons.getAt(button).strokeThickness = 2;
                    this.buttonIcons.getAt(button).fill = 'white';
                } else {
                    //this.buttonIcons.setAllChildren('strokeThickness', 0);
                    this.buttonIcons.setAllChildren('fill', 'gray');
                }
            }
        },

        processClick: function () {
            var tile = this.getTileAtPixel(this.input.activePointer.worldX,
                                           this.input.activePointer.worldY);
            // Check if the tile is not already flipped
            if(tile !== null &&
               this.tiles.getAt(tile.x).getAt(tile.y).visible) {
                // Set the tile as "revealed"
                this.tiles.getAt(tile.x).getAt(tile.y).visible = false;
                this.selectedTiles.push(tile);
                if(this.selectedTiles.length > 1) {
                    // The current tile was the second tile clicked
                    // Update score
                    this.score++;
                    this.scoreText.setText('Tries\n\n' + this.score);
                    // Check if there is a match between the two icons
                    var icon1 = this.getShapeAndColor(this.mainBoard, this.selectedTiles[0])
                      , icon2 = this.getShapeAndColor(this.mainBoard, tile);
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
                            // Update best score ?
                            if(!!localStorage) {
                                this.bestScore = localStorage.getItem(this.memoryBestScoreText);
                                console.log(this.bestScore);
                                if(this.bestScore === null || this.bestScore > this.score) {
                                    this.bestScore = this.score;
                                    localStorage.setItem(this.memoryBestScoreText,
                                                         this.bestScore);
                                    var text = 'Best\n\n' + this.bestScore;
                                    console.log(this.bestText);
                                    if(this.bestText === undefined) {
                                        this.bestText = this.add.text(
                                            this.world.width - 15,
                                            this.world.height - 50,
                                            text, this.textStyle);
                                        this.bestText.anchor.set(1.0, 0.5);
                                    } else {
                                        this.bestText.setText(text);
                                    }
                                }
                            }
                        }
                        this.selectedTiles = []; // Reset variable
                    }
                }
            } else {
                // Check if a menu button is clicked
                var button = this.getButtonAtPixel(this.input.activePointer.worldX,
                                                   this.input.activePointer.worldY);
                if(button !== null) {
                    if(button === 0) {
                        this.game.state.start('menu');
                    } else {
                        this.resetBoard();
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
            for(var x = 0; x < this.game.boardWidth; x++) {
                for(var y = 0; y < this.game.boardHeight; y++) {
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
            var half = parseInt(TILE_SIZE * 0.5)
              , text = icon.shape
              , style = { font: ICON_SIZE + 'px FontAwesome',
                          fill: icon.color, align: 'center'}
              , t = this.add.text(x + half, y + half + 5, text, style);
            t.anchor.set(0.5);
            return t;
        }

    };

    window['memory'] = window['memory'] || {};
    window['memory'].Game = Game;

}());
