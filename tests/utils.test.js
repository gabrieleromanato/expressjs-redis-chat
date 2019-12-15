'use strict';

const {avatar} = require('../utils');
const validator = require('validator');
const timeago = require('timeago.js');

describe('Utils Tests', () => {
    it('should return a valid URL', () => {
        
        const str = avatar('gabriele.romanato@gmail.com');

        expect(validator.isURL(str)).toBe(true);
    });
    it('should return a valid Gravatar URL', () => {
        
        const str = avatar('gabriele.romanato@gmail.com');

        expect(/[a-z0-9]\.jpg$/i.test(str)).toBe(true);
    });

    it('checks if relative timestamps are displayed correctly', () => {
        const now = Date.now();
        const oneMinAgo = now - ( 1000 * 60 );
        const time = new Date(oneMinAgo);
        const str = timeago.format(time);

        expect(str.toLowerCase()).toEqual('1 minute ago');
    });
});