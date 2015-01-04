'use strict';

var Game = function () {};

module.exports = Game;

var TILE_SIZE = 90 // Size of tile height & width in pixels
  , TILE_RADIUS = 10
  , GAP_SIZE = 10 // Size of gap between tiles in pixels
  , HALF_GAP_SIZE = GAP_SIZE * 0.5
  , TILE_GAP_SIZE = TILE_SIZE + GAP_SIZE
  , ICON_SIZE = 70
  , MARKER_SIZE = 4
  , MARKER_RADIUS = TILE_RADIUS
  , BUTTON_SIZE = 70
  , BUTTON_MARGIN = 10
  , TILE_COLOR = 0xffffff // White
  , HIGHLIGHT_COLOR = 0x00ff00 // Green
  , REVEAL_DELAY = 0.6 // 0.6 second
  , GAMEOVER_DELAY = 2.0 // 2 seconds
  , FADE_IN_DELAY = 300 // 300 milliseconds
  , FADE_OUT_DELAY = 200 // 200 milliseconds
  , MIN_FADE_OUT_DELAY = 500 // 600 milliseconds
  , MAX_FADE_OUT_DELAY = 1000 // 800 milliseconds
  , SHAKE_DELAY = 50 // 50 milliseconds
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
                  WRENCH]
  , Utils = require('./utils');

Game.prototype = {

    create: function () {
        if(this.game.randomBoard) {
            this.game.board = Utils.getRandomBoard();
        }
        this.setMargins();

        this.background = this.add.tileSprite(0, 0, this.world.width,
                                              this.world.height,
                                              'background');
        this.selectedTiles = []; // Stores the (x, y) of the tiles clicked
        this.createBoard();
        this.createMenu();
        this.marker = this.add.graphics();
        this.marker.lineStyle(MARKER_SIZE, HIGHLIGHT_COLOR, 1);
        this.marker.drawRoundedRect(-MARKER_SIZE * 0.25, -MARKER_SIZE * 0.25,
                                    TILE_SIZE + MARKER_SIZE * 0.5,
                                    TILE_SIZE + MARKER_SIZE * 0.5, MARKER_RADIUS);

        this.score = 0;
        var text = 'Tries\n\n' + this.score;
        this.textStyle = { font: '30px Arial', fill: '#ffffff',
                           align: 'center' };
        this.scoreText = this.add.text(15, this.world.height - 60, text,
                                       this.textStyle);
        this.scoreText.anchor.set(0, 0.5);
        if(!!localStorage) {
            this.memoryBestScoreText = 'memory.bestScore' +
                                       this.game.board.width + 'x' +
                                       this.game.board.height;
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

    setMargins: function () {
        this.xmargin = parseInt((this.world.width - (this.game.board.width *
                                TILE_GAP_SIZE)) * 0.5);
        this.ymargin = parseInt((this.world.height -
                                 (this.game.board.height * TILE_GAP_SIZE)) *
                                0.5);
        this.borderLeft = this.xmargin + HALF_GAP_SIZE;
        this.borderRight = this.world.width - this.xmargin - HALF_GAP_SIZE;
        this.borderTop = this.ymargin + HALF_GAP_SIZE;
        this.borderBottom = this.world.height - this.ymargin - HALF_GAP_SIZE;
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

    removeBoard: function () {
        this.selectedTiles = [];
        this.numTiles = 0;
        this.input.onDown.remove(this.processClick, this);
        for(var x = 0; x < this.game.board.width; x++) {
            for(var y = 0; y < this.game.board.height; y++) {
                var tile = this.tiles.getAt(x).getAt(y);
                if(!tile.revealed) {
                    this.numTiles++;
                    var leftTop = this.leftTopCoordsOfTile({x: x, y: y});
                    var delay = Math.floor(Math.random() * (MAX_FADE_OUT_DELAY - MIN_FADE_OUT_DELAY + 1) + MIN_FADE_OUT_DELAY);
                    this.add.tween(tile.scale).to({x: 0, y: 0}, delay,
                                                   Phaser.Easing.Exponential.InOut, true);
                    this.add.tween(tile).to({x: leftTop.x + TILE_SIZE * 0.5,
                                             y: leftTop.y + TILE_SIZE * 0.5},
                                             delay, Phaser.Easing.Exponential.InOut, true)
                        .onComplete.add(function () {
                            if(--this.numTiles === 0) {
                                this.resetBoard();
                            }
                        }, this);
                }
            }
        }
        if(this.numTiles === 0) {
            this.resetBoard();
        }
    },

    resetBoard: function () {
        this.icons.destroy();
        if(this.game.randomBoard) {
            this.game.board = Utils.getRandomBoard();
            this.setMargins();
            this.tiles.destroy();
            this.createBoard();
            if(!!localStorage) {
                this.memoryBestScoreText = 'memory.bestScore' +
                                           this.game.board.width + 'x' +
                                           this.game.board.height;
                this.bestScore = localStorage.getItem(this.memoryBestScoreText);
                var text;
                if(this.bestScore !== null) {
                    text = 'Best\n\n' + this.bestScore;
                } else {
                    text = 'Best\n\n?';
                }
                this.bestText.setText(text);
            }
        } else {
            this.mainBoard = this.getRandomizedBoard();
            this.drawIcons(this.mainBoard);
            this.tiles.setAllChildren('revealed', false);
            this.tiles.setAllChildren('scale.x', 1);
            this.tiles.setAllChildren('scale.y', 1);
            this.tiles.setAllChildren('x', 0);
            this.tiles.setAllChildren('y', 0);
            this.world.bringToTop(this.tiles);
        }
        this.score = 0;
        this.scoreText.setText('Tries\n\n' + this.score);
        this.input.onDown.add(this.processClick, this);
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
        var numIconsUsed = parseInt(this.game.board.width *
                                    this.game.board.height * 0.5);

        // Make two of each
        icons = icons.slice(0, numIconsUsed);
        icons = icons.concat(icons);
        this.shuffle(icons);

        // Create the board data structure, with randomly placed icons
        var board = [];
        for(var x = 0; x < this.game.board.width; x++) {
            var column = [];
            for(var y = 0; y < this.game.board.height; y++) {
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
        for(var x = 0; x < this.game.board.width; x++) {
            var column = this.add.group();
            for(var y = 0; y < this.game.board.height; y++) {
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
        for(var x = 0; x < this.game.board.width; x++) {
            var column = this.add.group();
            for(var y = 0; y < this.game.board.height; y++) {
                var leftTop = this.leftTopCoordsOfTile({x: x, y: y})
                  , tile = this.add.graphics();
                tile.beginFill(TILE_COLOR);
                tile.lineStyle(0, TILE_COLOR, 1);
                tile.drawRoundedRect(leftTop.x, leftTop.y, TILE_SIZE, TILE_SIZE, TILE_RADIUS);
                tile.endFill();
                tile.revealed = false;
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
           !this.tiles.getAt(tile.x).getAt(tile.y).revealed) {
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
                this.buttonIcons.getAt(button).fill = 'white';
            } else {
                this.buttonIcons.setAllChildren('fill', 'gray');
            }
        }
    },

    processClick: function () {
        var tile = this.getTileAtPixel(this.input.activePointer.worldX,
                                       this.input.activePointer.worldY);
        // Check if the tile is not already flipped
        if(tile !== null) {
            if(!this.tiles.getAt(tile.x).getAt(tile.y).revealed) {
                var selectedTile = this.tiles.getAt(tile.x).getAt(tile.y);
                // Set the tile as "revealed"
                selectedTile.revealed = true;
                var leftTop = this.leftTopCoordsOfTile({x: tile.x, y: tile.y});
                this.add.tween(selectedTile.scale).to({x: 0, y: 0}, FADE_OUT_DELAY,
                                                      Phaser.Easing.Linear.Out, true);
                this.add.tween(selectedTile).to({x: leftTop.x + TILE_SIZE * 0.5,
                                                 y: leftTop.y + TILE_SIZE * 0.5},
                                                 FADE_OUT_DELAY, Phaser.Easing.Linear.Out, true);
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
                        // Icons don't match. Wait and hide both icons
                        this.input.onDown.remove(this.processClick, this);
                        this.time.events.add(Phaser.Timer.SECOND * REVEAL_DELAY,
                                             this.hideIcons, this);
                    } else {
                        if(this.hasWon()) { // Check if all pairs found
                            // Show the fully unrevealed board for a few seconds
                            this.time.events.add(Phaser.Timer.SECOND * GAMEOVER_DELAY,
                                                 this.removeBoard, this);
                            // Update best score ?
                            if(!!localStorage) {
                                this.bestScore = localStorage.getItem(this.memoryBestScoreText);
                                if(this.bestScore === null || this.bestScore > this.score) {
                                    this.bestScore = this.score;
                                    localStorage.setItem(this.memoryBestScoreText,
                                                         this.bestScore);
                                    var text = 'Best\n\n' + this.bestScore;
                                    this.bestText.setText(text);
                                }
                            }
                        }
                        this.selectedTiles = []; // Reset variable
                    }
                }
            } else {
                // Tile is already flipped
                // Shake icon
                var icon = this.icons.getAt(tile.x).getAt(tile.y);
                this.input.onDown.remove(this.processClick, this);
                var x = icon.x;
                this.add.tween(icon).to({x: icon.x - 5}, SHAKE_DELAY,
                                        Phaser.Easing.Quadratic.InOut, true)
                    .onComplete.add(function () {
                        this.add.tween(icon).to({x: icon.x + 10}, SHAKE_DELAY,
                                                Phaser.Easing.Quadratic.InOut, true, 0, 1, true)
                            .onComplete.add(function () {
                                this.add.tween(icon).to({x: x}, SHAKE_DELAY,
                                                        Phaser.Easing.Quadratic.InOut, true)
                                    .onComplete.add(function () {
                                        this.input.onDown.add(this.processClick, this);
                                    }, this);
                            }, this);
                    }, this);
            }
        } else {
            // Check if a menu button is clicked
            var button = this.getButtonAtPixel(this.input.activePointer.worldX,
                                               this.input.activePointer.worldY);
            if(button !== null) {
                if(button === 0) {
                    this.game.state.start('Menu');
                } else {
                    this.removeBoard();
                }
            }
        }
    },

    hideIcons: function () {
        for(var i = 0; i < this.selectedTiles.length; i++) {
            var tile = this.tiles.getAt(this.selectedTiles[i].x)
                                 .getAt(this.selectedTiles[i].y);
            tile.revealed = false;
            this.add.tween(tile.scale).to({ x: 1, y: 1}, FADE_IN_DELAY,
                                         Phaser.Easing.Exponential.Out, true);
            this.add.tween(tile).to({ x: 0, y: 0}, FADE_IN_DELAY,
                                    Phaser.Easing.Exponential.Out, true);
        }
        this.selectedTiles = []; // Reset variable
        this.time.events.add(FADE_IN_DELAY, function () {
        this.input.onDown.add(this.processClick, this);}, this);
    },

    hasWon: function () {
        // Returns true if all the tiles have been revealed, otherwise false
        for(var x = 0; x < this.game.board.width; x++) {
            for(var y = 0; y < this.game.board.height; y++) {
                if(!this.tiles.getAt(x).getAt(y).revealed) {
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
