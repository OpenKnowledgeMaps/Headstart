$("#search-projects-form").submit(function (event) {
    event.preventDefault()
    var urlEncKW = encodeURIComponent($('#ipt-keywords').val())
    let params = $("#search-projects-form").serialize();
    setupPaginator(urlEncKW, params)
})

function simpleTemplating (data) {
  var html = $('<ul class="list-group">')
  $.each(data, function (index, item) {
    html.append($('<li class="list-group-item">')
    .html($('<a>')
    .attr('class', 'project-title')
    .attr('href', '#')
    .html('<span class="awesome"> </span>Overview of ' + item.acronymtitle).on('click', function () {
      var win = window.open("building_map.html")
      win.dataParamsForOpening = {
        data: $.param(item),
        service_name: service_name,
        service: data_config.service,
        server_url: data_config.server_url,
        search_url: service_url,
        acronymtitle: item.acronymtitle,
        funder: item.funder,
        project_id: item.project_id,
        obj_id: item.obj_id,
        acronym: item.acronym
      }
    }))
    .append('<span class="project-code"> (' + item.project_id +
      ')</span><div class="project-funders">' + item.funder + 
      ((item.funding_tree.length > 0)?(', ' + item.funding_tree[item.funding_tree.length-1]):('')) +
      ' (' + item.start_date.slice(0, 4) +' - '+ item.end_date.slice(0,4) + ')' +
      '</div><div class="project-organisations">Participants: ' + formatOrganisationLinks(item.organisations).slice(0,15).join(', ') + 
      ((item.organisations.length > 15)?(',...'):('')) + '</div>'))
  })
  return html
}

var formatOrganisationLinks = function (organisations) {
  return organisations.map(function (org) {
    if (typeof org.name !== "undefined") {
        return '<a href="' +org.url + '" target="_blank">'+org.name+'</a>';
    } else {
        return '';
    }
    
  })
}

var setupPaginator = function (searchTerm, params) {
  var paginator = $('#viper-search-pager')
  paginator.pagination({
    dataSource: data_config.server_url + 'services/getOpenAireProjects.php?' + encodeURI(params),
    callback: function (data, pagination) {
      var header = '<div id="project_count">Projects: ' + pagination.totalNumber + ' results for <span style="font-weight:bold;">' + decodeURI(searchTerm) + '</span></div>'
      var html = simpleTemplating(data)
      if (pagination.totalNumber === 0) {
        $('#viper-search-results').html('<div class="viper-no-results-err">Sorry, no projects found for <span style="font-weight:bold;">' + decodeURI(searchTerm) + '</span>. Please try another search term.</div>')
      } else {
        $('#viper-search-results').html(header)
            .append(html)
      }
      if(pagination.totalNumber <= pagination.pageSize) {
          $("#viper-search-pager").hide();
      }
    },
    formatAjaxError: function (jqXHR, textStatus, errorThrown) {
      $('#viper-search-results').text('Error Searching: Check your search terms. See Console for error details')
      console.log(jqXHR, textStatus, errorThrown)
    },
    alias: {
      pageSize: 'size',
      pageNumber: 'page'
    },
    ajaxDataType: 'get',
    ajax: {
      cache: true, //required or JQuery's cache busting causes OpenAire API to throw a stacktrace
      beforeSend: function () {
        var html = '<div class="loading">Loading Results from OpenAire...</div>' +
        '<div class="lds-spinner"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>'
        $('#viper-search-results').html(html);
        
        var active_page = $('.paginationjs').find("li.active");
        active_page.removeClass('active');
        
        if(active_page.next() !== null && active_page.next() !== undefined ){
            active_page.next().addClass('active');  
        } else {
            $('.pagination').find("li:first").addClass("active")
        }
        
        $("#viper-search-pager").show();
      },
      dataFilter: function (data, type) {
        try {
          mungedData = JSON.parse(data)
          if(mungedData.response.results === null) { // Edge case for no results
            mungedData.response.results = {}
            mungedData.response.results.result = []
            console.log(mungedData)
          } else if (!Array.isArray(mungedData.response.results.result)) { // Edge case for 1 result
            mungedData.response.results.result = [ mungedData.response.results.result ]
          }
          return JSON.stringify(mungedData)
        } catch (e) {
          console.log(e)
          return data
        }
      }
    },
    locator: 'response.results.result',
    className: 'paginationjs-theme-blue',
    formatResult: handleResponse,
    totalNumberLocator: function (response) {
      return response.response.header.total.$
    },
  })
}

var handleResponse = function (response) {
  return response.map(rawResponseMapper)
}

var rawResponseMapper = function (result) {
  var projectMetadata = deepGet(result, ['metadata', 'oaf:entity', 'oaf:project'])
  var items = {
    project_id: deepGet(projectMetadata, ['code', '$'], ''),
    acronym: deepGet(projectMetadata, ['acronym', '$'], ''),
    title: deepGet(projectMetadata, ['title', '$'], ''),
    start_date: deepGet(projectMetadata, ['startdate', '$'], ''),
    end_date: deepGet(projectMetadata, ['enddate', '$'], ''),
    call_id: deepGet(projectMetadata, ['callidentifier', '$'], ''),
    special_clause: deepGet(projectMetadata, ['ecsc39', '$'], ''),
    funding_stream: getFundingLevels(result).slice(-1)[0],
    funder: deepGet(projectMetadata, ['fundingtree', 'funder', 'shortname', '$'], ''),
    oa_mandate: deepGet(projectMetadata, ['oamandatepublications', '$'], ''),
    organisations: getOrganisations(projectMetadata),
    funding_tree: getFundingLevels(result),
    openaire_link: deepGet(projectMetadata, ['websiteurl', '$'], ''),
    obj_id: deepGet(result, ['header', 'dri:objIdentifier', '$']),
  }
  items.acronymtitle = ((items.acronym !== '')?(items.acronym + ' - '):('')) + items.title;
  
  return items;
}

$(document).ready(function () {
  $('#tbl-project-search-results').hide()
  $('#oa-searching').hide()
  $('#okm-making').hide()
  $('.lds-spinner').hide()
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

function getOrganisations(project) {
  var rel = deepGet(project, ['rels', 'rel'], [])
  if (Array.isArray(rel) && rel.length > 0) {
    return rel.map(function (entry) {
        return createOrganisations(entry);
    })
  } else {
    return [createOrganisations(rel)];
  }
}

function createOrganisations(source) {
    let short_name = deepGet(source, ['legalshortname', '$']);
    let long_name = deepGet(source, ['legalname', '$']);
    let website = deepGet(source, ['websiteurl', '$']);
    let org_id = deepGet(source, ['to', '$']);
    
    let org_name = function(short_name, long_name) {
        if (typeof short_name === "undefined" && typeof long_name === "undefined") {
            return "";
        } else if (typeof short_name === "undefined" && typeof long_name !== "undefined") {
            return long_name;
        } else {
            return short_name;
        }
    }
    
    let org_website = function(website, org_id) {
        if (typeof website === "undefined" && typeof org_id === undefined) {
            return "";
        } else if (typeof website === "undefined" && typeof org_id !== undefined) {
            return "https://www.openaire.eu/search/organization?organizationId=" + org_id;
        } else {
            return website;
        }
    }
    
    return {
      name: org_name(short_name, long_name),
      url: org_website(website, org_id)
    }
}

function getFundingLevels (result) {
  var funding_tree = deepGet(result, ['metadata', 'oaf:entity', 'oaf:project', 'fundingtree'], [])
  let funding_levels = digFundingTree(funding_tree, []);
  return ((funding_levels.length === 0)?(""):(funding_levels))
}

// call this recursively until we work our way down to funding_level_0
function digFundingTree (rootTree, fundingNames) {
  var keys = (Object.getOwnPropertyNames(rootTree))
  var r = /^funding_level_[0-9]+$/
  var nestedTree = keys.find(r.test.bind(r))
    if(typeof nestedTree === 'undefined') 
      return fundingNames
  fundingNames.push(deepGet(rootTree, [nestedTree, 'name', '$']))
  if (nestedTree === 'funding_level_0') {
    return fundingNames
  } else {
    try {
      return digFundingTree(rootTree[nestedTree]['parent'], fundingNames)
    }
    catch (e) {
      console.log(rootTree)
    }
  }
}
