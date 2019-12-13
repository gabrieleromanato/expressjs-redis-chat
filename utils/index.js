'use strict';

const crypto = require('crypto');

module.exports = {
    avatar(email) {
        const hash = crypto.createHash('md5').update(email).digest('hex');
        return `https://www.gravatar.com/avatar/${hash}.jpg`;
    }
};