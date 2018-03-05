$("#search-projects-form").validate({
  debug: true,
  submitHandler: function (form, event) {
    event.preventDefault()
    var urlEncKW = encodeURIComponent($("#ipt-keywords").val())
    $.get('http://api.openaire.eu/search/projects?hasECFunding=true&format=json&size=50&keywords=' + urlEncKW, handleResponse)
  }
})

var handleResponse = function (response) {
  console.log(response)
  var dataSet = response.response.results.result.map(rawResponseMapper)
  $('#tbl-project-search-results').show()
  $('#tbl-project-search-results').DataTable({
    data: dataSet,
    searching: false,
    lengthChange: false,
    ordering: false
  })
  // TODO: Handle repeated searches
}

var rawResponseMapper = function (result) {
  return [
    deepGet(result, ['metadata', 'oaf:entity', 'oaf:project', 'code', '$'], ''),
    deepGet(result, ['metadata', 'oaf:entity', 'oaf:project', 'acronym', '$'], ''),
    deepGet(result, ['metadata', 'oaf:entity', 'oaf:project', 'title', '$'], ''),
    deepGet(result, ['metadata', 'oaf:entity', 'oaf:project', 'startdate', '$'], ''),
    
    deepGet(result, ['metadata', 'oaf:entity', 'oaf:project', 'enddate', '$'], ''),
    deepGet(result, ['metadata', 'oaf:entity', 'oaf:project', 'callidentifier', '$'], ''),
    deepGet(result, ['metadata', 'oaf:entity', 'oaf:project', 'ecsc39', '$'], ''),
    '', // result.metadata['oaf:entity']['oaf:project'].fundingtree.funding_level_2.parent.funding_level_1.parent.funding_level_0.name.$
    // TODO: build function to handles these random nestings and finally get level 0
    '', // TODO: Generate like which correctly uses search.js to make a backend request like the others
    
  ]
}

$(document).ready(function () {
  $('#tbl-project-search-results').hide()
})

// Standard deep get function adapted from https://github.com/joshuacc/drabs
function deepGet (obj, props, defaultValue) {
  if (obj === undefined || obj === null) {
      return defaultValue;
  }
  if (props.length === 0) {
      return obj;
  }
  var foundSoFar = obj[props[0]];
  var remainingProps = props.slice(1);
  return deepGet(foundSoFar, remainingProps, defaultValue);
}
