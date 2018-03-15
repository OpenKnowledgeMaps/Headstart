$("#search-projects-form").validate({
  debug: true,
  submitHandler: function (form, event) {
    event.preventDefault()
    var urlEncKW = encodeURIComponent($("#ipt-keywords").val())
    $.get('http://api.openaire.eu/search/projects?hasECFunding=true&format=json&size=50&keywords=' + urlEncKW, handleResponse)
  }
})

var handleResponse = function (response) {
  var dataSet = response.response.results.result.map(rawResponseMapper)
  $('#tbl-project-search-results').show()
  var table = $('#tbl-project-search-results').DataTable({
    data: dataSet,
    searching: false,
    lengthChange: false,
    ordering: false,
    "columnDefs": [ {
      "targets": -1,
      "data": null,
      "defaultContent": "<button>Make Map</button>"
  } ]
  })
  $('#tbl-project-search-results tbody').on( 'click', 'button', function () {
    var data = table.row( $(this).parents('tr') ).data();
    console.log(data)
    doSubmit('project_id='+data[0]+'&funding_level='+data[7]+'&q='+encodeURIComponent( $("#ipt-keywords").val()) )
} )
  // TODO: Handle repeated searches
}

var rawResponseMapper = function (result) {
  console.log(result)
  return [
    deepGet(result, ['metadata', 'oaf:entity', 'oaf:project', 'code', '$'], ''),
    deepGet(result, ['metadata', 'oaf:entity', 'oaf:project', 'acronym', '$'], ''),
    deepGet(result, ['metadata', 'oaf:entity', 'oaf:project', 'title', '$'], ''),
    deepGet(result, ['metadata', 'oaf:entity', 'oaf:project', 'startdate', '$'], ''),
    
    deepGet(result, ['metadata', 'oaf:entity', 'oaf:project', 'enddate', '$'], ''),
    deepGet(result, ['metadata', 'oaf:entity', 'oaf:project', 'callidentifier', '$'], ''),
    deepGet(result, ['metadata', 'oaf:entity', 'oaf:project', 'ecsc39', '$'], ''),
    getFundingLevel0(result),
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

function getFundingLevel0 (result) {
  var funding_tree = deepGet(result, ['metadata', 'oaf:entity', 'oaf:project', 'fundingtree'])
  return digFundingTree(funding_tree)
}

// call this recursively until we work our way down to funding_level_0
function digFundingTree (rootTree) {
  var keys = (Object.getOwnPropertyNames(rootTree))
  var r = /^funding_level_[0-9]+$/
  var nestedTree = keys.find(r.test.bind(r))
  if (nestedTree === 'funding_level_0') return deepGet(rootTree, ['funding_level_0', 'name', '$'])
  else return digFundingTree(rootTree[nestedTree]['parent'])
}