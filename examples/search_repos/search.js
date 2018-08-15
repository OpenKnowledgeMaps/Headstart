var service_url;
var service_name;
var options;

switch (data_config.service) {
    case 'plos':
        service_url = data_config.server_url + "services/searchPLOS.php"
        service_name = "PLOS";
        options = options_plos;
        break;
    case 'pubmed':
        service_url = data_config.server_url + "services/searchPubmed.php"
        service_name = "PubMed";
        options = options_pubmed;
        break;
    case 'doaj':
        service_url = data_config.server_url + "services/searchDOAJ.php"
        service_name = "DOAJ";
        options = options_doaj;
        break;
    case 'core':
        service_url = data_config.server_url + "services/searchCORE.php"
        service_name = "Core";
        options = options_core;
        break;
    case 'base':
        service_url = data_config.server_url + "services/searchBASE.php"
        service_name = "BASE";
        options = options_base;
        break;
    
    case 'openaire':
        service_url = data_config.server_url + "services/searchOpenAire.php"
        service_name = "OpenAire";
        options = options_base;
        break;
}

$(window).bind("pageshow", function () {
    $(".btn").attr("disabled", false);
});

$("#searchform").validate({
    submitHandler: function (form) {
        $(".btn").attr("disabled", true);
        $("#progress").html("");

        d3.select("#progress").append("p")
                .text("Please be patient, this can take a while...")
                .append("div")
                .attr("id", "progressbar")

        $("#progressbar").progressbar();
        var tick_interval = 2;
        var tick_increment = 1;
        var tick_function = function () {
            var value = $("#progressbar").progressbar("option", "value");
            value += tick_increment;
            $("#progressbar").progressbar("option", "value", value);
            if (value < 100) {
                window.setTimeout(tick_function, tick_interval * 1000);
            } else {
                //alert("Done");
            }
        };
        window.setTimeout(tick_function, tick_interval * 1000);

        var data = $("#searchform").serialize();

        doSubmit(data)
    }
});

var doSubmit = function (data, newWindow, callback) {
  data += "&today=" + new Date().toLocaleDateString("en-US");

  var openInNewWindow= function(data) {
    if (data.status === "success") {
      var file = data.id;
      window.open("headstart.php?query=" +
        data.query +
        "&file=" +
        file +
        "&service=" +
        data_config.service +
        "&service_name=" +
        service_name, '_blank')
      console.log('opening')
      callback(true)
      return false;
    } else {
        callback(false)
    }
  }

  var openInThisWindow = function(data) {
    if (data.status === "success") {
      var file = data.id;
      window.location =
        "headstart.php?query=" +
        data.query +
        "&file=" +
        file +
        "&service=" +
        data_config.service +
        "&service_name=" +
        service_name;
      return false;
    } else {
      $("#progress").html(
        "Sorry! Something went wrong. Most likely, we did not get enough results for your search. Please try again with a different query."
      );
      $(".btn").prop("disabled", false);
    }
  }

  $.ajax({
    // make an AJAX request
    type: "POST",
    url: service_url,
    data: data,
    success: newWindow ? openInNewWindow : openInThisWindow
  });
};

$(document).ready(function () {
    var search_options = SearchOptions;

    search_options.init("#filter-container", options);

    options.dropdowns.forEach(function (entry) {
        search_options.select_multi('.dropdown_multi_' + entry.id, entry.name)
    })

    var valueExists = function (key, value) {
        var find = options.dropdowns.filter(
                function (data) {
                    return data[key] == value
                }
        );

        return (find.length > 0) ? (true) : (false);
    }
    if (valueExists("id", "time_range")) {
        search_options.addDatePickerFromTo("#from", "#to", "any-time");
    } else if (valueExists("id", "year_range")) {
        search_options.setDateRangeFromPreset("#from", "#to", "any-time-years", "1809");
    }
});
