'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _lodash = require('lodash');

var _ = _interopRequireWildcard(_lodash);

var _request = require('request');

var request = _interopRequireWildcard(_request);

var _cheerio = require('cheerio');

var cheerio = _interopRequireWildcard(_cheerio);

var debug = require('debug')('Crawler');
var EventEmitter = require('events').EventEmitter;

var _singleton = Symbol();

/**
 *
 * Singleton class used to scrape websites based on templates and a queue.
 *  - the queue contains the URLs which will be retrieved and then processed as defined by its matching template

 *
 */

var Crawler = (function (_EventEmitter) {
    _inherits(Crawler, _EventEmitter);

    function Crawler(singletonToken) {
        _classCallCheck(this, Crawler);

        _get(Object.getPrototypeOf(Crawler.prototype), 'constructor', this).call(this);
        if (_singleton !== singletonToken) throw new Error('Crawler is a singleton class, cannot instantiate directly.');

        this.entries = {};

        /* Default interval to wait between requests for the same entry (milliseconds) */
        this.DEFAULT_INTERVAL = 1000;
    }

    _createClass(Crawler, [{
        key: 'addEntry',

        /**
         * Adds a template to the scraper.
         *
         * @param {object} template - The properties of the template, including name, matchesFormat, interval and callback.
         */
        value: function addEntry(entry) {
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
    }, {
        key: 'getEntries',
        value: function getEntries() {
            return this.entries;
        }

        /**
         * Starts the whole process of looping through the queue.
         */
    }, {
        key: 'start',
        value: function start() {
            var that = this;
            _.forEach(this.entries, function (entry) {
                function makeRequest() {
                    debug('Making request for ' + entry.url);
                    that._makeRequest(entry.url, entry.callback);
                }

                setTimeout(makeRequest, 0);
                setInterval(makeRequest, entry.interval);
            });
        }

        /**
         * Makes a request to a specific URL and then applies the callback specified in its template.
         *
         * @param {String} url - An URL to be requested.
         * @param {Object} template - The corresponding template matching the URL provided.
         * @private
         */
    }, {
        key: '_makeRequest',
        value: function _makeRequest(url, callback) {
            /* TODO: take care of other responses than 200. */

            var that = this;

            request.get(url, function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    debug('Got results for ' + url);
                    var result = callback(body, cheerio.load(body));
                    that.emit('result', result);
                }
            });
        }
    }], [{
        key: 'destroyInstance',

        /**
         * Used to destroy the current instance of the class (it's a Singleton).
         * Particularly useful for testing.
         */
        value: function destroyInstance() {
            this[_singleton] = null;
        }
    }, {
        key: 'instance',
        get: function get() {
            if (!this[_singleton]) this[_singleton] = new Crawler(_singleton);

            return this[_singleton];
        }
    }]);

    return Crawler;
})(EventEmitter);

exports['default'] = Crawler;
module.exports = exports['default'];
//# sourceMappingURL=index.js.map
