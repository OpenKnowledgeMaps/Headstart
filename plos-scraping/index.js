var fs      = require('fs');
var _       = require('lodash');
var async   = require('async');
var Scraper = require('./lib/index');
var apiKey  = require('./api.json').key;

var config = {
  apiKey     : apiKey,
  directory  : './results',
  altmetrics : ['views', 'citations'],
  query      : { 'type': 'abstract', 'term' : 'cats' },
  meta       : ['author_display', 'title_display', 'abstract',
                'publication_date', 'article_type', 'journal']
};

var PLoS = new Scraper(config);

var queries = [
  { 'type': 'subject', 'term' : 'psychology' },
  { 'type': 'subject', 'term' : 'biotechnology' },
  { 'type': 'subject', 'term' : 'physics' },
  { 'type': 'subject', 'term' : 'geography' },
];

PLoS.parallel(queries, './final/merged.json');
