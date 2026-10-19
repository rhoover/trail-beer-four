var nsg = require('node-sprite-generator');

nsg({
    src: ['src/img/vtbt100/*.png'],
    spritePath: 'src/img/sprites/breweries-list-sprite.png',
    stylesheetPath: 'src/sass/sprites/_breweries-list-sprite.scss',
    layout: 'packed',
    layoutOptions: {
      padding: 5
    },
    stylesheet: 'css',
    stylesheetOptions: {
      prefix: '',
      spritePath: '/img/sprites/breweries-list-sprite.png'
    },
    compositor: "jimp"
});
