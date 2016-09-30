var service_url;
var service_name;
var options;

switch(data_config.service){
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
        options = options_pubmed;
        break;
}

$(window).bind("pageshow", function() {
    $(".btn").attr("disabled", false);
});

$("#searchform").validate({
    submitHandler: function(form) {
        $(".btn").attr("disabled", true);
        $("#progress").html("");

        d3.select("#progress").append("p")
            .text("Please be patient, this can take a while...")
            .append("div")
            .attr("id", "progressbar")

        $("#progressbar").progressbar();
        var tick_interval = 2;
        var tick_increment = 1;
        var tick_function = function() {
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

        $.ajax({ // make an AJAX request
            type: "POST",
            url: service_url,
            data: $("#searchform").serialize(),
            success: function(data) {
                if (data.status === "success") {
                    var title = "Overview of " + service_name + " articles for " + data.query + ":" + data.id;
                    var file = data.id;

                    window.location = "headstart.php?title=" + title + "&file=" + file;
                    return false;
                } else {
                    $("#progress").html("Sorry! Something went wrong. Most likely, we did not get enough results for your search. Please try again with a different query.");
                    $(".btn").prop("disabled", false);
                }
            }
        });
    }
});

$(document).ready(function() {
    var search_options = SearchOptions;
    
    search_options.init("#filter-container", options);

    options.dropdowns.forEach(function(entry) {
        search_options.select_multi('.dropdown_multi_' + entry.id, entry.name)
    })

    search_options.addDatePickerFromTo("#from", "#to", "any-time");
});
