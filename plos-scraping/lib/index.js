var fs      = require('fs');
var _       = require('lodash');
var merge   = require('merge');
var async   = require('async');
var request = require('request');


var Scraper = function(config) {

  var self        = this;
  this.config     = config;
  this.apiKey     = config.apiKey;
  this.meta       = config.meta || [];
  this.directory  = config.directory || './results';
  this.altmetrics = config.altmetrics || ['citations', 'views'];
  this.query      = config.query || { 'type': 'subject', 'term': 'psychology'};

  /********************************************
  * Scraper.getArticles:
  *
  * Takes a URL (prepared with utility.query)
  * and makes a GET Request. Example URL:
  * http://api.plos.org/search?q={type}:"{term}"&api_key={key}
  *
  * where type could be "subject", "author", "title" etc.
  * The ressource is an XML blob, which gets parsed and then returns
  * a JSON blob, like so:
  * {
  *   "10.1371/journal.pone.0083558": {
  *                     "id": "10.1371/journal.pone.0083558",
  *                     "author": ["Random", "People"],
  *                     "title": "Random Title",
  *                     "abstract": "Complex random thingy",
  *                     "journal": "PLoS ONE"
  *                   }
  *
  * }
  ********************************************/

  this.getArticles = function(query, cb) {
    var url = self.prepare(query);
    request(url, function(err, res, body) {
      if (err) return cb(err);

      // from XML to JSON ...
      //var articles = parse(body, self.meta);
      var articles = self.parseArticles(body, self.meta);
      cb(null, articles);
    });
  };


  this.parseArticles = function(body, meta) {
    var obj = JSON.parse(body);
    return _.reduce(obj.response.docs, function(blob, article) {
      var key = article.id;
      blob[key] = {};

      _.each(meta, function(point) {
        blob[key][point] = article[point];
      });

      return blob;
    }, {});
  };

  /********************************************
  * Scraper.getAltmetrics:
  *
  * takes the articles (JSON blob) from the main.getArticles function;
  * extracts the keys (which are the DOIs); wraps them into another URL:
  * 
  * 10.1371/journal.pone.0083558 =>
  *
  * http://alm.plos.org/api/v3/articles?api_key={key}&ids=10.1371/journal.pone.0083558
  * 
  * with async.map we make several concurrent GET requests to different URLS
  * (as specified by the DOIs); the response body is a JSON array, holding
  * the altmetrics data; extracts them and adds them to the article JSON blob.
  *
  ********************************************/

  this.getAltmetrics = function(articles, callback) {
    var dois = Object.keys(articles);
    var urls = dois.map(self.wrapDOI);

    async.map(urls, function(url, cb) {
      request(url, function(err, res, body) {
        var altjson = JSON.parse(body)[0];
        var key = _.last(url.split('='));

        var specifics = _.reduce(self.altmetrics, function(base, item) {
          base[item] = altjson[item];
          return base;
        }, {});

        _.extend(specifics, {
          url: altjson.url,
          pdf: self.wrapPDF(altjson.url),
        });

        // weird inconsistency; some are URL Encoded, others are not
        _.extend(articles[key] || articles[key.replace('%2F', '/')], specifics);

        cb(null, articles);
      });

      }, function(err, articles) {
        if (err) return callback(err);
        var res = {};
        var key = _.values(self.query).join('-');
        res[key] = _.first(articles);
        callback(null, res);
    });
  };


  /*
   * main function; wraps both GET Requests
   */

  this.scrape = function(callback) {
    return self.getArticles(self.query, function(err, articles) {
      self.getAltmetrics(articles, callback);
    });
  };


  /*
   * Some utility functions
   */

  this.prepare = function() {
   var baseURL = 'http://api.plos.org/search?q={type}:"{term}"&apikey={key}'
                      .replace('{key}', self.apiKey)
                      .replace('{type}', self.query.type)
                      .replace('{term}', self.query.term);
   return [baseURL, '&wt=json&fq=doc_type:full&q=everyhing'].join('');
  };


  // first wrap; wraps the DOI from the parsed results
  this.wrapDOI = function(doi) {
    return 'http://alm.plos.org/api/v3/articles?api_key={key}&ids={doi}'
            .replace('{key}', self.apiKey)
            .replace('{doi}', doi.replace('/', '%2F')); // url encode the slash
  };


  // second wrap; wraps the URL to a representation of URL as pdf
  this.wrapPDF = function(url) {
    var start  = url.substring(0, url.indexOf('article') + 7);
    var middle = '/fetchObject.action?uri=';
    var end    = url.substring(url.indexOf('info'), url.length);
    return [start, middle, end, '&representation=PDF'].join('');
  };


  /*
   * Functions for dealing with the JSON results
   */


  /****************************************
   * saves the scraped JSON into a seperate file
   * in the specified directory (else ./results)
   * with the name of the query (e.g. abstract-cats.json)
   ***************************************/
  this.writeJSON = function(err, scraped) {
    var key = _.values(self.query).join('-');
    var file = [self.directory + '/', key, '.json'].join('');

    if (!fs.existsSync(self.directory)) {
      fs.mkdirSync(self.directory); 
    }

    fs.writeFile(file, JSON.stringify(scraped, null, 4), function(err) {
      if (err) {
        console.log('Something horrible happened. Evacuate the room.');
        throw err;
      }
    });
  };


  /********************************************
   * merges all the scraped JSON files that are
   * in the directory (e.g. ./results) to a specified
   * output directory (e.g. ./final/merged.json)
   ********************************************/
  this.mergeJSON = function(direction) {
    var path = direction.split('/').slice(0, 2).join('/');
    if (!fs.existsSync(path)) {
      fs.mkdirSync(path);
    }

    fs.readdir(self.directory, function(err, files) {
      if (err) throw err;

      var merged = _.reduce(files, function(base, file) {
        var path = [self.directory, file].join('/');
        var json = fs.readFileSync(path, 'utf8');

        // if the query was not valid; e.g. if PLoS does not
        // have data on it (or it was mistyped), the JSON
        // is empty ({}); can't parse it
        if (json) {
          base = merge(base, JSON.parse(json));
        }

        return base;
      }, {});

      fs.writeFileSync(direction, JSON.stringify(merged, null, 4));
      console.log('merged into ' + direction);
    });
  };


  /************************************************
   * We can do some awesome asynchronicity here >:)
   ************************************************/
  this.parallel = function(queries, mergedir) {
    async.each(queries, function(query, callback) {
      var scraper = self.clone(query);

      scraper.scrape(function(err, scraped) {
        if (err) return callback(err);

        scraper.writeJSON(err, scraped);
        callback();
      });
    }, function(err) {
      if (err) throw err;
      self.mergeJSON(mergedir);
    });
  };


  this.clone = function(query) {
    var config = _.extend(this.config, { query: query });
    return new Scraper(config);
  };

};


module.exports = Scraper;
