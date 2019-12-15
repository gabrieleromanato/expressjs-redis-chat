'use strict';

const request = require('request');

const httpRequest = ({ url, method }) => {
    return new Promise((resolve, reject) => {
        const params = {
            url: url,
            method: method
        };
        request(params, ( error, response, body ) => {
            if(error) {
                reject(error);
            }
            resolve(response);
        });
    });
};

describe('HTTP Tests', () => {
    it('verifies that the app is online', async () => {
        const response = await httpRequest({ url: 'http://localhost:3000', method: 'GET'});
        expect(response.statusCode).toEqual(200);
    });
});