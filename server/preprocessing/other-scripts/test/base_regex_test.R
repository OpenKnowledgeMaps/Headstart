query = c('2019-ncov and sars-cov-2'
            ,'term1 term2 term3'
            ,'(dog and cat) or (sun and moon)'
            ,'cats and "mice and cheese"'
            ,'cats or (sun and moon)'
            ,'(parentheses or ("cats and dogs"))'
            ,'-2019-ncov'
            ,'--2019-ncov'
            ,'(a and b -"c")'
            ,'+-"'
            ,'2019-ncov or sars-cov-2'
            ,'"2019-ncov" or "sars-cov-2"'
            ,'"2019-ncov"+"sars-cov-2"'
            ,'"2019-ncov" + "sars-cov-2"'
            ,'"2019-ncov"+"sars-cov-2"'
            ,'(cats + dogs) or (sun - moon)'
            ,'science -(research or knowledge or theory)'
            ,'orandor or andorand'
            ,'science -research -knowledge -theory'
            ,'a+b'
            ,'and or not'
            ,'-(dogs+cats)'
            ,'((cats) and dogs)'
            ,'""knowledge and domain visualization""'
            ,'((-""hello"") or test)'
            ,'cats - dogs'
            ,'cats --- dogs'
            ,'cats +++ dogs'
            ,'\'\'test\'\''
            ,'a+b')

# remove pluses between terms, remove spaces after minuses
query_wt_plus = gsub("(^|\\s)[\\+]+[\\s]+", " ", query, perl=T)
query_cleaned = gsub("((^|\\s)[-]+)[\\s]+", " \\1", query_wt_plus, perl=T)

# add "textus:" to each word/phrase to enable verbatim search
# make sure it is added after any opening parentheses to enable queries such as "(a and b) or (a and c)"
exact_query = gsub('([\"\']+(.*?)[\"\']+)|(?<=\\(\\b|\\+|-\\"\\b)|(?!or\\b|and\\b|[-]+[\\"\\(]*\\b)(?<!\\S)(?=\\S)(?!\\(|\\+)'
                   , "textus:\\1", query_cleaned, perl=T)

exact_query