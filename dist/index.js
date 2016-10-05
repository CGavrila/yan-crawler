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
        if (Crawler._instance) {
            throw new Error("Error: Instantiation failed: Use Crawler.getInstance() instead of new.");
        }
        Crawler._instance = this;
    }
    Crawler.getInstance = function () {
        return Crawler._instance;
    };
    Crawler.destroyInstance = function () {
        Crawler._instance = null;
    };
    Crawler.prototype.addEntry = function (entry) {
        if (!entry.name)
            throw new Error('Entry name is missing.');
        if (!entry.url)
            throw new Error('Entry url is missing.');
        if (!entry.callback)
            throw new Error('Entry callback is missing.');
        if (!('interval' in entry))
            entry.interval = this.DEFAULT_INTERVAL;
        this.entries[entry.name] = entry;
    };
    Crawler.prototype.getEntries = function () {
        return this.entries;
    };
    Crawler.prototype.start = function () {
        var that = this;
        _.forEach(this.entries, function (entry) {
            function makeRequest() {
                debug_crawler('Making request for ' + entry.url);
                that.makeRequest(entry.url, entry.callback);
            }
            setTimeout(makeRequest, 0);
            setInterval(makeRequest, entry.interval);
        });
    };
    Crawler.prototype.makeRequest = function (url, callback) {
        var that = this;
        request.get(url, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                debug_crawler('Got results for ' + url);
                var result = callback(body, cheerio.load(body));
                that.emit('result', result);
            }
        });
    };
    Crawler._instance = new Crawler();
    return Crawler;
}(events_1.EventEmitter));
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Crawler;
//# sourceMappingURL=index.js.map