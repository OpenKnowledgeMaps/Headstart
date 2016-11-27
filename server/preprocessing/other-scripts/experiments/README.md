## Setup experiments

* change working directory to `other-scripts/experiments`
* The experiment script can be copy&pasted to RStudio, and also works when called by e.g. `Rscript run_experiment.R 'natural language processing' doaj atn` from within the `experiments` folder
  * there are three arguments:
  * the first one `natural language processing` is the query
  * the second one is the service, either `pubmed` or `doaj`
  * the third one is the weighting scheme, a three letter combination. please have a look at [R tm weightSMART](https://www.rdocumentation.org/packages/tm/versions/0.6-2/topics/weightSMART) for available options
    * `nnn` is the simple TF
    * `ntn` is similar to TFIDF
