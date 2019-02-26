var service_url = data_config.server_url + "services/searchLinkedCat.php";
var service_name = "LinkedCat";
var options = options_linkedcat;
var visualization_type = "keywords"
var author_id = "";
var author_name = "";
var author_count = 0;
var author_living_dates = "";
var author_image_link = "";

$(window).bind("pageshow", function () {
    $(".btn").attr("disabled", false);
});

$("#searchform").validate({
    submitHandler: function (form) {
        $(".btn").attr("disabled", true);
        $("#progress").html("");

        d3.select("#progress").append("p")
                .text("Bitte haben Sie ein wenig Geduld, dieser Vorgang dauert etwa 20 Sekunden...")
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
  data += encodeURI("&today=" + new Date().toLocaleDateString("en-US") 
          + "&author_id=" + author_id
          + "&doc_count=" + author_count
          + "&living_dates=" + author_living_dates
          + "&image_link=" + author_image_link);
  

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
        "headstart.php?query=" + data.query
        + "&file=" + file
        + "&service=" + data_config.service
        + "&service_name=" + service_name
        + "&visualization_type=" + visualization_type;
      return false;
    } else {
      $("#progress").html(
        "Pardon! Es ist leider etwas schief gelaufen. Wahrscheinlich gibt es zu Ihrem Suchanfrage zu wenige Dokumente. Bitte versuchen Sie es mit einer anderen Anfrage."
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

var search_options;

var chooseOptions = function () {
    search_options = SearchOptions;

    switch (visualization_type) {
        case "keywords":
            options = options_linkedcat;
            service_url = data_config.server_url + "services/searchLinkedCat.php";
            placeholder = "Suchbegriff eingeben...";
            $('.keyword-btn').addClass('btn-enabled');
            break;

        case "authors":
            options = options_linkedcat_authors;
            service_url = data_config.server_url + "services/searchLinkedCatAuthorview.php";
            placeholder = "Autorennamen eingeben...";
            $('.author-btn').addClass('btn-enabled');
            break;

        default:
            options = options_linkedcat;
            service_url = data_config.server_url + "services/searchLinkedCat.php";
    }
    
    search_options.init("#filter-container", options, false);

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
        search_options.setDateRangeFromPreset("#from", "#to", "any-time-years", "1847");
    }
}

var autocomplete_function;
var autocomplete_interval;
 
var addAutoComplete = function() {
    if(visualization_type === "authors") {
        autocomplete_function = new autoComplete({
            selector: 'input[name="q"]',
            minChars: 0,
            source: function(term, suggest){
                term = term.toLowerCase();
                var choices = autocomplete_data;
                var matches = [];
                for (i=0; i<choices.length; i++) {
                    if(typeof choices[i][1].toLowerCase === "undefined" 
                            || choices[i][1].toLowerCase().indexOf === "undefined") {
                        continue;
                    }

                    if (~choices[i][1].toLowerCase().indexOf(term)) {
                        matches.push(choices[i]);
                    }
                }
                suggest(matches);
            },
            renderItem: function (item, search){
                search = search.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
                var re = new RegExp("(" + search.split(' ').join('|') + ")", "gi");
                return '<div class="autocomplete-suggestion" '
                        +' data-id="' + item[0] + '"'
                        +' data-author="'+item[1] +'"'
                        +' data-count="' + item[2] + '"'
                        +' data-living_dates="' + item[3] + '"'
                        +' data-image_link="' + item[4] + '"'
                        +'>'+item[1].replace(re, "<b>$1</b>")
                        +((item[1] !== "")?(' (' +item[2] + ')'):(""))
                        +'</div>';
            },
            onSelect: function(e, term, item){
                $('input[name=q]').val(item.getAttribute('data-author'));
                author_id = item.getAttribute('data-id');
                author_count = item.getAttribute('data-count');
                author_living_dates = item.getAttribute('data-living_dates');
                //author_image_link = item.getAttribute('data-author_image_link');
            }
        });
    }
}

function adaptInterface() {
    $('input[name=q]').attr("placeholder", placeholder);
    $('input[name=optradio]:checked').addClass('checked');
    $('input[name=optradio]:not(:checked)').removeClass('checked');
}

$(document).ready(function () {
    
    var changeVisualization = function () {
        visualization_type = $("input[name='optradio']:checked").val();

        search_options.user_defined_date = false;
        $("#filter-container").html("");
        $('.author-btn').removeClass('btn-enabled');
        $('.keyword-btn').removeClass('btn-enabled');
        
        if (typeof autocomplete_function === "object" && autocomplete_function !== null) {
            autocomplete_function.destroy();
            autocomplete_function = null;
        }

        chooseOptions();
        adaptInterface();
        addAutoComplete();
    };
    
    $("input[name='optradio']").change(changeVisualization);

    chooseOptions();
    addAutoComplete();
    
    changeVisualization();
});
