var service_url = data_config.server_url + "services/searchLinkedCat.php";
var service_name = "LinkedCat";
var options = options_linkedcat;
var visualization_mode = "keywords"
var author_id = "";
var author_name = "";
var author_count = 0;
var author_living_dates = "";
var author_image_link = "";

var search_options;

var chooseOptions = function () {
    search_options = SearchOptions;

    switch (visualization_mode) {
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
    if(visualization_mode !== "authors") {
        $("#searchfield").show();
        $("#authors-loading").hide(); 
    } else {
        if(autocomplete_data === null) {
            $("#searchfield").hide();
            $("#authors-loading").show();
        } else {
            $("#searchfield").show();
            $("#authors-loading").hide(); 
            
            autocomplete_function = $('input[name="q"]').autoComplete({
                minChars: 0,
                cache: false,
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
                    $('input[name=q]').val(item.data('author'));
                    author_id = item.data('id');
                    author_count = item.data('count');
                    author_living_dates = item.data('living_dates');
                    author_image_link = item.data('image_link');
                    $("#searchform").validate().element('input[name=q]');
                }
            });
        }
    }
}

function adaptInterface() {
    $('input[name=q]').attr("placeholder", placeholder);
    $('input[name=optradio]:checked').addClass('checked');
    $('input[name=optradio]:not(:checked)').removeClass('checked');
}

function configureSearch() {
    $("#searchform").attr("action", "building_map.php?" 
                                        + encodeURI("&today=" + new Date().toLocaleDateString("en-US") 
                                                        + "&author_id=" + author_id
                                                        + "&doc_count=" + author_count
                                                        + "&living_dates=" + author_living_dates
                                                        + "&image_link=" + author_image_link
                                                        + "&service_url=" + service_url
                                                        + "&service_name=" + service_name
                                                        + "&service=" + data_config.service
                                                        + "&visualization_mode=" + visualization_mode
                                        )
                          );
}

$("#searchform").submit(function () {
    configureSearch();
    
    var ua = window.navigator.userAgent;
    var iOS = !!ua.match(/iPad/i) || !!ua.match(/iPhone/i);
    var webkit = !!ua.match(/WebKit/i);
    var iOSSafari = iOS && webkit && !ua.match(/CriOS/i);

    if(iOSSafari) {
        $("#searchform").attr("target", "");
    }

})

$("#searchform").validate({
    ignore: []
});

$(document).ready(function () {
    
    var changeVisualization = function () {
        visualization_mode = $("input[name='optradio']:checked").val();

        search_options.user_defined_date = false;
        $('input[name="q"]').val("");
        $("#filter-container").html("");
        $('.author-btn').removeClass('btn-enabled');
        $('.keyword-btn').removeClass('btn-enabled');
        
        if (typeof autocomplete_function === "object" && autocomplete_function !== null) {
            $('input[name="q"]').autoComplete('destroy');
            autocomplete_function = null;
        }

        chooseOptions();
        adaptInterface();
        configureSearch();
        addAutoComplete();
    };
    
    $("input[name='optradio']").change(changeVisualization);

    chooseOptions();
    configureSearch();
    addAutoComplete();
    
    changeVisualization();
});
