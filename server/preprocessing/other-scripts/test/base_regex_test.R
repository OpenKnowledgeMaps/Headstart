# input - expected output
queries = list('2019-ncov and sars-cov-2'='textus:2019-ncov and textus:sars-cov-2'
            ,'term1 term2 term3'='textus:term1 textus:term2 textus:term3'
            ,'(dog and cat) or (sun and moon)'='(textus:dog and textus:cat) or (textus:sun and textus:moon)'
            ,'cats and "mice and cheese"'='textus:cats and textus:"mice and cheese"'
            ,'cats or (sun and moon)'='textus:cats or (textus:sun and textus:moon)'
            ,'(parentheses or ("cats and dogs"))'='(textus:parentheses or (textus:"cats and dogs"))'
            ,'-2019-ncov'='-textus:2019-ncov'
            ,'--2019-ncov'='-textus:2019-ncov'
            ,'(a and b -"c")'='(textus:a and textus:b -textus:"c")'
            ,'2019-ncov or sars-cov-2'='textus:2019-ncov or textus:sars-cov-2'
            ,'"2019-ncov" or "sars-cov-2"'='textus:"2019-ncov" or textus:"sars-cov-2"'
            ,'"2019-ncov"+"sars-cov-2"'='textus:"2019-ncov" textus:"sars-cov-2"'
            ,'"2019-ncov" + "sars-cov-2"'='textus:"2019-ncov" textus:"sars-cov-2"'
            ,'"2019-ncov"+"sars-cov-2"'='textus:"2019-ncov" textus:"sars-cov-2"'
            ,'(cats + dogs) or (sun - moon)'='(textus:cats textus:dogs) or (textus:sun -textus:moon)'
            ,'science -(research or knowledge or theory)'='textus:science -(textus:research or textus:knowledge or textus:theory)'
            ,'orandor or andorand'='textus:orandor or textus:andorand'
            ,'science -research -knowledge -theory'='textus:science -textus:research -textus:knowledge -textus:theory'
            ,'a+b'='textus:a textus:b'
            ,'and or not'='and or textus:not'
            ,'-(dogs+cats)'='-(textus:dogs textus:cats)'
            ,'((cats) and dogs)'='((textus:cats) and textus:dogs)'
            ,'""knowledge -   and +domain visualization""'='textus:""knowledge -   and +domain visualization""'
            ,'((-""hello"") or test)'='((-textus:""hello"") or textus:test)'
            ,'cats - dogs'='textus:cats -textus:dogs'
            ,'cats --- dogs'='textus:cats -textus:dogs'
            ,'cats +++ dogs'='textus:cats textus:dogs'
            ,'\'\'test\'\''="textus:''test''"
            ,'+++++++++++++++science'='textus:science'
            ,'+a -b'='textus:a -textus:b')


test_preprocess_query <- function(query) {
  # remove pluses between terms
  query_wt_plus = gsub("(?!\\B\"[^\"]*)[\\+]+(?![^\"]*\"\\B)", " ", query, perl=T)
  # remove multiple minuses and spaces after minuses
  query_wt_multi_minus = gsub("(?!\\B\"[^\"]*)((^|\\s))[\\-]+[\\s]*(?![^\"]*\"\\B)", "\\1-", query_wt_plus, perl=T)
  # remove multiple spaces inside the query
  query_wt_multi_spaces = gsub("(?!\\B\"[^\"]*)[\\s]{2,}(?![^\"]*\"\\B)", " ", query_wt_multi_minus, perl=T)
  # trim query, if needed
  query_cleaned = gsub("^\\s+|\\s+$", "", query_wt_multi_spaces, perl=T)

  # add "textus:" to each word/phrase to enable verbatim search
  # make sure it is added after any opening parentheses to enable queries such as "(a and b) or (a and c)"
  exact_query = gsub('([\"\']+(.*?)[\"\']+)|(?<=\\(\\b|\\+|-\\"\\b|\\s-\\b|^-\\b)|(?!or\\b|and\\b|[-]+[\\"\\(]*\\b)(?<!\\S)(?=\\S)(?!\\(|\\+)'
                   , "textus:\\1", query_cleaned, perl=T)
  expected = queries[[query]]
  if (exact_query != expected) {
    print(paste("Processing fails for", query, ". Result:", exact_query, "Expected:", expected))
  }
}

for (q in names(queries)) {
  test_preprocess_query(q)
}
