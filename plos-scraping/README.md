# PLoS Scraping

Given some search criteria (see below), scrapes the PLoS ONE API.

```
npm install

# for tests
npm test

# for tests with code coverage
sudo npm -g install istanbul
istanbul cover _mocha
```

The PLoS One api provides the following search criteria:
* default
* author
* title
* subject
* abstract

You need to have your own api key though. Sign Up [here](http://alm.plos.org/docs/Home) and get your key.
Enter it in the api.json file and you're ready to go!

## How To

Scraper in lib/index.js is the main object. Use it like this:

```javascript
var config = {
  apiKey     : 'yourapikey',
  altmetrics : ['views', 'citations'],
  query      : { 'type': 'abstract', 'term' : 'cats' },
  metadata   : ['author_display', 'title_display', 'abstract', 'publication_date']
};

var PLoS = new Scraper(config);


PLoS.scrape(function(err, data) {
  if (err) {
    console.log('Something horrible happened. Evacuate the room.');
    throw err;
	}

  /* data is a JSON array of articles with the query as key; e.g.:
   * { "abstract-cat": { "some-weird-doi": {
   *                       "id": "some-weird-doi",
   *                       "title_display": "bla",
   *                       "author_display": ["bla1", "bla2"],
   *                       "publication_date": "2009-03-17T00:00:00Z",
   *                       "abstract": "bla", 
   *                       "url": "some-url",
   *                       "pdf": "some-pdf-ressource",
   *                       "views": 9000,
   *                       "citations": 0
   *                     }
   *               }
   * }
   */

	console.log(data);
});
```

## Methods

## main API calls

### Scraper.getArticles

Makes a GET request to a prepared URL according to the PLoS api.
Returns a JSON blob (originally an XML blob, that's why the XML parser
is still in there), where the metadata of the paper is specified.

### Scraper.parseArticles

Parses the JSON blob that is returned by the first GET Request.

### Scraper.getAltmetrics

With the DOIs from the articles, makes another GET Request for the
altmetrics data. Adds specified altmetrics things (views, citations)
to the JSON blob, which is then returned.

### Scraper.scrape

wraps the .getArticles and .getAltmetrics methods; takes a callback
that is called with the final JSON blob.

## preparing Stuff

### Scraper.prepare

given the search criteria, returns the URL to which the .getArticles GET Request is made
subsequently.

### Scraper.wrapDOI

wraps the DOI into a URL to which the .getAltmetrics GET Request is made.

### Scraper.wrapPDF

wraps the URL to another URL which points to the pdf ressource

## doing stuff with the Results

### Scraper.writeJSON

Takes the data from PLoS.scrape and writes it to a JSON file in the specified
directory (default: ./results). Name is the query (e.g. abstract-cat).

### Scraper.mergeJSON

Merges all the files in the results directory into one file.

## Getting Things Done

### Scraper.parallel

Given an array of queries, runs them in parallel and merges them upon finishing.

```javascript
// assumes everything given above

var queries = [
  { 'type': 'abstract', 'term' : 'cats' },
  { 'type': 'abstract', 'term' : 'dogs' },
  { 'type': 'abstract', 'term' : 'elephants' }
  { 'type': 'abstract', 'term' : 'squirrels' }
  { 'type': 'abstract', 'term' : 'humans' }
  { 'type': 'abstract', 'term' : 'apes' }
];

var mergedir = './final/merged.json'
PLoS.parallel(queries, mergedir);
```

## Things to do

When anybody figures out how to scrape the paper fulltext (seems like it's not possible, though),
this could be easily incorporated into the Scraper. Otherwise, since we have the URL to the HTML paper
(and the URL to the PDF paper), it would be possible to do this by hand. But it wouldn't be a particularly
nice experience.
