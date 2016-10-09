/// <reference path="../typings/index.d.ts" />

'use strict';

import * as _ from 'lodash';
import * as request from 'request';
import * as cheerio from 'cheerio';
import * as debug from 'debug';

import { EventEmitter } from 'events';
import { ServerResponse } from 'http';

var debug_crawler = debug('Crawler');

/**
 * Used as a template for the websites that will be polled.
 */
export interface Entry {
    name: string;
    url: string;
    interval?: number;
    callback: Function;
}

/**
 * Poll websites based on provided intervals.
 */
export class Crawler extends EventEmitter {

    private DEFAULT_INTERVAL : number = 1000; // milliseconds

    private static _instance : Crawler;
    private started: boolean;

    private entries: { [name: string]: Entry } = {};
    private intervals: { [name: string]: any } = {};

    constructor() {
        super();
        this.started = false;
        if(Crawler._instance){
            throw new Error("Error: Instantiation failed: Use Crawler.getInstance() instead of new.");
        }
    }

    public static getInstance(): Crawler {
        return this._instance || (this._instance = new this());

    }

    public static destroyInstance(): void {
        Crawler._instance = null;
    }

    /**
     * Starts the process of looping through the queue.
     */
    public start(): void {
        this.started = true;
        _.map(this.entries, this.createNewInterval.bind(this));
    }

    public isStarted(): boolean {
        return this.started;
    }

    /**
     * Stops the process of looping through the queue.
     */
    public stop(): void {
        this.started = false;
        this.clearIntervals();
    }

    /**
     * Adds an entry to the scraper.
     *
     * @param {Entry} entry - The properties of the template, including name, matchesFormat, interval and callback.
     */
    public addEntry(entry: Entry): void {
        if (!entry.name) throw new Error('Entry name is missing.');
        if (!entry.url) throw new Error('Entry url is missing.');
        if (!entry.callback) throw new Error('Entry callback is missing.');
        if(this.entries[entry.name] !== undefined) throw new Error('Cannot add two entries with the same name.');

        if (!('interval' in entry)) entry.interval = this.DEFAULT_INTERVAL;

        this.entries[entry.name] = entry;
        if(this.isStarted()) {
            this.createNewInterval(entry);
        }
    }

    /**
     * Add multiple entries to the scraper.
     *
     * @param {Entry[]} entries - Entries to be added.
     */
    public addEntries(entries: Entry[]): void {
        for(let entry of entries) {
            this.addEntry(entry);
        }
    }

    /**
     * Remove all entries and stops all requests.
     */
    public clearEntries(): void {
        this.entries = {};
        this.clearIntervals();
    }

    /**
     * Remove an entry.
     *
     * @param entryName Name of the entry to delete
     * @returns {boolean} True if successful, false otherwise.
     */
    public removeEntry(entryName: string): boolean {
        if (!entryName) return false;
        if (!this.entries[entryName]) return false;

        delete this.entries[entryName];
        clearInterval(this.intervals[entryName]);
        delete this.intervals[entryName];

        return true;
    }

    /**
     * Creates a new interval for an entry;
     * @param {Entry} entry
     */
    private createNewInterval(entry: Entry) {
        setTimeout(this.makeRequest.bind(this, entry.url, entry.callback), 0);
        this.intervals[entry.name] = setInterval(this.makeRequest.bind(this, entry.url, entry.callback), entry.interval);
    }

    /**
     * Remove all intervals.
     */
    private clearIntervals(): void {
        _.forOwn(this.intervals, function(value, key) {
            clearInterval(value);
        });
        this.intervals = {};
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

        debug_crawler('Making request for ' + url);

        let that = this;
        request.get(url, function (error : Error, response : ServerResponse, body) {
            if (!error && response.statusCode == 200) {
                debug_crawler('Got results for ' + url);
                let result = callback(body, cheerio.load(body));
                that.emit('result', result);
            }
        });
    }

    /**
     * Retrieves the current templates used by the scraper.
     *
     * @returns {{}|*} - An array of Entries.
     */
    public getEntries(): { [name: string]: Entry } {
        return this.entries;
    }

    public getIntervals(): { [name: string]: any } {
        return this.intervals;
    }
}
