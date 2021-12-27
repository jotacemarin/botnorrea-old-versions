'use strict';

const MODULE_ID = 'discord:index';
const ytdl = require('ytdl-core');
const utils = require('../utils');
const logger = utils.logger(MODULE_ID);
const { RichEmbed } = require('discord.js');
const kanyeService = require('../services/kanye-rest');
const { BOT_NAME, BOT_IMAGE, BOT_THUMBNAIL } = require('../config');
const constants = require('./constants');

const queue = new Map();

/**
 * create a `RichEmbed` message
 * @param {string} title title message
 * @param {string} description body message
 */
function embedConstructor(title, description) {
    return new RichEmbed()
    .setAuthor(BOT_NAME, BOT_THUMBNAIL)
    .setThumbnail(BOT_THUMBNAIL)
    .setTitle(title)
    .setDescription(description)
    .setImage(BOT_IMAGE)
    .setTimestamp(new Date());
}

/**
 * reply to user when no was joined in voice channel
 * @param {Message} msg discord message interface
 */
function nonVoiceChannel (msg) {
    const embed = embedConstructor('No voice channel', 'you need to be in a voice channel');
    return msg.reply(embed);
}

/**
 * reply to user when bot need permissions
 * @param {Message} msg discord message interface
 */
function nonMediaPermissions (msg) {
    const embed = embedConstructor('No media permissions', 'i need permissions or to be in a voice channel to play music');
    return msg.reply(embed);
}

/**
 * reply to user when especific commands need a parameter but got nothing
 * @param {Message} msg discord message interface
 */
function withoutParamerts (msg) {
    const embed = embedConstructor('Without parameters', 'i need parameters to works');
    return msg.reply(embed);
}

/**
 * ask user' permissions in server
 * @param {Message} msg discord message interface
 */
function canAccesstoMedia (msg) {
    const voiceChannel = msg.member.voiceChannel;
    if (!voiceChannel) {
        return false;
    } else { }
    const permissions = voiceChannel.permissionsFor(msg.client.user);
    if (!permissions.has('CONNECT') || !permissions.has('SPEAK')) {
        return false;
    } else { }
    return true;
}

/**
 * play song on voice channel connection
 * @param {Guild} guild `Guild`
 * @param {any} song param for find video on youtube
 */
function playSong(guild, song) {
	const serverQueue = queue.get(guild.id);
	if (!song) {
		serverQueue.voiceChannel.leave();
		queue.delete(guild.id);
		return;
    } else { }
    logger.info(`song: ${JSON.stringify(song)}`);
	const dispatcher = serverQueue.connection.playStream(ytdl(song.url))
		.on('end', () => {
			logger.info('Music ended!');
			serverQueue.songs.shift();
			playSong(guild, serverQueue.songs[0]);
		})
		.on('error', error => {
			logger.error(error);
		});
	dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
}

module.exports = {
    nonVoiceChannel,
    nonMediaPermissions,
    withoutParamerts,
    canAccesstoMedia,
    /**
     * return a kanye west quote
     * @param msg `Message`
     */
    ping: async msg => {
        logger.info('ping');
        const embed = embedConstructor('Api kanye rest', `${await kanyeService.kanyequote()}`);
        return msg.channel.send(embed);
    },
    /**
     * return olongolongo response xD
     * @param msg `Message`
     */
    olongolongo: async msg => {
        logger.info('olongolongo');
        const embed = embedConstructor('A ver', 'Que es la joda par de catrejijueputas!');
        return msg.channel.send(embed);
    },
    /**
     * bot join in channel server
     * @param msg `Message`
     */
    join: async msg => {
        logger.info('join');
        if (!msg.member.voiceChannelID) {
            return nonVoiceChannel(msg);
        } else { }
        return msg.member.voiceChannel.join();
    },
    /**
     * bot leave in channel server
     * @param msg `Message`
     */
    leave: async msg => {
        logger.info('leave');
        if (!msg.member.voiceChannelID) {
            return nonVoiceChannel(msg);
        } else { }
        return msg.member.voiceChannel.leave();
    },
    /**
     * add song in channel discord
     * @param msg `Message`
     */
    play: async (msg) => {
        logger.info('play');
        if (!canAccesstoMedia(msg)) {
            return nonMediaPermissions(msg);
        } else { }
        const params = msg.content.split(' ')[1];
        if (!params || params.length === 0) {
            return withoutParamerts(msg);
        } else { }
        const voiceChannel = msg.member.voiceChannel;
        const songInfo = await ytdl.getInfo(params);
        const song = {
            title: songInfo.title,
            url: songInfo.video_url
        };
        const serverQueue = queue.get(msg.guild.id);
        if (!serverQueue) {
            const queueContruct = {
                textChannel: msg.channel,
                voiceChannel,
                connection: null,
                songs: [],
                volume: 5,
                playing: true,
            };
            queue.set(msg.guild.id, queueContruct);
            queueContruct.songs.push(song);
            try {
                let connection = await voiceChannel.join();
                queueContruct.connection = connection;
                playSong(msg.guild, queueContruct.songs[0]);
                const embed = embedConstructor('Jukebox', `**${song.title}** has been added to the queue!`);
                return msg.channel.send(embed);
            } catch (error) {
                logger.error(error.message);
                queue.delete(msg.guild.id);
                return msg.channel.send(error.message);
            }
        } else {
            serverQueue.songs.push(song);
            logger.info(JSON.stringify(serverQueue.songs));
            const embed = embedConstructor('Jukebox', `**${song.title}** has been added to the queue!`);
            return msg.channel.send(embed);
        }
    },
    /**
     * skip song in channel discord
     * @param msg `Message`
     */
    next: async msg => {
        logger.info('next');
        if (!canAccesstoMedia(msg)) {
            return nonMediaPermissions(msg);
        } else { }
        const serverQueue = queue.get(msg.guild.id);
        serverQueue.connection.dispatcher.end();
    },
    /**
     * backward song in channel discord
     * @param msg `Message`
     */
    back: async () => { },
    /**
     * stop music in channel discord
     * @param msg `Message`
     */
    stop: async msg => {
        logger.info('stop');
        if (!canAccesstoMedia(msg)) {
            return nonMediaPermissions(msg);
        } else { }
        const serverQueue = queue.get(msg.guild.id);
        serverQueue.songs = [];
        serverQueue.connection.dispatcher.end();
    },
    /**
     * generate random string of list based message params
     * @param msg `Message`
     */
    randomList: async msg => {
        const { params } = utils.getCommand(msg.content);
        let array = params.split(/\s/g);
        const quantity = array.shift();
        msg.reply(`${constants.EMOJI_NOTEPAD} ${array.sort((a, b) => Math.random() - Math.random()).slice(0, quantity).join(' ')}`);
    },
    /**
     * throw a dice
     * @param msg `Message`
     */
    throwDice: async msg => {
        msg.reply(`${parseInt((Math.random() * 6) + 1)}`);
    },
    /**
     * help info
     * @param msg `Message`
     */
    help: async msg => {
        const embed = new RichEmbed()
        .setAuthor(BOT_NAME, BOT_THUMBNAIL)
        .setThumbnail(BOT_THUMBNAIL)
        .setTitle('Help')
        .setDescription('Command list of **Botnorrea**')
        .setImage(BOT_IMAGE)
        .addField(constants.EMOJI_ROBOT, constants.BODY_ROBOT)
        .addBlankField()
        .addField(constants.EMOJI_HAND, constants.BODY_HAND)
        .addBlankField()
        .addField(constants.EMOJI_DOOR, constants.BODY_DOOR)
        .addBlankField()
        .addField(constants.EMOJI_PLAY, constants.BODY_PLAY)
        .addBlankField()
        .addField(constants.EMOJI_NEXT, constants.BODY_NEXT)
        .addBlankField()
        .addField(constants.EMOJI_PREVIOUS, constants.BODY_PREVIOUS)
        .addBlankField()
        .addField(constants.EMOJI_STOP, constants.BODY_STOP)
        .addBlankField()
        .addField(constants.EMOJI_DICE, constants.BODY_DICE)
        .addBlankField()
        .addField(constants.EMOJI_SLOT, constants.BODY_SLOT)
        .addBlankField()
        .addField(constants.EMOJI_INFO, constants.BODY_INFO)
        .setTimestamp(new Date());
        msg.reply(embed);
    }
};