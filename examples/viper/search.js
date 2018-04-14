var service_url;
var service_name;
var options;

$(document).ready(function () {
    service_url = data_config.server_url + "services/searchOpenAire.php"
    service_name = "OpenAire";
    options = options_base;
})

$(window).bind("pageshow", function () {
    $(".btn").attr("disabled", false);
});

$("#searchform").submit(function (){
    $(".btn").attr("disabled", true);

    var data = $("#searchform").serialize();

    doSubmit(data)
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
