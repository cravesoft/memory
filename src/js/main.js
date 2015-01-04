'use strict';

var i18n = require('i18next-client');

i18n.init({
    //lng: 'en-US',
    ns: { namespaces: ['ns.common', 'ns.special'], defaultNs: 'ns.special'},
    load: 'current',
    getAsync: false,
    useLocalStorage: false,
    useCookie: false,
    fallbackLng: false,
    debug: true
});

var game = new Phaser.Game(1280, 720, Phaser.AUTO, 'memory-game');
game.state.add('Boot',  require('./boot'));
game.state.add('Preloader', require('./preloader'));
game.state.add('Menu', require('./menu'));
game.state.add('Game', require('./game'));

game.state.start('Boot');
