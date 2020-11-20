const data = (state = [], action) => {
  switch (action.type) {
    case "INITIALIZE":
      // TODO move the whole io.js dataprocessing somewhere here
      return sanitizeData(action.dataArray);
    default:
      return state;
  }
};

export default data;

const ATTRS_TO_CHECK = [
  "id",
  "authors",
  "title",
  "paper_abstract",
  "year",
  "oa_state",
  "subject_orig",
  "relevance",
  "x",
  "y",
  "area_uri",
  "area",
  "cluster_labels",
];

const MANDATORY_ATTRS = {
  area_uri: {
    // TODO maybe some escaping will be required
    derive: (entry) => entry.area,
  },
};

const sanitizeData = (data) => {
  let missingAttributes = new Map();

  data.forEach((entry) => {
    ATTRS_TO_CHECK.forEach((attr) => {
      if (typeof entry[attr] === "undefined") {
        if (!missingAttributes.has(attr)) {
          missingAttributes.set(attr, 0);
        }
        missingAttributes.set(attr, missingAttributes.get(attr) + 1);

        if (MANDATORY_ATTRS[attr]) {
          entry[attr] = MANDATORY_ATTRS[attr].derive(entry);
        }
      }
    });
  });

  missingAttributes.forEach((value, key) => {
    console.warn(
      `Attribute '${key}' missing in ${
        value === data.length ? "all" : value
      } data entries.`
    );
  });

  return data;
};
