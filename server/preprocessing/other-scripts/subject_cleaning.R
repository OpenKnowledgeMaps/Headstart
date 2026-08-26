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
  # MeSH descriptor/qualifier handling. A qualifier always ends a heading, so a
  # qualifier run is the anchor for both jobs:
  #   * strip the qualifier from a "Descriptor/qualifier" pair, keeping the
  #     descriptor: "Autistic Disorder/genetics" -> "Autistic Disorder".
  #   * split a space-delimited blob of headings (some sources deliver MeSH
  #     space-joined rather than "; "-separated) by inserting "; " where a
  #     qualifier run is followed by the next heading:
  #     "Cell Cycle Proteins/*genetics Cell Line" -> "Cell Cycle Proteins; Cell Line".
  # The separator is "/", ":" (optional surrounding spaces) or " - " (a dash that
  # must be surrounded by spaces, so hyphenated descriptors like "Alpha-Agonists"
  # are not split); the qualifier may carry a "*" major-topic marker on either
  # side. A run is only treated as a boundary when followed by end-of-text or the
  # start of another heading (space + capital/'*'/digit/'('), so genuine compounds
  # like "Health/economics policy" or "Mixed/Augmented Reality" are left intact.
  # Only subheadings from the authoritative NLM list are matched.
  #
  # Blob splitting is best-effort and intentionally under-splits: it never breaks
  # a real descriptor, but runs of qualifier-less headings (MeSH check tags such
  # as "Animals", "Humans") stay merged because there is no qualifier to anchor on.
  #
  # The colon form ("Hypothermia: chemically induced") reaches this function
  # because the generic "prefix:annotation" strips in the cleaning chain only
  # match a lowercase scheme with no space after the colon; a
  # "Descriptor: qualifier" construct (capitalised, spaced) passes them.
  qual <- MESH_QUALIFIER_ALTERNATION
  # a single "<sep><*?>qualifier<*?>" unit (separator is /, : or a spaced dash).
  unit <- paste0("(?:\\s*[/:]\\s*|\\s+-\\s+)\\*?\\s*(?i:", qual, ")\\s*\\*?")
  # A *stack* of 2+ qualifiers is unambiguously a MeSH descriptor/qualifier
  # construction, so always split it (handles blobs whose next heading starts
  # lower-case, e.g. a gene name "rab3A ...").
  stack <- paste0("(?:", unit, "){2,}")
  # A *single* qualifier is only a boundary before end-of-text or an upper-case
  # next heading. The next heading may follow with no space (some sources mash
  # headings together, "therapeutic useAngiotensin..."), so the space is optional;
  # the case-sensitive capital still leaves a lower-case compound continuation
  # ("Health/economics policy") intact.
  single <- paste0("(?:", unit, ")(?=\\s*$|\\s*[*A-Z0-9(])")
  one <- function(subject) {
    if (is.na(subject) || subject == "") return(subject)
    kws <- trimws(strsplit(subject, ";", fixed = TRUE)[[1]])
    out <- vapply(kws, function(kw) {
      s <- gsub(stack, "; ", kw, perl = TRUE)
      s <- gsub(single, "; ", s, perl = TRUE)
      # The "*" major-topic marker is handled independently of the qualifier
      # match: a standalone "*Descriptor" carries no qualifier, so it must not
      # depend on the gsubs above having fired. A " *Word" mid-string also
      # starts a new heading; a leading "*" is plain marker noise.
      s <- gsub("\\s+\\*(?=[A-Za-z(])", "; ", s, perl = TRUE)
      s <- sub("^\\*", "", s)
      if (identical(s, kw)) return(kw)   # no qualifier, no marker: not MeSH-shaped
      parts <- trimws(gsub("*", "", trimws(strsplit(s, ";", fixed = TRUE)[[1]]), fixed = TRUE))
      paste(parts[nzchar(parts)], collapse = "; ")
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

drop_lettered_code_dashed <- function(keywords) {
  # Letter-prefixed classification codes in "CODE - Caption" form, e.g.
  # "F331 - Atmospheric physics", "F800 - Physical geographical sciences"
  # (ANZSRC-FOR-style serialisation with a letter prefix). Neither the generic
  # classification strips nor the pure-digit rule match this shape, and the
  # later residual-digit cleanup then fragments it to "F- Caption". The spaced
  # dash and caption are required, so a real keyword that merely looks
  # code-like ("B12", "T2 MRI sequences", "3D printing") is never matched.
  keywords[!grepl("^[A-Z]{1,3}[0-9]{2,4} - .+$", keywords)]
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

drop_grant_id <- function(keywords) {
  # Funder grant / scheme reference numbers: 3+ slash-separated alphanumeric
  # segments (no spaces) containing a digit, e.g. "SP/19/3/34678", "HDRUK/CFC/01",
  # "MR/S003991/1". Requiring 2+ slashes excludes the 1-slash forms that are MeSH
  # descriptor/qualifier ("COVID-19/epidemiology") or gene names ("HER-2/neu");
  # all-digit numeric paths are handled by drop_numeric_path. False positives are
  # negligible: no such keyword occurs in a broad BASE corpus outside grant IDs.
  is_grant <- grepl("^[A-Za-z0-9][A-Za-z0-9-]*(/[A-Za-z0-9][A-Za-z0-9-]*){2,}$", keywords, perl = TRUE) &
    grepl("[0-9]", keywords) & !grepl("^[0-9/]+$", keywords)
  keywords[!is_grant]
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

# Library of Congress Classification, top-level classes (single letter). The
# letters are the authoritative LCC class set (I, O, W, X, Y are not classes);
# the value is the class's subject heading, used to recognise the "code + caption"
# form. Subclasses (2-3 letters) are handled separately, with their own list.
LCC_TOPLEVEL_CAPTIONS <- c(
  A = "General Works",
  B = "Philosophy|Psychology|Religion",
  C = "Auxiliary Sciences",
  D = "World History|History",
  E = "History",
  F = "History",
  G = "Geography|Anthropology|Recreation",
  H = "Social Sciences",
  J = "Political Science",
  K = "Law",
  L = "Education",
  M = "Music",
  N = "Fine Arts",
  P = "Language|Literature|Philology|Linguistics",
  Q = "Science",
  R = "Medicine",
  S = "Agriculture",
  T = "Technology",
  U = "Military Science",
  V = "Naval Science",
  Z = "Bibliography|Library Science|Information Resources"
)

drop_lcc_toplevel <- function(keywords) {
  # Drop LCC top-level classes in two forms:
  #   * a lone class letter, e.g. "Q";
  #   * the "code + caption" form, e.g. "Q Science", "R Medicine (General)".
  # The caption must match the class's own subject heading, so genuine science
  # terms that start with a class letter ("B cell", "T test", "G protein") are
  # kept. The bare caption on its own ("Science") is left alone (no class code).
  letters <- names(LCC_TOPLEVEL_CAPTIONS)
  drop <- keywords %in% letters
  for (l in letters) {
    drop <- drop | grepl(paste0("^", l, " (", LCC_TOPLEVEL_CAPTIONS[[l]], ")\\b"),
                         keywords, perl = TRUE)
  }
  keywords[!drop]
}

# LCC subclasses (2-3 letter codes), crawled from the LC Classification Outline
# (itsmarc.com / US Library of Congress). The value is the significant words of
# the subclass heading, used to recognise the "code + caption" form. Bare codes
# are intentionally NOT matched here: ~27% of these subclasses collide with common
# abbreviations (AI, ML, QA, QC, CT, PR, ...), so a bare code is too ambiguous.
LCC_SUBCLASS_WORDS <- c(
  AC = "collections series collected works", AE = "encyclopedias", AG = "dictionaries reference works", AI = "indexes",
  AM = "museums collectors collecting", AN = "newspapers", AP = "periodicals", AS = "academies learned societies",
  AY = "yearbooks almanacs directories", AZ = "history scholarship learning humanities", BC = "logic", BD = "speculative philosophy",
  BF = "psychology", BH = "aesthetics", BJ = "ethics", BL = "religions mythology rationalism",
  BM = "judaism", BP = "islam bahaism theosophy", BQ = "buddhism", BR = "christianity",
  BS = "bible", BT = "doctrinal theology", BV = "practical theology", BX = "christian denominations",
  CB = "history civilization", CC = "archaeology", CD = "diplomatics archives seals", CE = "technical chronology calendar",
  CJ = "numismatics", CN = "inscriptions epigraphy", CR = "heraldry", CS = "genealogy",
  CT = "biography", DA = "great britain", DAW = "central europe", DB = "austria liechtenstein hungary czechoslovakia",
  DC = "france andorra monaco", DD = "germany", DE = "greco roman world", DF = "greece",
  DG = "italy malta", DH = "low countries benelux", DJ = "netherlands holland", DJK = "eastern europe",
  DK = "russia soviet union former republics poland", DL = "northern europe scandinavia", DP = "spain portugal", DQ = "switzerland",
  DR = "balkan peninsula", DS = "asia", DT = "africa", DU = "oceania south seas",
  DX = "romanies", GA = "mathematical geography cartography", GB = "physical geography", GC = "oceanography",
  GE = "environmental sciences", GF = "human ecology anthropogeography", GN = "anthropology", GR = "folklore",
  GT = "manners customs", GV = "recreation leisure", HA = "statistics", HB = "economic theory demography",
  HC = "economic history conditions", HD = "industries land use labor", HE = "transportation communications", HF = "commerce",
  HG = "finance", HJ = "public finance", HM = "sociology", HN = "social history conditions problems reform",
  HQ = "family marriage women", HS = "societies secret benevolent", HT = "communities classes races", HV = "social pathology public welfare criminology",
  HX = "socialism communism anarchism", JA = "political science", JC = "political theory", JF = "political institutions public administration",
  JJ = "political institutions public administration north america", JK = "political institutions public administration united states", JL = "political institutions public administration canada latin america", JN = "political institutions public administration europe",
  JQ = "political institutions public administration asia africa australia pacific area", JS = "local government municipal", JV = "colonies colonization emigration immigration international migration", JX = "obsolete",
  JZ = "international relations", KB = "religious law comparative jurisprudence", KBM = "jewish law", KBP = "islamic law",
  KBR = "history canon law", KBU = "law roman catholic church holy see", KDZ = "america north", KE = "canada",
  KF = "united states", KG = "latin america mexico central west indies caribbean area", KH = "south america", KZ = "law nations",
  LA = "history education", LB = "theory practice education", LC = "special aspects education", LD = "individual institutions united states",
  LE = "individual institutions america except united states", LF = "individual institutions europe", LG = "individual institutions asia africa indian ocean islands australia new zealand pacific", LH = "college school magazines papers",
  LJ = "student fraternities societies united states", LT = "textbooks", ML = "literature on music", MT = "instruction study",
  "NA" = "architecture", NB = "sculpture", NC = "drawing design illustration", ND = "painting",
  NE = "print media", NK = "decorative arts", NX = "arts", PA = "greek language literature latin",
  PB = "modern languages celtic", PC = "romanic languages", PD = "germanic languages scandinavian", PE = "english language",
  PF = "west germanic languages", PG = "slavic languages baltic albanian language", PH = "uralic languages basque language", PJ = "oriental languages literatures",
  PK = "indo iranian languages literatures", PL = "languages literatures eastern asia africa oceania", PM = "hyperborean indian artificial languages", PN = "literature",
  PQ = "french literature italian spanish portuguese", PR = "english literature", PS = "american literature", PT = "german literature dutch flemish since afrikaans scandinavian old norse icelandic norwegian modern faroese danish swedish",
  PZ = "fiction juvenile belles lettres", QA = "mathematics", QB = "astronomy", QC = "physics",
  QD = "chemistry", QE = "geology", QH = "natural history biology", QK = "botany",
  QL = "zoology", QM = "human anatomy", QP = "physiology", QR = "microbiology",
  RA = "public aspects medicine", RB = "pathology", RC = "internal medicine", RD = "surgery",
  RE = "ophthalmology", RF = "otorhinolaryngology", RG = "gynecology obstetrics", RJ = "pediatrics",
  RK = "dentistry", RL = "dermatology", RM = "therapeutics pharmacology", RS = "pharmacy materia medica",
  RT = "nursing", RV = "botanic thomsonian eclectic medicine", RX = "homeopathy", RZ = "systems medicine",
  SB = "plant culture", SD = "forestry", SF = "animal culture", SH = "aquaculture fisheries angling",
  SK = "hunting sports", TA = "engineering civil", TC = "hydraulic engineering ocean", TD = "environmental technology sanitary engineering",
  TE = "highway engineering roads pavements", TF = "railroad engineering operation", TG = "bridge engineering", TH = "building construction",
  TJ = "mechanical engineering machinery", TK = "electrical engineering electronics nuclear", TL = "motor vehicles aeronautics astronautics", TN = "mining engineering metallurgy",
  TP = "chemical technology", TR = "photography", TS = "manufactures", TT = "handicrafts arts crafts",
  TX = "home economics", UA = "armies organization distribution military situation", UB = "military administration", UC = "maintenance transportation",
  UD = "infantry", UE = "cavalry armor", UF = "artillery", UG = "military engineering air forces",
  UH = "services", VA = "navies organization distribution naval situation", VB = "naval administration", VC = "naval maintenance",
  VD = "naval seamen", VE = "marines", VF = "naval ordnance", VG = "minor services navies",
  VK = "navigation merchant marine", VM = "naval architecture shipbuilding marine engineering", ZA = "information resources"
)

# Subclass codes that also read as a common abbreviation in scientific/everyday
# use (curated, not exhaustive). A *bare* code from this set is too ambiguous to
# treat as LCC (e.g. ML machine learning, QA quality assurance, CT scan, PR public
# relations, NA not applicable), so only the code+caption form is removed for these.
LCC_SUBCLASS_ABBREV <- c(
  "AC", "AE", "AG", "AI", "AM", "AN", "AP", "AS", "AZ",
  "BC", "BD", "BF", "BL", "BM", "BP", "BR", "BS", "BT", "BV",
  "CB", "CC", "CD", "CE", "CN", "CR", "CS", "CT",
  "DA", "DAW", "DB", "DC", "DE", "DF", "DJ", "DK", "DL", "DP", "DR", "DS", "DT", "DU", "DX",
  "GA", "GB", "GC", "GE", "GF", "GN", "GR", "GT",
  "HA", "HB", "HC", "HD", "HE", "HF", "HG", "HM", "HN", "HQ", "HS", "HT", "HV", "HX",
  "JS", "JV", "KB", "KE", "KG",
  "LA", "LB", "LC", "LD", "LF", "LG", "LH", "LT", "ML", "MT",
  "NA", "NB", "NC", "ND", "NE", "NK",
  "PA", "PB", "PC", "PD", "PE", "PG", "PH", "PK", "PL", "PM", "PN", "PR", "PS", "PT",
  "QA", "QB", "QC", "QD", "QE", "QM", "QR",
  "RA", "RB", "RC", "RD", "RE", "RF", "RL", "RM", "RS", "RT", "RV", "RX",
  "SB", "SD", "SF", "SH", "SK",
  "TA", "TC", "TD", "TE", "TF", "TG", "TH", "TL", "TN", "TP", "TR", "TS", "TX",
  "UA", "UB", "UC", "UE", "UF", "UG",
  "VA", "VB", "VC", "VD", "VF", "VM"
)

# Collision-free subclasses: a bare code from this set is safe to remove as LCC,
# because it is not a common abbreviation. Derived so it always equals the full
# subclass set minus the abbreviation collisions above.
LCC_SUBCLASS_COLLISION_FREE <- setdiff(names(LCC_SUBCLASS_WORDS), LCC_SUBCLASS_ABBREV)

drop_lcc_subclass <- function(keywords) {
  # Drop LCC subclasses in the forms where the code is unambiguous:
  #   * code + digits, bare or with caption ("QA76", "QA76 Computer software");
  #   * code + caption whose first word is part of the subclass heading
  #     ("QA Mathematics", "ML Literature of music").
  # The caption match keeps abbreviation expansions that share a subclass code
  # ("AI Artificial Intelligence", "CT Computed Tomography", "QA testing").
  # The digit form drops bare codes too (e.g. "GF125"): the digits make it
  # unambiguous LCC, and the rare biomedical-marker collisions (CD4, TP53) are an
  # acceptable trade-off for cluster summarisation, where an LCC code surfacing in
  # an area title is worse than dropping the occasional marker keyword.
  # (A bare code WITHOUT digits is handled by drop_lcc_subclass_bare, which only
  # touches the collision-free set.)
  codes <- names(LCC_SUBCLASS_WORDS)
  alt <- paste(codes[order(nchar(codes), decreasing = TRUE)], collapse = "|")  # longest first
  # code + digits (bare, or followed by a caption)
  drop <- grepl(paste0("^(", alt, ")[0-9]{1,4}(\\.[0-9]+)?( |$)"), keywords, perl = TRUE)
  # code + caption whose leading word belongs to the subclass heading
  m <- regmatches(keywords, regexec(paste0("^(", alt, ") (.+)$"), keywords, perl = TRUE))
  for (i in which(!drop)) {
    mm <- m[[i]]
    if (length(mm) == 3) {
      first <- tolower(sub("[^A-Za-z].*$", "", mm[[3]]))
      if (nzchar(first) &&
          first %in% strsplit(LCC_SUBCLASS_WORDS[[mm[[2]]]], " ", fixed = TRUE)[[1]]) {
        drop[i] <- TRUE
      }
    }
  }
  keywords[!drop]
}

drop_lcc_subclass_bare <- function(keywords) {
  # Drop a bare subclass code (no caption), but only from the collision-free set,
  # so abbreviation collisions (ML, QA, CT, ...) are kept. Exact, case-sensitive
  # match: a keyword that *is* exactly "QH"/"QK"/... and nothing else.
  keywords[!(keywords %in% LCC_SUBCLASS_COLLISION_FREE)]
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
    keywords <- drop_lettered_code_dashed(keywords)
    keywords <- drop_hrcs(keywords)
    keywords <- drop_science_metrix(keywords)
    keywords <- drop_sdg(keywords)
    keywords <- drop_acm_ccs(keywords)
    keywords <- drop_hal_shs(keywords)
    keywords <- drop_url(keywords)
    keywords <- drop_numeric_path(keywords)
    keywords <- drop_grant_id(keywords)
    keywords <- drop_letter_domain(keywords)
    keywords <- drop_lcc_toplevel(keywords)
    keywords <- drop_lcc_subclass(keywords)
    keywords <- drop_lcc_subclass_bare(keywords)
    # keywords <- drop_domain_general(keywords)  # handled by legacy chain for now
    join_keywords(keywords)
  }
  vapply(x, one, character(1), USE.NAMES = FALSE)
}

# --- DOAJ LCC caption/code block removal --------------------------------------
# DOAJ appends journal-level Library of Congress classifications to dcsubject as
# separate keywords: real keywords first, then "caption; code" pairs ordered
# general -> specific (e.g. "Science; Q; Physics; QC1-999; Geophysics. Cosmic
# physics; QC801-809"); records without author keywords carry only the block.
# The codes are removed by other rules, but the caption keywords survive (or get
# fragmented by the ". "-split steps) and then dominate tf-idf in
# journal-homogeneous clusters. This filter drops the captions while the codes
# are still present to pair against, so it must run before the code-removal and
# "."-split steps of the cleaning chain.
#
# Caption vocabulary: normalized caption/fragment -> LCC class of the code it is
# paired with in DOAJ data. Includes range-level captions ("Renewable energy
# sources" TJ807-830) that the LCC_* heading lists above do not cover, and the
# fragments of comma-split captions ("Economic growth, development, planning"
# arrives as three keywords). Curated from a corpus sweep of DOAJ records; a
# keyword is only dropped when BOTH its text matches this vocabulary AND a code
# of the matching class is present in the same subject line, so caption
# lookalikes used as real keywords ("Technology", "Ecology") survive on records
# without the block, and real keywords that merely sit next to a code (a record
# carrying "solar eclipse; RE1-994" without a caption) are never dropped.
LCC_DOAJ_CAPTION_CLASSES <- c(
  "agriculture" = "S",
  "agriculture (general)" = "S",
  "anthropology" = "GN",
  "applied mathematics. quantitative methods" = "T",
  "architecture" = "NA",
  "arts in general" = "NX",
  "astronomy" = "QB",
  "astrophysics" = "QB",
  "bibliography. library science. information resources" = "Z",
  "biology (general)" = "QH",
  "business" = "HF",
  "business communication. including business report writing" = "HF",
  "business correspondence" = "HF",
  "chemical engineering" = "TP",
  "chemical industries" = "HD",
  "chemical technology" = "TP",
  "chemistry" = "QD",
  "cities. urban geography" = "GF",
  "city planning" = "HT",
  "colonies and colonization. emigration and immigration. international migration" = "JV",
  "commerce" = "HF",
  "communication. mass media" = "P",
  "communities. classes. races" = "HT",
  "computer applications to medicine. medical informatics" = "R",
  "computer software" = "QA",
  "crisis management. emergency management. inflation" = "HD",
  "demography. population. vital events" = "HB",
  "development" = "HD",
  "diseases of the circulatory (cardiovascular) system" = "RC",
  "diseases of the genitourinary system. urology" = "RC",
  "ecology" = "QH",
  "economic growth" = "HD",
  "economic theory. demography" = "HB",
  "economics as a science" = "HB",
  "education" = "L",
  "education (general)" = "L",
  "electric apparatus and materials. electric circuits. electric networks" = "TK",
  "electrical engineering. electronics. nuclear engineering" = "TK",
  "electronic computers. computer science" = "QA",
  "electronics" = "TK",
  "engineering (general). civil engineering (general)" = "TA",
  "engineering economy" = "TA",
  "environmental effects of industries and plants" = "TD",
  "environmental law" = "K",
  "environmental pollution" = "TD",
  "environmental sciences" = "GE",
  "environmental technology. sanitary engineering" = "TD",
  "etc" = "PN",
  "ethics" = "BJ",
  "forestry" = "SD",
  "general works" = "A",
  "general. including nature conservation" = "QH",
  "genetics" = "QH",
  "geodesy" = "QB",
  "geographical distribution" = "QH",
  "geography (general)" = "G",
  "geography. anthropology. recreation" = "G",
  "geology" = "QE",
  "geophysics. cosmic physics" = "QC",
  "history (general)" = "D",
  "history of africa" = "DT",
  "history of scholarship and learning. the humanities" = "AZ",
  "human ecology. anthropogeography" = "GF",
  "human settlements. communities" = "HT",
  "industries. land use. labor" = "HD",
  "infectious and parasitic diseases" = "RC",
  "information technology" = "T",
  "islam" = "BP",
  "islamic law" = "KBP",
  "journalism. the periodical press" = "PN",
  "language and literature" = "P",
  "law" = "K",
  "management information systems" = "T",
  "management. industrial management" = "HD",
  "mathematical geography. cartography" = "GA",
  "mathematics" = "QA",
  "mechanical engineering and machinery" = "TJ",
  "medical physics. medical radiology. nuclear medicine" = "R",
  "medicine" = "R",
  "medicine (general)" = "R",
  "meteorology. climatology" = "QC",
  "microbiology" = "QR",
  "military science" = "U",
  "naval architecture. shipbuilding. marine engineering" = "VM",
  "neurology. diseases of the nervous system" = "RC",
  "neurosciences. biological psychiatry. neuropsychiatry" = "RC",
  "nuclear and particle physics. atomic energy. radioactivity" = "QC",
  "nursing" = "RT",
  "oceanography" = "GC",
  "ophthalmology" = "RE",
  "orthopedic surgery" = "RD",
  "pediatrics" = "RJ",
  "philosophy. psychology. religion" = "B",
  "physical geography" = "GB",
  "physics" = "QC",
  "physiology" = "QP",
  "planning" = "HD",
  "political science" = "J",
  "polymers and polymer manufacture" = "TP",
  "practical theology" = "BV",
  "psychiatry" = "RC",
  "psychology" = "BF",
  "public aspects of medicine" = "RA",
  "regional economics. space in economics" = "HT",
  "renewable energy sources" = "TJ",
  "risk in industry. risk management" = "HD",
  "science" = "Q",
  "science (general)" = "Q",
  "shipment of goods. delivery of goods" = "HF",
  "social sciences" = "H",
  "social sciences (general)" = "H",
  "sociology (general)" = "HM",
  "special aspects of education" = "LC",
  "sports" = "GV",
  "sports medicine" = "RC",
  "surgery" = "RD",
  "technology" = "T",
  "telecommunication" = "TK",
  "the family. marriage. woman" = "HQ",
  "theory and practice of education" = "LB",
  "transportation and communications" = "HE",
  "urban groups. the city. urban sociology" = "HT",
  "urbanization. city and country" = "HT"
)

LCC_RANGE_CODE_PATTERN <- "^[A-Z]{1,3}[0-9]+(\\.[0-9]+)?-[0-9]+(\\.[0-9]+)?$"

drop_doaj_lcc_pairs <- function(x) {
  # Drop LCC caption keywords whose class code is present in the same subject
  # line (see the vocabulary comment above). The codes themselves (range form
  # and bare top-level letter) are left in place for the existing removal rules.
  # Class markers are range codes, single-number codes with a 2-3 letter prefix
  # ("HT388"), and bare SINGLE top-level letters. A bare 2-3-letter token is a
  # real acronym (OCT, GPS, UK) far more often than an LCC subclass code, and a
  # single-letter prefix with digits ("T2", "B12") is a real keyword, so
  # neither counts as a marker.
  toplevel_letters <- names(LCC_TOPLEVEL_CAPTIONS)
  single_code <- "^[A-Z]{2,3}[0-9]{1,4}(\\.[0-9]+)?$"
  one <- function(subject) {
    if (is.na(subject) || subject == "") return(subject)
    kws <- split_keywords(subject)
    if (length(kws) == 0) return(subject)
    is_code <- grepl(LCC_RANGE_CODE_PATTERN, kws) | grepl(single_code, kws)
    range_prefix <- ifelse(is_code, sub("^([A-Z]{1,3}).*$", "\\1", kws), NA_character_)
    classes <- unique(c(range_prefix[!is.na(range_prefix)],
                        kws[kws %in% toplevel_letters]))
    if (length(classes) == 0) return(subject)
    norm <- tolower(gsub("\\s+", " ", trimws(kws)))
    caption_class <- LCC_DOAJ_CAPTION_CLASSES[norm]
    # a caption's class and a present marker pair up when one is a prefix of
    # the other (bare "G" marks the "GE..." subclass captions and vice versa).
    compatible <- vapply(caption_class, function(cc) {
      if (is.na(cc)) return(FALSE)
      any(startsWith(classes, cc) | startsWith(cc, classes))
    }, logical(1), USE.NAMES = FALSE)
    join_keywords(kws[!compatible])
  }
  vapply(x, one, character(1), USE.NAMES = FALSE)
}

# --- Full subject-cleaning chain ----------------------------------------------

clean_subject_string <- function(subject_all, vis_type = NULL, doaj = FALSE) {
  # The BASE subject/keyword cleaning chain, extracted from the etl() inline
  # gsub sequence so it is testable in isolation. Vectorized over records;
  # `doaj` is a logical (recycled or per-record) marking records from the DOAJ
  # collection, which get the LCC caption/code block removal first — that
  # filter needs the codes still present and the captions unfragmented, so it
  # must precede the code-removal and "."-split steps below.
  subject_cleaned = ifelse(rep_len(doaj, length(subject_all)),
                           drop_doaj_lcc_pairs(subject_all), subject_all)
  subject_cleaned = gsub("DOAJ:[^;]*(;|$)?", "", subject_cleaned) # remove DOAJ classification
  subject_cleaned = gsub("/dk/atira[^;]*(;|$)?", "", subject_cleaned) # remove atira classification
  subject_cleaned = gsub("ddc:[0-9]+(;|$)?", "", subject_cleaned) # remove Dewey Decimal Classification
  subject_cleaned = gsub("([\\w\\/\\:-])*?\\/ddc\\/([\\/0-9\\.])*", "", subject_cleaned) # remove Dewey Decimal Classification in URI form
  subject_cleaned = gsub("[A-Z,0-9\\.]{2,}-[A-Z,0-9\\.]{2,}(;|$)?", "", subject_cleaned) #remove LOC classification (range form, incl. decimal-before-dash e.g. HT165.5-169.9)
  subject_cleaned = gsub("[^\\(;]+\\(General\\)(;|$)?", "", subject_cleaned) # remove general subjects
  subject_cleaned = gsub("[^\\(;]+\\(all\\)(;|$)?", "", subject_cleaned) # remove general subjects
  subject_cleaned = gsub("[^:;]+ ?:: ?[^;]+(;|$)?", "", subject_cleaned) #remove classification with separator ::
  subject_cleaned = gsub("[^\\[;]+\\[[A-Z,0-9]+\\](;|$)?", "", subject_cleaned) # remove WHO classification
  subject_cleaned = gsub("Info:\\w+-(\\w+\\/)+", "", subject_cleaned) # remove Info:eu-repo/classification/
  # Annotation prefixes ("theme:annotation") are a lowercase scheme token with
  # no space after the colon; requiring both keeps "Descriptor: qualifier" and
  # "Title: Subtitle" constructs (capitalised, spaced) intact, and the
  # lookbehind stops the scheme from matching a lowercase tail of a longer
  # word ("Lipopolysaccharides:" must not match as "ipopolysaccharides:").
  subject_cleaned = gsub("(?<![A-Za-z0-9])([a-z]+:[A-Za-z0-9\\/\\.-][A-Za-z0-9 \\/\\.-]*);?", "", subject_cleaned, perl=TRUE) # clean up annotations with prefix e.g. theme:annotation
  # The FOS colon form ("FOS: Health sciences") is removed whole, on both viz
  # branches: it is an uppercase, spaced scheme, so the tightened annotation
  # strip above deliberately no longer matches it, and the space-form FOS rules
  # below do not either. Without this the later ": " normalisation would turn
  # it into a plausible-looking "FOS Health sciences" keyword.
  subject_cleaned = gsub("FOS ?:[^;]*(;|$)?", "", subject_cleaned)
  if (!is.null(vis_type) && vis_type == "timeline") {
    subject_cleaned = gsub("FOS ", "", subject_cleaned) # remove FOS classification tag, but keep classifcation name
    arxiv_classification_string = "(cs|econ|eess|math|astro-ph|nlin|q-bio|q-fin|stat)\\.[A-Z]{2}|cond-mat\\.[a-z\\-]+|hep-(ex|lat|ph|th)|math-ph|nucl-(ex|th)|physics\\.[a-z\\-]+|(astro-ph|gr-qc|quant-ph|cond-mat)"
    subject_cleaned = gsub(arxiv_classification_string, "", subject_cleaned, perl=TRUE) # remove arXiv classification short code, but keep classifcation name
  } else {
    subject_cleaned = gsub("FOS [A-Za-z ]+", "", subject_cleaned) # remove FOS classifications (Fields of Science and Technology)
    arxiv_classification_string = "(([A-Za-z ]+ )?cond-mat\\.[a-z\\-]+)|([\\w ]+ )?(cs|econ|eess|math|astro-ph|nlin|q-bio|q-fin|stat)\\.[A-Z]{2}|cond-mat\\.[a-z\\-]+|hep-(ex|lat|ph|th)|math-ph|nucl-(ex|th)|physics\\.[a-z\\-]+|([\\w ]+ )(astro-ph|gr-qc|quant-ph|cond-mat)"
    subject_cleaned = gsub(arxiv_classification_string, "", subject_cleaned, perl=TRUE) # remove arXiv classification, except on streamgraphs
  }
  subject_cleaned = gsub("(?<![A-Za-z0-9])([a-z]+:[A-Za-z0-9\\/\\.][A-Za-z0-9 \\/\\.]*);?", "", subject_cleaned, perl=TRUE) # clean up annotations with prefix e.g. theme:annotation
  subject_cleaned = gsub("(wikidata)?\\.org/entity/[qQ]([\\d]+)?", "", subject_cleaned) # remove wikidata classification
  subject_cleaned = gsub("</keyword><keyword>", "", subject_cleaned) # remove </keyword><keyword>
  subject_cleaned = gsub("\\[No keyword\\]", "", subject_cleaned)

  if (!is.null(vis_type) && vis_type == "timeline") {
    # These classifications have not been cleaned for the streamgraph as the
    # impact of cleaning them has not been evaluated
    subject_cleaned = remove_keywords_with_text_in_square_brackets(subject_cleaned)
  } else {
    # de-invert comma-inverted MeSH descriptors (marker preserved).
    # Runs before the marker-stripping steps so [MeSH]/(mesh) are still present.
    subject_cleaned = deinvert_marked_mesh_keywords(subject_cleaned)
    # drop whole keywords that are additional classifications. Runs before the
    # bracket strip so leading-bracket classifications (e.g. HAL [SHS.ECO]...)
    # are still intact.
    subject_cleaned = clean_classification_keywords(subject_cleaned)
    # strip the "(mesh)" marker ("[MeSH]" is handled just below).
    subject_cleaned = remove_mesh_round_bracket_marker(subject_cleaned)
    subject_cleaned = remove_text_in_square_brackets_from_keywords(subject_cleaned)
    # strip MeSH subheading qualifiers, keeping the descriptor
    # ("Autistic Disorder/genetics" -> "Autistic Disorder"). Runs AFTER marker
    # removal so a trailing "[MeSH]"/"(mesh)" does not sit between the qualifier
    # and the heading boundary and block the strip.
    subject_cleaned = strip_mesh_qualifier(subject_cleaned)
  }

  subject_cleaned = gsub("\\[[^\\[]+\\][^\\;]+(;|$)?", "", subject_cleaned) # remove classification
  subject_cleaned = gsub("[0-9]{2,} [A-Z]+[^;]*(;|$)?", "", subject_cleaned) #remove classification
  subject_cleaned = gsub(" -- ", "; ", subject_cleaned) #replace inconsistent keyword separation
  subject_cleaned = gsub("[-]{2,}", "; ", subject_cleaned) #replace inconsistent keyword separation
  subject_cleaned = gsub("[A-Z]\\.\\d\\.\\d+", "", subject_cleaned) #replace inconsistent keyword separation
  subject_cleaned = gsub(" \\(  ", "; ", subject_cleaned) #replace inconsistent keyword separation
  subject_cleaned = gsub("(\\w* \\w*(\\.)( \\w* \\w*)?)", "; ", subject_cleaned) # remove overly broad keywords separated by .
  subject_cleaned = gsub("\\. ", "; ", subject_cleaned) # replace inconsistent keyword separation
  subject_cleaned = gsub(" ?\\d[:?-?]?(\\d+.)+", "", subject_cleaned) # replace residuals like 5:621.313.323 or '5-76.95'
  # replace with a space, not the empty string: a "Title: Subtitle" keyword the
  # annotation strip now preserves must not have its words fused together.
  subject_cleaned = gsub(": ", " ", subject_cleaned) # clean up keyword separation
  subject_cleaned = gsub("^; $", "", subject_cleaned) # clean up keyword separation
  subject_cleaned = gsub(";+", ";", subject_cleaned) # clean up keyword separation
  subject_cleaned = gsub(",+", ",", subject_cleaned) # clean up keyword separation
  # NOTE: a comma is NOT normalised to comma-space here: a comma without a
  # following space is an intra-tag join ("spaCy,Geography" is one keyword),
  # and inserting the space would turn it into a separator downstream.
  subject_cleaned = gsub("\\s+", " ", subject_cleaned) # clean up keyword separation
  # stri_trim in the pipeline image; trimws is the dependency-free equivalent
  # for plain-R test environments (identical on ASCII whitespace).
  if (requireNamespace("stringi", quietly = TRUE)) {
    subject_cleaned = stringi::stri_trim(subject_cleaned)
  } else {
    subject_cleaned = trimws(subject_cleaned)
  }
  subject_cleaned
}
