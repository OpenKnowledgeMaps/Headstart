rm(list = ls())
library(logging)
library(jsonlite)
library(dplyr)
library(tidyr)

args <- commandArgs(TRUE)
wd <- args[1]
service <- args[2]
tmp_json <- args[3]

setwd(wd) #Don't forget to set your working directory

sglog <- getLogger('sg')

start.time <- Sys.time()
metadata <- fromJSON(tmp_json)

sg_data = list()

if (service == 'linkedcat' || service == 'linkedcat_authorview') {
  sg_data$area <- metadata %>% group_by(year, area) %>% count
  sg_data$subject <- metadata %>% separate_rows(subject, sep="; ") %>% group_by(year, subject) %>% count
  sg_data$bkl_caption <- metadata %>% separate_rows(bkl_caption, sep="; ") %>% group_by(year, bkl_caption) %>% count
}

end.time <- Sys.time()
time.taken <- end.time - start.time
sglog$info(paste("Time taken streamgraph:", time.taken, sep=" "))
print(toJSON(sg_data))
