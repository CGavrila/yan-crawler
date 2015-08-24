'use strict';

import * as _ from 'lodash';
import * as request from 'request';
import * as cheerio from 'cheerio';

var debug = require('debug')('Crawler');
var EventEmitter = require('events').EventEmitter;

let _singleton = Symbol();

/**
 *
 * Singleton class used to scrape websites based on templates and a queue.
 *  - the queue contains the URLs which will be retrieved and then processed as defined by its matching template

 *
 */
class Crawler extends EventEmitter {

    constructor(singletonToken) {
        super();
        if (_singleton !== singletonToken)
            throw new Error('Crawler is a singleton class, cannot instantiate directly.');

        this.entries = {};

        /* Default interval to wait between requests for the same entry (milliseconds) */
        this.DEFAULT_INTERVAL = 1000;
    }

    static get instance() {
        if(!this[_singleton])
            this[_singleton] = new Crawler(_singleton);

        return this[_singleton]
    }

    /**
     * Used to destroy the current instance of the class (it's a Singleton).
     * Particularly useful for testing.
     */
    static destroyInstance() {
        this[_singleton] = null;
    }

    /**
     * Adds a template to the scraper.
     *
     * @param {object} template - The properties of the template, including name, matchesFormat, interval and callback.
     */
    addEntry(entry) {
        if (!entry.name) throw new Error('Entry name is missing.');
        if (!entry.url) throw new Error('Entry url is missing.');
        if (!entry.callback) throw new Error('Entry callback is missing.');

        if (!('interval' in entry)) entry.interval = this.DEFAULT_INTERVAL;

        this.entries[entry.name] = entry;
    }

    /**
     * Retrieves the current templates used by the scraper.
     *
     * @returns {{}|*} - An array of objects.
     */
    getEntries() {
        return this.entries;
    }

    /**
     * Starts the whole process of looping through the queue.
     */
    start() {
        var that = this;
        _.forEach(this.entries, function(entry) {
            function makeRequest() {
                debug('Making request for ' + entry.url);
                that._makeRequest(entry.url, entry.callback);
            }

            setTimeout(makeRequest, 0);
            setInterval(makeRequest, entry.interval);
        })
    }

    /**
     * Makes a request to a specific URL and then applies the callback specified in its template.
     *
     * @param {String} url - An URL to be requested.
     * @param {Object} template - The corresponding template matching the URL provided.
     * @private
     */
    _makeRequest(url, callback) {
        /* TODO: take care of other responses than 200. */

        let that = this;

        request.get(url, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                debug('Got results for ' + url);
                let result = callback(body, cheerio.load(body));
                that.emit('result', result);
            }
        });
    }
}

export default Crawler;