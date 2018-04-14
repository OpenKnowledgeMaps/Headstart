var service_url;
var service_name;
var options;

$(document).ready(function () {
    service_url = data_config.server_url + "services/searchOpenAire.php"
    service_name = "OpenAire";
    options = options_openaire;
})

$(window).bind("pageshow", function () {
    $(".btn").attr("disabled", false);
});

var doSubmit = function (data, newWindow, callback) {
    data += "&today=" + new Date().toLocaleDateString("en-US");

    var openInNewWindow = function (data) {
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

    var openInThisWindow = function (data) {
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
        if (typeof entry.width === "undefined") {
            entry.width = "110px";
        }
        search_options.select_multi('.dropdown_multi_' + entry.id, entry.name, entry.width, options)
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
        if (service_name === "pubmed") {
            search_options.addDatePickerFromTo("#from", "#to", "any-time", "1809-01-01");
        } else if (service_name === "base") {
            search_options.addDatePickerFromTo("#from", "#to", "any-time", "1665-01-01");
        } else {
            search_options.addDatePickerFromTo("#from", "#to", "any-time", "1809-01-01");
        }
    } else if (valueExists("id", "year_range")) {
        search_options.setDateRangeFromPreset("#from", "#to", "any-time-years", "1809");
    }
    
});
