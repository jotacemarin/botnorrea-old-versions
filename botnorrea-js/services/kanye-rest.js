'use strict';

const axios = require('axios').default;

async function kanyequote () {
    let result = '';
    await axios.get('https://api.kanye.rest').then(response => {
        result = response.data.quote;
    }).catch(error => {
        result = 'something going wrong';
    });
    return result;
}

module.exports = {
    kanyequote
}