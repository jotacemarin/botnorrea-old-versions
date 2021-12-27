'use strict';

const MODULE_ID = 'discord:index';
const Discord = require('discord.js');

const constants = require('./constants');
const config = require('../config');
const utils = require('../utils');
const logger = utils.logger(MODULE_ID);
const controllers = require('../controllers');

const discordClient = new Discord.Client();

discordClient.once('ready', () => {
    logger.info(`logged in as ${discordClient.user.tag}!`);
});

discordClient.once('reconnecting', () => {
    logger.info(`botnorrea is reconnecting`);
});

discordClient.once('disconnect', () => {
    logger.info(`botnorrea is disconnected`);
});
  
discordClient.on('message', async msg => {
    if (msg.author.bot) {
        return logger.info('bot message');
    }
    [].length
    const { command } = utils.getCommand(msg.content);
    switch (command) {
        case constants.PING:
            return await controllers.ping(msg);
        case constants.SALUDO:
            return await controllers.olongolongo(msg);
        case constants.JOIN:
            return await controllers.join(msg);
        case constants.LEAVE:
            return await controllers.leave(msg);
        case constants.ROLL:
            return await controllers.randomList(msg);
        case constants.PARTICIPATE:
            return await controllers.throwDice(msg);
        case constants.PLAY:
            return await controllers.play(msg);
        case constants.NEXT:
            return await controllers.next(msg);
        case constants.STOP:
            return await controllers.stop(msg);
        case constants.HELP:
            return await controllers.help(msg);
        default:
            return logger.info(`message without command, command:\n${command}\ncontent:\n${msg.content}`);
    }
});

module.exports = discordClient;
