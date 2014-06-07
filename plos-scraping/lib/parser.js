/******************************************
 * It's not used, because apparently PLoS
 * also has a JSON api; maybe it's needed at
 * some point, so I'll leave it in here.
 ******************************************/
var _       = require('lodash');
var cheerio = require('cheerio');

var parseName = function(selector) {
  // e.g. '[name="id"]' => 'id'
  return selector.split('"').slice(1, 2);
};


/**********************************************
 * Given the XML blob, scrapes the data that we
 * want to get; these are specified by name tags;
 *********************************************/
module.exports = function(body, paperdata) {
  var result = {};
  var $      = cheerio.load(body);
  paperdata  = paperdata || [];

  // always add the id / doi
  if (paperdata.indexOf('id') === -1) {
    paperdata.unshift('id');
  }

  var filter = _.map(paperdata, function(point) {
    return '[name="{0}"]'.replace('{0}', point);
  });

  $('doc').each(function(index) {
    var key;

    _.each(filter, function(name) {

      // author display is weird; idea:
      // split on upper case letter; join neighbours again;
      // problem: middle name ...
      var isAuthor = name.indexOf('author') !== -1;
      var current = $(this).find(name).text();
     
      if (name.indexOf('id') !== -1) {
        key = current;
        result[key] = {};
      }

      var value = parseName(name);
      result[key][value] = current;

    }, this);
  });

  /*
   * weird, but works; sometimes there are several dois, like
   * doi/introduction, doi/materials_and_methods; these do not
   * point to a URL (only the basic doi does). So we have to
   * get rid of them ~ they contain more than one slash, so that's that
   */
  return _.omit(result, function(val, key) {
    return key.match(/\//g).length > 1;
  });
};
