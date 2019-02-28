var options_linkedcat = {
    dropdowns: [
        {id: "year_range", multiple: false, name: "Zeitraum", type: "dropdown"
            , fields: [
                {id: "any-time-years", text: "1847-1918"}
                , {id: "user-defined", text: "Zeitraum", class: "user-defined",
                    inputs: [
                        {id: "from", label: "von: ", class: "time_input"}
                        , {id: "to", label: "bis: ", class: "time_input"}
                    ]}
            ]},
        {id: "include_content_type", multiple: true, name: "Dokumentarten", type: "dropdown"
            , fields: [
                {id: "Andere Abhandlungen", text: "Andere Abhandlungen", count:1345, selected:true}
                , {id: "Anthologie", text: "Anthologie", count:1, selected:true}
                , {id: "Bericht", text: "Bericht", count:1331}
                , {id: "Bibliografie", text: "Bibliografie", count: 212}
                , {id: "Biografie", text: "Biografie", count:21, selected:true}
                , {id: "Briefsammlung", text: "Briefsammlung", count:17, selected:true}
                , {id: "Katalog", text: "Katalog", count:5, selected:true}
                , {id: "Kommentar", text: "Kommentar", count:0, selected:true}
                , {id: "Mehrsprachiges Wörterbuch", text: "Mehrsprachiges Wörterbuch", count:1, selected:true}
                , {id: "Mitgliederverzeichnis", text: "Mitgliederverzeichnis", count:2, selected:true}
                , {id: "Quelle", text: "Quelle", count:83, selected:true}
                , {id: "Reisebericht", text: "Reisebericht", count:10, selected:true}
                , {id: "Rezension", text: "Rezension", count:39, selected:true}
                , {id: "Statistik", text: "Statistik", count:2, selected:true}
                , {id: "Verzeichnis", text: "Verzeichnis", count:42, selected:true}
                , {id: "Wörterbuch", text: "Wörterbuch", count:15, selected:true}
            ]},
        {id: "vis_type", multiple: false, name: "Visualisierungstypen", type: "dropdown"
            , fields: [
                {id: "overview", text: "Überblick", selected:true}
                , {id: "timeline", text: "Zeitstrahl"}
            ]},
    ]
}

var options_linkedcat_authors = {
    dropdowns: [
        {id: "vis_type", multiple: false, name: "Visualisierungstypen", type: "dropdown"
            , fields: [
                {id: "overview", text: "Überblick", selected:true}
                , {id: "timeline", text: "Zeitstrahl"}
            ]},
    ]
}

var SearchOptions = {
    user_defined_date: false,
    init: function (tag, data, has_button) {

        var self = this;

        self.drawOptions(tag, data, has_button);

    },
    drawOptions: function (tag, data, has_button) {
        var self = this;

        if(typeof has_button === "undefined" || has_button === true) {
            var div = d3.select(tag).append('div')
                    .attr("id", "filter-btn")
                    .attr("class", "divity")

            div.append('a')
                    .attr("href", "#")
                    .attr("class", "frontend-btn")
                    .text("Weitere Optionen")
        }

        var filters = d3.select(tag).append('div')
                .attr('id', 'filters')
                .attr('class', function () {
                    if(typeof has_button === "undefined" || has_button === true) {
                        return 'divity frontend-hidden';
                    } else {
                        return 'divity';
                    } 
                })

        d3.select(tag).append('div')
                .attr('id', 'input-container')
                .attr('class', 'divity frontend-hidden')

        data.dropdowns.forEach(function (entry) {

            if (entry.type == "input") {
                var new_input = filters.insert("div", "#input-container")
                        .attr("class", entry.class)

                new_input.append("label")
                        .attr("for", entry.id)
                        .text(entry.label)
                        .style("margin-left", "8px")

                new_input.append("input")
                        .attr("id", entry.id)
                        .attr("name", entry.id)
                        .attr("type", "text")
                        .attr("size", "5")
                        .attr("value", entry.value)

            } else if (entry.type = "dropdown") {

                var new_select = filters
                        .insert('select', "#input-container")
                        .attr("id", entry.id)
                        .style("width", "350px")
                        .style("overflow", "auto")
                        .attr("class", "dropdown_multi_" + entry.id)
                        .style("vertical-align", "top")
                        .attr("name", entry.id)
                        .property("required", true);

                if (entry.multiple) {
                    new_select.attr("name", entry.id + "[]")
                    new_select.attr("multiple", "multiple")
                }

                entry.fields.forEach(function (option) {
                    var current_option = new_select
                            .append('option')
                            .attr("value", option.id)
                            .text(option.text 
                                    + ((typeof option.count !== "undefined")?(" (" + option.count + ")"):(""))
                                );

                    if (option.selected) {
                        current_option.attr("selected", "");
                    }

                    if (option.inputs != null) {
                        $('#input-container').append('<p class="selectrange">Bitte wählen Sie einen Zeitraum zwischen 1847 und 1918.</p>')
                        option.inputs.forEach(function (input) {
                            let input_container = d3.select("#input-container")
                                    .append('div').attr('class','timefield')
                                
                                input_container.append("label")
                                    .attr("for", input.id)
                                    .text(input.label)
                                    
                                input_container.append("input")
                                    .attr("id", input.id)
                                    .attr("name", input.id)
                                    .attr("class", input.class)
                                    .attr("type", "text")
                                    .attr("size", "18")
                        })
                    }
                })
            }
        })
        /*filters.append("div")
         .attr("class", "submit-btn")
         .append("a")
         .attr("id", "submit-btn")
         .attr("href", "#")
         .attr("class", "frontend-btn")
         .style("vertical-align", "middle")
         .text("Submit");

         /*d3.select(tag).append("div")
         .attr("id", "stats")
         .attr("class", "divity")
         .html("<p>Loading...</p>")*/

        $("#filter-btn").click(function () {
            $("#filters").toggleClass("frontend-hidden");
            //$("#stats").toggleClass("frontend-hidden");

            var closed = $("#filters").css("display") == "none";

            if (closed) {
                $("#input-container").css("display", "none");
            } else if (self.user_defined_date) {
                $("#input-container").css("display", "block");
            }

        });

    },
    select_multi: function (dropdown_class, entity) {

        var self = this;

        $(function () {
            $(dropdown_class).multiselect({
                allSelectedText: entity
                , nonSelectedText: '0 ' + entity
                , nSelectedText: entity
                , numberDisplayed: 1
                , maxHeight: 250
                , includeSelectAllOption: true
                , selectAllText: "Alle auswählen"
                , onChange: function (element, checked) {
                    if (checked === true) {

                        if (element.val() !== "user-defined") {
                            self.user_defined_date = false;
                            d3.select("#input-container").style("display", "none");
                        } else {
                            self.user_defined_date = true;
                            d3.select("#input-container").style("display", "block");
                        }

                        self.setDateRangeFromPreset("#from", "#to", element.val());
                    }
                }
            });

        })
    },
    setDateRangeFromPreset: function (from, to, val, start_date) {
	var start = new Date();
        var end = new Date();
        end.setYear(1918)

        switch (val) {

            case "user-defined":
                self.user_defined_date = true;
                d3.select("#input-container").style("display", "block");
                break;

            //full date
            case "any-time":
                if(typeof start_date === "undefined") {
                    start.setTime(0);
                } else {
                    start.setTime(Date.parse(start_date))
                }
                this.setDateFields(from, to, start, end);
                break;

            case "last-month":
                start.setMonth(end.getMonth() - 1);
                this.setDateFields(from, to, start, end);
                break;

            case "last-year":
                start.setFullYear(end.getFullYear() - 1);
                this.setDateFields(from, to, start, end);
                break;

            //years only
            case "any-time-years":
                if(typeof start_date === "undefined") {
                    $(from).val("1847");
                } else {
                    $(from).val(start_date);
                }
                $(to).val(end.getFullYear());
                $(from).attr("min", start_date)
                $(from).attr("max", end.getFullYear())
                $(to).attr("min", start_date)
                $(to).attr("max", end.getFullYear())
                break;

            case "this-year":
                $(from).val(end.getFullYear());
                $(to).val(end.getFullYear());
                break;

            case "last-year-years":
                $(from).val(end.getFullYear() - 1);
                $(to).val(end.getFullYear() - 1);
                break;

            default:
                break;
        }
    },
    setDateFields: function (from, to, start, end) {
        Date.prototype.yyyymmdd = function () {
            var yyyy = this.getFullYear().toString();
            var mm = (this.getMonth() + 1).toString(); // getMonth() is zero-based
            var dd = this.getDate().toString();
            return yyyy + "-" + (mm[1] ? mm : "0" + mm[0]) + "-" + (dd[1] ? dd : "0" + dd[0]); // padding
        };

        $(from).datepicker("setDate", start);
        $(to).datepicker("setDate", end);
    },
    initDateFields: function (from, to) {
        setDateFields(from, to);
    },
    addDatePickerFromTo: function (from, to, init_time_range, start_date) {

        var self = this;

        $(function () {
            $(from).datepicker({
                changeMonth: true,
                numberOfMonths: 3,
                dateFormat: 'yy-mm-dd',
                onClose: function (selectedDate) {
                    $(to).datepicker("option", "minDate", selectedDate);
                }
            });
            $(to).datepicker({
                changeMonth: true,
                numberOfMonths: 3,
                dateFormat: 'yy-mm-dd',
                onClose: function (selectedDate) {
                    $(from).datepicker("option", "maxDate", selectedDate);
                }
            });

            self.setDateRangeFromPreset("#from", "#to", init_time_range, start_date);

        });
    }
};
