"""
Tests for the doi_title_filter function.

The function signature is:
    doi_title_filter(anchor_title: str, candidate_title: str) -> bool

Returns True  → titles refer to the same paper (keep candidate)
Returns False → titles are genuinely different papers (filter candidate out)

Tests include known test cases of false negatives which should be filtered out.
Tests include test cases of benign pairs extracted from real container logs. None of themshould be filtered out.

Patterns observed:
- Exact matches (ratio 100): identical titles from different repository records
- Near-matches (90–99): trailing period, trailing/leading whitespace, Unicode vs
  ASCII punctuation (curly vs straight quote)
- Journal-prefix prepended (65–89): one version carries "Journal Name / Title",
  the other carries only "Title": caught by substring matching after lowercasing
- ALL-CAPS vs title-case (23–36): very short titles; case-insensitive comparison
  resolves these
"""

import pytest
from common.deduplication import doi_title_filter


# ---------------------------------------------------------------------------
# Parametrize helpers
# ---------------------------------------------------------------------------

def _case(anchor, candidate, doi=""):
    return pytest.param(anchor, candidate, id=doi or f"{anchor[:40]}…")


# ---------------------------------------------------------------------------
# Ratio ~100: identical titles, different repository records
# ---------------------------------------------------------------------------

EXACT_CASES = [
    _case(
        "Crosstalk in concurrent repeated games impedes direct reciprocity and requires stronger levels of forgiveness",
        "Crosstalk in concurrent repeated games impedes direct reciprocity and requires stronger levels of forgiveness",
        "10.1038/s41467-017-02721-8",
    ),
    _case(
        "Enhancing satellite-based emergency mapping: Identifying wildfires through geo-social media analysis",
        "Enhancing satellite-based emergency mapping: Identifying wildfires through geo-social media analysis",
        "10.1080/20964471.2025.2454526",
    ),
    _case(
        "Les fondements scientifiques et métaphysiques du monisme haeckelien",
        "Les fondements scientifiques et métaphysiques du monisme haeckelien",
        "10.1163/19552343-1009596005",
    ),
    _case(
        "Introspection dynamics: a simple model of counterfactual learning in asymmetric games",
        "Introspection dynamics: a simple model of counterfactual learning in asymmetric games",
        "10.1088/1367-2630/ac6f76",
    ),
    _case(
        "Maximum-entropy large-scale structures of Boolean networks optimized for criticality",
        "Maximum-entropy large-scale structures of Boolean networks optimized for criticality",
        "10.1088/1367-2630/17/4/043021",
    ),
]


@pytest.mark.parametrize("anchor,candidate", EXACT_CASES)
def test_exact_match_not_filtered(anchor, candidate):
    assert doi_title_filter(anchor, candidate) is False


# ---------------------------------------------------------------------------
# Ratio 90–99: near-identical: trailing period, punctuation, version tag
# ---------------------------------------------------------------------------

NEAR_MATCH_CASES = [
    _case(
        "Enhanced geocoding precision for location inference of tweet text using spaCy, Nominatim and Google Maps. A comparative analysis of the influence of data selection.",
        "Enhanced geocoding precision for location inference of tweet text using spaCy, Nominatim and Google Maps. A comparative analysis of the influence of data selection",
        "10.1371/journal.pone.0282942",
    ),
    _case(
        "Exact conditions for evolutionary stability in indirect reciprocity under noise.",
        "Exact conditions for evolutionary stability in indirect reciprocity under noise",
        "10.1371/journal.pcbi.1013584",
    ),
    _case(
        "Direct reciprocity between individuals that use different strategy spaces.",
        "Direct reciprocity between individuals that use different strategy spaces",
        "10.1371/journal.pcbi.1010149",
    ),
    _case(
        "Defining discovery: Is Google Scholar a discovery platform? An essay on the need for a new approach to scholarly discovery [version 2; peer review: 2 approved]",
        "Defining discovery: Is Google Scholar a discovery platform? An essay on the need for a new approach to scholarly discovery",
        "10.12688/openreseurope.14318.2",
    ),
    _case(
        "A Diachronic Analysis of Paradigm Shifts in NLP Research: When, How, and Why?",
        "A diachronic analysis of paradigm shifts in NLP research: when, how, and why?",
        "10.18653/v1/2023.emnlp-main.142",
    ),
    _case(
        "The evolution of strategic timing in collective-risk dilemmas.",
        "The Evolution of Strategic Timing in Collective-Risk Dilemmas",
        "10.1371/journal.pone.0066490",
    ),
    _case(
        "Urban emotion sensing beyond 'affective capture': Advancing critical interdisciplinary methods",
        "Urban Emotion Sensing Beyond 'Affective Capture': Advancing Critical Interdisciplinary Methods",
        "10.3390/ijerph17239003",
    ),
]


@pytest.mark.parametrize("anchor,candidate", NEAR_MATCH_CASES)
def test_near_match_not_filtered(anchor, candidate):
    assert doi_title_filter(anchor, candidate) is False


# ---------------------------------------------------------------------------
# Ratio 65–89: journal name prepended as title prefix
# One version: "Journal Name / Paper Title"
# Other version: "Paper Title"
# Substring matching (lowercased) resolves these.
# ---------------------------------------------------------------------------

JOURNAL_PREFIX_CASES = [
    _case(
        "Assessing the spatial accuracy of geocoding flood-related imagery using Vision Language Models",
        "Spatial Information Research / Assessing the spatial accuracy of geocoding flood-related imagery using Vision Language Models",
        "10.1007/s41324-025-00609-0",
    ),
    _case(
        "Spatial Economic Analysis / Analysing the spatial manifestation of sustainability-engaged inter-firm networks in Germany, Austria and Switzerland",
        "Analysing the spatial manifestation of sustainability-engaged inter-firm networks in Germany, Austria and Switzerland",
        "10.1080/17421772.2025.2573061",
    ),
    _case(
        "Adapting mobile map application designs to map use context: a review and call for action on potential future research themes",
        "Cartography and Geographic Information Science / Adapting mobile map application designs to map use context : a review and call for action on potential future research themes",
        "10.1080/15230406.2021.2015720",
    ),
    _case(
        "Developing a Citizen Social Science approach to understand urban stress and promote wellbeing in urban communities",
        "Palgrave Communications / Developing a Citizen Social Science approach to understand urban stress and promote wellbeing in urban communities",
        "10.1057/s41599-020-0460-1",
    ),
    _case(
        "Spatial crime distribution and prediction for sporting events using social media",
        "International Journal of Geographical Information Science / Spatial crime distribution and prediction for sporting events using social media",
        "10.1080/13658816.2020.1719495",
    ),
    _case(
        "Composition of place: towards a compositional view of functional space",
        "Cartography and Geographic Information Science / Composition of place : towards a compositional view of functional space",
        "10.1080/15230406.2019.1598894",
    ),
    _case(
        "International Journal of Environmental Research and Public Health / Applying Spatial Video Geonarratives and Physiological Measurements to Explore Perceived Safety in Baton Rouge, Louisiana",
        "Applying Spatial Video Geonarratives and Physiological Measurements to Explore Perceived Safety in Baton Rouge, Louisiana",
        "10.3390/ijerph18031284",
    ),
    _case(
        "Commuter Mobility Patterns in Social Media: Correlating Twitter and LODES Data",
        "ISPRS International Journal of Geo-Information / Commuter Mobility Patterns in Social Media : Correlating Twitter and LODES Data",
        "10.3390/ijgi11010015",
    ),
    _case(
        "Sensors / Wearables and the quantified self : systematic benchmarking of physiological sensors",
        "Wearables and the Quantified Self: Systematic Benchmarking of Physiological Sensors",
        "10.3390/s19204448",
    ),
    _case(
        "PLoS ONE / Abundant topological outliers in social media data and their effect on spatial analysis",
        "Abundant Topological Outliers in Social Media Data and Their Effect on Spatial Analysis.",
        "10.1371/journal.pone.0162360",
    ),
    _case(
        "Urban Planning / Citizen-centric urban planning through extracting emotion information from Twitter in an interdisciplinary space-time-linguistics algorithm",
        "Citizen-Centric Urban Planning through Extracting Emotion Information from Twitter in an Interdisciplinary Space-Time-Linguistics Algorithm",
        "10.17645/up.v1i2.617",
    ),
    _case(
        "Urban Planning / #London2012: Towards citizen-contributed urban planning through sentiment analysis of twitter data",
        "#London2012: Towards Citizen-Contributed Urban Planning Through Sentiment Analysis of Twitter Data",
        "10.17645/up.v3i1.1287",
    ),
    _case(
        "ISPRS International Journal of Geo-Information / Geospatial analysis of the building heat demand and distribution losses in a district heating network",
        "Geospatial Analysis of the Building Heat Demand and Distribution Losses in a District Heating Network",
        "10.3390/ijgi5120219",
    ),
    _case(
        "Estimating the Spatial Distribution of Crime Events around a Football Stadium from Georeferenced Tweets",
        "ISPRS International Journal of Geo-Information / Estimating the Spatial Distribution of crime events around a football stadium from georeferenced tweets",
        "10.3390/ijgi7020043",
    ),
    _case(
        "Contextual Sensing: Integrating Contextual Information with Human and Technical Geo-Sensor Information for Smart Cities",
        "Sensors / Contextual sensing : integrating contextual information with human and technical geo-sensor information for smart cities",
        "10.3390/s150717013",
    ),
    _case(
        "Geo-spatial Information Science / Routing through open spaces : a performance comparison of algorithms",
        "Routing through open spaces – A performance comparison of algorithms",
        "10.1080/10095020.2017.1399675",
    ),
    _case(
        "Combining machine-learning topic models and spatiotemporal analysis of social media data for disaster footprint and damage assessment",
        "Cartography and Geographic Information Science / Combining machine-learning topic models and spatiotemporal analysis of social media data for disaster footprint and damage assessment",
        "10.1080/15230406.2017.1356242",
    ),
    _case(
        "Urban Planning / Investigating the emotional responses of individuals to urban green space using twitter data : a critical comparison of three different methods of sentiment analysis",
        "Investigating the Emotional Responses of Individuals to Urban Green Space Using Twitter Data: A Critical Comparison of Three Different Methods of Sentiment Analysis",
        "10.17645/up.v3i1.1231",
    ),
    _case(
        "ISPRS International Journal of Geo-Information / Analyzing and predicting micro-location patterns of software firms",
        "Analyzing and Predicting Micro-Location Patterns of Software Firms",
        "10.3390/ijgi7010001",
    ),
    _case(
        "ISPRS International Journal of Geo-Information / Beyond Spatial Proximity : Classifying Parks and Their Visitors in London Based on Spatiotemporal and Sentiment Analysis of Twitter Data",
        "Beyond Spatial Proximity—Classifying Parks and Their Visitors in London Based on Spatiotemporal and Sentiment Analysis of Twitter Data",
        "10.3390/ijgi7090378",
    ),
    _case(
        "E2mC: Improving Emergency Management Service Practice through Social Media and Crowdsourcing Analysis in Near Real Time",
        "Sensors / E2mC: improving emergency management service practice through social media and crowdsourcing analysis in near real time",
        "10.3390/s17122766",
    ),
    _case(
        "User Experience Design in Professional Map-Based Geo-Portals",
        "ISPRS International Journal of Geo-Information / User Experience Design in Professional Map-Based Geo-Portals",
        "10.3390/ijgi2041015",
    ),
    _case(
        "ISPRS International Journal of Geo-Information / GIS-based planning and modeling for renewable energy : challenges and future research avenues",
        "GIS-Based Planning and Modeling for Renewable Energy: Challenges and Future Research Avenues",
        "10.3390/ijgi3020662",
    ),
    _case(
        "Determination of Suitable Areas for the Generation of Wind Energy in Germany: Potential Areas of the Present and Future",
        "ISPRS International Journal of Geo-Information / Determination of suitable areas for the generation of wind energy in Germany : potential areas of the present and future",
        "10.3390/ijgi3030942",
    ),
    _case(
        "Collective Sensing: Integrating Geospatial Technologies to Understand Urban Systems—An Overview",
        "Remote Sensing / Collective sensing: integrating geospatial technologies to understand urban systems : an overview",
        "10.3390/rs3081743",
    ),
    _case(
        "Sensors / Ubiquitous geo-sensing for context-aware analysis : exploring relationships between environmental and human dynamics",
        "Ubiquitous Geo-Sensing for Context-Aware Analysis: Exploring Relationships between Environmental and Human Dynamics",
        "10.3390/s120709800",
    ),
    _case(
        "The Vienna Principles: A Vision for Scholarly Communication in the 21st Century",
        "Mitteilungen der Vereinigung Österreichischer Bibliothekarinnen & Bibliothekare / The Vienna Principles: A Vision for Scholarly Communication in the 21st Century",
        "10.31263/voebm.v69i3.1733",
    ),
    _case(
        "Niederschlags-Abfluss-Modellierung mit Long Short-Term Memory (LSTM)",
        "Österreichische Wasser- und Abfallwirtschaft / Niederschlags-Abfluss-Modellierung mit Long Short-Term Memory (LSTM)",
        "10.1007/s00506-021-00767-z",
    ),
    _case(
        "Social Sciences / Privacy Threats and Protection Recommendations for the Use of Geosocial Network Data in Research",
        "Privacy Threats and Protection Recommendations for the Use of Geosocial Network Data in Research",
        "10.3390/socsci7100191",
    ),
    _case(
        "Social Sciences / The Spatial Structures in the Austrian COVID-19 Protest Movement: A Virtual and Geospatial User Network Analysis",
        "The Spatial Structures in the Austrian COVID-19 Protest Movement: A Virtual and Geospatial User Network Analysis",
        "10.3390/socsci13060282",
    ),
]


@pytest.mark.parametrize("anchor,candidate", JOURNAL_PREFIX_CASES)
def test_journal_prefix_not_filtered(anchor, candidate):
    assert doi_title_filter(anchor, candidate) is False


# ---------------------------------------------------------------------------
# Ratio 23–36: ALL-CAPS vs title-case on short titles
# fuzz.partial_ratio is case-sensitive so these score very low on raw comparison;
# lowercasing before comparison resolves them.
# ---------------------------------------------------------------------------

CAPS_VARIANT_CASES = [
    _case(
        "Recent Deaths",
        "RECENT DEATHS",
        "10.11/test_doi_title_filter_caps_variant",
    ),
    _case(
        "TECHNOCHEMICAL LECTURES, 1942-1943, OF THE MELLON INSTITUTE",
        "Technochemical Lectures, 1942-1943, of the Mellon Institute",
        "10.11/test_doi_title_filter_caps_variant",
    ),
]


@pytest.mark.parametrize("anchor,candidate", CAPS_VARIANT_CASES)
def test_caps_variant_not_filtered(anchor, candidate):
    assert doi_title_filter(anchor, candidate) is False


# ---------------------------------------------------------------------------
# Known test cases of false negatives which should be filtered out
# ---------------------------------------------------------------------------

FALSE_NEGATIVE_CASES = [
    _case(
        "Comparison of downloads, citations and readership data for two information systems journals",
        "Scientific publications – the bad, the good, for a fistful of dollars ; Научные публикации – хорошие, плохие, за пригоршню долларов",
        "10.1007/s11192-014-1365-9",
    ),
    _case(
        "Research data explored: an extended analysis of citations and altmetrics",
        "Methodological issues of open research data: analysis of the datasets from SciELO included in Figshare ; Aspectos metodológicos de los datos abiertos de investigación: análisis de los conjuntos de datos de la colección SciELO incluidos en Figshare",
        "10.1007/s11192-016-1887-4",
    ),
]

@pytest.mark.parametrize("anchor,candidate", FALSE_NEGATIVE_CASES)
def test_false_negatives_filtered(anchor, candidate):
    assert doi_title_filter(anchor, candidate) is True