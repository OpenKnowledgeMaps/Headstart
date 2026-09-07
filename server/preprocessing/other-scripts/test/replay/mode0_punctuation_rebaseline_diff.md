# Replay label diff: punctuation segmentation in Mode 0

Mode 0 now shares the punctuation-aware title segmentation (its legacy
corpus structure is unchanged); prune_ngrams also no longer loses all
n-grams when every title yields the same n-gram count. Only changed
clusters listed; Modes 1-3 were unaffected by this change.

## base_cancer_fallback mode 0

- cluster 1:
  - before: Cancer screening, Health behavior, Artificial intelligence
  - after:  Cancer screening, Artificial intelligence, Associates Poll
- cluster 3:
  - before: Cancer incidence seer, Population-based cancer registration, Cancer control
  - after:  Cancer incidence, Population-based cancer registration, Cancer control
- cluster 6:
  - before: Challenges opportunities, Computational immuno, Immuno oncology
  - after:  Challenges and opportunities, Challenges opportunities, Computational immuno
- cluster 7:
  - before: Humans, Diet, Female
  - after:  Diet, Female, Humans
- cluster 11:
  - before: Cervix uteri, AIDS disease, Human cancer
  - after:  Cervix uteri, Human cancer, Biomolecular therapeutics
- cluster 12:
  - before: Cancer epidemiological, Clinical concepts, Epidemiological clinical
  - after:  Konsep Epidemiologis, Penelitian Kanker
- cluster 14:
  - before: Fibroblasts protagonists, Tumor microenvironment, Bone neoplasms
  - after:  Cancer fibroblasts, Fibroblasts protagonists, Protagonists tumor

## base_cancer_research mode 0

- cluster 1:
  - before: Cancer screening, Global cancer statistics, Epidemiology
  - after:  Cancer screening, Epidemiology, Global cancer statistics
- cluster 5:
  - before: Challenges opportunities, Computational immuno, Immuno oncology
  - after:  Challenges and opportunities, Challenges opportunities, Computational immuno
- cluster 10:
  - before: Cervix uteri, AIDS disease, Human cancer
  - after:  Cervix uteri, Human cancer, Biomolecular therapeutics
- cluster 11:
  - before: Cancer epidemiological, Clinical concepts, Epidemiological clinical
  - after:  Konsep Epidemiologis, Penelitian Kanker
- cluster 14:
  - before: Fibroblasts protagonists, Tumor microenvironment, Bone neoplasms
  - after:  Cancer fibroblasts, Fibroblasts protagonists, Protagonists tumor

## base_digital_education mode 0

- cluster 1:
  - before: MSc (digital education), Digital Uzbekistan e-learning platforms, Students
  - after:  Digital educational environment, E-learning, Students
- cluster 7:
  - before: Diversified education, Academic Advising, Accessibility
  - after:  Diversified education, Academic Advising, Adult and continuing education administration
- cluster 10:
  - before: Engineering education, Digital leadership, Digital platforms
  - after:  Engineering education, Digital leadership, Maritime education faculty
- cluster 14:
  - before: Digital tablet, Éducation inclusive, Éducation numérique
  - after:  Éducation numérique, Digital tablet, Éducation inclusive
- cluster 15:
  - before: Ethical considerations, Global legal practices, Legal Tech education
  - after:  Legal Tech education, Ethical considerations, Global legal practices

## openaire_fight_ncov mode 0

- cluster 2:
  - before: Assessment and dose-efficacy, Polymers preclinical assessment, 3. good health
  - after:  Assessment and dose-efficacy, Preclinical assessment, 3. good health
- cluster 4:
  - before: Sars-cov-2 variants, Adult, Neutralizing antibody responses
  - after:  Adult, Sars-cov-2 variants b.1.351, Neutralizing antibody responses
- cluster 5:
  - before: Activity month 12-18, Airway epithelia months, Antiviral activity month
  - after:  Airway epithelia, Determine tropism, Month 12-18

## orcid_0204881x mode 0

- cluster 1:
  - before: Agonistic design, Constructive disagreement, Neurodiverse children
  - after:  Agonistic design, Constructive disagreement, Critical Realist
- cluster 2:
  - before: Values-led participatory design, Autistic children, Science & technology
  - after:  Values-led participatory design, Autistic children, Cybernetics
- cluster 3:
  - before: Computational empowerment, Field grow, Formal education
  - after:  Computational empowerment, Child-AI Entanglements, Exploring Child-AI
- cluster 4:
  - before: Supporting children, Children social, Computing design
  - after:  Children social, Computing design, Creative modes
- cluster 5:
  - before: More-than-human, HCI, Configure decision
  - after:  More-than-human, HCI, Annan teknik
- cluster 8:
  - before: Verhandlung Technologischer Zukünfte
  - after:  Technologischer Zukünfte, Verhandlung Technologischer
- cluster 9:
  - before: Dementia care, Care Materializing, Designing robotic
  - after:  Dementia care, Designing robotic, Robotic technology

## orcid_02979614 mode 0

- cluster 1:
  - before: Attacking rate, Beast Attacking, Network security
  - after:  Attacking rate, Address shuffling, Beast Attacking
- cluster 4:
  - before: Cloudoscopy Services, Coordinated load, Grid shock
  - after:  Coordinated load, Grid shock, Topology mapping

## orcid_22336926 mode 0

- cluster 2:
  - before: Human sensing, Emotion, Mixed methods approach
  - after:  Emotion, Mixed methods approach, Walkability
- cluster 7:
  - before: Physiological wearable sensors, Moments of stress, Stress detection
  - after:  Moments of stress, Stress detection, Physiological wearable sensors
- cluster 9:
  - before: Naher Echtzeit, Data collection, Analysis flood
  - after:  Data collection, Naher Echtzeit, Analysis flood
- cluster 10:
  - before: Bicycle safety, Emotion sensing, Urban emotions benefits
  - after:  Bicycle safety, Emotion sensing, Urban emotions
- cluster 13:
  - before: Public and environmental health, Algorithms, Wearable electronic devices
  - after:  Wearable electronic devices, Environmental health, Female
- cluster 17:
  - before: Leveraging standardized, Standardized near real-time, Integrated geo-sensing
  - after:  Leveraging standardized, Integrated geo-sensing, Mobile phone usage

## orcid_24414043 mode 0

- cluster 1:
  - before: Accountability and oversight, Intelligence, Political science
  - after:  Accountability, Intelligence, Oversight
- cluster 2:
  - before: Ams algorithmus, Bedeutet Freiheit, Epistemologie und Funktionslogik
  - after:  Epistemologie und Funktionslogik, Funktionslogik von Cyber
- cluster 3:
  - before: Data science, Auditing intermediaries, Content
  - after:  Data science, Auditing intermediaries, Data set
- cluster 4:
  - before: Digital services, Google maps, Cultural sovereignty
  - after:  Google maps, Comparing travel, Cultural sovereignty
- cluster 5:
  - before: Ethics global perspectives, Governance and ethics, Algorithms
  - after:  Artificial intelligence, Escape from regulation, Ethics-washing to ethics-shopping
- cluster 6:
  - before: International relations theory
  - after:  Relations theory, International relations
- cluster 7:
  - before: Technologies human rights, Digital technology, Handbook human
  - after:  Human rights, Digital technology, Digital technologies
- cluster 11:
  - before: Surveillance technology, Export controls, International relations
  - after:  Surveillance technology, Export controls, Global governance
- cluster 14:
  - before: European foreign policy, Authority understanding internet, Governance and Nodal
  - after:  Understanding internet Exchange, European foreign policy, Governance and Nodal

## orcid_28976075 mode 0

- cluster 2:
  - before: Argumentation quality assessment, Argument generation, Argumentation knowledge
  - after:  Argument generation, Argumentation knowledge, Quality assessment
- cluster 6:
  - before: Machine learning, Behaviour change interventions, Clinical trial
  - after:  Clinical trial, Extracting factual, Machine learning
- cluster 7:
  - before: Analysis of high-agreement, Content Units, Haystack an analysis
  - after:  Analysis of high-agreement, Content Units, MTurk for summarization
- cluster 13:
  - before: Discourse structure
  - after:  Discourse Structure-Based framework, Framework for science, Science Journalism
- cluster 15:
  - before: Question answering, Objective approach, Anaphora resolution
  - after:  Question answering, Discourse context, Objective approach

## orcid_39246636 mode 0

- cluster 1:
  - before: Estimation drivers, Job displacement
  - after:  Job displacement, Skill mismatch

## orcid_42216275 mode 0

- cluster 2:
  - before: Neuropsychiatry, Deep learning, Differential diagnosis
  - after:  Observational learning, Neuropsychiatry, Machine learning
- cluster 8:
  - before: Hemisphere language
  - after:  Hemisphere in language, Hemisphere language, Language is Executive
- cluster 13:
  - before: EEG, Electrocardiography, Electroencephalography
  - after:  Brain-computer interface, EEG, Electrocardiography
- cluster 14:
  - before: Layer-5 pyramidal neurons, Bursting accelerates STDP, Acetylcholine and noradrenaline
  - after:  Layer-5 pyramidal neurons, Neuromodulation in layer-5
- cluster 15:
  - before: Predictive processing theorizes, OpenScope program, Address these conflicts
  - after:  Collaborative community experiment, Mechanisms of predictive, OpenScope program

## orcid_45050517 mode 0

- cluster 1:
  - before: Social and information networks, Data analysis, Statistics and probability
  - after:  Data analysis, Social and information networks, Phase transitions and critical phenomena
- cluster 4:
  - before: Humans, Medicine, Statistical models
  - after:  Humans, Medicine, Phase transition
- cluster 6:
  - before: Geophysics
  - after:  Aftershock sequences, Geophysics, Spatiotemporal correlations
- cluster 7:
  - before: Social and information networks, Machine Learning, Physics and Society
  - after:  Social and information networks, Physics and Society, Machine Learning
- cluster 9:
  - before: Biological physics, Disordered systems and neural networks, Random boolean networks
  - after:  Biological physics, Random boolean networks, Disordered systems and neural networks
- cluster 10:
  - before: Bayes theorem, Markov Chains
  - after:  Bayes theorem, Markov Chains, Temporal networks

## orcid_49712944 mode 0

- cluster 1:
  - before: Dietary recommendations, Digital receipts, Adult
  - after:  Adult, Algorithms, Counseling
- cluster 3:
  - before: Cerebral cortex, Intensities in t2, T2 MRI sequences
  - after:  Cerebral cortex, Intensities in t2/mri, T2/mri sequences
- cluster 13:
  - before: Customization Conceptualizing, Informational privacy, Behaviors online
  - after:  Behaviors online, Smart Products

## orcid_5116955x_r2 mode 0

- cluster 2:
  - before: Stochastic processes, Zero-determinant strategies, Biological evolution
  - after:  Stochastic processes, Zero-determinant strategies, Evolutionary game theory
- cluster 5:
  - before: Prisoner dilemma, Science, Game theory
  - after:  Science, Prisoner dilemma, Game theory
- cluster 8:
  - before: Indirect reciprocity, Behavioral Neuroscience, Experimental and cognitive Psychology
  - after:  Indirect reciprocity, Social dilemmas
- cluster 11:
  - before: Building capacity, Cooperation investments, Collective cooperative
  - after:  Building capacity, Collective cooperative, Cooperation investments
- cluster 12:
  - before: Coercion, Alliances, Applied Mathematics
  - after:  Coercion, Prisoner's dilemma, Alliances
- cluster 15:
  - before: Pool punishment, Democracy, Germany
  - after:  Pool punishment, Tragedy of the commons, Social behavior

## orcid_5116955x mode 0

- cluster 12:
  - before: Building capacity, Cooperation investments, Investments Building
  - after:  Building capacity, Cooperation investments, Ensure cooperation
- cluster 13:
  - before: Coercion, Alliances, Applied Mathematics
  - after:  Coercion, Prisoner's dilemma, Alliances
- cluster 15:
  - before: Pool punishment, Democracy, Germany
  - after:  Pool punishment, Tragedy of the commons, Social behavior

## orcid_58498137 mode 0

- cluster 2:
  - before: Valuation languages, Business & economics, Consistent criticism
  - after:  Valuation languages, Consistent criticism, Cost–benefit analysis

## orcid_60114382 mode 0

- cluster 1:
  - before: Hochschulen ein Werkstattbericht, Kommunikationstool Wissensmanagement-Potenziale, Lehre an Hochschulen
  - after:  Lehre an Hochschulen, Transformation der Lehre
- cluster 6:
  - before: Social semantic server, Learning network, Concepts practices
  - after:  Social semantic server, Learning network, Recommender approach
- cluster 9:
  - before: Field experiment, Tracing knowledge, Barcamp
  - after:  Field experiment, Tracing knowledge

## orcid_89117832 mode 0

- cluster 3:
  - before: Artificial Intelligence, Automated review, Automation
  - after:  Mental health, Scoping review, Artificial Intelligence
- cluster 4:
  - before: Assistant Prototype, Consent Assistant, Persuasive XAI
  - after:  Persuasive XAI, Awareness Persuasive, Compliance Awareness

## orcid_90626039 mode 0

- cluster 3:
  - before: Entanglement witnesses, Mirrored entanglement, Medicine
  - after:  Entanglement witnesses, Medicine, Mirrored entanglement
- cluster 6:
  - before: Medical physics, Positron-emission tomography, Instrumentation and detectors
  - after:  Medical physics, Instrumentation and detectors, Positron-emission tomography

## orcid_92873770 mode 0

- cluster 1:
  - before: Human-centered explainable, Explainable ai HCXAI
  - after:  Human-centered explainable
- cluster 4:
  - before: Visual sampling behavior, Data driven, Agent Teams
  - after:  Visual sampling behavior, Data driven, Automotive Wizard
- cluster 8:
  - before: Assistants accountability, Autonomous vehicles, Explanatory dialogues
  - after:  Autonomous vehicles, Explanatory dialogues, User acceptance
- cluster 9:
  - before: Dynamic monitoring, Management systems, Attention management
  - after:  Dynamic monitoring tasks, Attention management systems, Evaluating attention management
- cluster 11:
  - before: Automated driving, Driving hotzenplotz, Vehicle control
  - after:  Automated driving, Automated vehicles, Vehicle control
- cluster 13:
  - before: Automated driving, Augmentation concepts, Chatbots Waiting
  - after:  Automated driving, Augmentation concepts, Intelligent user

## orcid_96127791_r2 mode 0

- cluster 3:
  - before: Venous thromboembolism, Venous thrombosis, COVID cardiovascular diseases
  - after:  Venous thromboembolism, Venous thrombosis, Stroke
- cluster 4:
  - before: Covid-19 vaccination, SARs-CoV-2 infections COVID-RED, COVID adolescent
  - after:  Covid-19 vaccination, SARs-CoV-2 infections, COVID adolescent
- cluster 7:
  - before: Early-stage clinical evaluation, Artificial intelligence DECIDE-AI, Clinical decision support systems
  - after:  Early-stage clinical evaluation, Artificial intelligence, Clinical decision support systems
- cluster 11:
  - before: Challenges overview, Biomedical ontologies, Data opportunities
  - after:  Biomedical big data, Biomedical ontologies, Challenges overview
- cluster 13:
  - before: Population-scale linked data, Temporal sequencing, 20-year follow-up
  - after:  Population-scale linked data, Temporal sequencing, 1.7 million individuals
- cluster 14:
  - before: Association studies
  - after:  Genome-wide association studies, Positive Unlabelled learning, Learning for genome-wide
- cluster 17:
  - before: National electronic, Health records, Electronic health
  - after:  National electronic health, Predicting excess deaths, Model for predicting

## orcid_96127791 mode 0

- cluster 1:
  - before: Phenotyping algorithms, Common data model, COVID electronic health records
  - after:  Phenotyping algorithms, Common data model, Data harmonisation
- cluster 4:
  - before: Cohort studies, Retrospective studies, Late-onset epilepsy
  - after:  Cohort studies, Unsupervised machine learning, Humans
- cluster 5:
  - before: Artificial intelligence DECIDE-AI, Early-stage clinical evaluation, Clinical decision support systems
  - after:  Early-stage clinical evaluation, Artificial intelligence, Clinical decision support systems
- cluster 8:
  - before: Covid-19 vaccination, SARs-CoV-2 infections COVID-RED, Daily symptom diary
  - after:  Covid-19 vaccination, SARs-CoV-2 infections, COVID adolescent
- cluster 12:
  - before: Challenges overview, Biomedical ontologies, Data opportunities
  - after:  Biomedical big data, Biomedical ontologies, Challenges overview
- cluster 14:
  - before: Population-scale linked data, Temporal sequencing, 20-year follow-up
  - after:  Population-scale linked data, Temporal sequencing, 1.7 million individuals
- cluster 15:
  - before: Association studies
  - after:  Genome-wide association studies, Positive Unlabelled learning, Learning for genome-wide
- cluster 17:
  - before: National electronic, Health records, Electronic health
  - after:  National electronic health, Predicting excess deaths, Model for predicting

## orcid_98436798 mode 0

- cluster 9:
  - before: Library for deep, Short-term memory networks, Near-real-time streamflow observations
  - after:  Short-term memory networks, Near-real-time streamflow observations, Python library
- cluster 16:
  - before: Flow routing processes, Involving active student, Demonstrating the unit
  - after:  Flow routing processes, Involving active student, University lecture experiment

## pubmed_cancer_datasets mode 0

- cluster 4:
  - before: Database Poland, Dermoscopic lesions, Glioblastoma dataset
  - after:  Glioblastoma dataset, Histological Hyperspectral, Images extracted
- cluster 15:
  - before: Biomarker discovery, Cancer biomarker, DNA G-quadruplex
  - after:  Biomarker discovery, Cancer biomarker, Biomuta bioxpress

## pubmed_climate_change_all mode 0

- cluster 2:
  - before: Breeding crops, Climate resilience, Gendered vulnerability
  - after:  Gendered vulnerability, Global climate, Asthma
- cluster 3:
  - before: China, Climate change impacts, Consensus
  - after:  China, Climate change impacts, Crop yield
- cluster 4:
  - before: Environmental health, Climate conditions, Children
  - after:  Climate conditions, Environmental health, Meta analysis
- cluster 7:
  - before: Climate security, Dengue transmission, Malaria
  - after:  Climate security, Rigorous understanding, Avian demography
- cluster 9:
  - before: Climate change mitigation, Denial, Public understanding of science
  - after:  Climate change mitigation, Systematic review
- cluster 11:
  - before: Carbon feedback, Meta-analysis, Community pharmacist
  - after:  Carbon feedback, Community pharmacist, Geo-evolutionary feedbacks

## pubmed_disease_all mode 0

- cluster 4:
  - before: Acute dialysis, Historical overview, Jaws revisited
  - after:  Acute dialysis, Cardio renal, Cardiovascular entity
- cluster 7:
  - before: Eponym Kostmann, Genetic disease, Kostmann disease
  - after:  Genetic disease, Conversation with Kurt, Elizabeth McNally
- cluster 10:
  - before: Blood glucose, Certification Influences, Expander pupil
  - after:  Blood glucose, Certification Influences, Crossover study
- cluster 11:
  - before: Analyses human, Babesiosis clinical, Definition diseases
  - after:  Analyses human, Definition diseases, Disease relationships
- cluster 12:
  - before: Admiral Boerhaave-van Wassenaer, Boerhaave syndrome, Boerhaave Wassenaer
  - after:  Admiral Boerhaave, Boerhaave syndrome, Boerhaave Wassenaer
- cluster 15:
  - before: Chronic coronary, Coronary syndromes
  - after:  Chronic coronary syndromes, Patients with chronic, Vericiguat in combination

## pubmed_disease mode 0

- cluster 2:
  - before: ASD schizophrenia, Bipolar disorder, Colonic tissue
  - after:  Bipolar disorder, Colonic tissue, Diabetic donors
- cluster 3:
  - before: Alzheimer disease, ATN biomarkers, Castillian Spanish
  - after:  Alzheimer disease, Alzheimer's disease, ATN biomarkers
- cluster 5:
  - before: China data, Comprehensive dataset, Dementia mortality
  - after:  Comprehensive dataset, Dementia mortality, Disease outbreaks
- cluster 6:
  - before: Parkinson disease, Parkinson s disease, Multimodal dataset
  - after:  Parkinson disease, Parkinson's disease, Multimodal dataset
- cluster 9:
  - before: Blood transcriptome, Data illuminating, Human virus
  - after:  Blood transcriptome, Transcriptome dataset, Viral infection
- cluster 12:
  - before: Access dataset, Arboviral disease, Chikungunya Brazil
  - after:  Access dataset, Arboviral disease, Count data
- cluster 15:
  - before: Asiaticus strains, Candidatus Liberibacter, Genome assembly
  - after:  Candidatus Liberibacter, Genome assembly, Genome dataset

## pubmed_infection_all mode 0

- cluster 1:
  - before: Urinary tract infection, Joint infection, Randomised controlled
  - after:  Urinary tract infection, Joint infection, 14 days
- cluster 2:
  - before: Randomised controlled, Complicated urinary tract infection, Infections caused
  - after:  Complicated urinary tract infection, Infections caused, Randomised controlled
- cluster 3:
  - before: Rifampin-resistant tuberculosis, Month rifapentine, Pragmatic trial
  - after:  Month rifapentine, Rifampin-resistant tuberculosis, Moxifloxacin tuberculosis
- cluster 6:
  - before: Hiv infected, Africa HPTN, Congenital cytomegalovirus
  - after:  Hiv infected, Congenital cytomegalovirus, Hiv perinatal
- cluster 8:
  - before: Autobiography, Clinical practice Update, Infection expert review
  - after:  Clinical practice Update, Expert review, Helicobacter pylori infection
- cluster 11:
  - before: Plasmodium falciparum, Typhoid conjugate vaccine, Acquired immunodeficiency syndrome
  - after:  Typhoid conjugate vaccine, Acquired immunodeficiency syndrome, Africa South of the Sahara
- cluster 12:
  - before: COVID-19, Complement, SARS-CoV-2
  - after:  COVID-19, Complement, Randomized controlled trial

## pubmed_infection_datasets mode 0

- cluster 2:
  - before: Sequencing dataset, Data Lancaster, Deep sequencing
  - after:  Sequencing dataset, Deep sequencing, Genetic variation
- cluster 4:
  - before: Sub-Saharan Africa, China data, Comprehensive database
  - after:  Sub-Saharan Africa, Comprehensive database, Disease outbreaks
- cluster 8:
  - before: Blood cells, Cellular immune, Death molecular
  - after:  Blood cells, Cellular immune, Sequencing dataset
- cluster 9:
  - before: Access dataset, Arboviral disease, Chikungunya Brazil
  - after:  Access dataset, Arboviral disease, Count data

## pubmed_infection mode 0

- cluster 1:
  - before: Urinary tract infection, Joint infection, Randomised controlled
  - after:  Urinary tract infection, Joint infection, 14 days
- cluster 3:
  - before: Rifampin-resistant tuberculosis, Month rifapentine, Pragmatic trial
  - after:  Month rifapentine, Rifampin-resistant tuberculosis, Moxifloxacin tuberculosis
- cluster 6:
  - before: Hiv infected, Africa HPTN, Congenital cytomegalovirus
  - after:  Hiv infected, Congenital cytomegalovirus, Hiv perinatal
- cluster 8:
  - before: Autobiography, Clinical practice Update, Infection expert review
  - after:  Clinical practice Update, Expert review, Helicobacter pylori infection
- cluster 12:
  - before: Plasmodium falciparum, Typhoid conjugate vaccine, Acquired immunodeficiency syndrome
  - after:  Typhoid conjugate vaccine, Acquired immunodeficiency syndrome, Africa South of the Sahara

## pubmed_space_travel_all mode 0

- cluster 1:
  - before: Mitochondria, Oxidative stress, Aerospace medicine
  - after:  Mitochondria, Oxidative stress, Effects spaceflight
- cluster 2:
  - before: Disrupts murine, Hypergravity disrupts, Intestinal microbiota
  - after:  Weightlessness, Effects of microgravity, Boyle
- cluster 4:
  - before: Human health, Space flight, Space medicine
  - after:  Human health, Biological effects, Motion sickness
- cluster 5:
  - before: Earth benefits, Space exercise, Systematic review
  - after:  Systematic review, Microgravity, Bacterial infections
- cluster 9:
  - before: Acid-base balance, Biochemistry spaceflight, Bone mineral density
  - after:  Biochemistry spaceflight, NASA Discipline Regulatory physiology, Nutritional biochemistry
- cluster 10:
  - before: Stanley white
  - after:  Stanley white, Flight surgeons
- cluster 12:
  - before: Behavioral implications, Radiation behavioral, Reproductive hazards
  - after:  Reproductive hazards, Dosage forms, Fluid shift
- cluster 14:
  - before: Cellular organisms, Engineering human, Duration spaceflight
  - after:  Engineering human, Duration spaceflight, Space exploration

## pubmed_space_travel mode 0

- cluster 1:
  - before: Analysis China, Animal behavior, Brain organoids
  - after:  Brain organoids, Ground conditions, Analysis China
- cluster 3:
  - before: Color satellite, Development phytoplankton, Fingerprint libraries
  - after:  Color satellite, Fingerprint libraries, Development phytoplankton

## pubmed_species_all mode 0

- cluster 2:
  - before: Cutaneous leishmaniasis, Amoxicillin clavulanate, Clostridioides difficile
  - after:  Cutaneous leishmaniasis, Clostridioides difficile, Difficile infection
- cluster 3:
  - before: Christian Rudolph, Francis Galton, III Christian
  - after:  Francis Galton, Obstetrical hemorrhage, Birth eugenics
- cluster 4:
  - before: Alzheimer's disease, Alzheimer s disease, Active immunotherapy
  - after:  Alzheimer's disease, Active immunotherapy, ACU193
- cluster 5:
  - before: Anhydrase Thomas, Approach carbonic, Avian cardiac
  - after:  Avian cardiac, Cardiac physiologist, Charcot paradox
- cluster 7:
  - before: Randomized clinical trial, Cardiac arrest, Keratitis clinical
  - after:  Randomized clinical trial, Cardiac arrest, Adenoviral keratoconjunctivitis
- cluster 8:
  - before: Charles Darwin, Darwin scientist, Entomological reactions
  - after:  Charles Darwin, Darwin 1809-2009, Entomological reactions
- cluster 10:
  - before: Centennial review, Comet assay, Corneal transplantation
  - after:  Centennial review, Corneal transplantation, Classics revisited
- cluster 11:
  - before: Darwin and Haeckel, Hermann Joseph, Joseph Muller
  - after:  Population genetics, Darwin and Haeckel, Hermann Joseph
- cluster 14:
  - before: Genome evolution, Microarray design, Oligo microarray
  - after:  Genome evolution, Epigenetics, Microarray design
- cluster 15:
  - before: Disease food, Disease risk, Disturbance increase
  - after:  Disease risk, Disturbance increase, Insects environmental

## pubmed_species mode 0

- cluster 6:
  - before: Functional traits, African bats, Amphipoda Niphargidae
  - after:  Functional traits, African bats, Ecological traits
- cluster 7:
  - before: Camera traps, Artificial intelligence, Bipartite networks
  - after:  Bipartite networks, Camera traps, Conservation
- cluster 8:
  - before: Common vampire, Distribution maps, Habitat maps
  - after:  Aerial surveys, Common vampire, Distribution maps
- cluster 13:
  - before: Herbal species, Acoustic communication, Database Vietnamese
  - after:  Herbal species, Microbial volatiles, Acoustic communication

## pubmed_vienna_all mode 0

- cluster 7:
  - before: Randomised controlled trial, Meropenem treatment, Randomised phase
  - after:  Meropenem treatment, Randomised controlled trial, Chronic lymphocytic
- cluster 15:
  - before: Carl Toldt, Historical Contribution, Lipochrome
  - after:  Carl Toldt, Historical Contribution, Obstetric forceps

## pubmed_vienna mode 0

- cluster 3:
  - before: Catalog genome, Genetic variation, Humans primates
  - after:  Genetic variation, Primate species, Catalog genome
- cluster 5:
  - before: Access dataset, Citizen science, Collaboration dependencies
  - after:  Access dataset, Citizen science, Collaboration networks
- cluster 7:
  - before: Cancer Histology, Canine cutaneous, CATCH dataset
  - after:  Cancer Histology, Canine cutaneous, Characterization data
- cluster 10:
  - before: Alder birch, Aragwas catalog, Brain tumour
  - after:  Aragwas catalog, Brain tumour, DHS countries
- cluster 14:
  - before: Genome assembly, Bobtail squid, Cultivar Désirée
  - after:  Genome assembly, Bobtail squid, Euprymna scolopes

## pubmed_work_all mode 0

- cluster 2:
  - before: Care nurse, Nurses perceptions, Patient satisfaction
  - after:  Care nurse, Patient satisfaction, Stress management
- cluster 4:
  - before: Personal profile, Profile interview, Allain Pioneer
  - after:  Personal profile, Alexandra Stolzing, Annelies Allain
- cluster 7:
  - before: Patient safety, Hour reduction, Mortality risk
  - after:  Patient safety, Hour reduction, Resident physician
- cluster 10:
  - before: Health study, Social engagement intervention, Randomized controlled
  - after:  Health study, Randomized controlled, Quality of life
- cluster 11:
  - before: Cardiac demands, Community variations, Display units
  - after:  Display units, Ergonomic intervention, Health outcomes
- cluster 13:
  - before: Clinical practice guidelines, Infographic returning, Jospt Infographic
  - after:  Clinical practice guidelines, Workers
- cluster 14:
  - before: Coronary heart disease, Systematic review, Disease systematic
  - after:  Coronary heart disease, Systematic review, Review and meta-analysis

## pubmed_work mode 0

- cluster 3:
  - before: Dataset image, Banana leaves, Fundus MSHF
  - after:  Dataset image, Banana leaves, Glioblastoma dataset
- cluster 5:
  - before: Arboviral disease, Breast cancers, Building Rooftops
  - after:  Breast cancers, Building Rooftops, Depression dataset
- cluster 7:
  - before: Bird species, Expression dataset, Extended Lombardy
  - after:  Expression dataset, Facial expression, Reference dataset
- cluster 8:
  - before: Accelerometer magnetometer, Advanced melanoma, Atmospheric moisture
  - after:  Advanced melanoma, Atmospheric moisture, Blood pressure
- cluster 11:
  - before: Dementia mortality, Healthcare monitoring, Heat acclimation
  - after:  Dementia mortality, Heat acclimation, Human heat
- cluster 13:
  - before: Curated plant, Elemental crystals, Peptide database
  - after:  Curated plant, Peptide database, Elemental crystals

