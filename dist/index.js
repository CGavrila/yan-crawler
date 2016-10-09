'use strict';
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var _ = require('lodash');
var request = require('request');
var cheerio = require('cheerio');
var debug = require('debug');
var events_1 = require('events');
var debug_crawler = debug('Crawler');
var Crawler = (function (_super) {
    __extends(Crawler, _super);
    function Crawler() {
        _super.call(this);
        this.DEFAULT_INTERVAL = 1000;
        this.entries = {};
        this.intervals = {};
        this.started = false;
        if (Crawler._instance) {
            throw new Error("Error: Instantiation failed: Use Crawler.getInstance() instead of new.");
        }
    }
    Crawler.getInstance = function () {
        return this._instance || (this._instance = new this());
    };
    Crawler.destroyInstance = function () {
        Crawler._instance = null;
    };
    Crawler.prototype.start = function () {
        this.started = true;
        _.map(this.entries, this.createNewInterval.bind(this));
    };
    Crawler.prototype.isStarted = function () {
        return this.started;
    };
    Crawler.prototype.stop = function () {
        this.started = false;
        this.clearIntervals();
    };
    Crawler.prototype.addEntry = function (entry) {
        if (!entry.name)
            throw new Error('Entry name is missing.');
        if (!entry.url)
            throw new Error('Entry url is missing.');
        if (!entry.callback)
            throw new Error('Entry callback is missing.');
        if (this.entries[entry.name] !== undefined)
            throw new Error('Cannot add two entries with the same name.');
        if (!('interval' in entry))
            entry.interval = this.DEFAULT_INTERVAL;
        this.entries[entry.name] = entry;
        if (this.isStarted()) {
            this.createNewInterval(entry);
        }
    };
    Crawler.prototype.addEntries = function (entries) {
        for (var _i = 0, entries_1 = entries; _i < entries_1.length; _i++) {
            var entry = entries_1[_i];
            this.addEntry(entry);
        }
    };
    Crawler.prototype.clearEntries = function () {
        this.entries = {};
        this.clearIntervals();
    };
    Crawler.prototype.removeEntry = function (entryName) {
        if (!entryName)
            return false;
        if (!this.entries[entryName])
            return false;
        delete this.entries[entryName];
        clearInterval(this.intervals[entryName]);
        delete this.intervals[entryName];
        return true;
    };
    Crawler.prototype.createNewInterval = function (entry) {
        setTimeout(this.makeRequest.bind(this, entry.url, entry.callback), 0);
        this.intervals[entry.name] = setInterval(this.makeRequest.bind(this, entry.url, entry.callback), entry.interval);
    };
    Crawler.prototype.clearIntervals = function () {
        _.forOwn(this.intervals, function (value, key) {
            clearInterval(value);
        });
        this.intervals = {};
    };
    Crawler.prototype.makeRequest = function (url, callback) {
        debug_crawler('Making request for ' + url);
        var that = this;
        request.get(url, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                debug_crawler('Got results for ' + url);
                var result = callback(body, cheerio.load(body));
                that.emit('result', result);
            }
        });
    };
    Crawler.prototype.getEntries = function () {
        return this.entries;
    };
    Crawler.prototype.getIntervals = function () {
        return this.intervals;
    };
    return Crawler;
}(events_1.EventEmitter));
exports.Crawler = Crawler;
//# sourceMappingURL=index.js.map