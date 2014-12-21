var MIN_BOARD_WIDTH = 2
  , MAX_BOARD_WIDTH = 10
  , MIN_BOARD_HEIGHT = 2
  , MAX_BOARD_HEIGHT = 7;

var Utils = {

    getRandomBoard: function () {
        var width = Math.floor(Math.random() * (MAX_BOARD_WIDTH + 1 - MIN_BOARD_WIDTH)) + MIN_BOARD_WIDTH;
        var height;
        if(width % 2) {
            height = Math.floor(Math.random() * (Math.floor(MAX_BOARD_HEIGHT * 0.5) + 1 - Math.ceil(MIN_BOARD_WIDTH * 0.5))) + Math.ceil(MIN_BOARD_WIDTH * 0.5);
            height = height * 2;
        } else {
            height = Math.floor(Math.random() * (MAX_BOARD_HEIGHT + 1 - MIN_BOARD_HEIGHT)) + MIN_BOARD_HEIGHT;
        }
        return {
            width: width,
            height: height
        };
    }
};

module.exports = Utils;
