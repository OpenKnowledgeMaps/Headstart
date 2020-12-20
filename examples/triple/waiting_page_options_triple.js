const waiting_page_texts = {
    longer_than_expected_text: 'Creating your visualization takes longer than expected. Please stay tuned!'
    , waiting_title: 'Your knowledge map on <strong id="search_term"></strong> is being created!'
    , status_waiting: 'Please be patient, this takes around 20 seconds.<br>While you are waiting, find out how the knowledge map is being created below.'
    , try_again_title: 'Have another try!'
}

const error_texts = {
    not_enough_results: {
        title: "Sorry! We could not create a knowledge map."
        , reason: 'Most likely there were not enough results for <strong id="search_term_fail"></strong> with the selected search options.'
        , remedy: "<strong>Here are some tips to improve your query:</strong>"
        , more_info: 'Alternatively you can <a class="underline" id="more-info-link_na" target="_blank">check out results for your search query on <span id="more-info-link_service"></span></a>. For more information about our service please <a class="underline" href="https://openknowledgemaps.org/faq">see our FAQs</a>.'
        , contact: 'If you think that there is something wrong with our service, please let us know at <a class="underline" href="mailto:info@openknowledgemaps.org">info@openknowledgemaps.org</a>. Please include the search query in your message.'
        , "resolution": "Try again"
        , "resolution_link": "index.php"
    },
    connection_error: {
        title: "Connection lost"
        , reason: "It seems that your Internet is unavailable or the connection was reset."
        , remedy: 'Please check your Internet settings and try again by <a class="underline" style="cursor:pointer" onClick="window.location.reload();">refreshing this page</a>.'
        , "resolution": "Refresh this page"
        , "resolution_link": "javascript:location.reload()"

    },
    server_error: {
        title: "Whoops! An unexpected error occurred."
        , reason: 'Unfortunately we don’t know what went wrong. We apologize for the inconvenience. Please <a class="underline" href="index.php">try again</a> in a few minutes.'
        , remedy: 'If the error persists, please let us know at <a class="underline" href="mailto:info@openknowledgemaps.org">info@openknowledgemaps.org</a>. We will investigate the issue further.'
        , "resolution": "Try again"
        , "resolution_link": "index"

    },
    no_post_data: {
        title: "Ooops! You should not be here..."
        , reason: 'We apologize for this slight detour. You will be redirected to <a class="underline" href="index">our search page</a> in 10 seconds.'
        , contact: 'For more information about our service please <a class="underline" href="https://openknowledgemaps.org/faq">see our FAQs</a>. If you think that there is something wrong with our service, please let us know at <a class="underline" href="mailto:info@openknowledgemaps.org">info@openknowledgemaps.org</a>'
        , "resolution": "Go to search page"
        , "resolution_link": "index"

    },
    timeout: {
        title: "We didn't anticipate this taking so long - unfortunately your request timed out."
        , reason: "It might be that too many people are currently creating knowledge maps. You may also have lost your Internet connection."
        , remedy: 'In any case, we recommend to check your Internet settings and try again by <a class="underline" style="cursor:pointer" onClick="window.location.reload();">refreshing this page</a>.'
        , contact: 'For more information about our service please <a class="underline" href="https://openknowledgemaps.org/faq">see our FAQs</a>. If you think that there is something wrong with our service, please let us know at <a class="underline" href="mailto:info@openknowledgemaps.org">info@openknowledgemaps.org</a>'
        , "resolution": "Refresh this page"
        , "resolution_link": "javascript:location.reload()"

    },
    pubmed_api_fail: {
        title: "An unexpected error occurred while retrieving data from PubMed"
        , reason: "The PubMed API is currently experiencing problems. We have logged the error and will investigate the issue."
        , remedy: 'Please <a class="underline" style="cursor:pointer" onClick="window.location.reload();">try again</a> in a few minutes or <a class="underline" style="cursor:pointer" href="index">use the BASE integration</a>, which also covers the articles indexed in PubMed.'
        , contact: 'For more information about our service please <a class="underline" href="https://openknowledgemaps.org/faq">see our FAQs</a>. If you think that there is something wrong with our service, please let us know at <a class="underline" href="mailto:info@openknowledgemaps.org">info@openknowledgemaps.org</a>'
        , "resolution": "Try again"
        , "resolution_link": "javascript:location.reload()"

    },
}

//Set JavaScript values influenced by PHP & error code translations
const error_code_translation = {
            'timeframe too short': 'Increase the custom time range'
            , 'query length': 'Try a shorter query'
            , 'too specific': 'Try keywords instead of long phrases'
            , 'typo': 'Check if you have a typo in your query'
};

const error_always_add = [
    'typo'
];

const add_not_enough_results_links = true;


