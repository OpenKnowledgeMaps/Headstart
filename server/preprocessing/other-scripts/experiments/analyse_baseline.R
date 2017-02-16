library("ggplot2")
library("GGally")
library("reshape2")

hexbin_mapper <- function(data, mapping, ...){
  p <- ggplot(data = data, mapping = mapping) + 
    geom_hex(bins=15)
  p
}

pubmed <- read.csv("baseline_data_statistics_pubmed.csv")
doaj <- read.csv("baseline_data_statistics_doaj.csv")
#drops <- c("query")
#pubmed <- pubmed[ , !(names(pubmed) %in% drops)]
#doaj <- doaj[ , !(names(doaj) %in% drops)]
doaj$nasum <- apply(doaj[ ,9:35], 1, sum)
pubmed$nasum <- apply(pubmed[ ,9:22], 1, sum)

df <- rbind(doaj[,c("service", "result_size", "k_baseline", "stress", "R2", "tdm_sparsity", "norm_sparsity", "nasum")], 
            pubmed[,c("service", "result_size", "k_baseline", "stress", "R2", "tdm_sparsity", "norm_sparsity", "nasum")])

for_boxplot <- rbind(doaj[, c("service", "nasum")],
                     pubmed[, c("service", "nasum")])
n_obs <- function(x){return(c(y=median(x)+10, label=mean(x)))}
ggplot(melt(for_boxplot), aes(x=variable, y=value, fill=service)) + geom_boxplot() + stat_summary(fun.data = n_obs, geom="text", fun.y=median)
ggsave("total_na_boxplot.png", width=6, height=4, units="in")


for_pairplot <- rbind(doaj[, c("service", "result_size", "k_baseline", "stress", "R2", "tdm_sparsity", "norm_sparsity", "nasum")],
                     pubmed[, c("service", "result_size", "k_baseline", "stress", "R2", "tdm_sparsity", "norm_sparsity", "nasum")])
ggpairs(for_pairplot, lower = list(continuous = hexbin_mapper))
ggsave("na_pairs.png", width=12, height=8, units="in")

drops <- c("query", "result_size", "k_baseline", "stress", "R2", "tdm_sparsity", "norm_sparsity", "nasum")
nas_d <- doaj[ , !(names(doaj) %in% drops)]
nas_p <- pubmed[ , !(names(pubmed) %in% drops)]

n_obs <- function(x){return(c(y=-5, label=sum(x)))}
ggplot(melt(nas_p), aes(x=variable, y=value, fill=service)) + geom_boxplot() + theme(axis.text.x = element_text(angle = 90, hjust = 1)) + stat_summary(fun.data = n_obs, geom="text", fun.y=median)
ggsave("pubmed_na_boxplots.png", width=12, height=8, units="in")

ggplot(melt(nas_d), aes(x=variable, y=value, fill=service)) + geom_boxplot() + theme(axis.text.x = element_text(angle = 90, hjust = 1)) + stat_summary(fun.data = n_obs, geom="text", fun.y=median)
ggsave("doaj_na_boxplots.png", width=12, height=8, units="in")