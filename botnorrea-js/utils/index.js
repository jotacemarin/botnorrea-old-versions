'use strict';

const bunyan = require('bunyan');
const emojiUnicode = require("emoji-unicode")
const config = require('../config');

module.exports = {
    logger: (module_id) => {
        return bunyan.createLogger({
            name: module_id,
            level: config.LOG_LEVEL
        })
    },
    getCommand: (message) => {
        const decode = message.split(/\s/g);
        const command = emojiUnicode(decode.shift());
        return {
            command,
            params: decode.join(' ')
        };
    }
};

