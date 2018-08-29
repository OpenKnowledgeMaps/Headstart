var options_plos = {
  dropdowns: [
    {
      id: 'time_range',
      multiple: false,
      name: 'Time Range',
      type: 'dropdown',
      fields: [
        { id: 'any-time', text: 'Any time' },
        { id: 'last-month', text: 'Last month' },
        { id: 'last-year', text: 'Last year' },
        {
          id: 'user-defined',
          text: 'Custom range',
          class: 'user-defined',
          inputs: [
            { id: 'from', label: 'From: ', class: 'time_input' },
            { id: 'to', label: 'To: ', class: 'time_input' }
          ]
        }
      ]
    },
    {
      id: 'sorting',
      multiple: false,
      name: 'Sorting',
      type: 'dropdown',
      fields: [
        { id: 'most-relevant', text: 'Most relevant' },
        { id: 'most-recent', text: 'Most recent' }
      ]
    },
    {
      id: 'article_types',
      multiple: true,
      name: 'Article types',
      type: 'dropdown',
      fields: [
        { id: 'Research Article', text: 'Research Article', selected: true },
        { id: 'Review', text: 'Review', selected: true },
        { id: 'Best Practice', text: 'Best Practice', selected: true },
        { id: 'Book Review', text: 'Book Review', selected: true },
        {
          id: 'Book Review/Science in the Media',
          text: 'Book Review/Science in the Media',
          selected: true
        },
        { id: 'Case Report', text: 'Case Report', selected: true },
        { id: 'Collection Review', text: 'Collection Review', selected: true },
        { id: 'Community Page', text: 'Community Page', selected: true },
        { id: 'Correction', text: 'Correction', selected: false },
        { id: 'Correspondence', text: 'Correspondence', selected: true },
        {
          id: 'Correspondence and Other Communications',
          text: 'Correspondence and Other Communications',
          selected: true
        },
        { id: 'Deep Reads', text: 'Deep Reads', selected: true },
        { id: 'Editorial', text: 'Editorial', selected: true },
        { id: 'Education', text: 'Education', selected: true },
        { id: 'Essay', text: 'Essay', selected: true },
        { id: 'Expert Commentary', text: 'Expert Commentary', selected: true },
        {
          id: 'Expression of Concern',
          text: 'Expression of Concern',
          selected: true
        },
        { id: 'Feature', text: 'Feature', selected: true },
        { id: 'Formal Comment', text: 'Formal Comment', selected: true },
        {
          id: 'From Innovation to Application',
          text: 'From Innovation to Application',
          selected: true
        },
        {
          id: 'Guidelines and Guidance',
          text: 'Guidelines and Guidance',
          selected: true
        },
        { id: 'Health in Action', text: 'Health in Action', selected: true },
        {
          id: 'Historical and Philosophical Perspectives',
          text: 'Historical and Philosophical Perspectives',
          selected: true
        },
        {
          id: 'Historical Profiles and Perspectives',
          text: 'Historical Profiles and Perspectives',
          selected: true
        },
        { id: 'Interview', text: 'Interview', selected: true },
        { id: 'Journal Club', text: 'Journal Club', selected: true },
        { id: 'Learning Forum ', text: 'Learning Forum ', selected: true },
        { id: 'Message from ISCB', text: 'Message from ISCB', selected: true },
        {
          id: 'Neglected Diseases',
          text: 'Neglected Diseases',
          selected: true
        },
        { id: 'Obituary', text: 'Obituary', selected: true },
        { id: 'Opinion', text: 'Opinion', selected: true },
        { id: 'Overview', text: 'Overview', selected: true },
        { id: 'Pearls', text: 'Pearls', selected: true },
        { id: 'Perspective', text: 'Perspective', selected: true },
        { id: 'Photo Quiz', text: 'Photo Quiz', selected: false },
        { id: 'Policy Forum', text: 'Policy Forum', selected: true },
        { id: 'Policy Platform', text: 'Policy Platform', selected: true },
        { id: 'Primer', text: 'Primer', selected: true },
        { id: 'Quiz', text: 'Quiz', selected: false },
        {
          id: 'Research in Translation',
          text: 'Research in Translation',
          selected: true
        },
        { id: 'Research Matters', text: 'Research Matters', selected: true },
        { id: 'Retraction', text: 'Retraction', selected: false },
        { id: 'Special Report', text: 'Special Report', selected: true },
        { id: 'Student Forum', text: 'Student Forum', selected: true },
        { id: 'Symposium', text: 'Symposium', selected: true },
        { id: 'Synopsis', text: 'Synopsis', selected: false },
        {
          id: 'The PLoS Medicine Debate',
          text: 'The PLoS Medicine Debate',
          selected: true
        },
        { id: 'Topic Page', text: 'Topic Page', selected: true },
        { id: 'Unsolved Mystery', text: 'Unsolved Mystery', selected: true },
        { id: 'Viewpoints ', text: 'Viewpoints ', selected: true }
      ]
    },
    ,
    {
      id: 'journals',
      multiple: true,
      name: 'Journals',
      type: 'dropdown',
      fields: [
        { id: 'PLoSONE', text: 'PLOS ONE', selected: true },
        { id: 'PLoSGenetics', text: 'PLOS Genetics', selected: true },
        { id: 'PLoSPathogens', text: 'PLOS Pathogens', selected: true },
        {
          id: 'PLoSCompBiol',
          text: 'PLOS Computational Biology',
          selected: true
        },
        {
          id: 'PLoSNTD',
          text: 'PLOS Neglected Tropical Diseases',
          selected: true
        },
        { id: 'PLoSBiology', text: 'PLOS Biology', selected: true },
        { id: 'PLoSMedicine', text: 'PLOS Medicine', selected: true },
        {
          id: 'PLoSClinicalTrials',
          text: 'PLOS Hub for Clinical Trials',
          selected: true
        }
      ]
    }
  ]
};

var options_core = {
  dropdowns: [
    {
      id: 'year_range',
      multiple: false,
      name: 'Time Range',
      type: 'dropdown',
      fields: [
        { id: 'any-time-years', text: 'Any time' },
        { id: 'this-year', text: 'This year' },
        { id: 'last-year-years', text: 'Last year' },
        {
          id: 'user-defined',
          text: 'Custom range',
          class: 'user-defined',
          inputs: [
            { id: 'from', label: 'From: ', class: 'time_input' },
            { id: 'to', label: 'To: ', class: 'time_input' }
          ]
        }
      ]
    },
    {
      id: 'language_id',
      multiple: false,
      name: 'Languages',
      type: 'dropdown',
      fields: [
        { id: 'all', text: 'All', selected: true },
        { id: 'af', text: 'Afrikaans', selected: false },
        { id: 'sq', text: 'Albanian', selected: false },
        { id: 'ar', text: 'Arabic', selected: false },
        { id: 'bn', text: 'Bengali', selected: false },
        { id: 'bg', text: 'Bulgarian', selected: false },
        { id: 'zh-c', text: 'Chinese (Simplified)', selected: false },
        { id: 'zh-t', text: 'Chinese (Traditional)', selected: false },
        { id: 'hr', text: 'Croatian', selected: false },
        { id: 'cs', text: 'Czech', selected: false },
        { id: 'da', text: 'Danish', selected: false },
        { id: 'nl', text: 'Dutch', selected: false },
        { id: 'en', text: 'English', selected: false },
        { id: 'et', text: 'Estonian', selected: false },
        { id: 'fi', text: 'Finnish', selected: false },
        { id: 'fr', text: 'French', selected: false },
        { id: 'de', text: 'German', selected: false },
        { id: 'el', text: 'Greek', selected: false },
        { id: 'gu', text: 'Gujarati', selected: false },
        { id: 'he', text: 'Hebrew', selected: false },
        { id: 'hi', text: 'Hindi', selected: false },
        { id: 'hu', text: 'Hungarian', selected: false },
        { id: 'id', text: 'Indonesian', selected: false },
        { id: 'it', text: 'Italian', selected: false },
        { id: 'ja', text: 'Japanese', selected: false },
        { id: 'kn', text: 'Kannada', selected: false },
        { id: 'ko', text: 'Korean', selected: false },
        { id: 'lv', text: 'Latvian', selected: false },
        { id: 'lt', text: 'Lithuanian', selected: false },
        { id: 'mk', text: 'Macedonian', selected: false },
        { id: 'ml', text: 'Malayalam', selected: false },
        { id: 'mr', text: 'Marathi', selected: false },
        { id: 'ne', text: 'Nepali', selected: false },
        { id: 'no', text: 'Norwegian', selected: false },
        { id: 'fa', text: 'Persian', selected: false },
        { id: 'pl', text: 'Polish', selected: false },
        { id: 'pt', text: 'Portuguese', selected: false },
        { id: 'pa', text: 'Punjabi', selected: false },
        { id: 'ro', text: 'Romanian', selected: false },
        { id: 'ru', text: 'Russian', selected: false },
        { id: 'sk', text: 'Slovak', selected: false },
        { id: 'sl', text: 'Slovene', selected: false },
        { id: 'so', text: 'Somali', selected: false },
        { id: 'es', text: 'Spanish', selected: false },
        { id: 'sw', text: 'Swahili', selected: false },
        { id: 'sv', text: 'Swedish', selected: false },
        { id: 'tl', text: 'Tagalog', selected: false },
        { id: 'ta', text: 'Tamil', selected: false },
        { id: 'te', text: 'Telugu', selected: false },
        { id: 'th', text: 'Thai', selected: false },
        { id: 'tr', text: 'Turkish', selected: false },
        { id: 'uk', text: 'Ukrainian', selected: false },
        { id: 'ur', text: 'Urdu', selected: false },
        { id: 'vi', text: 'Vietnamese', selected: false }
      ]
    }
  ]
};

var options_pubmed = {
  dropdowns: [
    {
      id: 'time_range',
      multiple: false,
      name: 'Time Range',
      type: 'dropdown',
      fields: [
        { id: 'any-time', text: 'Any time' },
        { id: 'last-month', text: 'Last month' },
        { id: 'last-year', text: 'Last year' },
        {
          id: 'user-defined',
          text: 'Custom range',
          class: 'user-defined',
          inputs: [
            { id: 'from', label: 'From: ', class: 'time_input' },
            { id: 'to', label: 'To: ', class: 'time_input' }
          ]
        }
      ]
    },
    {
      id: 'sorting',
      multiple: false,
      name: 'Sorting',
      type: 'dropdown',
      fields: [
        { id: 'most-relevant', text: 'Most relevant' },
        { id: 'most-recent', text: 'Most recent' }
      ]
    },
    {
      id: 'article_types',
      multiple: true,
      name: 'Article types',
      type: 'dropdown',
      fields: [
        { id: 'autobiography', text: 'Autobiography', selected: true },
        { id: 'bibliography', text: 'Bibliography', selected: true },
        { id: 'biography', text: 'Biography', selected: true },
        {
          id: 'book illustrations',
          text: 'Book Illustrations',
          selected: true
        },
        { id: 'case reports', text: 'Case Reports', selected: true },
        { id: 'classical article', text: 'Classical Article', selected: true },
        {
          id: 'clinical conference',
          text: 'Clinical Conference',
          selected: true
        },
        { id: 'clinical study', text: 'Clinical Study', selected: true },
        { id: 'clinical trial', text: 'Clinical Trial', selected: true },
        {
          id: 'clinical trial, phase i',
          text: 'Clinical Trial, Phase I',
          selected: true
        },
        {
          id: 'clinical trial, phase ii',
          text: 'Clinical Trial, Phase II',
          selected: true
        },
        {
          id: 'clinical trial, phase iii',
          text: 'Clinical Trial, Phase III',
          selected: true
        },
        {
          id: 'clinical trial, phase iv',
          text: 'Clinical Trial, Phase IV',
          selected: true
        },
        { id: 'collected works', text: 'Collected Works', selected: true },
        { id: 'comment', text: 'Comment', selected: true },
        { id: 'comparative study', text: 'Comparative Study', selected: true },
        { id: 'congresses', text: 'Congresses', selected: true },
        {
          id: 'consensus development conference',
          text: 'Consensus Development Conference',
          selected: true
        },
        {
          id: 'consensus development conference, nih',
          text: 'Consensus Development Conference, NIH',
          selected: true
        },
        {
          id: 'controlled clinical trial',
          text: 'Controlled Clinical Trial',
          selected: true
        },
        {
          id: 'corrected and republished article',
          text: 'Corrected and Republished Article',
          selected: true
        },
        { id: 'dataset', text: 'Dataset', selected: true },
        { id: 'dictionary', text: 'Dictionary', selected: true },
        { id: 'directory', text: 'Directory', selected: true },
        {
          id: 'duplicate publication',
          text: 'Duplicate publication',
          selected: true
        },
        { id: 'editorial', text: 'Editorial', selected: true },
        {
          id: 'electronic supplementary materials',
          text: 'Electronic Supplementary Materials',
          selected: true
        },
        { id: 'english abstract', text: 'English Abstract', selected: true },
        { id: 'ephemera', text: 'Ephemera', selected: true },
        {
          id: 'evaluation studies',
          text: 'Evaluation Studies',
          selected: true
        },
        { id: 'festschrift', text: 'Festschrift', selected: true },
        {
          id: 'government publications',
          text: 'Government Publications',
          selected: true
        },
        { id: 'guideline', text: 'Guideline', selected: true },
        {
          id: 'historical article',
          text: 'Historical Article',
          selected: true
        },
        {
          id: 'interactive tutorial',
          text: 'Interactive Tutorial',
          selected: true
        },
        { id: 'interview', text: 'Interview', selected: true },
        {
          id: 'introductory journal article',
          text: 'Introductory Journal Article',
          selected: true
        },
        { id: 'journal article', text: 'Journal Article', selected: true },
        { id: 'lectures', text: 'Lectures', selected: true },
        { id: 'legal cases', text: 'Legal Cases', selected: true },
        { id: 'legislation', text: 'Legislation', selected: true },
        { id: 'letter', text: 'Letter', selected: true },
        { id: 'meta analysis', text: 'Meta Analysis', selected: true },
        { id: 'multicenter study', text: 'Multicenter Study', selected: true },
        { id: 'news', text: 'News', selected: true },
        { id: 'newspaper article', text: 'Newspaper Article', selected: true },
        {
          id: 'observational study',
          text: 'Observational Study',
          selected: true
        },
        { id: 'overall', text: 'Overall', selected: true },
        {
          id: 'patient education handout',
          text: 'Patient Education Handout',
          selected: true
        },
        { id: 'periodical index', text: 'Periodical Index', selected: true },
        {
          id: 'personal narratives',
          text: 'Personal Narratives',
          selected: true
        },
        { id: 'pictorial works', text: 'Pictorial Works', selected: true },
        { id: 'popular works', text: 'Popular Works', selected: true },
        { id: 'portraits', text: 'Portraits', selected: true },
        {
          id: 'practice guideline',
          text: 'Practice Guideline',
          selected: true
        },
        {
          id: 'pragmatic clinical trial',
          text: 'Pragmatic Clinical Trial',
          selected: true
        },
        {
          id: 'publication components',
          text: 'Publication Components',
          selected: true
        },
        {
          id: 'publication formats',
          text: 'Publication Formats',
          selected: true
        },
        {
          id: 'publication type category',
          text: 'Publication Type Category',
          selected: true
        },
        { id: 'published erratum', text: 'Published Erratum', selected: true },
        {
          id: 'randomized controlled trial',
          text: 'Randomized Controlled Trial',
          selected: true
        },
        {
          id: 'research support, american recovery and reinvestment act',
          text: 'Research Support, American Recovery and Reinvestment Act',
          selected: true
        },
        {
          id: 'research support, n i h, extramural',
          text: 'Research Support, NIH Extramural',
          selected: true
        },
        {
          id: 'research support, n i h, intramural',
          text: 'Research Support, NIH Intramural',
          selected: true
        },
        {
          id: "research support, non u s gov't",
          text: "Research Support, U.S. Gov't",
          selected: true
        },
        {
          id: "research support, u s gov't, non p h s",
          text: "Research Support, U.S. Gov't, Non P.H.S",
          selected: true
        },
        {
          id: "research support, u s gov't, p h s",
          text: "Research Support, U.S. Gov't, P.H.S",
          selected: true
        },
        {
          id: 'research support, u s government',
          text: 'Research Support, U.S. Government',
          selected: true
        },
        {
          id: 'retracted publication',
          text: 'Retracted Publication',
          selected: true
        },
        {
          id: 'retraction of publication',
          text: 'Retraction of Publication',
          selected: true
        },
        { id: 'review', text: 'Review', selected: true },
        {
          id: 'scientific integrity review',
          text: 'Scientific Integrity Review',
          selected: true
        },
        {
          id: 'study characteristics',
          text: 'Study Characteristics',
          selected: true
        },
        {
          id: 'support of research',
          text: 'Support of Research',
          selected: true
        },
        { id: 'technical report', text: 'Technical Report', selected: true },
        { id: 'twin study', text: 'Twin Study', selected: true },
        {
          id: 'validation studies',
          text: 'Validation Studies',
          selected: true
        },
        { id: 'video audio media', text: 'Video Audio Media', selected: true },
        { id: 'webcasts', text: 'Webcasts', selected: true }
      ]
    }
  ]
};

var options_doaj = {
  dropdowns: [
    {
      id: 'year_range',
      multiple: false,
      name: 'Time Range',
      type: 'dropdown',
      fields: [
        { id: 'any-time-years', text: 'Any time' },
        { id: 'this-year', text: 'This year' },
        { id: 'last-year-years', text: 'Last year' },
        {
          id: 'user-defined',
          text: 'Custom range',
          class: 'user-defined',
          inputs: [
            { id: 'from', label: 'From: ', class: 'time_input' },
            { id: 'to', label: 'To: ', class: 'time_input' }
          ]
        }
      ]
    },
    {
      id: 'sorting',
      multiple: false,
      name: 'Sorting',
      type: 'dropdown',
      fields: [
        { id: 'most-relevant', text: 'Most relevant' },
        { id: 'most-recent', text: 'Most recent' }
      ]
    }
  ]
};

var options_base = {
  dropdowns: [
    {
      id: 'time_range',
      multiple: false,
      name: 'Time Range',
      type: 'dropdown',
      fields: [
        { id: 'any-time', text: 'Any time' },
        { id: 'last-month', text: 'Last month' },
        { id: 'last-year', text: 'Last year' },
        {
          id: 'user-defined',
          text: 'Custom range',
          class: 'user-defined',
          inputs: [
            { id: 'from', label: 'From: ', class: 'time_input' },
            { id: 'to', label: 'To: ', class: 'time_input' }
          ]
        }
      ]
    },
    {
      id: 'sorting',
      multiple: false,
      name: 'Sorting',
      type: 'dropdown',
      fields: [
        { id: 'most-relevant', text: 'Most relevant' },
        { id: 'most-recent', text: 'Most recent' }
      ]
    },
    {
      id: 'document_types',
      multiple: true,
      name: 'Document types',
      type: 'dropdown',
      fields: [
        { id: '4', text: 'Audio', selected: false },
        { id: '11', text: 'Book', selected: false },
        { id: '111', text: 'Book part', selected: false },
        { id: '13', text: 'Conference object', selected: false },
        { id: '16', text: 'Course material', selected: false },
        { id: '7', text: 'Dataset', selected: false },
        { id: '5', text: 'Image/video', selected: false },
        { id: '121', text: 'Journal/newspaper article', selected: true },
        { id: '122', text: 'Journal/newspaper other content', selected: false },
        { id: '17', text: 'Lecture', selected: false },
        { id: '19', text: 'Manuscript', selected: false },
        { id: '3', text: 'Map', selected: false },
        { id: '2', text: 'Musical notation', selected: false },
        { id: 'F', text: 'Other/Unknown material', selected: false },
        { id: '1A', text: 'Patent', selected: false },
        { id: '14', text: 'Report', selected: false },
        { id: '15', text: 'Review', selected: false },
        { id: '6', text: 'Software', selected: false },
        { id: '51', text: 'Still image', selected: false },
        { id: '1', text: 'Text', selected: false },
        { id: '181', text: 'Thesis: bachelor', selected: false },
        {
          id: '183',
          text: 'Thesis: doctoral and postdoctoral',
          selected: false
        },
        { id: '182', text: 'Thesis: master', selected: false },
        { id: '52', text: 'Video/moving image', selected: false }
      ]
    }
  ]
};

var SearchOptions = {
  user_defined_date: false,
  init: function(tag, data) {
    var self = this;

    self.drawOptions(tag, data);
  },
  drawOptions: function(tag, data) {
    var self = this;

    var div = d3
      .select(tag)
      .append('div')
      .attr('id', 'filter-btn')
      .attr('class', 'divity');

    div
      .append('a')
      .attr('href', '#')
      .attr('class', 'frontend-btn')
      .text('Options');

    var filters = d3
      .select(tag)
      .append('div')
      .attr('id', 'filters')
      .attr('class', 'divity frontend-hidden');

    d3
      .select(tag)
      .append('div')
      .attr('id', 'input-container')
      .attr('class', 'divity frontend-hidden');

    data.dropdowns.forEach(function(entry) {
      if (entry.type == 'input') {
        var new_input = filters
          .insert('div', '#input-container')
          .attr('class', entry.class);

        new_input
          .append('label')
          .attr('for', entry.id)
          .text(entry.label)
          .style('margin-left', '8px');

        new_input
          .append('input')
          .attr('id', entry.id)
          .attr('name', entry.id)
          .attr('type', 'text')
          .attr('size', '5')
          .attr('value', entry.value);
      } else if ((entry.type = 'dropdown')) {
        var new_select = filters
          .insert('select', '#input-container')
          .attr('id', entry.id)
          .style('width', '350px')
          .style('overflow', 'auto')
          .attr('class', 'dropdown_multi_' + entry.id)
          .style('vertical-align', 'top')
          .attr('name', entry.id);

        if (entry.multiple) {
          new_select.attr('name', entry.id + '[]');
          new_select.attr('multiple', 'multiple');
        }

        entry.fields.forEach(function(option) {
          var current_option = new_select
            .append('option')
            .attr('value', option.id)
            .text(option.text);

          if (option.selected) {
            current_option.attr('selected', '');
          }

          if (option.inputs != null) {
            option.inputs.forEach(function(input) {
              d3
                .select('#input-container')
                .append('label')
                .attr('for', input.id)
                .text(input.label)
                .style('margin-left', '8px');

              d3
                .select('#input-container')
                .append('input')
                .attr('id', input.id)
                .attr('name', input.id)
                .attr('class', input.class)
                .attr('type', 'text')
                .attr('size', '18');
            });
          }
        });
      }
    });
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

    $('#filter-btn').click(function() {
      $('#filters').toggleClass('frontend-hidden');
      //$("#stats").toggleClass("frontend-hidden");

      var closed = $('#filters').css('display') == 'none';

      if (closed) {
        $('#input-container').css('display', 'none');
      } else if (self.user_defined_date) {
        $('#input-container').css('display', 'block');
      }
    });
  },
  select_multi: function(dropdown_class, entity) {
    var self = this;

    $(function() {
      $(dropdown_class).multiselect({
        allSelectedText: 'All ' + entity,
        nonSelectedText: 'No ' + entity,
        nSelectedText: entity,
        buttonWidth: '150px',
        numberDisplayed: 2,
        maxHeight: 250,
        includeSelectAllOption: true,
        onChange: function(element, checked) {
          if (checked === true) {
            if (element.val() !== 'user-defined') {
              self.user_defined_date = false;
              d3.select('#input-container').style('display', 'none');
            } else {
              self.user_defined_date = true;
              d3.select('#input-container').style('display', 'block');
            }

            self.setDateRangeFromPreset('#from', '#to', element.val());
          }
        }
      });
    });
  },
  setDateRangeFromPreset: function(from, to, val, start_date) {
    var current_date = new Date();
    var current_year = current_date.getFullYear();

    var start = new Date();
    var end = new Date();
    end.setHours(start.getHours() + start.getTimezoneOffset() / 60 * -1);

    switch (val) {
      case 'user-defined':
        self.user_defined_date = true;
        d3.select('#input-container').style('display', 'block');
        break;

      //full date
      case 'any-time':
        if (typeof start_date === 'undefined') {
          start.setTime(0);
        } else {
          start.setTime(Date.parse(start_date));
        }
        this.setDateFields(from, to, start, end);
        break;

      case 'last-month':
        start.setMonth(end.getMonth() - 1);
        this.setDateFields(from, to, start, end);
        break;

      case 'last-year':
        start.setFullYear(end.getFullYear() - 1);
        this.setDateFields(from, to, start, end);
        break;

      //years only
      case 'any-time-years':
        if (typeof start_date === 'undefined') {
          $(from).val('1809');
        } else {
          $(from).val(start_date);
        }
        $(to).val(current_year);
        break;

      case 'this-year':
        $(from).val(current_year);
        $(to).val(current_year);
        break;

      case 'last-year-years':
        $(from).val(current_year - 1);
        $(to).val(current_year - 1);
        break;

      default:
        break;
    }
  },
  setDateFields: function(from, to, start, end) {
    Date.prototype.yyyymmdd = function() {
      var yyyy = this.getFullYear().toString();
      var mm = (this.getMonth() + 1).toString(); // getMonth() is zero-based
      var dd = this.getDate().toString();
      return (
        yyyy +
        '-' +
        (mm[1] ? mm : '0' + mm[0]) +
        '-' +
        (dd[1] ? dd : '0' + dd[0])
      ); // padding
    };

    $(from).datepicker('setDate', start);
    $(to).datepicker('setDate', end);
  },
  initDateFields: function(from, to) {
    setDateFields(from, to);
  },
  addDatePickerFromTo: function(from, to, init_time_range, start_date) {
    var self = this;

    $(function() {
      $(from).datepicker({
        changeMonth: true,
        numberOfMonths: 3,
        dateFormat: 'yy-mm-dd',
        onClose: function(selectedDate) {
          $(to).datepicker('option', 'minDate', selectedDate);
        }
      });
      $(to).datepicker({
        changeMonth: true,
        numberOfMonths: 3,
        dateFormat: 'yy-mm-dd',
        onClose: function(selectedDate) {
          $(from).datepicker('option', 'maxDate', selectedDate);
        }
      });

      self.setDateRangeFromPreset('#from', '#to', init_time_range, start_date);
    });
  }
};
