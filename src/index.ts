/// <reference path="../typings/index.d.ts" />

'use strict';

import * as _ from 'lodash';
import * as request from 'request';
import * as cheerio from 'cheerio';
import * as debug from 'debug';

import { EventEmitter } from 'events';

var debug_crawler = debug('Crawler');

export interface Entry {
    name: string;
    url: string;
    interval?: number;
    callback: Function;
}

/**
 *
 * Singleton class used to scrape websites based on templates and a queue.
 *  - the queue contains the URLs which will be retrieved and then processed as defined by its matching template

 *
 */
class Crawler extends EventEmitter {
    
    private entries: Entry[];
    
    /* Default interval to wait between requests for the same entry (milliseconds) */
    private DEFAULT_INTERVAL : number = 1000;

    private static _instance : Crawler = new Crawler(); 

    constructor() {
        super();
        if(Crawler._instance){
            throw new Error("Error: Instantiation failed: Use Crawler.getInstance() instead of new.");
        }
        Crawler._instance = this;
    }

    public static getInstance(): Crawler {
        return Crawler._instance;
    }

    /**
     * Used to destroy the current instance of the class (it's a Singleton).
     * Particularly useful for testing.
     */
    public static destroyInstance(): void {
        Crawler._instance = null;
    }

    /**
     * Adds a template to the scraper.
     *
     * @param {Entry} entry - The properties of the template, including name, matchesFormat, interval and callback.
     */
    public addEntry(entry: Entry): void {
        if (!entry.name) throw new Error('Entry name is missing.');
        if (!entry.url) throw new Error('Entry url is missing.');
        if (!entry.callback) throw new Error('Entry callback is missing.');

        if (!('interval' in entry)) entry.interval = this.DEFAULT_INTERVAL;

        this.entries[entry.name] = entry;
    }

    /**
     * Retrieves the current templates used by the scraper.
     *
     * @returns {{}|*} - An array of Entries.
     */
    public getEntries(): Entry[] {
        return this.entries;
    }

    /**
     * Starts the whole process of looping through the queue.
     */
    public start(): void {
        var that = this;
        _.forEach(this.entries, function(entry : Entry) {
            function makeRequest() {
                debug_crawler('Making request for ' + entry.url);
                that.makeRequest(entry.url, entry.callback);
            }

            setTimeout(makeRequest, 0);
            setInterval(makeRequest, entry.interval);
        })
    }

    /**
     * Makes a request to a specific URL and then applies the callback specified in its template.
     *
     * @param {String} url - An URL to be requested.
     * @param {Function} callback - Callback.
     * @private
     */
    private makeRequest(url: string, callback: Function): void {
        /* TODO: take care of other responses than 200. */

        let that = this;

        request.get(url, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                debug_crawler('Got results for ' + url);
                let result = callback(body, cheerio.load(body));
                that.emit('result', result);
            }
        });
    }
}

export default Crawler;
