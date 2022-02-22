import d3 from "d3";

/**
 * Applies force layout on the knowledge map bubbles and papers.
 * Doesn't return anything, it directly modifies the store after it's finished.
 *
 * It doesn't depend on anything in DOM - the whole calculation doesn't render
 * anything and it doesn't use any rendered properties either. The only parameters
 * it uses are the data coordinates and dimensions and the chart size.
 *
 * The algorithm is simple. It works iteratively in two parts.
 *
 * Bubbles part (repeated iteratively):
 *  - moves bubbles into the chart (if they're overflowing)
 *  - pushes bubbles apart from each other if there's a collision
 *
 * Papers part (repeated iteratively):
 *  - moves papers into the bubbles
 *  - pushes papers apart from each other if there's a collision
 *
 * @param {Array} areas bubbles array
 * @param {Array} papers papers array (data)
 * @param {Number} chartSize headstart chart initial size
 * @param {Function} updateAreas function that modifies the areas store
 * @param {Function} updatePapers function that modifies the papers store
 * @param {Object} config the config object
 */
export const applyForce = (
  areas,
  papers,
  chartSize,
  updateAreas,
  updatePapers,
  config
) => {
  if (config.is_force_areas) {
    const areasAlpha = getAreasForceAlpha(papers.length, config);
    areaForce(areas, chartSize, areasAlpha, updateAreas);
  }

  if (config.is_force_papers) {
    const papersAlpha = getPapersForceAlpha(papers.length, config);
    paperForce(papers, areas, chartSize, papersAlpha, updatePapers);
  }
};

const areaForce = (areas, size, alpha, updateAreas) => {
  const forceAreas = d3.layout
    .force()
    .links([])
    .size([size, size])
    .alpha(alpha);

  const areasRenderTicks = 10;
  const multiplierAreas = areasRenderTicks + 1;

  function iterate() {
    const alpha = forceAreas.alpha();

    for (let i = 0; i < areasRenderTicks; i++) {
      forceAreas.tick();
    }

    areas.forEach((a, i) => {
      if (
        a.x - a.r < 0 ||
        a.x + a.r > size ||
        a.y - a.r < 0 ||
        a.y + a.r > size
      ) {
        a.x += (size / 2 - a.x) * alpha * multiplierAreas;
        a.y += (size / 2 - a.y) * alpha * multiplierAreas;
      }

      areas.slice(i + 1).forEach(function (b) {
        moveCollidedObjects(a, b, alpha * multiplierAreas);
      });
    });

    if (alpha > 0) {
      iterate();
    } else {
      updateAreas(areas.slice(0));
    }
  }

  iterate();
};

const paperForce = (papers, areas, size, alpha, updatePapers) => {
  const forcePapers = d3.layout
    .force()
    .nodes([])
    .links([])
    .size([size, size])
    .alpha(alpha);

  const papersRenderTicks = 15;
  const multiplierPapers = papersRenderTicks + 1;

  function iterate() {
    const alpha = forcePapers.alpha();

    for (let i = 0; i < papersRenderTicks; i++) {
      forcePapers.tick();
    }

    papers.forEach((paperA, i) => {
      let currentArea = areas.find((area) => area.area_uri === paperA.area_uri);

      const paperCircleA = getPaperCircle(paperA);

      const distance = Math.sqrt(
        Math.pow(currentArea.x - paperCircleA.x, 2) +
          Math.pow(currentArea.y - paperCircleA.y, 2)
      );

      if (distance > Math.abs(currentArea.r - paperCircleA.r)) {
        paperCircleA.y +=
          (currentArea.y - paperCircleA.y) * alpha * multiplierPapers;
        paperCircleA.x +=
          (currentArea.x - paperCircleA.x) * alpha * multiplierPapers;
        paperA.x = paperCircleA.x - paperA.width / 2;
        paperA.y = paperCircleA.y - paperA.height / 2;
      }

      papers.slice(i + 1).forEach((paperB) => {
        const paperCircleB = getPaperCircle(paperB);

        moveCollidedObjects(
          paperCircleA,
          paperCircleB,
          alpha * multiplierPapers
        );

        paperA.x = paperCircleA.x - paperA.width / 2;
        paperA.y = paperCircleA.y - paperA.height / 2;
        paperB.x = paperCircleB.x - paperB.width / 2;
        paperB.y = paperCircleB.y - paperB.height / 2;
      });
    });

    if (alpha > 0) {
      iterate();
    } else {
      updatePapers(papers.slice(0));
    }
  }

  iterate();
};

const moveCollidedObjects = (a, b, alpha) => {
  let dx = a.x - b.x;
  let dy = a.y - b.y;
  let l = Math.sqrt(dx * dx + dy * dy);
  let d = a.r + b.r;

  if (l < d) {
    l = ((l - d) / l) * alpha;
    dx *= l;
    dy *= l;
    a.x -= dx;
    a.y -= dy;
    b.x += dx;
    b.y += dy;
  }
};

const getPaperCircle = (paper) => {
  const circle = {
    x: paper.x + paper.width / 2,
    y: paper.y + paper.height / 2,
    r: (paper.diameter / 2) * 1.2,
  };

  return circle;
};

/**
 * Returns alpha value needed for the force layout.
 *
 * The alpha values are adopted from the legacy code.
 *
 * @param {number} numOfPapers how many papers are in the vis
 *
 * @returns paper force layout alpha value
 */
const getPapersForceAlpha = (numOfPapers, config) => {
  if (!config.is_force_papers || !config.dynamic_force_papers) {
    return config.papers_force_alpha;
  }
  if (numOfPapers < 150) {
    return config.papers_force_alpha;
  }
  if (numOfPapers < 200) {
    return 0.2;
  }
  if (numOfPapers < 350) {
    return 0.3;
  }
  if (numOfPapers < 500) {
    return 0.4;
  }

  return 0.6;
};

/**
 * Returns alpha value needed for the force layout.
 *
 * The alpha values are adopted from the legacy code.
 *
 * @param {number} numOfPapers how many papers are in the vis
 *
 * @returns area force layout alpha value
 */
const getAreasForceAlpha = (numOfPapers, config) => {
  if (!config.is_force_area || !config.dynamic_force_area) {
    return config.area_force_alpha;
  }

  if (numOfPapers < 200) {
    return config.area_force_alpha;
  }

  return 0.02;
};
