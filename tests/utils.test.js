'use strict';

const {avatar} = require('../utils');
const validator = require('validator');

describe('Utils Tests', () => {
    it('should return a valid URL', () => {
        
        const str = avatar('gabriele.romanato@gmail.com');

        expect(validator.isURL(str)).toBe(true);
    });
});