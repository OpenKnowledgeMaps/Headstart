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
            placeholder = "Stichwort eingeben...";
            $('.keyword-btn').addClass('btn-enabled');
            $('#additional-information').html(additional_information.keywords);
            break;

        case "authors":
            options = options_linkedcat_authors;
            service_url = data_config.server_url + "services/searchLinkedCatAuthorview.php";
            placeholder = "Autor auswählen...";
            $('.author-btn').addClass('btn-enabled');
            $('#additional-information').html(additional_information.authors);
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
                    let name = "";
                    if(search.length > 0) {
                        name = item[1].replace(/</g, "&lt;");
                        name = name.replace(/>/g, "&gt;");
                    }
                    return '<div class="autocomplete-suggestion" '
                            +' data-id="' + item[0] + '"'
                            +' data-author="'+name +'"'
                            +' data-count="' + item[2] + '"'
                            +' data-living_dates="' + item[3] + '"'
                            +' data-image_link="' + item[4] + '"'
                            +'>'+name.replace(re, "<b>$1</b>")
                            +((name !== "")?(' (' +item[2] + ')'):(""))
                            +'</div>';
                },
                onSelect: function(e, term, item){
                    $('input[name=q]').val(item.data('author'));
                    author_id = item.data('id');
                    author_count = item.data('count');
                    author_living_dates = item.data('living_dates');
                    author_image_link = item.data('image_link');
                    $("#searchform").validate().element('input[name=q]');
                    
                    author_selected = true;
                    removeInputError();
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

function showInputError(error_message) {
    $("#q-error").text(error_message);
    $("#q-error").removeClass("label-hide");
    $("#q-error").removeClass("label-show").addClass("label-show");
}

function removeInputError() {
    if($("#q-error").hasClass("label-show")){
        $("#q-error").removeClass("label-show");
        $("#q-error").addClass("label-hide");
    }
}

$("#searchform").submit(function (event) {
    if($.trim($('input[name="q"]').val()) === "") {
        showInputError("Bitte geben Sie ein Stichwort ein:");
        event.preventDefault();
    }
    
    if(visualization_mode === "authors" && !author_selected) {
        showInputError("Bitte wählen Sie einen Autor aus der Liste aus:");
        event.preventDefault();
    }
    
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
        
        let url = new URL(window.location.href);
        url.searchParams.delete("mode");
        url.searchParams.append("mode", visualization_mode);
        window.history.pushState({path:url.toString()}, '', url.toString());

        search_options.user_defined_date = false;
        $('input[name="q"]').val("");
        $("#filter-container").html("");
        $('.author-btn').removeClass('btn-enabled');
        $('.keyword-btn').removeClass('btn-enabled');
        
        if (typeof autocomplete_function === "object" && autocomplete_function !== null) {
            $('input[name="q"]').autoComplete('destroy');
            autocomplete_function = null;
        }
        
        removeInputError();
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
