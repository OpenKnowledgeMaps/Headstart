# subject_cleaning.R
#
# Keyword/subject cleaning helpers for the BASE worker, sourced from base.R.
# Pure base R (no external packages) so it can be sourced and tested in
# isolation. Two concerns:
#   * MeSH labels: strip [MeSH]/(mesh) markers and de-invert comma-inverted
#     descriptors for readability.
#   * Classification removal: drop whole keywords that are subject
#     classifications (split the subject, filter the keyword vector, rejoin).


remove_keywords_with_text_in_square_brackets <- function(x) {
  # This function removes whole keywords that contain text in square brackets.
  # Example: 'Climate [MeSH]' | 'Some keywords [Chemical]'.
  gsub("[^;]*\\[[^]]+\\][^;]*;?", "", x)
}

remove_text_in_square_brackets_from_keywords <- function(x) {
  # This function removes text in square brackets.
  # Example: 'Climate [MeSH]' -> 'Climate'| 'Some keywords [Chemical]' -> 'Some keywords'.
  gsub("\\[[^]]*\\]", "", x)
}

# --- MeSH keyword handling (label improvements) -------------------
# Applied only in the non-"timeline" branch (see vis_layout subject cleaning).

remove_mesh_round_bracket_marker <- function(x) {
  # remove the "(mesh)" marker from keywords (case-insensitive),
  # mirroring remove_text_in_square_brackets_from_keywords for the "[MeSH]" form.
  # Only the literal "(mesh)" marker is removed -- NOT other parentheses, which
  # carry real keyword content. Example: 'Climate (mesh)' -> 'Climate'.
  gsub("\\s*\\(mesh\\)", "", x, ignore.case = TRUE)
}

# Reversal-exclusion set for MeSH de-inversion. Bare descriptors
# listed here are kept in their original order instead of being reversed. To be
# populated from the manual review of multi-comma MeSH descriptors;
MESH_DEINVERSION_EXCLUSIONS <- c(
  "Human Papillomavirus Recombinant Vaccine Quadrivalent, Types 6, 11, 16, 18",
  "Dibenz(b,f)(1,4)oxazepine-10(11H)-carboxylic acid, 8-chloro-, 2-acetylhydrazide",
  "Technology, Industry, and Agriculture",
  "Multi-Ingredient Cold, Flu, and Allergy Medications",
  "National Heart, Lung, and Blood Institute (U.S.)",
  "Disruptive, Impulse Control, and Conduct Disorders",
  "Health Care Quality, Access, and Evaluation",
  "Gram-Negative Anaerobic Straight, Curved, and Helical Rods",
  "Hormones, Hormone Substitutes, and Hormone Antagonists",
  "Vaginal Creams, Foams, and Jellies",
  "Neoplasms, Ductal, Lobular, and Medullary",
  "Congenital, Hereditary, and Neonatal Diseases and Abnormalities",
  "Nucleobase, Nucleoside, Nucleotide, and Nucleic Acid Transport Proteins",
  "Nucleic Acids, Nucleotides, and Nucleosides",
  "Diet, Food, and Nutrition",
  "Amino Acids, Peptides, and Proteins",
  "Neoplasms, Cystic, Mucinous, and Serous",
  "Benzenaminium, 4,4'-(3-oxo-1,5-pentanediyl)bis(N,N-dimethyl-N-2-propenyl-), Dibromide",
  "3-Pyridinecarboxylic acid, 1,4-dihydro-2,6-dimethyl-5-nitro-4-(2-(trifluoromethyl)phenyl)-, Methyl ester",
  "Pneumonia, Atypical Interstitial, of Cattle",
  "Pneumonia, Progressive Interstitial, of Sheep",
  "Epidermitis, Exudative, of Swine",
  "Gastroenteritis, Transmissible, of Swine",
  "Enteritis, Transmissible, of Turkeys",
  "Anemia, Refractory, with Excess of Blasts"
)

deinvert_mesh_term <- function(term) {
  # Naive de-inversion: reverse the comma-separated parts and join with a space.
  # "Adaptation, Physiological" -> "Physiological Adaptation"; "A, B, C" -> "C B A".
  # Terms in MESH_DEINVERSION_EXCLUSIONS are left untouched.
  if (term %in% MESH_DEINVERSION_EXCLUSIONS) return(term)
  if (!grepl(",", term, fixed = TRUE)) return(term)
  parts <- trimws(strsplit(term, ",", fixed = TRUE)[[1]])
  paste(rev(parts), collapse = " ")
}

deinvert_marked_mesh_keywords <- function(x) {
  # de-invert comma-inverted MeSH descriptors for readability. Only
  # keywords carrying a [MeSH] or (mesh) marker are affected; the marker is
  # preserved here and removed by the marker-stripping steps that follow.
  marker_re <- "\\s*(\\[MeSH\\]|\\(mesh\\))\\s*$"
  one <- function(subject) {
    if (is.na(subject) || subject == "") return(subject)
    kws <- trimws(strsplit(subject, ";", fixed = TRUE)[[1]])
    out <- vapply(kws, function(kw) {
      if (!grepl(marker_re, kw, ignore.case = TRUE, perl = TRUE)) return(kw)
      marker <- regmatches(kw, regexpr(marker_re, kw, ignore.case = TRUE, perl = TRUE))
      bare <- sub(marker_re, "", kw, ignore.case = TRUE, perl = TRUE)
      paste0(deinvert_mesh_term(trimws(bare)), marker)
    }, character(1), USE.NAMES = FALSE)
    paste(out, collapse = "; ")
  }
  vapply(x, one, character(1), USE.NAMES = FALSE)
}

# MeSH subheadings/qualifiers, the authoritative NLM list
# (https://www.nlm.nih.gov/mesh/subhierarchy.html), de-duplicated. Matching is
# case-insensitive. The page's "adminstration & dosage" spelling is kept next to
# the canonical "administration & dosage" so either form in the data is matched.
MESH_QUALIFIERS <- c(
  "analysis", "blood", "cerebrospinal fluid", "isolation & purification", "urine",
  "anatomy & histology", "blood supply", "cytology", "ultrastructure", "embryology",
  "abnormalities", "innervation", "pathology", "chemistry", "agonists",
  "analogs & derivatives", "antagonists & inhibitors", "chemical synthesis",
  "diagnosis", "diagnostic imaging", "etiology", "chemically induced", "complications",
  "secondary", "congenital", "genetics", "immunology", "microbiology", "virology",
  "parasitology", "transmission", "organization & administration", "economics",
  "legislation & jurisprudence", "standards", "supply & distribution", "trends",
  "pharmacology", "adminstration & dosage", "administration & dosage", "adverse effects",
  "poisoning", "toxicity", "pharmacokinetics", "physiology", "growth & development",
  "metabolism", "biosynthesis", "deficiency", "enzymology", "physiopathology",
  "statistics & numerical data", "epidemiology", "ethnology", "mortality",
  "therapeutic use", "therapy", "diet therapy", "drug therapy", "nursing",
  "prevention & control", "radiotherapy", "rehabilitation", "surgery",
  "transplantation", "classification", "drug effects", "education", "ethics",
  "history", "injuries", "instrumentation", "methods", "pathogenicity", "psychology",
  "radiation effects", "veterinary"
)

# Alternation built longest-first so multi-word qualifiers win over a substring
# (e.g. "drug therapy" before "therapy"); the qualifiers contain no regex
# metacharacters, so no escaping is needed.
MESH_QUALIFIER_ALTERNATION <- paste(
  unique(MESH_QUALIFIERS)[order(nchar(unique(MESH_QUALIFIERS)), decreasing = TRUE)],
  collapse = "|"
)

strip_mesh_qualifier <- function(x) {
  # MeSH descriptor/qualifier pairs: drop the trailing subheading, keep the
  # descriptor. "Autistic Disorder/genetics" -> "Autistic Disorder",
  # "Hospitals/*supply & distribution" -> "Hospitals". The separator is "/" or
  # ":" (with or without surrounding spaces), the qualifier may carry a leading
  # "*" major-topic marker, and a "*" left on the descriptor is trimmed too.
  # Only subheadings from the authoritative NLM list are removed, so genuine
  # compounds ("Mixed/Augmented Reality") are untouched.
  #
  # KNOWN LIMITATION: in the live base.R order the colon form ("Hypothermia:
  # chemically induced") is usually already removed whole by the generic
  # "prefix:annotation" gsub before this runs, taking the descriptor with it. So
  # in practice this mainly affects the slash form; the colon form is the same
  # legacy-ordering interference that trips up the classification drops.
  pat <- paste0("^(.+?)\\s*[/:]\\s*\\*?\\s*(", MESH_QUALIFIER_ALTERNATION, ")\\s*$")
  one <- function(subject) {
    if (is.na(subject) || subject == "") return(subject)
    kws <- trimws(strsplit(subject, ";", fixed = TRUE)[[1]])
    out <- vapply(kws, function(kw) {
      stripped <- kw
      repeat {                                   # handle stacked qualifiers
        s <- sub(pat, "\\1", stripped, ignore.case = TRUE, perl = TRUE)
        if (identical(s, stripped)) break
        stripped <- s
      }
      if (!identical(stripped, kw)) stripped <- trimws(gsub("*", "", stripped, fixed = TRUE))
      stripped
    }, character(1), USE.NAMES = FALSE)
    paste(out, collapse = "; ")
  }
  vapply(x, one, character(1), USE.NAMES = FALSE)
}

# --- Classification keyword cleanup ------------------------------------------
# Split the subject into a keyword vector, run individual filter functions that
# drop whole classification keywords, then rejoin. Each classification is one
# small, self-contained filter, which keeps the rules readable and testable.

split_keywords <- function(subject) {
  kws <- trimws(strsplit(subject, ";", fixed = TRUE)[[1]])
  kws[nzchar(kws)]
}

join_keywords <- function(keywords) {
  paste(keywords, collapse = "; ")
}

# Each drop_* filter takes a character vector of keywords and returns it with
# the keywords belonging to that classification removed.

drop_keyvalue <- function(keywords) {
  # key=value annotations, e.g. "name=Bristol Population Health Science Institute".
  keywords[!grepl("^name=", keywords, ignore.case = TRUE)]
}

drop_rcdc <- function(keywords) {
  # NIH RCDC, e.g. "Autism (rcdc)".
  keywords[!grepl("\\(rcdc\\)\\s*$", keywords, ignore.case = TRUE)]
}

drop_not_elsewhere_classified <- function(keywords) {
  # "... not elsewhere classified" residue, e.g. "Biological Sciences not elsewhere classified".
  keywords[!grepl("not elsewhere classified", keywords, ignore.case = TRUE)]
}

drop_for <- function(keywords) {
  # ANZSRC Fields of Research, serialisations seen in the data:
  #   "01 Mathematical Sciences (for)", "38 Economics (for-2020)", "FoR 03 (Chemical Sciences)",
  #   "anzsrc-for: 3402 Inorganic Chemistry".
  # The FoR-prefix form requires a letter after "(" so a stray "... (89.8%)" is not matched.
  # NOTE: in the current base.R order the "anzsrc-for: ..." form is already reduced to an
  # orphan "anzsrc-" by an earlier generic "prefix:annotation" gsub, so this branch only
  # takes effect if the per-scheme filters run before that legacy step.
  keywords[!grepl("\\(for(-2020)?\\)\\s*$|^FoR [0-9]+ \\([A-Za-z]|^anzsrc-for ?: ?[0-9]+",
                  keywords, ignore.case = TRUE)]
}

drop_hrcs <- function(keywords) {
  # UK Health Research Classification System, e.g. "... (hrcs-rac)", "... (hrcs-hc)".
  keywords[!grepl("\\(hrcs-[a-z]+\\)\\s*$", keywords, ignore.case = TRUE)]
}

drop_science_metrix <- function(keywords) {
  # Science-Metrix, e.g. "Bioinformatics (science-metrix)".
  keywords[!grepl("\\(science-metrix\\)\\s*$", keywords, ignore.case = TRUE)]
}

drop_sdg <- function(keywords) {
  # UN Sustainable Development Goals, in two serialisations:
  #   suffix marker, e.g. "3 Good Health and Well Being (sdg)"
  #   numbered prefix, e.g. "SDG 10: Reduced inequalities"
  is_sdg <- grepl("\\(sdg\\)\\s*$", keywords, ignore.case = TRUE) |
    grepl("^SDG ?[0-9]+ ?[:.-]", keywords, ignore.case = TRUE)
  keywords[!is_sdg]
}

drop_acm_ccs <- function(keywords) {
  # ACM Computing Classification System concept path, e.g.
  # "Computing methodologies -> Machine learning" (the arrow is U+2192).
  keywords[!grepl("→", keywords, fixed = TRUE)]
}

drop_hal_shs <- function(keywords) {
  # HAL domains: a leading bracket with one of the 13 top-level codes, optionally
  # followed by dotted uppercase sub-codes, e.g. "[SHS.ECO]Humanities and ...".
  # Case-sensitive: the codes are upper-case (lower-case look-alikes are not HAL).
  pat <- "^\\[(CHIM|INFO|MATH|NLIN|PHYS|SCCO|SDE|SDU|SDV|SHS|SPI|STAT|QFIN)(\\.[A-Z-]+)*\\]"
  keywords[!grepl(pat, keywords)]
}

drop_url <- function(keywords) {
  # URLs leaking in as keywords, e.g. supplementary-file links.
  keywords[!grepl("^https?://", keywords, ignore.case = TRUE)]
}

drop_numeric_path <- function(keywords) {
  # Numeric ontology path codes (digits and slashes only), e.g. "/692/308/174".
  keywords[!grepl("^[0-9/]*/[0-9/]*$", keywords)]
}

# Toulouse Capitole (TSE) subject headings (top level + sub-categories),
# hardcoded from https://publications.ut-capitole.fr/view/subjects/ . A keyword
# equal to one of these (e.g. "B- ECONOMIE et FINANCE") is a subject
# classification, not a topic.
TOULOUSE_SUBJECTS <- c(
  "A- DROIT",
  "A1- Généralités",
  "A1-1- Introduction au droit",
  "A1-2- Philosophie du droit",
  "A1-3- Sociologie juridique",
  "A1-4- Droit de l'informatique",
  "A1-5- Droit et religions",
  "A1-6- Organisation judiciaire",
  "A1-7- Sources du droit",
  "A1-8- Principes généraux du droit",
  "A1-9- Anthropologie juridique",
  "A2- Histoire du droit",
  "A2-1- Droit romain et droits de l'Antiquité",
  "A2-2- Histoire du droit et des institutions",
  "A2-3- Histoire du droit privé",
  "A3- Droit public",
  "3-1- Droit constitutionnel",
  "3-3- Droit administratif",
  "3-3- Libertés publiques",
  "3-4- Finances publiques",
  "3-5- Droit de l'urbanisme",
  "3-6- Droit de la santé publique",
  "3-7- Droit de l'information, de la communication, droit de la presse",
  "3-8- Droit public économique et des affaires",
  "A4- Droit privé",
  "4-1- Droit civil",
  "4-10- Droit de l'environnement",
  "4-11- Droit médical",
  "4-12- Droit de l'information, de la communication, droit de la presse",
  "4-13- Droit du sport",
  "4-14- Droit du tourisme",
  "4-2- Droit des affaires – droit commercial",
  "4-3- Droit social – droit du travail",
  "4-4- Droit fiscal",
  "4-5- Droit des transports",
  "4-6- Droit des assurances",
  "4-7- Droit de la propriété intellectuelle ( littéraire, artistique, industrielle)",
  "4-8- Droit de la construction – droit immobilier",
  "4-9- Droit rural",
  "A5- Droit pénal",
  "5-1- Droit pénal – Procédure pénale",
  "5-2- Droit pénal des affaires – droit pénal spécial",
  "5-3- Pénologie – Science pénitentiaire",
  "5-4- Criminologie",
  "A6- Droit international",
  "6-1- Droit international privé",
  "6-2- Droit international public",
  "6-3- Droit international économique",
  "A7- Droit comparé",
  "7-1- Grands systèmes de droit",
  "7-2- Droit des pays étrangers",
  "A8- Droit de l'Union Européenne",
  "8-1- Sources",
  "8-2- Institutions",
  "8-3- Droit substantiel",
  "B- ECONOMIE ET FINANCE",
  "B1- Généralités",
  "B2- Production. Travail",
  "B3- Transport et Communication",
  "B4- Commerce et Affaire",
  "B5- Finances",
  "C- GESTION",
  "C1- Généralités",
  "C2- Comptabilité – Contrôle",
  "C3- Gestion ressources humaines",
  "C4- Management",
  "C5- Marketing",
  "C6- Stratégie",
  "D- SCIENCES POLITIQUES",
  "D1- Généralités",
  "D2- Politique",
  "D3- Institution et Administration",
  "D4- Relations internationales",
  "E- SCIENCES DE L'INFORMATION ET DE LA COMMUNICATION",
  "E1- Généralités",
  "E2- Communication",
  "E3- Culture et Media",
  "F- SCIENCES HUMAINES",
  "F1- Histoire. Géographie",
  "F2- Sociologie",
  "G- MATHEMATIQUES",
  "H- INFORMATIQUE",
  "I- LANGUE",
  "J- SPORT"
)

normalize_subject <- function(x) {
  # Case-fold and normalise curly apostrophes so keyword variants (lower-case,
  # curly quotes) match the canonical list.
  toupper(gsub("[‘’']", "'", trimws(x)))
}

drop_letter_domain <- function(keywords) {
  # Exact (normalised) match against the hardcoded Toulouse subject list.
  keywords[!(normalize_subject(keywords) %in% normalize_subject(TOULOUSE_SUBJECTS))]
}

# drop_domain_general <- function(keywords) {
#   # Library of Congress "(General)" subjects, e.g. "Biology (General)".
#   # Currently removed by the legacy gsub chain; enable when that is retired.
#   keywords[!grepl("\\([Gg]eneral\\)\\s*$", keywords)]
# }

clean_classification_keywords <- function(x) {
  one <- function(subject) {
    if (is.na(subject) || subject == "") return(subject)
    keywords <- split_keywords(subject)
    keywords <- drop_keyvalue(keywords)
    keywords <- drop_rcdc(keywords)
    keywords <- drop_not_elsewhere_classified(keywords)
    keywords <- drop_for(keywords)
    keywords <- drop_hrcs(keywords)
    keywords <- drop_science_metrix(keywords)
    keywords <- drop_sdg(keywords)
    keywords <- drop_acm_ccs(keywords)
    keywords <- drop_hal_shs(keywords)
    keywords <- drop_url(keywords)
    keywords <- drop_numeric_path(keywords)
    keywords <- drop_letter_domain(keywords)
    # keywords <- drop_domain_general(keywords)  # handled by legacy chain for now
    join_keywords(keywords)
  }
  vapply(x, one, character(1), USE.NAMES = FALSE)
}
