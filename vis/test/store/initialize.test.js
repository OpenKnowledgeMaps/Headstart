import { initializeStore } from "../../js/actions";

import headingReducer from "../../js/reducers/heading";
import localizationReducer from "../../js/reducers/localization";
import queryReducer from "../../js/reducers/query";
import filesReducer from "../../js/reducers/files";
import contextLineReducer from "../../js/reducers/contextLine";

const setup = (overrideConfig, overrideContext) => {
  const configObject = Object.assign(
    {
      title: "presetTitle",
      create_title_from_context: true,
      create_title_from_context_style: "viper",
      is_authorview: false,
      is_streamgraph: false,
      custom_title: "customTitle",
      show_dropdown: false,
      files: [
        {
          title: "edu1",
          file: "./data/edu1.csv",
        },
        {
          title: "edu2",
          file: "./data/edu2.csv",
        },
      ],
      show_context: true,
      service: "base",
      service_names: {
        plos: "PLOS",
        base: "BASE",
        pubmed: "PubMed",
        doaj: "DOAJ",
        openaire: "OpenAIRE",
        linkedcat: "LinkedCat+",
        linkedcat_authorview: "LinkedCat+",
        linkedcat_browseview: "LinkedCat+",
      },
      show_context_oa_number: true,
      context_most_relevant_tooltip: undefined,
      options: undefined,
      show_context_timestamp: false,

      language: "eng",
      localization: {
        eng: {
          area: "Area",
          intro_icon: "++intro icon++",
          intro_label: "Some intro label",
          default_title: "Sample title",
          overview_label: "Overview of",
          streamgraph_authors_label: "Sample streamgraph authors label",
          overview_authors_label: "Sample knowledgemap authors label",
          streamgraph_label: "Sample streamgraph keywords label",
          custom_title_explanation: "Sample explanation",
        },
      },
    },
    overrideConfig
  );

  const contextObject = Object.assign(
    {
      query: "test query",
      params: {
        title: "title",
        acronym: "acronym",
        project_id: "projectId",
        num_documents: 100,
        author_id: undefined,
        living_dates: undefined,
        sorting: "",
        document_types: undefined,
        include_content_type: undefined,
        article_types: undefined,
        from: undefined,
        to: undefined,
        num_papers: undefined,
        num_datasets: undefined,
        start_date: undefined,
        end_date: undefined,
        lang_id: undefined,
      },
      share_oa: 1,
      last_update: undefined,
    },
    overrideContext
  );

  return { configObject, contextObject };
};

describe("config and context state", () => {
  describe("actions", () => {
    it("should create an initialize action", () => {
      const { configObject, contextObject } = setup();
      const expectedAction = {
        type: "INITIALIZE",
        configObject,
        contextObject,
      };

      expect(initializeStore(configObject, contextObject)).toEqual(
        expectedAction
      );
    });
  });

  describe("reducers", () => {
    describe("heading reducer", () => {
      it("should return the initial state", () => {
        const expectedResult = {};

        const result = headingReducer(undefined, {});

        expect(result).toEqual(expectedResult);
      });

      it("should handle the initialization", () => {
        const initialState = {};
        const expectedResult = {
          title: "title",
          acronym: "acronym",
          projectId: "projectId",
          presetTitle: "presetTitle",
          titleStyle: "viper",
          titleLabelType: "keywordview-knowledgemap",
          customTitle: "customTitle",
          showDropdown: false,
        };

        const { configObject, contextObject } = setup();

        const result = headingReducer(
          initialState,
          initializeStore(configObject, contextObject)
        );

        expect(result).toEqual(expectedResult);
      });

      it("should handle the initialization even without context params", () => {
        const initialState = {};
        const expectedResult = {
          title: undefined,
          acronym: undefined,
          projectId: undefined,
          presetTitle: "presetTitle",
          titleStyle: "viper",
          titleLabelType: "keywordview-knowledgemap",
          customTitle: "customTitle",
          showDropdown: false,
        };

        const { configObject, contextObject } = setup(
          {},
          {
            params: null,
          }
        );

        const result = headingReducer(
          initialState,
          initializeStore(configObject, contextObject)
        );

        expect(result).toEqual(expectedResult);
      });

      it("should initialize a standard titleStyle", () => {
        const initialState = {};
        const expectedResult = {
          title: "title",
          acronym: "acronym",
          projectId: "projectId",
          presetTitle: "presetTitle",
          titleStyle: "standard",
          titleLabelType: "keywordview-knowledgemap",
          customTitle: "customTitle",
          showDropdown: false,
        };

        const { configObject, contextObject } = setup({
          create_title_from_context_style: null,
        });

        const result = headingReducer(
          initialState,
          initializeStore(configObject, contextObject)
        );

        expect(result).toEqual(expectedResult);
      });
    });

    it("should initialize a null titleStyle", () => {
      const initialState = {};
      const expectedResult = {
        title: "title",
        acronym: "acronym",
        projectId: "projectId",
        presetTitle: "presetTitle",
        titleStyle: null,
        titleLabelType: "keywordview-knowledgemap",
        customTitle: "customTitle",
        showDropdown: false,
      };

      const { configObject, contextObject } = setup({
        create_title_from_context: false,
        create_title_from_context_style: null,
      });

      const result = headingReducer(
        initialState,
        initializeStore(configObject, contextObject)
      );

      expect(result).toEqual(expectedResult);
    });

    it("should initialize an authorview streamgraph titleLabelType", () => {
      const initialState = {};
      const expectedResult = {
        title: "title",
        acronym: "acronym",
        projectId: "projectId",
        presetTitle: "presetTitle",
        titleStyle: "viper",
        titleLabelType: "authorview-streamgraph",
        customTitle: "customTitle",
        showDropdown: false,
      };

      const { configObject, contextObject } = setup({
        is_authorview: true,
        is_streamgraph: true,
      });

      const result = headingReducer(
        initialState,
        initializeStore(configObject, contextObject)
      );

      expect(result).toEqual(expectedResult);
    });

    it("should initialize an authorview knowledgemap titleLabelType", () => {
      const initialState = {};
      const expectedResult = {
        title: "title",
        acronym: "acronym",
        projectId: "projectId",
        presetTitle: "presetTitle",
        titleStyle: "viper",
        titleLabelType: "authorview-knowledgemap",
        customTitle: "customTitle",
        showDropdown: false,
      };

      const { configObject, contextObject } = setup({
        is_authorview: true,
        is_streamgraph: false,
      });

      const result = headingReducer(
        initialState,
        initializeStore(configObject, contextObject)
      );

      expect(result).toEqual(expectedResult);
    });

    it("should initialize an keywordview streamgraph titleLabelType", () => {
      const initialState = {};
      const expectedResult = {
        title: "title",
        acronym: "acronym",
        projectId: "projectId",
        presetTitle: "presetTitle",
        titleStyle: "viper",
        titleLabelType: "keywordview-streamgraph",
        customTitle: "customTitle",
        showDropdown: false,
      };

      const { configObject, contextObject } = setup({
        is_authorview: false,
        is_streamgraph: true,
      });

      const result = headingReducer(
        initialState,
        initializeStore(configObject, contextObject)
      );

      expect(result).toEqual(expectedResult);
    });
  });

  describe("localization reducer", () => {
    it("should return the initial state", () => {
      const expectedResult = {};

      const result = localizationReducer(undefined, {});

      expect(result).toEqual(expectedResult);
    });

    it("should handle the initialization", () => {
      const initialState = {};
      const expectedResult = {
        area: "Area",
        intro_icon: "++intro icon++",
        intro_label: "Some intro label",
        default_title: "Sample title",
        overview_label: "Overview of",
        streamgraph_authors_label: "Sample streamgraph authors label",
        overview_authors_label: "Sample knowledgemap authors label",
        streamgraph_label: "Sample streamgraph keywords label",
        custom_title_explanation: "Sample explanation",
      };

      const { configObject, contextObject } = setup();

      const result = localizationReducer(
        initialState,
        initializeStore(configObject, contextObject)
      );

      expect(result).toEqual(expectedResult);
    });
  });

  describe("query reducer", () => {
    it("should return the initial state", () => {
      const expectedResult = null;

      const result = queryReducer(undefined, {});

      expect(result).toEqual(expectedResult);
    });

    it("should handle the initialization", () => {
      const initialState = null;
      const { configObject, contextObject } = setup();
      const expectedResult = contextObject.query;

      const result = queryReducer(
        initialState,
        initializeStore(configObject, contextObject)
      );

      expect(result).toEqual(expectedResult);
    });

    it("should handle the initialization even without the query", () => {
      const initialState = null;
      const { configObject, contextObject } = setup();
      contextObject.query = undefined;
      const expectedResult = null;

      const result = queryReducer(
        initialState,
        initializeStore(configObject, contextObject)
      );

      expect(result).toEqual(expectedResult);
    });
  });

  describe("files reducer", () => {
    it("should return the initial state", () => {
      const expectedResult = { current: 0, list: [] };

      const result = filesReducer(undefined, {});

      expect(result).toEqual(expectedResult);
    });

    it("should handle the initialization", () => {
      const initialState = { current: 0, list: [] };
      const { configObject, contextObject } = setup();
      const expectedResult = {
        current: 0,
        list: configObject.files,
      };

      const result = filesReducer(
        initialState,
        initializeStore(configObject, contextObject)
      );

      expect(result).toEqual(expectedResult);
    });
  });

  describe("context line reducer", () => {
    it("should return the initial state", () => {
      const expectedResult = {};

      const result = contextLineReducer(undefined, {});

      expect(result).toEqual(expectedResult);
    });

    it("should initialize show to true", () => {
      const initialState = {};
      const { configObject, contextObject } = setup(
        {
          show_context: true,
        },
        {
          params: {},
        }
      );

      const result = contextLineReducer(
        initialState,
        initializeStore(configObject, contextObject)
      );

      expect(result).toHaveProperty("show", true);
    });

    it("should initialize show to false due to switch set to false", () => {
      const initialState = {};
      const { configObject, contextObject } = setup(
        {
          show_context: false,
        },
        {
          params: {},
        }
      );

      const result = contextLineReducer(
        initialState,
        initializeStore(configObject, contextObject)
      );

      expect(result).toHaveProperty("show", false);
    });

    it("should initialize show to false due to missing params", () => {
      const initialState = {};
      const { configObject, contextObject } = setup(
        {
          show_context: true,
        },
        {
          params: undefined,
        }
      );

      const result = contextLineReducer(
        initialState,
        initializeStore(configObject, contextObject)
      );

      expect(result).toHaveProperty("show", false);
    });

    it("should initialize correct articles count", () => {
      const ARTICLES_COUNT = 42;
      const initialState = {};
      const { configObject, contextObject } = setup(
        {},
        {
          num_documents: ARTICLES_COUNT,
        }
      );

      const result = contextLineReducer(
        initialState,
        initializeStore(configObject, contextObject)
      );

      expect(result).toHaveProperty("articlesCount", ARTICLES_COUNT);
    });

    it("should initialize null articles count", () => {
      const ARTICLES_COUNT = undefined;

      const initialState = {};
      const { configObject, contextObject } = setup(
        {},
        {
          num_documents: ARTICLES_COUNT,
        }
      );

      const result = contextLineReducer(
        initialState,
        initializeStore(configObject, contextObject)
      );

      expect(result).toHaveProperty("articlesCount", ARTICLES_COUNT);
    });

    it("should initialize correct modifier type", () => {
      const MODIFIER = "most-recent";

      const initialState = {};
      const { configObject, contextObject } = setup(
        {},
        {
          params: {
            sorting: MODIFIER,
          },
        }
      );

      const result = contextLineReducer(
        initialState,
        initializeStore(configObject, contextObject)
      );

      expect(result).toHaveProperty("modifier", MODIFIER);
    });

    it("should initialize showModifierPopover to true", () => {
      const MODIFIER = "most-relevant";
      const TOOLTIP = true;
      const EXPECTED_VALUE = true;

      const initialState = {};
      const { configObject, contextObject } = setup(
        {
          context_most_relevant_tooltip: TOOLTIP,
        },
        {
          params: {
            sorting: MODIFIER,
          },
        }
      );

      const result = contextLineReducer(
        initialState,
        initializeStore(configObject, contextObject)
      );

      expect(result).toHaveProperty("showModifierPopover", EXPECTED_VALUE);
    });

    it("should initialize showModifierPopover to false due to different modifier", () => {
      const MODIFIER = "most-recent";
      const TOOLTIP = true;
      const EXPECTED_VALUE = false;

      const initialState = {};
      const { configObject, contextObject } = setup(
        {
          context_most_relevant_tooltip: TOOLTIP,
        },
        {
          params: {
            sorting: MODIFIER,
          },
        }
      );

      const result = contextLineReducer(
        initialState,
        initializeStore(configObject, contextObject)
      );

      expect(result).toHaveProperty("showModifierPopover", EXPECTED_VALUE);
    });

    it("should initialize showModifierPopover to false due to false tooltip flag", () => {
      const MODIFIER = "most-relevant";
      const TOOLTIP = false;
      const EXPECTED_VALUE = false;

      const initialState = {};
      const { configObject, contextObject } = setup(
        {
          context_most_relevant_tooltip: TOOLTIP,
        },
        {
          params: {
            sorting: MODIFIER,
          },
        }
      );

      const result = contextLineReducer(
        initialState,
        initializeStore(configObject, contextObject)
      );

      expect(result).toHaveProperty("showModifierPopover", EXPECTED_VALUE);
    });

    it("should initialize correct open access count", () => {
      const SHOW_COUNT = true;
      const COUNT = 22;
      const EXPECTED_VALUE = COUNT;

      const initialState = {};
      const { configObject, contextObject } = setup(
        {
          show_context_oa_number: SHOW_COUNT,
        },
        {
          share_oa: COUNT,
        }
      );

      const result = contextLineReducer(
        initialState,
        initializeStore(configObject, contextObject)
      );

      expect(result).toHaveProperty("openAccessCount", EXPECTED_VALUE);
    });

    it("should hide open access count", () => {
      const SHOW_COUNT = false;
      const COUNT = 22;
      const EXPECTED_VALUE = null;

      const initialState = {};
      const { configObject, contextObject } = setup(
        {
          show_context_oa_number: SHOW_COUNT,
        },
        {
          share_oa: COUNT,
        }
      );

      const result = contextLineReducer(
        initialState,
        initializeStore(configObject, contextObject)
      );

      expect(result).toHaveProperty("openAccessCount", EXPECTED_VALUE);
    });

    it("should show author", () => {
      const IS_AUTHORVIEW = true;
      const AUTHOR_ID = 111;
      const EXPECTED_VALUE = true;

      const initialState = {};
      const { configObject, contextObject } = setup(
        {
          is_authorview: IS_AUTHORVIEW,
        },
        {
          params: {
            author_id: AUTHOR_ID,
          },
        }
      );

      const result = contextLineReducer(
        initialState,
        initializeStore(configObject, contextObject)
      );

      expect(result).toHaveProperty("showAuthor", EXPECTED_VALUE);
    });

    it("should not show author (not authorview)", () => {
      const IS_AUTHORVIEW = false;
      const AUTHOR_ID = 111;
      const EXPECTED_VALUE = false;

      const initialState = {};
      const { configObject, contextObject } = setup(
        {
          is_authorview: IS_AUTHORVIEW,
        },
        {
          params: {
            author_id: AUTHOR_ID,
          },
        }
      );

      const result = contextLineReducer(
        initialState,
        initializeStore(configObject, contextObject)
      );

      expect(result).toHaveProperty("showAuthor", EXPECTED_VALUE);
    });

    it("should not show author (id not provided)", () => {
      const IS_AUTHORVIEW = true;
      const AUTHOR_ID = undefined;
      const EXPECTED_VALUE = false;

      const initialState = {};
      const { configObject, contextObject } = setup(
        {
          is_authorview: IS_AUTHORVIEW,
        },
        {
          params: {
            author_id: AUTHOR_ID,
          },
        }
      );

      const result = contextLineReducer(
        initialState,
        initializeStore(configObject, contextObject)
      );

      expect(result).toHaveProperty("showAuthor", EXPECTED_VALUE);
    });

    it("should load correct author data", () => {
      const AUTHOR_ID = 123;
      const LIVING_DATES = "1856-1918";
      const EXPECTED_VALUE = {
        id: AUTHOR_ID,
        livingDates: LIVING_DATES,
      };

      const initialState = {};
      const { configObject, contextObject } = setup(
        {},
        {
          params: {
            author_id: AUTHOR_ID,
            living_dates: LIVING_DATES,
          },
        }
      );

      const result = contextLineReducer(
        initialState,
        initializeStore(configObject, contextObject)
      );

      expect(result).toHaveProperty("author", EXPECTED_VALUE);
    });

    it("should load null author data if no params", () => {
      const EXPECTED_VALUE = {
        id: null,
        livingDates: null,
      };

      const initialState = {};
      const { configObject, contextObject } = setup(
        {},
        {
          params: undefined,
        }
      );

      const result = contextLineReducer(
        initialState,
        initializeStore(configObject, contextObject)
      );

      expect(result).toHaveProperty("author", EXPECTED_VALUE);
    });

    /**
     * TODO
     *
     * this test might not be accurate, testing it on a real context + config would be better
     */
    it("should initialize correct single document type from document_types", () => {
      const DOCUMENT_TYPE = "Articles";
      const EXPECTED_VALUE = DOCUMENT_TYPE;

      const initialState = {};
      const { configObject, contextObject } = setup(
        {
          options: [
            {
              id: "document_types",
              fields: [
                {
                  id: 121,
                  text: DOCUMENT_TYPE,
                },
              ],
            },
          ],
        },
        {
          params: {
            document_types: [121],
          },
        }
      );

      const result = contextLineReducer(
        initialState,
        initializeStore(configObject, contextObject)
      );

      expect(result).toHaveProperty("documentTypes", [EXPECTED_VALUE]);
    });

    /**
     * TODO
     *
     * this test might not be accurate, testing it on a real context + config would be better
     */
    it("should initialize correct multiple document types from document_types", () => {
      const EXPECTED_VALUE = ["Articles", "Newspaper", "Books"];

      const initialState = {};
      const { configObject, contextObject } = setup(
        {
          options: [
            {
              id: "document_types",
              fields: [
                {
                  id: 11,
                  text: "Some unused field",
                },
                {
                  id: 121,
                  text: EXPECTED_VALUE[2],
                },
                {
                  id: 69,
                  text: EXPECTED_VALUE[1],
                },
                {
                  id: 82,
                  text: EXPECTED_VALUE[0],
                },
              ],
            },
          ],
        },
        {
          params: {
            document_types: [82, 69, 121],
          },
        }
      );

      const result = contextLineReducer(
        initialState,
        initializeStore(configObject, contextObject)
      );

      expect(result).toHaveProperty("documentTypes", EXPECTED_VALUE);
    });

    /**
     * TODO
     *
     * this test might not be accurate, testing it on a real context + config would be better
     */
    it("should initialize correct single document type from include_content_type", () => {
      const DOCUMENT_TYPE = "Articles";
      const EXPECTED_VALUE = DOCUMENT_TYPE;

      const initialState = {};
      const { configObject, contextObject } = setup(
        {
          options: [
            {
              id: "include_content_type",
              fields: [
                {
                  id: 121,
                  text: DOCUMENT_TYPE,
                },
              ],
            },
          ],
        },
        {
          params: {
            include_content_type: [121],
          },
        }
      );

      const result = contextLineReducer(
        initialState,
        initializeStore(configObject, contextObject)
      );

      expect(result).toHaveProperty("documentTypes", [EXPECTED_VALUE]);
    });

    /**
     * TODO
     *
     * this test might not be accurate, testing it on a real context + config would be better
     */
    it("should initialize correct single document type from article_types", () => {
      const DOCUMENT_TYPE = "Articles";
      const EXPECTED_VALUE = DOCUMENT_TYPE;

      const initialState = {};
      const { configObject, contextObject } = setup(
        {
          options: [
            {
              id: "article_types",
              fields: [
                {
                  id: 121,
                  text: DOCUMENT_TYPE,
                },
              ],
            },
          ],
        },
        {
          params: {
            article_types: [121],
          },
        }
      );

      const result = contextLineReducer(
        initialState,
        initializeStore(configObject, contextObject)
      );

      expect(result).toHaveProperty("documentTypes", [EXPECTED_VALUE]);
    });

    it("should initialize null document type if params do not have any needed property", () => {
      const DOCUMENT_TYPE = "Articles";
      const EXPECTED_VALUE = null;

      const initialState = {};
      const { configObject, contextObject } = setup(
        {
          options: [
            {
              id: "article_types",
              fields: [
                {
                  id: 121,
                  text: DOCUMENT_TYPE,
                },
              ],
            },
          ],
        },
        {
          params: {},
        }
      );

      const result = contextLineReducer(
        initialState,
        initializeStore(configObject, contextObject)
      );

      expect(result).toHaveProperty("documentTypes", EXPECTED_VALUE);
    });

    it("should load correct data source from service_name", () => {
      const SERVICE_NAME = "PubMed";
      const EXPECTED_VALUE = SERVICE_NAME;

      const initialState = {};
      const { configObject, contextObject } = setup({
        service_name: SERVICE_NAME,
      });

      const result = contextLineReducer(
        initialState,
        initializeStore(configObject, contextObject)
      );

      expect(result).toHaveProperty("dataSource", EXPECTED_VALUE);
    });

    it("should load correct data source from service_names", () => {
      const SERVICE_NAMES = {
        base: "BASE",
        pubmed: "PubMed",
        doaj: "DOAJ",
      };
      const SERVICE = "base";
      const EXPECTED_VALUE = SERVICE_NAMES[SERVICE];

      const initialState = {};
      const { configObject, contextObject } = setup(
        {
          service_names: SERVICE_NAMES,
        },
        {
          service: SERVICE,
        }
      );

      const result = contextLineReducer(
        initialState,
        initializeStore(configObject, contextObject)
      );

      expect(result).toHaveProperty("dataSource", EXPECTED_VALUE);
    });

    it("should initialize a correct timespan '11 Aug 2019 - 12 Aug 2020' (base)", () => {
      const SERVICE_NAME = "base";
      const FROM = "2019-08-11T13:30:22.112Z";
      const TO = "2020-08-12T13:30:22.112Z";

      const initialState = {};
      const { configObject, contextObject } = setup(
        {
          service: SERVICE_NAME,
        },
        {
          params: {
            from: FROM,
            to: TO,
          },
        }
      );

      const result = contextLineReducer(
        initialState,
        initializeStore(configObject, contextObject)
      );

      expect(result).toHaveProperty("timespan", "11 Aug 2019 - 12 Aug 2020");
    });

    it("should initialize a correct timespan 'All time' (pubmed)", () => {
      const SERVICE_NAME = "pubmed";
      const FROM = "1809-01-01T13:30:22.112Z";
      const TO = "2020-08-13T13:30:22.112Z";

      const initialState = {};
      const { configObject, contextObject } = setup(
        {
          service: SERVICE_NAME,
        },
        {
          params: {
            from: FROM,
            to: TO,
          },
        }
      );

      const result = contextLineReducer(
        initialState,
        initializeStore(configObject, contextObject)
      );

      expect(result).toHaveProperty("timespan", "All time");
    });

    it("should initialize a correct timespan 'Until 12 Aug 2020' (default)", () => {
      const SERVICE_NAME = "some-other";
      const FROM = "1970-01-01T13:30:22.112Z";
      const TO = "2020-08-12T13:30:22.112Z";

      const initialState = {};
      const { configObject, contextObject } = setup(
        {
          service: SERVICE_NAME,
        },
        {
          params: {
            from: FROM,
            to: TO,
          },
        }
      );

      const result = contextLineReducer(
        initialState,
        initializeStore(configObject, contextObject)
      );

      expect(result).toHaveProperty("timespan", "Until 12 Aug 2020");
    });

    it("should initialize a correct timespan 'Until 2019' (doaj)", () => {
      const SERVICE_NAME = "doaj";
      const FROM = "1809-01-01T13:30:22.112Z";
      const TO = "2019-08-12T13:30:22.112Z";

      const initialState = {};
      const { configObject, contextObject } = setup(
        {
          service: SERVICE_NAME,
        },
        {
          params: {
            from: FROM,
            to: TO,
          },
        }
      );

      const result = contextLineReducer(
        initialState,
        initializeStore(configObject, contextObject)
      );

      expect(result).toHaveProperty("timespan", "Until 2019");
    });

    it("should initialize a null timespan (no 'to' param)", () => {
      const SERVICE_NAME = "doaj";
      const FROM = "1809-01-01T13:30:22.112Z";
      const TO = undefined;

      const initialState = {};
      const { configObject, contextObject } = setup(
        {
          service: SERVICE_NAME,
        },
        {
          params: {
            from: FROM,
            to: TO,
          },
        }
      );

      const result = contextLineReducer(
        initialState,
        initializeStore(configObject, contextObject)
      );

      expect(result).toHaveProperty("timespan", null);
    });

    it("should initialize correct papers count", () => {
      const COUNT = 420;
      const initialState = {};
      const { configObject, contextObject } = setup(
        {
          create_title_from_context_style: true,
        },
        {
          num_papers: COUNT,
        }
      );

      const result = contextLineReducer(
        initialState,
        initializeStore(configObject, contextObject)
      );

      expect(result).toHaveProperty("paperCount", COUNT);
    });

    it("should initialize null articles count", () => {
      const COUNT = 420;
      const EXPECTED_VALUE = null;

      const initialState = {};
      const { configObject, contextObject } = setup(
        {
          create_title_from_context_style: false,
        },
        {
          num_papers: COUNT,
        }
      );

      const result = contextLineReducer(
        initialState,
        initializeStore(configObject, contextObject)
      );

      expect(result).toHaveProperty("paperCount", EXPECTED_VALUE);
    });

    it("should initialize correct datasets count", () => {
      const COUNT = 420;
      const initialState = {};
      const { configObject, contextObject } = setup(
        {
          create_title_from_context_style: true,
        },
        {
          num_datasets: COUNT,
        }
      );

      const result = contextLineReducer(
        initialState,
        initializeStore(configObject, contextObject)
      );

      expect(result).toHaveProperty("datasetCount", COUNT);
    });

    it("should initialize null articles count", () => {
      const COUNT = 420;
      const EXPECTED_VALUE = null;

      const initialState = {};
      const { configObject, contextObject } = setup(
        {
          create_title_from_context_style: false,
        },
        {
          num_datasets: COUNT,
        }
      );

      const result = contextLineReducer(
        initialState,
        initializeStore(configObject, contextObject)
      );

      expect(result).toHaveProperty("datasetCount", EXPECTED_VALUE);
    });

    it("should initialize correct project runtime", () => {
      const START_DATE = "2009-01-01T13:30:22.112Z";
      const END_DATE = "2012-31-12T13:30:22.112Z";

      const initialState = {};
      const { configObject, contextObject } = setup(
        {
          create_title_from_context_style: true,
        },
        {
          params: {
            start_date: START_DATE,
            end_date: END_DATE,
          },
        }
      );

      const result = contextLineReducer(
        initialState,
        initializeStore(configObject, contextObject)
      );

      expect(result).toHaveProperty("projectRuntime", "2009–2012");
    });

    it("should initialize null project runtime if end date is missing", () => {
      const START_DATE = "2009-01-01T13:30:22.112Z";
      const END_DATE = undefined;

      const initialState = {};
      const { configObject, contextObject } = setup(
        {
          create_title_from_context_style: true,
        },
        {
          params: {
            start_date: START_DATE,
            end_date: END_DATE,
          },
        }
      );

      const result = contextLineReducer(
        initialState,
        initializeStore(configObject, contextObject)
      );

      expect(result).toHaveProperty("projectRuntime", null);
    });

    it("should initialize correct language", () => {
      const LANG_ID = "cs";
      const LANGUAGES = [
        {
          code: "cs",
          lang_in_lang: "čeština",
          lang_in_eng: "Czech",
        },
      ];

      const initialState = {};
      const { configObject, contextObject } = setup(
        {
          options: {
            languages: LANGUAGES,
          },
        },
        {
          params: {
            lang_id: LANG_ID,
          },
        }
      );

      const result = contextLineReducer(
        initialState,
        initializeStore(configObject, contextObject)
      );

      expect(result).toHaveProperty(
        "searchLanguage",
        "Language: čeština (Czech) "
      );
    });

    it("should initialize null language if wrong setting", () => {
      const LANG_ID = "unknown";
      const LANGUAGES = [
        {
          code: "cs",
          lang_in_lang: "čeština",
          lang_in_eng: "Czech",
        },
      ];

      const initialState = {};
      const { configObject, contextObject } = setup(
        {
          options: {
            languages: LANGUAGES,
          },
        },
        {
          params: {
            lang_id: LANG_ID,
          },
        }
      );

      const result = contextLineReducer(
        initialState,
        initializeStore(configObject, contextObject)
      );

      expect(result).toHaveProperty("searchLanguage", null);
    });

    it("should initialize correct timestamp", () => {
      const LAST_UPDATED = "today";

      const initialState = {};
      const { configObject, contextObject } = setup(
        {
          show_context_timestamp: true,
        },
        {
          last_update: LAST_UPDATED,
        }
      );

      const result = contextLineReducer(
        initialState,
        initializeStore(configObject, contextObject)
      );

      expect(result).toHaveProperty("timestamp", LAST_UPDATED);
    });
  });
});
