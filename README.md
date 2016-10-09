Overview
---
Simple module which allows you to poll websites at regular intervals and extract whatever information you want from the response. Strictly speaking, it's not a crawler. If you are looking for one, there are some quite popular alternatives out there like [node-crawler](https://github.com/sylvinus/node-crawler).

Installation
---
```
npm install yan-crawler
```

Usage
---
```javascript
var Crawler = require('yan-crawler').Crawler;
var crawler = Crawler.getInstance();

var amazonTemplate = {
    name: 'Amazon',
    url: 'https://www.amazon.com/',
    interval: 3000,
    callback: function(body, $) {
        // $ is cheerio - https://github.com/cheeriojs/cheerio
        console.log("Grabbed Amazon.");
    }
};

var IMDBTemplate = {
    name: 'IMDB',
    interval: 2000,
    url: 'http://www.imdb.com',
    callback: function(body, $) {
        console.log('Grabbed IMDB.');
    }
};

crawler.addEntry(amazonTemplate);
crawler.addEntry(IMDBTemplate);
crawler.start();
```

The code above will make requests to `www.amazon.com` every 3000ms and to `www.imdb.com` every 2000ms, calling their respective callbacks when it gets the results.

License
---
MIT
