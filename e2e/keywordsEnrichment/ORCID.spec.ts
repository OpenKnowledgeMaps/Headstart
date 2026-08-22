import { test, expect, Page } from "@playwright/test";
import { prepareVisualisation } from "../../vis/js/utils/e2eVisualisationLoader";

interface EnrichmentTestCase {
  suiteName: string;
  orcid: string;
  paperTitle: string;
  keywords?: string;
  abstract?: string;
  flaky?: boolean;
}

const testCases: EnrichmentTestCase[] = [
  {
    suiteName: "regression test",
    orcid: "0000-0001-5116-955X",
    paperTitle: "Humans choose representatives who enforce cooperation in social dilemmas through extortion",
    abstract:
      "Social dilemmas force players to balance between personal and collective gain. In many dilemmas, such as elected governments negotiating climate-change mitigation measures, the decisions are made not by individual players but by their representatives. However, the behaviour of representatives in social dilemmas has not been investigated experimentally. Here inspired by the negotiations for greenhouse-gas emissions reductions, we experimentally study a collective-risk social dilemma that involves representatives deciding on behalf of their fellow group members. Representatives can be re-elected or voted out after each consecutive collective-risk game. Selfish players are preferentially elected and are hence found most frequently in the ‘representatives’ treatment. Across all treatments, we identify the selfish players as extortioners. As predicted by our mathematical model, their steadfast strategies enforce cooperation from fair players who finally compensate almost completely the deficit caused by the extortionate co-players. Everybody gains, but the extortionate representatives and their groups gain the most.",
    keywords:
      "Climate Change [MeSH]; Cooperative Behavior [MeSH]; Female [MeSH]; Game Theory [MeSH]; Humans [MeSH]; Interpersonal Relations [MeSH]; Models, Theoretical [MeSH]; Q; Science; Young Adult [MeSH]; ddc:519; ddc:530",
  },
  {
    suiteName: "regression test",
    orcid: "0000-0001-5116-955X",
    paperTitle: "Extortion subdues human players but is finally punished in the prisoner’s dilemma",
    abstract:
      "Extortion is the practice of obtaining advantages through explicit forces and threats. Recently, it was demonstrated that even the repeated prisoner’s dilemma, one of the key models to explain mutual cooperation, allows for implicit forms of extortion. According to the theory, extortioners demand and receive an excessive share of any surplus, which allows them to outperform any adapting co-player. To explore the performance of such strategies against humans, we have designed an economic experiment in which participants were matched either with an extortioner or with a generous co-player. Although extortioners succeeded against each of their human opponents, extortion resulted in lower payoffs than generosity. Human subjects showed a strong concern for fairness: they punished extortion by refusing to fully cooperate, thereby reducing their own, and even more so, the extortioner’s gains. Thus, the prospects of extorting others in social relationships seem limited; in the long run, generosity is more profitable.",
    keywords:
      "Coercion [MeSH]; Cooperative Behavior [MeSH]; Game Theory [MeSH]; Humans [MeSH]",
  },
  {
    suiteName: "regression test",
    orcid: "0000-0001-5116-955X",
    paperTitle: "Asymmetric Power Boosts Extortion in an Economic Experiment",
    abstract:
      "Direct reciprocity is a major mechanism for the evolution of cooperation. Several classical studies have suggested that humans should quickly learn to adopt reciprocal strategies to establish mutual cooperation in repeated interactions. On the other hand, the recently discovered theory of ZD strategies has found that subjects who use extortionate strategies are able to exploit and subdue cooperators. Although such extortioners have been predicted to succeed in any population of adaptive opponents, theoretical follow-up studies questioned whether extortion can evolve in reality. However, most of these studies presumed that individuals have similar strategic possibilities and comparable outside options, whereas asymmetries are ubiquitous in real world applications. Here we show with a model and an economic experiment that extortionate strategies readily emerge once subjects differ in their strategic power. Our experiment combines a repeated social dilemma with asymmetric partner choice. In our main treatment there is one randomly chosen group member who is unilaterally allowed to exchange one of the other group members after every ten rounds of the social dilemma. We find that this asymmetric replacement opportunity generally promotes cooperation, but often the resulting payoff distribution reflects the underlying power structure. Almost half of the subjects in a better strategic position turn into extortioners, who quickly proceed to exploit their peers. By adapting their cooperation probabilities consistent with ZD theory, extortioners force their co-players to cooperate without being similarly cooperative themselves. Comparison to non-extortionate players under the same conditions indicates a substantial net gain to extortion. Our results thus highlight how power asymmetries can endanger mutually beneficial interactions, and transform them into exploitative relationships. In particular, our results indicate that the extortionate strategies predicted from ZD theory could play a more prominent role in our daily interactions than previously thought.",
    keywords:
      "Applied Mathematics; Behavior; Biology and Life Sciences; Coercion [MeSH]; Economics; Experimental Design; Experimental Economics; Game Theory; Game Theory [MeSH]; Games; Generalized Linear Model; Humans [MeSH]; Interpersonal Relations [MeSH]; Mathematical and Statistical Techniques; Mathematics; Medicine; Models, Theoretical [MeSH]; Physical Sciences; Prisoner's Dilemma; Psychology; Q; R; Recreation; Science; Social Behavior [MeSH]; Social Psychology; Social Sciences; Statistical Methods; Statistics (Mathematics); ddc:004",
  },
  {
    suiteName: "regression test",
    orcid: "0000-0001-5116-955X",
    paperTitle: "Democratic decisions establish stable authorities that overcome the paradox of second-order punishment",
    abstract:
      "Humans usually punish free riders but refuse to sanction those who cooperate but do not punish. However, such second-order punishment is essential to maintain cooperation. The central authorities established in modern societies punish both free riders and tax evaders. This is a paradox: would individuals who do not engage in second-order punishment strive for an authority that does? We address this puzzle with a mathematical model and an economic experiment. When individuals can choose between authorities by migrating between different communities, we find a costly bias against second-order punishment. When subjects use a majority vote instead, they vote for an authority with second-order punishment. These findings also suggest that other pressing social dilemmas could be solved by democratic voting.",
    keywords:
      "Computer Simulation [MeSH]; Cooperative Behavior [MeSH]; Democracy [MeSH]; Germany [MeSH]; Humans [MeSH]; Models, Theoretical [MeSH]; Politics [MeSH]; Punishment [MeSH]; Social Control Policies [MeSH]; evolution of cooperation; institution formation; pool punishment",
  },
  {
    suiteName: "regression test",
    orcid: "0000-0001-5116-955X",
    paperTitle: "The effect of environmental information on evolution of cooperation in stochastic games",
    abstract:
      "Many human interactions feature the characteristics of social dilemmas where individual actions have consequences for the group and the environment. The feedback between behavior and environment can be studied with the framework of stochastic games. In stochastic games, the state of the environment can change, depending on the choices made by group members. Past work suggests that such feedback can reinforce cooperative behaviors. In particular, cooperation can evolve in stochastic games even if it is infeasible in each separate repeated game. In stochastic games, participants have an interest in conditioning their strategies on the state of the environment. Yet in many applications, precise information about the state could be scarce. Here, we study how the availability of information (or lack thereof) shapes evolution of cooperation. Already for simple examples of two state games we find surprising effects. In some cases, cooperation is only possible if there is precise information about the state of the environment. In other cases, cooperation is most abundant when there is no information about the state of the environment. We systematically analyze all stochastic games of a given complexity class, to determine when receiving information about the environment is better, neutral, or worse for evolution of cooperation.",
    keywords:
      "B- ECONOMIE ET FINANCE; Cooperative Behavior [MeSH]; Humans [MeSH]; Mass Gatherings [MeSH]; Q; Science; [SHS.ECO]Humanities and Social Sciences/Economics and Finance; ddc:000",
  },
  {
    suiteName: "regression test",
    orcid: "0000-0001-5116-955X",
    paperTitle: "Social immunity modulates competition between coinfecting pathogens",
    abstract:
      "Coinfections with multiple pathogens can result in complex within‐host dynamics affecting virulence and transmission. While multiple infections are intensively studied in solitary hosts, it is so far unresolved how social host interactions interfere with pathogen competition, and if this depends on coinfection diversity. We studied how the collective disease defences of ants – their social immunity – influence pathogen competition in coinfections of same or different fungal pathogen species. Social immunity reduced virulence for all pathogen combinations, but interfered with spore production only in different‐species coinfections. Here, it decreased overall pathogen sporulation success while increasing co‐sporulation on individual cadavers and maintaining a higher pathogen diversity at the community level. Mathematical modelling revealed that host sanitary care alone can modulate competitive outcomes between pathogens, giving advantage to fast‐germinating, thus less grooming‐sensitive ones. Host social interactions can hence modulate infection dynamics in coinfected group members, thereby altering pathogen communities at the host level and population level.",
  },
  {
    suiteName: "regression test",
    orcid: "0000-0001-5116-955X",
    paperTitle: "Exact conditions for evolutionary stability in indirect reciprocity under noise",
    keywords:
      "Biological Evolution [MeSH]; Biology (General); Computational Biology [MeSH]; Computer Simulation [MeSH]; Cooperative Behavior [MeSH]; Game Theory [MeSH]; Humans [MeSH]; QH301-705.5; Social Norms [MeSH]",
  },
  {
    suiteName: "regression test",
    orcid: "0000-0003-4221-6275",
    paperTitle: "Proportion of foetal and placental implantation abnormalities in Madagascar: A cross-sectional study of 35,919 women at public-sector primary healthcare facilities in central and southern Madagascar, 2017–2020",
    abstract: `<jats:sec id="sec001">
<jats:title>Background</jats:title>
<jats:p>Like other countries in sub-Saharan Africa, Madagascar has a high burden of maternal and neonatal mortality. However, as the proportion of foetal and placental abnormalities among the Malagasy population is unknown, strategies aimed at reducing maternal and neonatal mortality are challenging to define and implement.</jats:p>
</jats:sec>
<jats:sec id="sec002">
<jats:title>Methods</jats:title>
<jats:p>We conducted a multi-year, cross-sectional study using secondary NGO data on obstetric ultrasound, including patient records of all pregnant women who received an obstetric ultrasound screening between July 1st, 2017, and September 30th, 2020, at 62 public-sector primary care facilities in urban and rural regions of Madagascar. We analysed demographic characteristics and determined the prevalence of foetal and placental abnormalities.</jats:p>
</jats:sec>
<jats:sec id="sec003">
<jats:title>Results</jats:title>
<jats:p>The dataset included 38,688 ultrasound screening reports from 35,919 women, where 2,587/35,919 (7.20%) women had more than one ultrasound exam. Most women (68.63%, 26,550/38,688) received their first ultrasound during the third trimester of pregnancy. Foetal malpresentation at 36 weeks of gestation or later was diagnosed in 5.48% (176/3,211) of women with the breech presentation being most common (breech 3.99%, 128/3,211; transverse 0.84%, 27/3,211; mobile 0.5%, 16/3,211; oblique 0.16%, 5/3,211). Placenta previa was found in 2.31% (875/38,755) and multiple gestations in 1.03% (370/35,919) cases. Around one in every 150 women (0.66%, 234/38,702) had amniotic fluid disorders.</jats:p>
</jats:sec>
<jats:sec id="sec004">
<jats:title>Conclusion</jats:title>
<jats:p>The proportion of foetal and placental abnormalities detected by obstetric ultrasound is consistent with findings from other countries in sub-Saharan Africa. In contrast to current WHO recommendations, pregnant women, particularly those from rural, resource-constrained settings attend obstetric ultrasound screenings most commonly during their third trimester of pregnancy.</jats:p>
</jats:sec>`,
    keywords:
      "Adolescent [MeSH]; Adult [MeSH]; Cross-Sectional Studies [MeSH]; Female [MeSH]; Fetus [MeSH]; Humans [MeSH]; Madagascar [MeSH]; Medicine; Medizin und Gesundheit; Placenta [MeSH]; Pregnancy [MeSH]; Prevalence [MeSH]; Primary Health Care [MeSH]; Public Sector [MeSH]; Q; R; Science; Ultrasonography, Prenatal [MeSH]; Young Adult [MeSH]; ddc:610; foetal and placental abnormalities; foetal implantation; obstretric ultrasound; placental implantation",
  },
  {
    suiteName: "regression test",
    orcid: "0000-0003-4221-6275",
    paperTitle: "Body temperature measurement in mice during acute illness: implantable temperature transponder versus surface infrared thermometry.",
    flaky: true,
    abstract:
      "Abstract Body temperature is a valuable parameter in determining the wellbeing of laboratory animals. However, using body temperature to refine humane endpoints during acute illness generally lacks comprehensiveness and exposes to inter-observer bias. Here we compared two methods to assess body temperature in mice, namely implanted radio frequency identification (RFID) temperature transponders (method 1) to non-contact infrared thermometry (method 2) in 435 mice for up to 7 days during normothermia and lipopolysaccharide (LPS) endotoxin-induced hypothermia. There was excellent agreement between core and surface temperature as determined by method 1 and 2, respectively, whereas the intra- and inter-subject variation was higher for method 2. Nevertheless, using machine learning algorithms to determine temperature-based endpoints both methods had excellent accuracy in predicting death as an outcome event. Therefore, less expensive and cumbersome non-contact infrared thermometry can serve as a reliable alternative for implantable transponder-based systems for hypothermic responses, although requiring standardization between experimenters.",
    keywords:
      "600 Technik, Medizin, angewandte Wissenschaften::610 Medizin und Gesundheit::610 Medizin und Gesundheit; Acute Disease; Acute Disease [MeSH]; Animals; Animals [MeSH]; Body Temperature [MeSH]; Creative Commons Namensnennung – 4.0 International (CC BY 4.0); Electrodes; Electrodes, Implanted [MeSH]; Female; Female [MeSH]; Hypothermia [MeSH]; Hypothermia: chemically induced; Hypothermia: diagnosis; Hypothermia: mortality; Hypothermia: physiopathology; Implanted; Inbred C57BL; Infrared Rays; Infrared Rays [MeSH]; Lipopolysaccharides; Lipopolysaccharides [Chemical]; Lipopolysaccharides [MeSH]; Lipopolysaccharides: administration & dosage; Machine Learning; Machine Learning [MeSH]; Medicine; Mice; Mice [MeSH]; Mice, Inbred C57BL [MeSH]; Q; R; Radio Frequency Identification Device [MeSH]; Radio Frequency Identification Device: methods; Science; Sepsis [MeSH]; Sepsis: chemically induced; Sepsis: diagnosis; Sepsis: mortality; Sepsis: physiopathology; Survival Analysis; Survival Analysis [MeSH]; Text; Thermometers [MeSH]; Thermometers: classification; Thermometry: instrumentation; Thermometry: methods; article; ddc:610; info:eu-repo/classification/ddc/600; radio frequency identification (RFID); radio frequency identification RFID",
  },
  {
    suiteName: "regression test",
    orcid: "0000-0003-4221-6275",
    paperTitle: "Seismic Facies Analysis: A Deep Domain Adaptation Approach",
    abstract:
      "Deep neural networks (DNNs) can learn accurately from large quantities of labeled input data, but often fail to do so when labelled data are scarce. DNNs sometimes fail to generalize ontest data sampled from different input distributions. Unsupervised Deep Domain Adaptation (DDA)techniques have been proven useful when no labels are available, and when distribution shifts are observed in the target domain (TD). In the present study, experiments are performed on seismic images of the F3 block 3D dataset from offshore Netherlands (source domain; SD) and Penobscot 3D survey data from Canada (target domain; TD). Three geological classes from SD and TD that have similar reflection patterns are considered. A deep neural network architecture named EarthAdaptNet (EAN) is proposed to semantically segment the seismic images when few classes have data scarcity, and we use a transposed residual unit to replace the traditional dilated convolution in the decoder block. The EAN achieved a pixel-level accuracy >84% and an ... : 22 pages, 13 figures, 5 tables, and supplementary material included in the end of the paper ...",
    keywords:
      "Artificial Intelligence cs.AI; Computer Vision and Pattern Recognition cs.CV; FOS: Computer and information sciences; FOS: Electrical engineering, electronic engineering, information engineering; FOS: Physical sciences; Geophysics physics.geo-ph; Image and Video Processing eess.IV; Machine Learning cs.LG",
  },
  {
    suiteName: "regression test",
    orcid: "0000-0003-4221-6275",
    paperTitle: "Informing deep neural networks by multiscale principles of neuromodulatory systems",
    abstract:
      "Our brains have evolved the ability to configure and adapt their processing states to match the unique challenges of acting and learning in diverse environments and behavioral contexts. In biological nervous systems, such state specification and adaptation arise in part from neuromodulators, including acetylcholine, noradrenaline, serotonin, and dopamine, whose diffuse release fine-tunes neuronal and synaptic dynamics and plasticity to complement the behavioral context in real-time. Despite the demonstrated effectiveness of deep neural networks for specific tasks, they remain relatively inflexible at generalizing across tasks or adapting to ever-changing behavioral demands. In this article, we provide an overview of neuromodulatory systems and their relationship to emerging pertinent principles in deep neural networks. We further outline opportunities for the integration of neuromodulatory principles into deep neural networks, towards endowing artificial intelligence with a key ingredient underlying the flexibility and learning capability of biological systems.",
    keywords:
      "610 Medicine & health; Artificial Intelligence [MeSH]; Dopamine [Chemical]; Dopamine [MeSH]; Humans [MeSH]; Neural Networks, Computer [MeSH]; Neurotransmitter Agents [Chemical]; Neurotransmitter Agents [MeSH]; Serotonin [Chemical]; Serotonin [MeSH]; acetylcholine; adaptive learning; dopamine; multiscale organization; noradrenaline; serotonin",
  },
  {
    suiteName: "bugfix merge of keywords and abstracts",
    orcid: "0000-0002-5238-4195",
    paperTitle: "Ten simple rules for innovative dissemination of research",
    abstract:
      "How we communicate research is changing because of new (especially digital) possibilities. This article sets out 10 easy steps researchers can take to disseminate their work in novel and engaging ways, and hence increase the impact of their research on science and society.",
    keywords:
      "Biology (General); Humans [MeSH]; Information Dissemination [MeSH]; Innovative dissemination; Online Social Networking [MeSH]; Open Science; QH301-705.5; Research Personnel [MeSH]; Scientific publishing",
  },
  {
    suiteName: "bugfix merge of keywords and abstracts",
    orcid: "0000-0001-5116-955X",
    paperTitle:
      "Social immunity modulates competition between coinfecting pathogens",
    abstract:
      "Coinfections with multiple pathogens can result in complex within‐host dynamics affecting virulence and transmission. While multiple infections are intensively studied in solitary hosts, it is so far unresolved how social host interactions interfere with pathogen competition, and if this depends on coinfection diversity. We studied how the collective disease defences of ants – their social immunity – influence pathogen competition in coinfections of same or different fungal pathogen species. Social immunity reduced virulence for all pathogen combinations, but interfered with spore production only in different‐species coinfections. Here, it decreased overall pathogen sporulation success while increasing co‐sporulation on individual cadavers and maintaining a higher pathogen diversity at the community level. Mathematical modelling revealed that host sanitary care alone can modulate competitive outcomes between pathogens, giving advantage to fast‐germinating, thus less grooming‐sensitive ones. Host social interactions can hence modulate infection dynamics in coinfected group members, thereby altering pathogen communities at the host level and population level.",
    keywords:
      "Animals [MeSH]; Ants [MeSH]; Argentine ants; Grooming [MeSH]; Host-Pathogen Interactions [MeSH]; Metarhizium [MeSH]; Metarhizium fungus; Social Behavior [MeSH]; Virulence [MeSH]; ddc:570; grooming; immune-mediated competition; infectious disease; multiple infections; pathogen competition; pathogen diversity; social insects",
  },
  {
    suiteName: "bugfix wrong DOIs in duplicates",
    orcid: "0000-0002-5238-4195",
    paperTitle:
      "Comparison of downloads, citations and readership data for two information systems journals",
    abstract:
      "No abstract available",
    keywords:
      "Keywords: not available",
  },
  {
    suiteName: "bugfix wrong DOIs in duplicates",
    orcid: "0000-0002-5238-4195",
    paperTitle:
      "Research data explored: an extended analysis of citations and altmetrics",
    abstract:
      'In this study, we explore the citedness of research data, its distribution over time and its relation to the availability of a digital object identifier (DOI) in the Thomson Reuters database Data Citation Index (DCI). We investigate if cited research data "impacts" the (social) web, reflected by altmetrics scores, and if there is any relationship between the number of citations and the sum of altmetrics scores from various social media platforms. Three tools are used to collect altmetrics scores, namely PlumX, ImpactStory, and Altmetric.com, and the corresponding results are compared. We found that out of the three altmetrics tools, PlumX has the best coverage. Our experiments revealed that research data remain mostly uncited (about 85 %), although there has been an increase in citing data sets published since 2008. The percentage of the number of cited research data with a DOI in DCI has decreased in the last years. Only nine repositories are responsible for research data with DOIs and two or more citations. The number of cited research data with altmetrics "foot-prints" is even lower (4-9 %) but shows a higher coverage of research data from the last decade. In our study, we also found no correlation between the number of citations and the total number of altmetrics scores. Yet, certain data types (i.e. survey, aggregate data, and sequence data) are more often cited and also receive higher altmetrics scores. Additionally, we performed citation and altmetric analyses of all research data published between 2011 and 2013 in four different disciplines covered by the DCI. In general, these results correspond very well with the ones obtained for research data cited at least twice and also show low numbers in citations and in altmetrics. Finally, we observed that there are disciplinary differences in the availability and extent of altmetrics scores.',
    keywords:
      "Altmetrics; Citedness; Co-citation analysis; Data Citation Index; Research data",
  },
  {
    suiteName: "regression test",
    orcid: "0000-0002-2233-6926",
    paperTitle: "Collective Sensing: Integrating Geospatial Technologies to Understand Urban Systems - An Overview",
    abstract:
      "Cities are complex systems composed of numerous interacting components that evolve over multiple spatio-temporal scales. Consequently, no single data source is sufficient to satisfy the information needs required to map, monitor, model, and ultimately understand and manage our interaction within such urban systems. Remote sensing technology provides a key data source for mapping such environments, but is not sufficient for fully understanding them. In this article we provide a condensed urban perspective of critical geospatial technologies and techniques: (i) Remote Sensing; (ii) Geographic Information Systems; (iii) object-based image analysis; and (iv) sensor webs, and recommend a holistic integration of these technologies within the language of open geospatial consortium (OGC) standards in-order to more fully understand urban systems. We then discuss the potential of this integration and conclude that this extends the monitoring and mapping options beyond “hard infrastructure” by addressing “humans as sensors”, mobility and human-environment interactions, and future improvements to quality of life and of social infrastructures.",
    keywords:
      "Q; Science; collective sensing; future trends; human-environment interactions; in situ sensing; sensor web; smart city; urban remote sensing",
  },
  {
    suiteName: "regression test title substring matching",
    orcid: "0000-0001-9237-8606",
    paperTitle: "Multibeam bathymetry raw data (Atlas Hydrosweep DS 3 echo sounder entire dataset) of RV POLARSTERN during cruise PS147/2",
    abstract:
      "Multibeam data were collected with RV Polarstern along the route of cruise PS147/2 and data acquisition was continuously monitored during the survey. Multibeam sonar system was Teledyne/Atlas Hydrosweep DS3. SVPs were retrieved from CTD data and synthetic profiles from World Ocean Atlas 18. SVPs were processed with HydrOffice SoundSpeedManager (https://www.hydroffice.org/soundspeed/main) and extended with World Ocean Atlas 18 (https://www.ncei.noaa.gov/archive/accession/NCEI-WOA18). SVP data were applied during acquisition. Multibeam data are unprocessed and may contain outliers and blunders and should not be used for grid calculations and charting projects without further editing. The raw multibeam sonar data in Teledyne Reson multibeam processing format (.s7k) were recorded with Teledyne PDS software. Raw data files can be processed using software packages like CARIS HIPS/SIPS. For updated vessel configuration files check further details.",
    keywords:
      'Bathymetry; Multibeam Echosounder; Event label; Binary Object; Binary Object Media Type; Binary Object File Size; File content; Data file recording duration; Data file recording distance; Ship speed; Number of pings; Start of data file recording, date/time; Start of data file recording, latitude; Start of data file recording, longitude; Start of data file, heading; Start of data file, depth; Stop of data file recording, date/time; Stop of data file recording, latitude; Stop of data file recording, longitude; Stop of data file, heading; Stop of data file, depth; DATE/TIME; LATITUDE; LONGITUDE; ELEVATION; Comment; Swath-mapping system Atlas Hydrosweep DS-3; CTD/Rosette; Extracted with MB-System; PS147/2; Polarstern; BATHYmetric Long-Term Observations during Expeditions with RV Polarstern BATHY-LTO; DataHub Earth and Environment of the Helmholtz Association DataHub; Pilot study: "targeted underway bathymetry" for mapping uncharted seamounts SEAMAP',
  },
  {
    suiteName: "regression test title substring matching",
    orcid: "0000-0002-5238-4195",
    paperTitle: "The Vienna Principles: A Vision for Scholarly Communication in the 21st Century",
    abstract:
      'Zur Zeit gibt es starke Bemühungen, die offensichtlichen Defizite des wissenschaftlichen Kommunikationssystems zu beheben. Open Science hat das Potenzial, die Produktion und Verbreitung von wissenschaftlichem Wissen positiv zu verändern; es existiert aber keine gemeinsam geteilte Vision, die das System wissenschaftlicher Kommunikation beschreibt, welches wir erschaffen wollen. Zwischen April 2015 und Juni 2016 trafen sich in Wien die Mitglieder der Open Access Network Austria (OANA) Arbeitsgruppe "Open Access and Scholarly Communication", um diese Angelegenheit zu diskutieren. Das Hauptergebnis unserer Überlegungen sind zwölf Prinzipien, die die Eckpfeiler eines künftigen wissenschaftlichen Kommunikationssystems dedarstellen. Diese Prinzipien sollen einen kohärenten Bezugsrahmen für die Debatte zur Verbesserung des derzeitigen Systems liefern. Mit diesem Dokument hoffen wir, eine breite Diskussion über eine gemeinsame Vision für die wissenschaftliche Kommunikation im 21. Jahrhundert anzustoßen.',
    keywords:
      "Bibliography. Library science. Information resources; Open Access; Open Science; Scholarly Communication; Vision; Wissenschaftskommunikation; Z",
  },
  {
    suiteName: "regression test DOI case-insensitive merge",
    orcid: "0000-0002-4505-0517",
    paperTitle: "Network structure, metadata, and the prediction of missing nodes and annotations",
    abstract:
      "The empirical validation of community detection methods is often based on available annotations on the nodes that serve as putative indicators of the large-scale network structure.",
    keywords:
      "Machine Learning; Physics; Physics and Society; QC1-999; Social and Information Networks",
  },
  {
    suiteName: "regression test DOI case-insensitive merge",
    orcid: "0000-0002-4505-0517",
    paperTitle: "Hierarchical block structures and high-resolution model selection in large networks",
    abstract:
      "Discovering and characterizing the large-scale topological features in empirical networks are crucial steps in understanding how complex systems function.",
    keywords:
      "Data Analysis; Disordered Systems and Neural Networks; Machine Learning; Physics; Physics and Society; QC1-999; Social and Information Networks; Statistical Mechanics; Statistics and Probability",
  },
  {
    suiteName: "regression test DOI case-insensitive merge",
    orcid: "0000-0002-9843-6798",
    paperTitle: "Generalizing Tree–Level Sap Flow Across the European Continent",
    abstract:
      "Sap flow offers key insights about transpiration dynamics and forest‐climate interactions.",
    keywords:
      "Earth sciences; Geophysics. Cosmic physics; LSTMs; QC801-809; ddc:550; deep learning; ecohydrology; info:eu-repo/classification/ddc/550; sap flow; transpiration; vegetation dynamics",
  },
  {
    suiteName: "regression test DOI case-insensitive merge",
    orcid: "0000-0001-9237-8606",
    paperTitle: "Multibeam bathymetry raw data (Atlas Hydrosweep DS 3 echo sounder entire dataset) of RV POLARSTERN during cruise PS147/2",
    abstract:
      'Multibeam data were collected with RV Polarstern along the route of cruise PS147/2 and data acquisition was continuously monitored during the survey. Multibeam sonar system was Teledyne/Atlas Hydrosweep DS3. SVPs were retrieved from CTD data and synthetic profiles from World Ocean Atlas 18. SVPs were processed with HydrOffice SoundSpeedManager (https://www.hydroffice.org/soundspeed/main) and extended with World Ocean Atlas 18 (https://www.ncei.noaa.gov/archive/accession/NCEI-WOA18). SVP data were applied during acquisition. Multibeam data are unprocessed and may contain outliers and blunders and should not be used for grid calculations and charting projects without further editing. The raw multibeam sonar data in Teledyne Reson multibeam processing format (.s7k) were recorded with Teledyne PDS software. Raw data files can be processed using software packages like CARIS HIPS/SIPS. For updated vessel configuration files check further details.',
    keywords:
      'Bathymetry; Multibeam Echosounder; Event label; Binary Object; Binary Object Media Type; Binary Object File Size; File content; Data file recording duration; Data file recording distance; Ship speed; Number of pings; Start of data file recording, date/time; Start of data file recording, latitude; Start of data file recording, longitude; Start of data file, heading; Start of data file, depth; Stop of data file recording, date/time; Stop of data file recording, latitude; Stop of data file recording, longitude; Stop of data file, heading; Stop of data file, depth; DATE/TIME; LATITUDE; LONGITUDE; ELEVATION; Comment; Swath-mapping system Atlas Hydrosweep DS-3; CTD/Rosette; Extracted with MB-System; PS147/2; Polarstern; BATHYmetric Long-Term Observations during Expeditions with RV Polarstern BATHY-LTO; DataHub Earth and Environment of the Helmholtz Association DataHub; Pilot study: "targeted underway bathymetry" for mapping uncharted seamounts SEAMAP',
  },
  {
    suiteName: "bugfix SOLR parsing of DOI",
    orcid: "0000-0002-1193-6256",
    paperTitle: "A controlled CO<sub>2</sub> release experiment in a fault zone at the In-Situ Laboratory in Western Australia",
    abstract:
      'A controlled-release test at the In-Situ Laboratory Project in Western Australia injected 38 tonnes of gaseous CO2 between 336-342 m depth in a fault zone, and the gas was monitored by a wide range of downhole and surface monitoring technologies. Injection of CO2 at this depth fills the gap between shallow release (<25 m) and storage (>600 m) field trials. The main objectives of the controlled-release test were to assess the monitorability of shallow CO2 accumulations, and to investigate the impacts of a fault zone on CO2 migration. CO2 arrival was detected by distributed temperature sensing at the monitoring well (7 m away) after approximately 1.5 days and an injection volume of 5 tonnes. The CO2 plume was detected also by borehole seismic and electric resistivity imaging. The early detection of significantly less than 38 tonnes of CO2 in the shallow subsurface demonstrates rapid and sensitive monitorability of potential leaks in the overburden of a commercial-scale storage project, prior to reaching shallow groundwater, soil zones or the atmosphere. Observations suggest that the fault zone did not alter the CO2 migration along bedding at the scale and depth of the test. Contrary to model predictions, no vertical CO2 migration was detected beyond the perforated injection interval. CO2 and formation water escaped to the surface through the monitoring well at the end of the experiment due to unexpected damage to the well’s fibreglass casing. The well was successfully remediated without impact to the environment and the site is ready for future experiments.',
    keywords:
      'Environmental engineering',
  },
  {
    suiteName: "bugfix SOLR parsing of DOI",
    orcid: "0000-0002-1193-6256",
    paperTitle: "Constraining probabilistic chloride mass-balance recharge estimates using baseflow and remotely sensed evapotranspiration: the Cambrian Limestone Aquifer in northern Australia",
    abstract:
      'Abstract Regional-scale estimates of groundwater recharge are inherently uncertain, but this uncertainty is rarely quantified. Quantifying this uncertainty provides an understanding of the limitations of the estimates, and being able to reduce the uncertainty makes the recharge estimates more useful for water resources management. This paper describes the development of a method to constrain the uncertainty in upscaled recharge estimates using a rejection sampling procedure for baseflow and remotely sensed evapotranspiration data to constrain the lower and upper end of the recharge distribution, respectively. The recharge estimates come from probabilistic chloride mass-balance estimates from 3,575 points upscaled using regression kriging with rainfall, soils and vegetation as covariates. The method is successfully demonstrated for the 570,000-km 2 Cambrian Limestone Aquifer in northern Australia. The method developed here is able to reduce the uncertainty in the upscaled chloride mass-balance estimates of recharge by nearly a third using data that are readily available. The difference between the 5 th and 95 th percentiles of unconstrained recharge across the aquifer was 31 mm/yr (range 5–36 mm/yr) which was reduced to 22 mm/yr for the constrained case (9–31 mm/yr). The spatial distribution of recharge was dominated by the spatial distribution of rainfall but was comparatively reduced in areas with denser vegetation or finer textured soils. Recharge was highest in the north-west in the Daly River catchment with a catchment average of 101 (61–192) mm/yr and lowest in the south-east Georgina River catchment with 6 (4–12) mm/yr.',
  },
];

const uniqueOrcids = [...new Set(testCases.map((tc) => tc.orcid).filter(Boolean))];

const additionalUniqueOrcids = [
  "0000-0001-5116-955X",
  "0000-0003-4221-6275",
  "0000-0002-9843-6798",
  "0000-0002-5238-4195",
  "0000-0002-4505-0517",
  "0000-0003-2897-6075",
  "0000-0002-8911-7832",
  "0000-0002-2233-6926",
  "0000-0001-9287-3770",
  "0000-0002-1193-6256",
  "0000-0003-0108-7980",
  "0000-0001-9237-8606"
];

const allUniqueOrcids = [...new Set([...uniqueOrcids, ...additionalUniqueOrcids])];


// This can also be used to pre-load the unique ORCID profiles, so that the subsequent tests run faster
// npx playwright test "e2e/keywordsEnrichment/ORCID.spec.ts" --grep "Warm-up: pre-load unique ORCID profiles"
test.describe("Warm-up: pre-load unique ORCID profiles", () => {
  for (const orcid of allUniqueOrcids) {
    test(`${orcid}`, async ({ page }) => {
      const url = `/search?type=get&vis_type=overview&orcid=${orcid}&service=orcid&embed=true`;
      await prepareVisualisation(page, url);
      await expect(page.locator("#search-term-unique")).toContainText(`(${orcid})`);
    });
  }
});

for (const tc of testCases) {
  test.describe(
    `Verify abstract and keywords are merged correctly, ${tc.suiteName}`,
    () => {
      const url = `/search?type=get&vis_type=overview&orcid=${tc.orcid}&service=orcid&embed=true`;

      async function openPaper(page: Page) {
        await prepareVisualisation(page, url);
        await expect(page.locator("#search-term-unique")).toContainText(
          `(${tc.orcid})`,
        );
        const paper = page.getByTitle(tc.paperTitle);
        await expect(paper).toBeVisible();
        await paper.click();
        return paper;
      }

      if (tc.keywords) {
        const keywords = tc.keywords;
        const flaky = tc.flaky;
        test(`Keywords enrichment for the '${tc.paperTitle}' document`, async ({
          page,
        }) => {
          test.fixme(!!flaky, "Flaky: depends on BASE API returning duplicate records consistently");
          await openPaper(page);
          await expect(page.locator("#list_holder")).toContainText(keywords);
        });
      }

      if (tc.abstract) {
        const abstract = tc.abstract;
        const flaky = tc.flaky;
        test(`Abstract enrichment for the '${tc.paperTitle}' document`, async ({
          page,
        }) => {
          test.fixme(!!flaky, "Flaky: depends on BASE API returning duplicate records consistently");
          await openPaper(page);
          await expect(page.locator("#list_holder")).toContainText(abstract);
        });
      }
    },
  );
}
