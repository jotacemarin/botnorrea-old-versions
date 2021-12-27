'use strict';

const packageJson = require('./package.json');
const API_ROOT = '/api';

module.exports = {
    BOT_NAME: 'Botnorrea',
    BOT_IMAGE: 'https://i.ytimg.com/vi/jxoe0nxfb_s/maxresdefault.jpg',
    BOT_THUMBNAIL: 'https://i.imgur.com/qzDzvAR.jpg',
    LOG_LEVEL: process.env['LOG_LEVEL'] || 'debug',
    PORT: process.env['PORT'] || 3000,
    VERSION: process.env['API_VERSION'] || packageJson.version,
    DISCORD_TOKEN: process.env['DISCORD_API_KEY'],
    RIOT_GAMEs_API: process.env['RIOT_GAMES_API_KEY'],
    basePath: (path) => {
        return API_ROOT.replace(/\/$/, '') + '/' + path.replace(/^\//, '')
    }
};
