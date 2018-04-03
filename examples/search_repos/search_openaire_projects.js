var table

$("#search-projects-form").validate({
  debug: true,
  submitHandler: function (form, event) {
    $('#oa-searching').show()
    $('.lds-spinner').show()
    event.preventDefault()
    var urlEncKW = encodeURIComponent($("#ipt-keywords").val())
    $.get('http://api.openaire.eu/search/projects?hasECFunding=true&format=json&size=50&keywords=' + urlEncKW, handleResponse)
    $("#search-projects-form input").prop("disabled", true);
    $("#search-projects-form button").prop("disabled", true);
  }
})

var handleResponse = function (response) {
  var dataSet = response.response.results.result.map(rawResponseMapper)
  table.clear()
  table.rows.add(dataSet).draw()
  $('#tbl-project-search-results').show()
  $('#oa-searching').hide()
  $('.lds-spinner').hide()
  $("#search-projects-form input").prop("disabled", false);
  $("#search-projects-form button").prop("disabled", false);

  $('#tbl-project-search-results tbody').on( 'click', 'button', function () {
    var self = $(this)
    // button show spinner
    self.html('<div class="lds-spinner"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>')
    var data = table.row( $(this).parents('tr') ).data();
    var submitObj = {
      'project_id': data[0],
      'funder': data[8],
      'acronym': data[1],
      'title': data[2],
      "funding_tree": data[11],
      "call_id": data[5],
      "start_date": data[3],
      "end_date": data[4],
      "oa_mandate": data[9],
      "special_clause": data[6],
      "organisations": data[10],
      "openaire_link": data[12],
      "obj_id": data[13],
    }
    doSubmit($.param(submitObj), true, function (success){
      if (success) {
        self.attr('class', 'btn-success')
        self.html('Map in New Tab')
      }
      else {
        self.attr('class', 'btn-warning')
        self.text('Error Making Map')
      }
    })
} )

}

var rawResponseMapper = function (result) {
  var projectMetadata = deepGet(result, ['metadata', 'oaf:entity', 'oaf:project'])
  return [
    deepGet(projectMetadata, ['code', '$'], ''),
    deepGet(projectMetadata, ['acronym', '$'], ''),
    deepGet(projectMetadata, ['title', '$'], ''),
    deepGet(projectMetadata, ['startdate', '$'], ''),
    deepGet(projectMetadata, ['enddate', '$'], ''),
    deepGet(projectMetadata, ['callidentifier', '$'], ''),
    deepGet(projectMetadata, ['ecsc39', '$'], ''),
    getFundingLevels(result).slice(-1)[0],
    deepGet(projectMetadata, ['fundingtree', 'funder', 'shortname', '$'], ''),
    deepGet(projectMetadata, ['oamandatepublications', '$'], ''),
    getOrganisations(projectMetadata),
    getFundingLevels(result),
    deepGet(projectMetadata, ['websiteurl', '$'], ''),
    deepGet(result, ['header', 'dri:objIdentifier', '$']),
    '' // Blank column for button
  ]
}

$(document).ready(function () {
  $('#tbl-project-search-results').hide()
  $('#oa-searching').hide()
  $('#okm-making').hide()
  $('.lds-spinner').hide()

  table = $('#tbl-project-search-results').DataTable({
    searching: false,
    lengthChange: false,
    ordering: false,
    "columnDefs": [ {
      "targets": -1,
      "data": null,
      "defaultContent": "<button>Make Map</button>"
    },
    {
      targets: 10,
      visible: false
    } ]
  })

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

function getFunding(foo) {
  return 'TODO'
}

function getOrganisations(project) {
  var rel = deepGet(project, ['rels', 'rel'], [])
  if (Array.isArray(rel)) {
    return rel.map(function (entry) {
      return {
        name: deepGet(entry, ['legalshortname', '$']),
        url: deepGet(entry, ['websiteurl', '$'])
      }
    })
  } else {
    return {
      name: deepGet(rel, ['legalshortname', '$']),
      url: deepGet(rel, ['websiteurl', '$'])
    }
  }
}

function getFundingLevels (result) {
  var funding_tree = deepGet(result, ['metadata', 'oaf:entity', 'oaf:project', 'fundingtree'], [])
  return digFundingTree(funding_tree, [])
}

// call this recursively until we work our way down to funding_level_0
function digFundingTree (rootTree, fundingNames) {
  var keys = (Object.getOwnPropertyNames(rootTree))
  var r = /^funding_level_[0-9]+$/
  var nestedTree = keys.find(r.test.bind(r))
  fundingNames.push(deepGet(rootTree, [nestedTree, 'name', '$']))
  if (nestedTree === 'funding_level_0') {
    return fundingNames
  } else {
    return digFundingTree(rootTree[nestedTree]['parent'], fundingNames)
  }
}
