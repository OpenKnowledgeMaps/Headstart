library(RCurl)
library(jsonlite)

h = basicTextGatherer()
curlPerform(url = "https://api.econbiz.de/v1/search?q=serendipity&size=10", writefunction = h$update)

r =fromJSON(h$value())

result = r$hits$hits