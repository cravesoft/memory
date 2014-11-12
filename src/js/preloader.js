(function() {
    'use strict';

    function Preloader() {
        this.asset = null;
        this.ready = false;
    }

    Preloader.prototype = {

        preload: function () {
            this.asset = this.add.sprite(this.game.world.centerX, this.game.world.centerY, 'preloader');
            this.asset.anchor.setTo(0.5);

            this.load.onLoadComplete.addOnce(this.onLoadComplete, this);
            this.load.setPreloadSprite(this.asset);
            this.load.image('background', 'assets/congruent_outline.png');
        },

        create: function () {
            this.asset.cropEnabled = false;
        },

        update: function () {
            if(!!this.ready) {
                this.game.state.start('menu');
            }
        },

        onLoadComplete: function () {
            this.ready = true;
        }
    };

    window['memory'] = window['memory'] || {};
    window['memory'].Preloader = Preloader;

}());
