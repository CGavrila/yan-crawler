import { expect, assert } from 'chai';
import * as sinon from 'sinon';
import * as nock from 'nock';
import { Crawler, Entry } from '../../dist/index';
import SinonSpy = Sinon.SinonSpy;

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

describe('Crawler', () => {

    beforeEach(function () {
        this.crawler = Crawler.getInstance();
        this.clock = sinon.useFakeTimers();
        this.makeRequestSpy = sinon.spy(Crawler.prototype, "makeRequest");
    });

    afterEach(function () {
        Crawler.destroyInstance();
        this.clock.restore();
        this.makeRequestSpy.restore();
    });


    var amazonTemplate: Entry<void> = {
        name: 'Amazon',
        url: 'https://www.amazon.com/',
        interval: INTERVAL,
        callback: (body, $): void => {
        }
    };

    var IMDBTemplate: Entry<void> = {
        name: 'IMDB',
        callback: (body, $): void => {
        },
        interval: INTERVAL,
        url: 'http://www.imdb.com'
    };

    it('should be able to handle multiple entries', function() {
       this.crawler.addEntry(IMDBTemplate);
       this.crawler.addEntry(amazonTemplate);
       assert(Object.keys(this.crawler.getEntries()).length === 2)
    });

    it('should fail if trying to add multiple entries with the same name', function() {
        this.crawler.addEntry(IMDBTemplate);
        expect(this.crawler.addEntry.bind(this.crawler, IMDBTemplate)).to.throw('Cannot add two entries with the same name.');
    });

    it('should default to the default interval', function() {
        this.crawler.addEntry(IMDBTemplate);
        expect(this.crawler.addEntry.bind(this.crawler, IMDBTemplate)).to.throw('Cannot add two entries with the same name.');
    });

     it('should not schedule any requests when clearing all entries', function() {
        this.crawler.addEntry(IMDBTemplate);
        this.crawler.addEntry(amazonTemplate);
        this.crawler.start();
        this.clock.tick(100);
        var initialCallCount = this.makeRequestSpy.callCount;
        this.crawler.clearEntries();
        assert(initialCallCount > 0);
        this.clock.tick(8000);
        var afterClearCallCount = this.makeRequestSpy.callCount;
        assert(initialCallCount === afterClearCallCount);
    });

    it('should not schedule any requests when clearing an entry', function() {
        this.crawler.addEntry(amazonTemplate);
        this.crawler.start();
        this.clock.tick(100);
        var initialCallCount = this.makeRequestSpy.callCount;
        assert(initialCallCount > 0);
        this.crawler.removeEntry(amazonTemplate.name);
        this.clock.tick(amazonTemplate.interval);
        var afterClearCallCount = this.makeRequestSpy.callCount;
        assert(afterClearCallCount === initialCallCount);
    });

    it('should be able to start crawling added entries after start', function() {
        this.crawler.addEntry(IMDBTemplate);
        this.crawler.start();
        this.clock.tick(100);
        this.crawler.addEntry(amazonTemplate);
        this.clock.tick(INTERVAL + 100);
        assert(this.makeRequestSpy.callCount === 4);
    });

    it('should start crawling within the provided interval', function() {
        this.crawler.addEntry(IMDBTemplate);
        this.crawler.start();
        this.clock.tick(100);
        assert(this.makeRequestSpy.calledOnce);
    });


    it('should crawl every `interval` seconds', function() {
        this.crawler.addEntry(IMDBTemplate);
        this.crawler.start();
        this.clock.tick(5000);
        assert(this.makeRequestSpy.callCount > 1);
    });

    it('should start crawling within the provided interval for multiple entries', function() {
        this.crawler.addEntry(IMDBTemplate);
        this.crawler.addEntry(amazonTemplate);
        this.crawler.start();
        this.clock.tick(5000);
        assert(this.makeRequestSpy.calledWith(IMDBTemplate.url));
        assert(this.makeRequestSpy.calledWith(amazonTemplate.url));
    });

    it('should stop making any requests when stopping the crawler', function() {
        this.crawler.addEntry(IMDBTemplate);
        this.crawler.addEntry(amazonTemplate);
        this.crawler.start();
        this.clock.tick(INTERVAL + 100);
        assert(this.makeRequestSpy.callCount === 4);
        this.crawler.stop();
        this.clock.tick(INTERVAL + 100);
        assert(this.makeRequestSpy.callCount === 4);
    });

});