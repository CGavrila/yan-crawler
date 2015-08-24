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
var Crawler = require('yan-crawler');
var crawler = Crawler.instance;

crawler.addEntry({
  name: 'Amazon',
  callback: function(body, $) {
    // $ is cheerio - https://github.com/cheeriojs/cheerio
    console.log('Done with Amazon.');
  },
  interval: 3000,
  url: 'www.amazon.com'
});

crawler.addEntry({
  name: 'IMDB',
  callback: function(body, $) {
    console.log('Done with IMDB.');
  },
  interval: 2000,
  url: 'www.imdb.com'
});

crawler.start();
```

The code above will make requests to `www.amazon.com` every 3000ms and to `www.imdb.com` every 2000ms, calling their respective callbacks when it gets the results.

License
---
MIT