// not extensive
var fs      = require('fs');
var _       = require('lodash');
var should  = require('should');
var request = require('request');

var lib     = require('../lib');
var Scraper = require('../lib/index');
var parse   = require('../lib/parser');
var apiKey  = require('../api.json').key;


describe('TESTS SCRAPER UTILITY', function() {

  before(function() {
    var config = {
      apiKey : apiKey,
      query  : { 'type': 'abstract', 'term': 'cats' }
    };
    this.Scraper = new Scraper(config);
    this.dois = [
    '10.1371/journal.pone.0083558',
    '10.1371/journal.pone.0065925',
    '10.1371/journal.pone.0078547',
    ];
  });


  it('#should test parser', function() {
    fs.readFile('parse.xml', 'utf8', function(err, data) {
      var dois = Object.keys(parse(data));
      dois.forEach(function(doi) {
        doi.should.be.type('string');
        doi.indexOf('journal').should.not.equal(-1);
      });
    });
  });


  it('#should test Scraper.prepare', function() {
    var res = this.Scraper.prepare();
    var expected = 'http://api.plos.org/search?q=abstract:"cats"&apikey={key}&wt=json&fq=doc_type:full&q=everyhing'.replace('{key}', apiKey);
    res.should.equal(expected);
  });


  it('#should test Scraper.wrapDOI', function() {
    var self = this;
    var wrapped = 'http://alm.plos.org/api/v3/articles?api_key={key}&ids={id}'.replace('{key}', apiKey); 
    this.dois.map(function(doi) {
      self.Scraper.wrapDOI(doi).should.equal(wrapped.replace('{id}', doi.replace('/', '%2F')));
    });
  });


  it('#should test Scraper.wrapPDF', function() {
    var test = 'http://www.plosone.org/article/info%3Adoi%2F10.1371%2Fjournal.pone.0056936';
    var expected = 'http://www.plosone.org/article/fetchObject.action?uri=info%3Adoi%2F10.1371%2Fjournal.pone.0056936&representation=PDF';
    this.Scraper.wrapPDF(test).should.equal(expected);
  });
});


describe('TESTS API-REQUESTS', function() {
  // whahaha
  this.timeout(12000);

  before(function() {
    var config = {
      apiKey: apiKey,
      query: { 'type': 'abstract', 'term': 'cats' }
    };
    this.Scraper = new Scraper(config);
    this.articles = {
       '10.1371%2Fjournal.pone.0084119': { 'id': '10.1371%2Fjournal.pone.0084119', 'journal': 'PLoS ONE' },
       '10.1371%2Fjournal.pone.0079379': { 'id': '10.1371%2Fjournal.pone.0079379', 'journal': 'PLoS ONE' }
    };
    this.url = 'http://api.plos.org/search?q="smartphone"&api_key={key}'.replace('{key}', apiKey);
  });


  it('#should test Scraper.getArticles', function(done) {
    this.Scraper.getArticles(this.url, function(err, articles) {
      var dois = Object.keys(articles);
      dois.forEach(function(article) {
        article.should.be.type('string');
        article.indexOf('journal').should.not.equal(-1);
      });
      done();
    });
  });


  it('#should test Scraper.getAltmetrics', function(done) {
    this.Scraper.getAltmetrics(this.articles, function(err, specifics) {
      var articles = specifics['abstract-cats']; // from Scraper initialization
      var pdfs = _.map(articles, function(obj) { return obj.pdf; });
      var properties = ['id', 'journal', 'citations', 'pdf', 'url'];

      pdfs.forEach(function(pdf) {
        pdf.should.endWith('PDF');
      });

      _.each(_.values(articles), function(article) {
        article.should.have.properties(properties);
      });

      done();
    });
  });
});
