"use strict";
var chai_1 = require('chai');
var sinon = require('sinon');
var nock = require('nock');
var index_1 = require('../../dist/index');
nock('https://www.amazon.com')
    .get('/')
    .reply(200, {
    message: 'Amazon here'
});
nock('http://www.imdb.com')
    .get('/')
    .reply(200, {
    message: 'IMDb here'
});
var INTERVAL = 1000;
describe('Crawler', function () {
    beforeEach(function () {
        this.crawler = index_1.Crawler.getInstance();
        this.clock = sinon.useFakeTimers();
        this.makeRequestSpy = sinon.spy(index_1.Crawler.prototype, "makeRequest");
    });
    afterEach(function () {
        index_1.Crawler.destroyInstance();
        this.clock.restore();
        this.makeRequestSpy.restore();
    });
    var amazonTemplate = {
        name: 'Amazon',
        url: 'https://www.amazon.com/',
        interval: INTERVAL,
        callback: function (body, $) {
        }
    };
    var IMDBTemplate = {
        name: 'IMDB',
        callback: function (body, $) {
        },
        interval: INTERVAL,
        url: 'http://www.imdb.com'
    };
    it('should be able to handle multiple entries', function () {
        this.crawler.addEntry(IMDBTemplate);
        this.crawler.addEntry(amazonTemplate);
        chai_1.assert(Object.keys(this.crawler.getEntries()).length === 2);
    });
    it('should fail if trying to add multiple entries with the same name', function () {
        this.crawler.addEntry(IMDBTemplate);
        chai_1.expect(this.crawler.addEntry.bind(this.crawler, IMDBTemplate)).to.throw('Cannot add two entries with the same name.');
    });
    it('should default to the default interval', function () {
        this.crawler.addEntry(IMDBTemplate);
        chai_1.expect(this.crawler.addEntry.bind(this.crawler, IMDBTemplate)).to.throw('Cannot add two entries with the same name.');
    });
    it('should not schedule any requests when clearing all entries', function () {
        this.crawler.addEntry(IMDBTemplate);
        this.crawler.addEntry(amazonTemplate);
        this.crawler.start();
        this.clock.tick(100);
        var initialCallCount = this.makeRequestSpy.callCount;
        this.crawler.clearEntries();
        chai_1.assert(initialCallCount > 0);
        this.clock.tick(8000);
        var afterClearCallCount = this.makeRequestSpy.callCount;
        chai_1.assert(initialCallCount === afterClearCallCount);
    });
    it('should not schedule any requests when clearing an entry', function () {
        this.crawler.addEntry(amazonTemplate);
        this.crawler.start();
        this.clock.tick(100);
        var initialCallCount = this.makeRequestSpy.callCount;
        chai_1.assert(initialCallCount > 0);
        this.crawler.removeEntry(amazonTemplate.name);
        this.clock.tick(amazonTemplate.interval);
        var afterClearCallCount = this.makeRequestSpy.callCount;
        chai_1.assert(afterClearCallCount === initialCallCount);
    });
    it('should be able to start crawling added entries after start', function () {
        this.crawler.addEntry(IMDBTemplate);
        this.crawler.start();
        this.clock.tick(100);
        this.crawler.addEntry(amazonTemplate);
        this.clock.tick(INTERVAL + 100);
        chai_1.assert(this.makeRequestSpy.callCount === 4);
    });
    it('should start crawling within the provided interval', function () {
        this.crawler.addEntry(IMDBTemplate);
        this.crawler.start();
        this.clock.tick(100);
        chai_1.assert(this.makeRequestSpy.calledOnce);
    });
    it('should crawl every `interval` seconds', function () {
        this.crawler.addEntry(IMDBTemplate);
        this.crawler.start();
        this.clock.tick(5000);
        chai_1.assert(this.makeRequestSpy.callCount > 1);
    });
    it('should start crawling within the provided interval for multiple entries', function () {
        this.crawler.addEntry(IMDBTemplate);
        this.crawler.addEntry(amazonTemplate);
        this.crawler.start();
        this.clock.tick(5000);
        chai_1.assert(this.makeRequestSpy.calledWith(IMDBTemplate.url));
        chai_1.assert(this.makeRequestSpy.calledWith(amazonTemplate.url));
    });
    it('should stop making any requests when stopping the crawler', function () {
        this.crawler.addEntry(IMDBTemplate);
        this.crawler.addEntry(amazonTemplate);
        this.crawler.start();
        this.clock.tick(INTERVAL + 100);
        chai_1.assert(this.makeRequestSpy.callCount === 4);
        this.crawler.stop();
        this.clock.tick(INTERVAL + 100);
        chai_1.assert(this.makeRequestSpy.callCount === 4);
    });
});
//# sourceMappingURL=index.js.map