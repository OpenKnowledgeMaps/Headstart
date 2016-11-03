## Setup experiments

* In experiments/run_experiment.R:
  * `line 9`: change working directory to the full path of the experiments-folder - it looks for the preprocessing scripts in relative paths
  * `line 45`: change the experiment_name, it should be something the reflects the parameters - the pdfs are named accordingly
  * `line 36`: for additional output, set `debug = TRUE`

* In vis_layout.R:
  * when wanting to experiment on filling missing keywords, tweak the `replace_keywords_if_empty` function in `lines 71-98`
  * when wanting to experiment on cluster naming, tweak the `create_cluster_names` function in `lines 168-186`

* The experiment script can be copy&pasted to RStudio, and also works when called by `Rscript run_experiment` from within the `experiments` folder
