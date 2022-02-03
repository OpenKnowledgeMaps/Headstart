class PaperSanitizer {
  config = {};

  constructor(config) {
    this.config = config;
  }

  /**
   * Checks whether the papers have all the required props defined in the scheme.
   *
   * Raises a console warning when a required property is missing.
   *
   * @param {Array} papers papers array
   * @param {Array} scheme scheme array
   */
  checkRequiredProps(papers, scheme) {
    const requiredProps = scheme.filter((p) => p.required);
    const missingProps = new Map();

    papers.forEach((paper) => {
      requiredProps.forEach((prop) => {
        if (typeof paper[prop.name] === "undefined") {
          if (!missingProps.has(prop.name)) {
            missingProps.set(prop.name, 0);
          }
          missingProps.set(prop.name, missingProps.get(prop.name) + 1);
        }
      });
    });

    if (missingProps.size > 0) {
      console.warn(
        `Missing required properties found: ${[...missingProps.entries()]
          .map(
            (e) => `'${e[0]}' (${e[1] === papers.length ? "all" : e[1]} papers)`
          )
          .join(", ")}.`
      );
    }
  }

  /**
   * Checks and sanitizes all properties according to the activity diagram.
   * https://docs.google.com/drawings/d/1GBqi8ZVKwhy6n-7o6ZlsmiaBRHJ_3YFXmAi_cvDaJiA/edit
   *
   * Raises a console warning when a paper doesn't match the scheme.
   *
   * @param {Array} papers papers array
   * @param {Array} scheme scheme array
   *
   * @returns sanitized papers array
   */
  sanitizeProps(papers, scheme) {
    const loc = this.config.localization[this.config.language];

    const wrongTypes = new Set();
    const wrongData = new Set();

    papers.forEach((paper) => {
      scheme.forEach((prop) => {
        // does it have a value?
        if (typeof paper[prop.name] !== "undefined") {
          // is the type correct?
          if (!prop.type || prop.type.includes(typeof paper[prop.name])) {
            // is the format correct?
            if (!prop.validator || prop.validator(paper[prop.name])) {
              // everything's correct!
              return;
            } else {
              wrongData.add(prop.name);
            }
          } else {
            wrongTypes.add(prop.name);
          }
          // is there a sanitization function?
          if (prop.sanitizer) {
            paper[prop.name] = prop.sanitizer(paper[prop.name]);
          } else {
            delete paper[prop.name];
          }
        }

        // is there a fallback?
        if (prop.fallback) {
          this.__setFallbackValue(paper, prop.name, prop.fallback(loc, paper));
        }
      });

      // fallback for props from config (legacy code)
      this.config.scale_types.forEach((type) => {
        this.__setFallbackValue(paper, type, loc.default_readers);
      });
    });

    this.__printWrongSetWarning(wrongTypes, "Incorrect data type");
    this.__printWrongSetWarning(wrongData, "Malformed data");

    return papers;
  }

  /**
   * Checks whether the unique paper props are actually unique.
   *
   * Raises a console warning when a property is non-unique.
   *
   * @param {Array} papers papers array
   * @param {Array} scheme scheme array
   */
  checkUniqueProps(papers, scheme) {
    const uniqueProps = scheme.filter((p) => p.unique);
    const duplicateProps = new Set();

    uniqueProps.forEach((prop) => {
      const values = new Set();
      papers.forEach((paper) => {
        if (values.has(paper[prop.name])) {
          duplicateProps.add(prop.name);
        }
        values.add(paper[prop.name]);
      });
    });

    if (duplicateProps.size > 0) {
      console.warn(
        `Properties with duplicate values that should be unique found: `,
        duplicateProps
      );
    }
  }

  __printWrongSetWarning(wrongSet, label) {
    if (wrongSet.size > 0) {
      console.warn(
        `${label} found in the following properties: ${[...wrongSet.keys()]
          .map((t) => `'${t}'`)
          .join(", ")}.`
      );
    }
  }

  __setFallbackValue(paper, property, fallback) {
    if (
      typeof paper[property] === "undefined" ||
      paper[property] === null ||
      paper[property] === ""
    ) {
      paper[property] = fallback;
    }
  }
}

export default PaperSanitizer;
