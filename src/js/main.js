'use strict';

var game = new Phaser.Game(1280, 720, Phaser.AUTO, 'memory-game');
game.state.add('Boot',  require('./boot'));
game.state.add('Preloader', require('./preloader'));
game.state.add('Menu', require('./menu'));
game.state.add('Game', require('./game'));

game.state.start('Boot');
