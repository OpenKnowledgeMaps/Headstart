var options_openaire = {
    dropdowns: [
        /*{id: "year_range", multiple: false, name: "Start year", type: "dropdown"
            , fields: [
                {id: "any-time-years", text: "Any time"}
                , {id: "this-year", text: "This year"}
                , {id: "last-year-years", text: "Last year"}
                , {id: "user-defined", text: "Custom range", class: "user-defined",
                    inputs: [
                        {id: "from", label: "From: ", class: "time_input"}
                        , {id: "to", label: "To: ", class: "time_input"}
                    ]}
            ]},*/
        {id: "funders", multiple: false, name: "Funders", type: "dropdown"
            , fields: [
                {id: "all", text: "All funders"}
                , {id: "ec", text: "EC - European Commission", selected: true}
                , {id: "arc", text: "ARC - Australian Research Council"}
                , {id: "hrzz", text: "CSF - Croatian Science Foundation"}
                , {id: "fct", text: "FCT - Fundação para a Ciência e a Tecnologia, I.P."}
                , {id: "fwf", text: "FWF - Austrian Science Fund"}
                , {id: "mestd", text: "MESTD - Ministry of Education, Science and Technological Development of Republic of Serbia"}
                , {id: "mzos", text: "MSES - Ministry of Science, Education and Sports of the Republic of Croatia"}               
                , {id: "nhmrc", text: "NHRMC - National Health and Medical Research Council"}
                , {id: "nih", text: "NIH - National Institutes of Health"}
                , {id: "nsf", text: "NSF - National Science Foundation"}
                , {id: "nwo", text: "NWO - Netherlands Organisation for Scientific Research"}        
                , {id: "rcuk", text: "RCUK - Research Council UK"}
                , {id: "sfi", text: "SFI - Science Foundation Ireland"}                
                , {id: "snsf", text: "SNSF - Swiss National Science Foundation"}
                , {id: "tubitak", text: "TUBITAK - Türkiye Bilimsel ve Teknolojik Araştırma Kurumu"}                
                , {id: "wt", text: "WT - Wellcome Trust"}                
            ]}
    ]}


var SearchOptions = {
    user_defined_date: false,
    init: function (tag, data) {

        var self = this;

        self.drawOptions(tag, data);

    },
    drawOptions: function (tag, data) {
        var self = this;

        var div = d3.select(tag).append('div')
                .attr("id", "filter-btn")
                .attr("class", "divity")

        div.append('a')
                .attr("class", "pointer refine-search")
                .text("Select a funding agency ")
                .append('span')
                .attr("class", "awesome")
                .text("")

        var filters = d3.select(tag).append('div')
                .attr('id', 'filters')
                .attr('class', 'divity frontend-hidden')

        d3.select(tag).append('div')
                .attr('id', 'input-container')
                .attr('class', 'divity frontend-hidden')

        data.dropdowns.forEach(function (entry) {
            
            if(entry.hasOwnProperty("display") && entry.display === "none") {
                return;
            }

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

                if (entry.multiple) {
                    new_select.attr("name", entry.id + "[]")
                    new_select.attr("multiple", "multiple")
                }

                entry.fields.forEach(function (option) {
                    var current_option = new_select
                            .append('option')
                            .attr("value", option.id)
                            .text(option.text);

                    if (option.selected) {
                        current_option.attr("selected", "");
                    }

                    if (option.inputs != null) {
                        option.inputs.forEach(function (input) {
                            d3.select("#input-container")
                                    .append("label")
                                    .attr("for", input.id)
                                    .text(input.label)
                                    .style("margin-right", "8px")

                            d3.select("#input-container")
                                    .append("input")
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
    select_multi: function (dropdown_class, entity, width, data) {

        var self = this;

        $(function () {
            $(dropdown_class).multiselect({
                allSelectedText: "All " + entity
                , nonSelectedText: "No " + entity
                , nSelectedText: entity
                , buttonWidth: width
                , numberDisplayed: 2
                , maxHeight: 250
                , includeSelectAllOption: true
                , onChange: function (element, checked) {
                    if (checked === true) {

                        if (element.val() !== "user-defined") {
                            self.user_defined_date = false;
                            d3.select("#input-container").style("display", "none");
                        } else {
                            self.user_defined_date = true;
                            d3.select("#input-container").style("display", "block");
                        }

                        self.setDateRangeFromPreset("#from", "#to", element.val(), data.start_date);
                    }
                }
            });

        })
    },
    setDateRangeFromPreset: function (from, to, val, start_date) {
        var current_date = new Date();
        var current_year = current_date.getFullYear();
        
        var start = new Date();
        var end = new Date();
        
        //set ranges for date picker
        var start_date_object = new Date(start_date);
        var start_year = start_date_object.getFullYear();
        var range = start_year + ":" + current_year;
        $(from).datepicker("option", "yearRange", range);
        $(to).datepicker("option", "yearRange", range);
        
        switch (val) {

            case "user-defined":
                self.user_defined_date = true;
                d3.select("#input-container").style("display", "block");
                break;

                //full date
            case "any-time":
                start.setTime(Date.parse(start_date));
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
                $(from).val(start_date);
                $(to).val(current_year);
                break;

            case "this-year":
                $(from).val(current_year);
                $(to).val(current_year);
                break;

            case "last-year-years":
                $(from).val(current_year - 1);
                $(to).val(current_year - 1);
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
                changeYear: true,
                numberOfMonths: 1,
                dateFormat: 'yy-mm-dd',
                onChangeMonthYear:function(y, m, i){                                
                    var d = i.selectedDay;
                    $(this).datepicker('setDate', new Date(y, m - 1, d));
                },
                firstDay: 1
            });
            $(to).datepicker({
                changeMonth: true,
                changeYear: true,
                numberOfMonths: 1,
                dateFormat: 'yy-mm-dd',
                onChangeMonthYear:function(y, m, i){                                
                    var d = i.selectedDay;
                    $(this).datepicker('setDate', new Date(y, m - 1, d));
                },
                firstDay: 1
            });

            self.setDateRangeFromPreset("#from", "#to", init_time_range, start_date);

        });
    }
};