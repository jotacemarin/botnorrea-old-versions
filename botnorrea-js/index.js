'use strict';

const MODULE_ID = 'server:main';
const config = require('./config');
const logger = require('./utils').logger(MODULE_ID);

logger.info('Initializing server');

const discordClient = require('./discord');

discordClient.login(config.DISCORD_TOKEN);

module.exports = discordClient;
