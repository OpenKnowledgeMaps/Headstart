rm(list = ls())
library(jsonlite)
library(dplyr)
library(tidyr)

args <- commandArgs(TRUE)
wd <- args[1]
tmp_json <- args[2]

setwd(wd) #Don't forget to set your working directory

metadata <- fromJSON(tmp_json)

sg_data = list()

sg_data$area <- metadata %>% group_by(year, area) %>% count
sg_data$subject <- metadata %>% separate_rows(subject, sep="; ") %>% group_by(year, subject) %>% count
sg_data$classification <- metadata %>% separate_rows(bkl_caption, sep="; ") %>% group_by(year, bkl_caption) %>% count

print(toJSON(sg_data))
