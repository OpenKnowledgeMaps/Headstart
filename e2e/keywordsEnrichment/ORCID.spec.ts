import { test, expect, Page } from "@playwright/test";
import { prepareVisualisation } from "../../vis/js/utils/e2eVisualisationLoader";

interface EnrichmentTestCase {
  suiteName: string;
  orcid: string;
  paperTitle: string;
  keywords?: string;
  abstract?: string;
}

const testCases: EnrichmentTestCase[] = [
  {
    suiteName: "regression test",
    orcid: "0000-0001-5116-955X",
    paperTitle: "Humans choose representatives who enforce cooperation in social dilemmas through extortion",
    abstract:
      "Social dilemmas force players to balance between personal and collective gain. In many dilemmas, such as elected governments negotiating climate-change mitigation measures, the decisions are made not by individual players but by their representatives. However, the behaviour of representatives in social dilemmas has not been investigated experimentally. Here inspired by the negotiations for greenhouse-gas emissions reductions, we experimentally study a collective-risk social dilemma that involves representatives deciding on behalf of their fellow group members. Representatives can be re-elected or voted out after each consecutive collective-risk game. Selfish players are preferentially elected and are hence found most frequently in the ‘representatives’ treatment. Across all treatments, we identify the selfish players as extortioners. As predicted by our mathematical model, their steadfast strategies enforce cooperation from fair players who finally compensate almost completely the deficit caused by the extortionate co-players. Everybody gains, but the extortionate representatives and their groups gain the most.",
    keywords:
      "Climate Change [MeSH]; Cooperative Behavior [MeSH]; Female [MeSH]; Game Theory [MeSH]; Humans [MeSH]; Interpersonal Relations [MeSH]; Models, Theoretical [MeSH]; Q; Science; Young Adult [MeSH]; ddc:530; ddc:599",
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
    abstract:
      "Indirect reciprocity is a key mechanism for large-scale cooperation. This mechanism captures the insight that in part, people help others to build and maintain a good reputation. To enable such cooperation, appropriate social norms are essential. They specify how individuals should act based on each others' reputations, and how reputations are updated in response to individual actions. Although previous work has identified several norms that sustain cooperation, a complete analytical characterization of all evolutionarily stable norms remains lacking, especially when assessments or actions are noisy. In this study, we provide such a characterization for the public assessment regime. This characterization reproduces known results, such as the leading eight norms, but it extends to more general cases, allowing for various types of errors and additional actions including costly punishment. We also identify norms that impose a fixed payoff on any mutant strategy, analogous to the zero-determinant strategies in direct reciprocity. These results offer a rigorous foundation for understanding the evolution of cooperation through indirect reciprocity and the critical role of social norms.",
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
    abstract:
      "Abstract Body temperature is a valuable parameter in determining the wellbeing of laboratory animals. However, using body temperature to refine humane endpoints during acute illness generally lacks comprehensiveness and exposes to inter-observer bias. Here we compared two methods to assess body temperature in mice, namely implanted radio frequency identification (RFID) temperature transponders (method 1) to non-contact infrared thermometry (method 2) in 435 mice for up to 7 days during normothermia and lipopolysaccharide (LPS) endotoxin-induced hypothermia. There was excellent agreement between core and surface temperature as determined by method 1 and 2, respectively, whereas the intra- and inter-subject variation was higher for method 2. Nevertheless, using machine learning algorithms to determine temperature-based endpoints both methods had excellent accuracy in predicting death as an outcome event. Therefore, less expensive and cumbersome non-contact infrared thermometry can serve as a reliable alternative for implantable transponder-based systems for hypothermic responses, although requiring standardization between experimenters.",
    keywords:
      "600 Technik, Medizin, angewandte Wissenschaften::610 Medizin und Gesundheit::610 Medizin und Gesundheit; Acute Disease; Acute Disease [MeSH]; Animals; Animals [MeSH]; Body Temperature; Body Temperature [MeSH]; Creative Commons Namensnennung – 4.0 International (CC BY 4.0); Electrodes; Electrodes, Implanted [MeSH]; Female; Female [MeSH]; Hypothermia [MeSH]; Hypothermia: chemically induced; Hypothermia: diagnosis; Hypothermia: mortality; Hypothermia: physiopathology; Implanted; Inbred C57BL; Infrared Rays; Infrared Rays [MeSH]; Lipopolysaccharides; Lipopolysaccharides [Chemical]; Lipopolysaccharides [MeSH]; Lipopolysaccharides: administration & dosage; Machine Learning; Machine Learning [MeSH]; Medicine; Mice; Mice [MeSH]; Mice, Inbred C57BL [MeSH]; Q; R; Radio Frequency Identification Device [MeSH]; Radio Frequency Identification Device: methods; Science; Sepsis [MeSH]; Sepsis: chemically induced; Sepsis: diagnosis; Sepsis: mortality; Sepsis: physiopathology; Survival Analysis; Survival Analysis [MeSH]; Text; Thermometers [MeSH]; Thermometers: classification; Thermometry: instrumentation; Thermometry: methods; article; ddc:610; info:eu-repo/classification/ddc/600; radio frequency identification (RFID); radio frequency identification RFID",
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
    paperTitle: "Informing deep neural networks by multiscale principles of neuromodulatory systems ",
    abstract:
      "Our brains have evolved the ability to configure and adapt their processing states to match the unique challenges of acting and learning in diverse environments and behavioral contexts. In biological nervous systems, such state specification and adaptation arise in part from neuromodulators, including acetylcholine, noradrenaline, serotonin, and dopamine, whose diffuse release fine-tunes neuronal and synaptic dynamics and plasticity to complement the behavioral context in real-time. Despite the demonstrated effectiveness of deep neural networks for specific tasks, they remain relatively inflexible at generalizing across tasks or adapting to ever-changing behavioral demands. In this article, we provide an overview of neuromodulatory systems and their relationship to emerging pertinent principles in deep neural networks. We further outline opportunities for the integration of neuromodulatory principles into deep neural networks, towards endowing artificial intelligence with a key ingredient underlying the flexibility and learning capability of biological systems.",
    keywords:
      "610 Medicine & health; Artificial Intelligence [MeSH]; Dopamine [Chemical]; Dopamine [MeSH]; Humans [MeSH]; Neural Networks, Computer [MeSH]; Neurotransmitter Agents [Chemical]; Neurotransmitter Agents [MeSH]; Serotonin [Chemical]; Serotonin [MeSH]; acetylcholine; adaptive learning; dopamine; multiscale organization; noradrenaline; serotonin",
  },
  {
    suiteName: "bugfix 1",
    orcid: "0000-0002-5238-4195",
    paperTitle: "Ten simple rules for innovative dissemination of research",
    abstract:
      "How we communicate research is changing because of new (especially digital) possibilities. This article sets out 10 easy steps researchers can take to disseminate their work in novel and engaging ways, and hence increase the impact of their research on science and society.",
    keywords:
      "Biology (General); Humans [MeSH]; Information Dissemination [MeSH]; Innovative dissemination;  Online Social Networking [MeSH]; Open Science; Research Personnel [MeSH]; Scientific publishing; QH301-705.5",
  },
  {
    suiteName: "bugfix 1",
    orcid: "0000-0001-5116-955X",
    paperTitle:
      "Social immunity modulates competition between coinfecting pathogens",
    abstract:
      "Coinfections with multiple pathogens can result in complex within‐host dynamics affecting virulence and transmission. While multiple infections are intensively studied in solitary hosts, it is so far unresolved how social host interactions interfere with pathogen competition, and if this depends on coinfection diversity. We studied how the collective disease defences of ants – their social immunity – influence pathogen competition in coinfections of same or different fungal pathogen species. Social immunity reduced virulence for all pathogen combinations, but interfered with spore production only in different‐species coinfections. Here, it decreased overall pathogen sporulation success while increasing co‐sporulation on individual cadavers and maintaining a higher pathogen diversity at the community level. Mathematical modelling revealed that host sanitary care alone can modulate competitive outcomes between pathogens, giving advantage to fast‐germinating, thus less grooming‐sensitive ones. Host social interactions can hence modulate infection dynamics in coinfected group members, thereby altering pathogen communities at the host level and population level.",
    keywords:
      "Animals [MeSH]; Ants [MeSH]; Argentine ants; ddc:570; grooming; Grooming [MeSH]; immune-mediated competition; infectious disease; host-pathogen interactions; Host-Pathogen Interactions [MeSH]; metarhizium fungus; Metarhizium [MeSH]; multiple infections; pathogen competition; pathogen diversity; Social Behavior [MeSH]; social insects; Virulence [MeSH];",
  },
];

const uniqueOrcids = [...new Set(testCases.map((tc) => tc.orcid).filter(Boolean))];

test.describe("Warm-up: pre-load unique ORCID profiles", () => {
  for (const orcid of uniqueOrcids) {
    test(`${orcid}`, async ({ page }) => {
      const url = `/search?type=get&vis_type=overview&orcid=${orcid}&service=orcid&embed=true`;
      await prepareVisualisation(page, url);
      await expect(page.locator("#search-term-unique")).toContainText(`(${orcid})`);
    });
  }

  test("wait for DB cache refresh", async () => {
    await new Promise((resolve) => setTimeout(resolve, 180_000));
  });
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
        test(`Keywords enrichment for the '${tc.paperTitle}' document`, async ({
          page,
        }) => {
          await openPaper(page);
          await expect(page.locator("#list_holder")).toContainText(keywords);
        });
      }

      if (tc.abstract) {
        const abstract = tc.abstract;
        test(`Abstract enrichment for the '${tc.paperTitle}' document`, async ({
          page,
        }) => {
          await openPaper(page);
          await expect(page.locator("#list_holder")).toContainText(abstract);
        });
      }
    },
  );
}
