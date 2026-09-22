# Replay label diff: label exclusions in Mode 0

drop_excluded_terms now runs in the Mode-0 branch too (post-tf-idf,
pre-selection), so listed generic terms cannot become Mode-0 labels.
Only changed clusters listed; Modes 1-3 unaffected.

## base_cancer_fallback mode 0

- cluster 7:
  - before: Diet, Female, Humans
  - after:  Diet, Female, Colorectal neoplasms
- cluster 13:
  - before: Breast cancer, Biotechnology, Medicine
  - after:  Breast cancer, Biotechnology, Science policy

## base_cancer_research mode 0

- cluster 6:
  - before: Humans, Colorectal neoplasms, Diet
  - after:  Colorectal neoplasms, Diet, Female
- cluster 13:
  - before: Breast cancer, Biotechnology, Medicine
  - after:  Breast cancer, Biotechnology, Science policy

## orcid_39246636 mode 0

- cluster 6:
  - before: Cities, Urban population, Humans
  - after:  Cities, Urban population

## orcid_42216275 mode 0

- cluster 9:
  - before: Spatial learning, Automation, ScholarlyArticle
  - after:  Spatial learning, Automation, Radial arm maze automated testing system animal welfare animal experimentation refinement and replacement
- cluster 12:
  - before: Medicine, Science, Placental implantation
  - after:  Placental implantation, Female, & dosage

## orcid_45050517 mode 0

- cluster 4:
  - before: Humans, Medicine, Phase transition
  - after:  Phase transition, Statistical models, Data analysis, Statistics and probability

## orcid_5116955x_r2 mode 0

- cluster 5:
  - before: Science, Prisoner dilemma, Game theory
  - after:  Prisoner dilemma, Game theory, Psychological models
- cluster 10:
  - before: Animals, Birds, Coevolution
  - after:  Birds, Coevolution, Grooming

## orcid_5116955x mode 0

- cluster 5:
  - before: Prisoner dilemma, Game theory, Science
  - after:  Prisoner dilemma, Game theory, Motivation
- cluster 10:
  - before: Animals, Birds, Coevolution
  - after:  Birds, Coevolution, Grooming

## orcid_90626039 mode 0

- cluster 3:
  - before: Entanglement witnesses, Medicine, Mirrored entanglement
  - after:  Entanglement witnesses, Mirrored entanglement, Bound entanglement

## orcid_96127791_r2 mode 0

- cluster 5:
  - before: Cohort studies, Female, Humans
  - after:  Cohort studies, Female, Late-onset epilepsy

## orcid_96127791 mode 0

- cluster 4:
  - before: Cohort studies, Unsupervised machine learning, Humans
  - after:  Cohort studies, Unsupervised machine learning, Female
- cluster 9:
  - before: Article, Nationwide study, COVID outcomes
  - after:  Nationwide study, COVID outcomes, Disease trajectories

