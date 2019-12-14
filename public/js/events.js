'use strict';

class Events {
    constructor(instance) {
        this.instance = instance;
        this.data = [];
    }

    on(evtName, callback) {
        let evt = {
            name: evtName,
            handler: callback
        };

        this.data.push(evt);
    }

    trigger(evtName) {
        for(const evt of this.data) {
            if(evt.name === evtName) {
                evt.handler(this.instance);
            }
        }
    }
}