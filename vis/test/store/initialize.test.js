import { initializeStore } from "../../js/actions";

import headingReducer from "../../js/reducers/heading";
import localizationReducer from "../../js/reducers/localization";
import queryReducer from "../../js/reducers/query";
import contextLineReducer from "../../js/reducers/contextLine";
import serviceReducer from "../../js/reducers/service";
import listReducer from "../../js/reducers/list";
import timespanReducer from "../../js/reducers/timespan";

const setup = (overrideConfig = {}, overrideContext = {}) => {
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
      service: undefined,
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
        const EXPECTED_RESULT = {};

        const result = headingReducer(undefined, {});

        expect(result).toEqual(EXPECTED_RESULT);
      });

      it("should handle the initialization", () => {
        const initialState = {};
        const EXPECTED_RESULT = {
          title: "title",
          acronym: "acronym",
          projectId: "projectId",
          presetTitle: "presetTitle",
          titleStyle: "viper",
          titleLabelType: "keywordview-knowledgemap",
          customTitle: "customTitle",
        };

        const { configObject, contextObject } = setup();

        const result = headingReducer(
          initialState,
          initializeStore(
            configObject,
            contextObject,
            [],
            null,
            500,
            null,
            null,
            500,
            {}
          )
        );

        expect(result).toEqual(EXPECTED_RESULT);
      });

      it("should handle the initialization even without context params", () => {
        const initialState = {};
        const EXPECTED_RESULT = {
          title: undefined,
          acronym: undefined,
          projectId: undefined,
          presetTitle: "presetTitle",
          titleStyle: "viper",
          titleLabelType: "keywordview-knowledgemap",
          customTitle: "customTitle",
        };

        const { configObject, contextObject } = setup(
          {},
          {
            params: null,
          }
        );

        const result = headingReducer(
          initialState,
          initializeStore(
            configObject,
            contextObject,
            [],
            null,
            500,
            null,
            null,
            500,
            {}
          )
        );

        expect(result).toEqual(EXPECTED_RESULT);
      });

      it("should initialize a standard titleStyle", () => {
        const initialState = {};
        const EXPECTED_RESULT = {
          title: "title",
          acronym: "acronym",
          projectId: "projectId",
          presetTitle: "presetTitle",
          titleStyle: "standard",
          titleLabelType: "keywordview-knowledgemap",
          customTitle: "customTitle",
        };

        const { configObject, contextObject } = setup({
          create_title_from_context_style: null,
        });

        const result = headingReducer(
          initialState,
          initializeStore(
            configObject,
            contextObject,
            [],
            null,
            500,
            null,
            null,
            500,
            {}
          )
        );

        expect(result).toEqual(EXPECTED_RESULT);
      });
    });

    it("should initialize a null titleStyle", () => {
      const initialState = {};
      const EXPECTED_RESULT = {
        title: "title",
        acronym: "acronym",
        projectId: "projectId",
        presetTitle: "presetTitle",
        titleStyle: null,
        titleLabelType: "keywordview-knowledgemap",
        customTitle: "customTitle",
      };

      const { configObject, contextObject } = setup({
        create_title_from_context: false,
        create_title_from_context_style: null,
      });

      const result = headingReducer(
        initialState,
        initializeStore(
          configObject,
          contextObject,
          [],
          null,
          500,
          null,
          null,
          500,
          {}
        )
      );

      expect(result).toEqual(EXPECTED_RESULT);
    });

    it("should initialize an authorview streamgraph titleLabelType", () => {
      const initialState = {};
      const EXPECTED_RESULT = {
        title: "title",
        acronym: "acronym",
        projectId: "projectId",
        presetTitle: "presetTitle",
        titleStyle: "viper",
        titleLabelType: "authorview-streamgraph",
        customTitle: "customTitle",
      };

      const { configObject, contextObject } = setup({
        is_authorview: true,
        is_streamgraph: true,
      });

      const result = headingReducer(
        initialState,
        initializeStore(
          configObject,
          contextObject,
          [],
          null,
          500,
          null,
          null,
          500,
          {}
        )
      );

      expect(result).toEqual(EXPECTED_RESULT);
    });

    it("should initialize an authorview knowledgemap titleLabelType", () => {
      const initialState = {};
      const EXPECTED_RESULT = {
        title: "title",
        acronym: "acronym",
        projectId: "projectId",
        presetTitle: "presetTitle",
        titleStyle: "viper",
        titleLabelType: "authorview-knowledgemap",
        customTitle: "customTitle",
      };

      const { configObject, contextObject } = setup({
        is_authorview: true,
        is_streamgraph: false,
      });

      const result = headingReducer(
        initialState,
        initializeStore(
          configObject,
          contextObject,
          [],
          null,
          500,
          null,
          null,
          500,
          {}
        )
      );

      expect(result).toEqual(EXPECTED_RESULT);
    });

    it("should initialize an keywordview streamgraph titleLabelType", () => {
      const initialState = {};
      const EXPECTED_RESULT = {
        title: "title",
        acronym: "acronym",
        projectId: "projectId",
        presetTitle: "presetTitle",
        titleStyle: "viper",
        titleLabelType: "keywordview-streamgraph",
        customTitle: "customTitle",
      };

      const { configObject, contextObject } = setup({
        is_authorview: false,
        is_streamgraph: true,
      });

      const result = headingReducer(
        initialState,
        initializeStore(
          configObject,
          contextObject,
          [],
          null,
          500,
          null,
          null,
          500,
          {}
        )
      );

      expect(result).toEqual(EXPECTED_RESULT);
    });

    it("should not change the state if the action is canceled", () => {
      const INITIAL_STATE = { some_state: 1 };

      const result = headingReducer(INITIAL_STATE, { canceled: true });

      expect(result).toEqual(INITIAL_STATE);
    });
  });

  describe("localization reducer", () => {
    it("should return the initial state", () => {
      const EXPECTED_RESULT = {};

      const result = localizationReducer(undefined, {});

      expect(result).toEqual(EXPECTED_RESULT);
    });

    it("should handle the initialization", () => {
      const initialState = {};
      const EXPECTED_RESULT = {
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
        initializeStore(
          configObject,
          contextObject,
          [],
          null,
          500,
          null,
          null,
          500,
          {}
        )
      );

      expect(result).toEqual(EXPECTED_RESULT);
    });

    it("should not change the state if the action is canceled", () => {
      const INITIAL_STATE = { some_state: 1 };

      const result = localizationReducer(INITIAL_STATE, { canceled: true });

      expect(result).toEqual(INITIAL_STATE);
    });
  });

  describe("query reducer", () => {
    it("should return the initial state", () => {
      const EXPECTED_RESULT = { text: "", parsedTerms: [] };

      const result = queryReducer(undefined, {});

      expect(result).toEqual(EXPECTED_RESULT);
    });

    it("should handle the initialization", () => {
      const initialState = null;
      const { configObject, contextObject } = setup();
      const EXPECTED_RESULT = contextObject.query;

      const result = queryReducer(
        initialState,
        initializeStore(
          configObject,
          contextObject,
          [],
          null,
          500,
          null,
          null,
          500,
          {}
        )
      );

      expect(result.text).toEqual(EXPECTED_RESULT);
    });

    it("should handle the initialization even without the query", () => {
      const initialState = null;
      const { configObject, contextObject } = setup();
      contextObject.query = undefined;
      const EXPECTED_RESULT = null;

      const result = queryReducer(
        initialState,
        initializeStore(
          configObject,
          contextObject,
          [],
          null,
          500,
          null,
          null,
          500,
          {}
        )
      );

      expect(result.text).toEqual(EXPECTED_RESULT);
    });

    it("should parse the query phrases correctly", () => {
      const initialState = null;
      const { configObject, contextObject } = setup(
        {},
        {
          query: `"some phrase" cool`,
        }
      );

      const EXPECTED_RESULT = ["some phrase", "cool"];

      const result = queryReducer(
        initialState,
        initializeStore(
          configObject,
          contextObject,
          [],
          null,
          500,
          null,
          null,
          500,
          {}
        )
      );

      expect(result.parsedTerms).toEqual(EXPECTED_RESULT);
    });

    it("should not change the state if the action is canceled", () => {
      const INITIAL_STATE = { some_state: 1 };

      const result = queryReducer(INITIAL_STATE, { canceled: true });

      expect(result).toEqual(INITIAL_STATE);
    });
  });

  describe("timespan reducer", () => {
    it("should not change the state if the action is canceled", () => {
      const INITIAL_STATE = { some_state: 1 };

      const result = timespanReducer(INITIAL_STATE, {
        canceled: true,
        some_state: 2,
      });

      expect(result).toEqual(INITIAL_STATE);
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

      const result = timespanReducer(
        initialState,
        initializeStore(
          configObject,
          contextObject,
          [],
          null,
          500,
          null,
          null,
          500,
          {}
        )
      );

      expect(result).toEqual("11 Aug 2019 - 12 Aug 2020");
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

      const result = timespanReducer(
        initialState,
        initializeStore(
          configObject,
          contextObject,
          [],
          null,
          500,
          null,
          null,
          500,
          {}
        )
      );

      expect(result).toEqual("Until 12 Aug 2020");
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

      const result = timespanReducer(
        initialState,
        initializeStore(
          configObject,
          contextObject,
          [],
          null,
          500,
          null,
          null,
          500,
          {}
        )
      );

      expect(result).toEqual("Until 2019");
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

      const result = timespanReducer(
        initialState,
        initializeStore(
          configObject,
          contextObject,
          [],
          null,
          500,
          null,
          null,
          500,
          {}
        )
      );

      expect(result).toEqual(null);
    });

    it("should initialize a correct timespan to today (triple)", () => {
      const TODAY = new Date();
      const SERVICE_NAME = "triple";
      const FROM = "2019";
      const TO = TODAY.getFullYear().toString();

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

      const result = timespanReducer(
        initialState,
        initializeStore(
          configObject,
          contextObject,
          [],
          null,
          500,
          null,
          null,
          500,
          {}
        )
      );

      expect(result).toEqual(`2019 - ${TODAY.getFullYear()}`);
    });

    it("should initialize a correct timespan 'Until 2019' (triple streamgraph)", () => {
      const SERVICE_NAME = "triple";
      const FROM = "1809-01-01T13:30:22.112Z";
      const TO = "2019-08-12T13:30:22.112Z";

      const initialState = {};
      const { configObject, contextObject } = setup(
        {
          service: SERVICE_NAME,
          is_streamgraph: true,
        },
        {
          params: {
            from: FROM,
            to: TO,
            sorting: "most-recent",
          },
        }
      );

      const result = timespanReducer(
        initialState,
        initializeStore(
          configObject,
          contextObject,
          [],
          null,
          500,
          null,
          null,
          500,
          {}
        )
      );

      expect(result).toEqual("Until 2019");
    });
  });

  describe("context line reducer", () => {
    it("should return the initial state", () => {
      const EXPECTED_RESULT = {};

      const result = contextLineReducer(undefined, {});

      expect(result).toEqual(EXPECTED_RESULT);
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
        initializeStore(
          configObject,
          contextObject,
          [],
          null,
          500,
          null,
          null,
          500,
          {}
        )
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
        initializeStore(
          configObject,
          contextObject,
          [],
          null,
          500,
          null,
          null,
          500,
          {}
        )
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
        initializeStore(
          configObject,
          contextObject,
          [],
          null,
          500,
          null,
          null,
          500,
          {}
        )
      );

      expect(result).toHaveProperty("show", false);
    });

    it("should initialize correct articles count", () => {
      const FAKE_DATA = [...Array(42).keys()].map((e) => ({
        id: e,
        resulttype: [],
      }));
      const initialState = {};
      const { configObject, contextObject } = setup({}, {});

      const result = contextLineReducer(
        initialState,
        initializeStore(
          configObject,
          contextObject,
          FAKE_DATA,
          null,
          500,
          null,
          null,
          500,
          {}
        )
      );

      expect(result).toHaveProperty("articlesCount", FAKE_DATA.length);
    });

    it("should initialize correct modifier type", () => {
      const MODIFIER = "most-recent";
      const FAKE_DATA = [...Array(101).keys()].map((e) => ({
        id: e,
        resulttype: [],
      }));

      const initialState = {};
      const { configObject, contextObject } = setup(
        {
          max_documents: 100,
        },
        {
          params: {
            sorting: MODIFIER,
          },
        }
      );

      const result = contextLineReducer(
        initialState,
        initializeStore(
          configObject,
          contextObject,
          FAKE_DATA,
          null,
          500,
          null,
          null,
          500,
          {}
        )
      );

      expect(result).toHaveProperty("modifier", MODIFIER);
    });

    it("should initialize correct modifier type if number of docs is equal to max", () => {
      const MODIFIER = "most-relevant";
      const FAKE_DATA = [...Array(100).keys()].map((e) => ({
        id: e,
        resulttype: [],
      }));

      const initialState = {};
      const { configObject, contextObject } = setup(
        {
          max_documents: 100,
        },
        {
          params: {
            sorting: MODIFIER,
          },
        }
      );

      const result = contextLineReducer(
        initialState,
        initializeStore(
          configObject,
          contextObject,
          FAKE_DATA,
          null,
          500,
          null,
          null,
          500,
          {}
        )
      );

      expect(result).toHaveProperty("modifier", MODIFIER);
    });

    it("should initialize null modifier if less documents than max", () => {
      const MODIFIER = "most-recent";
      const EXPECTED_MODIFIER = null;

      const initialState = {};
      const { configObject, contextObject } = setup(
        {
          max_documents: 100,
        },
        {
          params: {
            sorting: MODIFIER,
          },
          num_documents: 99,
        }
      );

      const result = contextLineReducer(
        initialState,
        initializeStore(
          configObject,
          contextObject,
          [],
          null,
          500,
          null,
          null,
          500,
          {}
        )
      );

      expect(result).toHaveProperty("modifier", EXPECTED_MODIFIER);
    });

    it("should initialize correct open access count", () => {
      const SHOW_COUNT = true;
      const FAKE_DATA = [
        { oa: true, resulttype: [] },
        { oa: true, resulttype: [] },
        { oa: true, resulttype: [] },
      ];

      const initialState = {};
      const { configObject, contextObject } = setup({
        show_context_oa_number: SHOW_COUNT,
      });

      const result = contextLineReducer(
        initialState,
        initializeStore(
          configObject,
          contextObject,
          FAKE_DATA,
          null,
          500,
          null,
          null,
          500,
          {}
        )
      );

      expect(result).toHaveProperty("openAccessCount", FAKE_DATA.length);
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
        initializeStore(
          configObject,
          contextObject,
          [],
          null,
          500,
          null,
          null,
          500,
          {}
        )
      );

      expect(result).toHaveProperty("openAccessCount", EXPECTED_VALUE);
    });

    it("should show author", () => {
      const IS_AUTHORVIEW = true;
      const EXPECTED_VALUE = true;

      const initialState = {};
      const { configObject, contextObject } = setup(
        {
          is_authorview: IS_AUTHORVIEW,
        },
        {
          params: {
            author_id: 111,
            living_dates: "1620-1699",
            image_link: "http://link.com/1234",
          },
        }
      );

      const result = contextLineReducer(
        initialState,
        initializeStore(
          configObject,
          contextObject,
          [],
          null,
          500,
          null,
          null,
          500,
          {}
        )
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
        initializeStore(
          configObject,
          contextObject,
          [],
          null,
          500,
          null,
          null,
          500,
          {}
        )
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
        initializeStore(
          configObject,
          contextObject,
          [],
          null,
          500,
          null,
          null,
          500,
          {}
        )
      );

      expect(result).toHaveProperty("showAuthor", EXPECTED_VALUE);
    });

    it("should load correct author data", () => {
      const AUTHOR_ID = 123;
      const LIVING_DATES = "1856-1918";
      const IMAGE_LINK = "http://example.com/1234";
      const EXPECTED_VALUE = {
        id: String(AUTHOR_ID),
        livingDates: LIVING_DATES,
        imageLink: IMAGE_LINK,
      };

      const initialState = {};
      const { configObject, contextObject } = setup(
        {},
        {
          params: {
            author_id: AUTHOR_ID,
            living_dates: LIVING_DATES,
            image_link: IMAGE_LINK,
          },
        }
      );

      const result = contextLineReducer(
        initialState,
        initializeStore(
          configObject,
          contextObject,
          [],
          null,
          500,
          null,
          null,
          500,
          {}
        )
      );

      expect(result).toHaveProperty("author", EXPECTED_VALUE);
    });

    it("should load null author data if no params", () => {
      const EXPECTED_VALUE = {
        id: null,
        livingDates: null,
        imageLink: null,
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
        initializeStore(
          configObject,
          contextObject,
          [],
          null,
          500,
          null,
          null,
          500,
          {}
        )
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
        initializeStore(
          configObject,
          contextObject,
          [],
          null,
          500,
          null,
          null,
          500,
          {}
        )
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
        initializeStore(
          configObject,
          contextObject,
          [],
          null,
          500,
          null,
          null,
          500,
          {}
        )
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
        initializeStore(
          configObject,
          contextObject,
          [],
          null,
          500,
          null,
          null,
          500,
          {}
        )
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
        initializeStore(
          configObject,
          contextObject,
          [],
          null,
          500,
          null,
          null,
          500,
          {}
        )
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
        initializeStore(
          configObject,
          contextObject,
          [],
          null,
          500,
          null,
          null,
          500,
          {}
        )
      );

      expect(result).toHaveProperty("documentTypes", EXPECTED_VALUE);
    });

    // added for old PubMed maps: pubmed sometimes changes their source document ids
    it("should not initialize certain document type if not supported anymore", () => {
      const REAL_CONFIG_OPTIONS = `[{"id":"time_range","multiple":false,"name":"Time Range","type":"dropdown","fields":[{"id":"any-time","text":"Any time"},{"id":"last-month","text":"Last month"},{"id":"last-year","text":"Last year"},{"id":"user-defined","text":"Custom range","class":"user-defined","inputs":[{"id":"from","label":"From: ","class":"time_input"},{"id":"to","label":"To: ","class":"time_input"}]}]},{"id":"sorting","multiple":false,"name":"Sorting","type":"dropdown","fields":[{"id":"most-relevant","text":"Most relevant"},{"id":"most-recent","text":"Most recent"}]},{"id":"article_types","multiple":true,"width":"140px","name":"Article types","type":"dropdown","fields":[{"id":"adaptive clinical trial","text":"Adaptive Clinical Trial","selected":true},{"id":"address","text":"Address","selected":true},{"id":"autobiography","text":"Autobiography","selected":true},{"id":"bibliography","text":"Bibliography","selected":true},{"id":"biography","text":"Biography","selected":true},{"id":"book illustrations","text":"Book Illustrations","selected":true},{"id":"case reports","text":"Case Reports","selected":true},{"id":"classical article","text":"Classical Article","selected":true},{"id":"clinical conference","text":"Clinical Conference","selected":true},{"id":"clinical study","text":"Clinical Study","selected":true},{"id":"clinical trial","text":"Clinical Trial","selected":true},{"id":"clinical trial protocol","text":"Clinical Trial Protocol","selected":true},{"id":"clinical trial, phase i","text":"Clinical Trial, Phase I","selected":true},{"id":"clinical trial, phase ii","text":"Clinical Trial, Phase II","selected":true},{"id":"clinical trial, phase iii","text":"Clinical Trial, Phase III","selected":true},{"id":"clinical trial, phase iv","text":"Clinical Trial, Phase IV","selected":true},{"id":"clinical trial, veterinary","text":"Clinical Trial, Veterinary","selected":true},{"id":"collected work","text":"Collected Work","selected":true},{"id":"collected works","text":"Collected Works","selected":true},{"id":"comment","text":"Comment","selected":true},{"id":"comparative study","text":"Comparative Study","selected":true},{"id":"congress","text":"Congress","selected":true},{"id":"consensus development conference","text":"Consensus Development Conference","selected":true},{"id":"consensus development conference, nih","text":"Consensus Development Conference, NIH","selected":true},{"id":"controlled clinical trial","text":"Controlled Clinical Trial","selected":true},{"id":"corrected and republished article","text":"Corrected and Republished Article","selected":true},{"id":"dataset","text":"Dataset","selected":true},{"id":"dictionary","text":"Dictionary","selected":true},{"id":"directory","text":"Directory","selected":true},{"id":"duplicate publication","text":"Duplicate publication","selected":true},{"id":"editorial","text":"Editorial","selected":true},{"id":"electronic supplementary materials","text":"Electronic Supplementary Materials","selected":true},{"id":"english abstract","text":"English Abstract","selected":true},{"id":"ephemera","text":"Ephemera","selected":true},{"id":"equivalence trial","text":"Equivalence Trial","selected":true},{"id":"evaluation studies","text":"Evaluation Studies","selected":true},{"id":"evaluation study","text":"Evaluation Study","selected":true},{"id":"expression of concern","text":"Expression of Concern","selected":true},{"id":"festschrift","text":"Festschrift","selected":true},{"id":"government publication","text":"Government Publication","selected":true},{"id":"guideline","text":"Guideline","selected":true},{"id":"historical article","text":"Historical Article","selected":true},{"id":"interactive tutorial","text":"Interactive Tutorial","selected":true},{"id":"interview","text":"Interview","selected":true},{"id":"introductory journal article","text":"Introductory Journal Article","selected":true},{"id":"journal article","text":"Journal Article","selected":true},{"id":"lecture","text":"Lecture","selected":true},{"id":"legal case","text":"Legal Case","selected":true},{"id":"legislation","text":"Legislation","selected":true},{"id":"letter","text":"Letter","selected":true},{"id":"manuscript","text":"Manuscript","selected":true},{"id":"meta analysis","text":"Meta Analysis","selected":true},{"id":"multicenter study","text":"Multicenter Study","selected":true},{"id":"news","text":"News","selected":true},{"id":"newspaper article","text":"Newspaper Article","selected":true},{"id":"observational study","text":"Observational Study","selected":true},{"id":"observational study, veterinary","text":"Observational Study, Veterinary","selected":true},{"id":"overall","text":"Overall","selected":true},{"id":"patient education handout","text":"Patient Education Handout","selected":true},{"id":"periodical index","text":"Periodical Index","selected":true},{"id":"personal narrative","text":"Personal Narrative","selected":true},{"id":"pictorial work","text":"Pictorial Work","selected":true},{"id":"popular work","text":"Popular Work","selected":true},{"id":"portrait","text":"Portrait","selected":true},{"id":"practice guideline","text":"Practice Guideline","selected":true},{"id":"pragmatic clinical trial","text":"Pragmatic Clinical Trial","selected":true},{"id":"preprint","text":"Preprint","selected":true},{"id":"publication components","text":"Publication Components","selected":true},{"id":"publication formats","text":"Publication Formats","selected":true},{"id":"publication type category","text":"Publication Type Category","selected":true},{"id":"published erratum","text":"Published Erratum","selected":true},{"id":"randomized controlled trial","text":"Randomized Controlled Trial","selected":true},{"id":"randomized controlled trial, veterinary","text":"Randomized Controlled Trial, Veterinary","selected":true},{"id":"research support, american recovery and reinvestment act","text":"Research Support, American Recovery and Reinvestment Act","selected":true},{"id":"research support, n i h, extramural","text":"Research Support, NIH Extramural","selected":true},{"id":"research support, n i h, intramural","text":"Research Support, NIH Intramural","selected":true},{"id":"research support, non u s gov't","text":"Research Support, U.S. Gov't","selected":true},{"id":"research support, u s gov't, non p h s","text":"Research Support, U.S. Gov't, Non P.H.S","selected":true},{"id":"research support, u s gov't, p h s","text":"Research Support, U.S. Gov't, P.H.S","selected":true},{"id":"research support, u s government","text":"Research Support, U.S. Government","selected":true},{"id":"retracted publication","text":"Retracted Publication","selected":false},{"id":"retraction of publication","text":"Retraction of Publication","selected":true},{"id":"review","text":"Review","selected":true},{"id":"scientific integrity review","text":"Scientific Integrity Review","selected":true},{"id":"study characteristics","text":"Study Characteristics","selected":true},{"id":"support of research","text":"Support of Research","selected":true},{"id":"systematic review","text":"Systematic Review","selected":true},{"id":"technical report","text":"Technical Report","selected":true},{"id":"twin study","text":"Twin Study","selected":true},{"id":"validation study","text":"Validation Study","selected":true},{"id":"video audio media","text":"Video Audio Media","selected":true},{"id":"webcasts","text":"Webcasts","selected":true}]}]`;
      // "addresses" not present in config options
      const REAL_CONTEXT_ARTICLE_TYPES = `["addresses","autobiography","bibliography","biography"]`;
      const EXPECTED_VALUE = ["Autobiography", "Bibliography", "Biography"];

      const initialState = {};
      const { configObject, contextObject } = setup(
        {
          options: JSON.parse(REAL_CONFIG_OPTIONS),
        },
        {
          params: {
            article_types: JSON.parse(REAL_CONTEXT_ARTICLE_TYPES),
          },
        }
      );

      const result = contextLineReducer(
        initialState,
        initializeStore(
          configObject,
          contextObject,
          [],
          null,
          500,
          null,
          null,
          500,
          {}
        )
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
        initializeStore(
          configObject,
          contextObject,
          [],
          null,
          500,
          null,
          null,
          500,
          {}
        )
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
        initializeStore(
          configObject,
          contextObject,
          [],
          null,
          500,
          null,
          null,
          500,
          {}
        )
      );

      expect(result).toHaveProperty("dataSource", EXPECTED_VALUE);
    });

    it("should initialize correct papers count", () => {
      const FAKE_DATA = [
        { resulttype: ["publication"] },
        { resulttype: ["publication"] },
      ];
      const initialState = {};
      const { configObject, contextObject } = setup({
        create_title_from_context_style: "viper",
      });

      const result = contextLineReducer(
        initialState,
        initializeStore(
          configObject,
          contextObject,
          FAKE_DATA,
          null,
          500,
          null,
          null,
          500,
          {}
        )
      );

      expect(result).toHaveProperty("paperCount", FAKE_DATA.length);
    });

    it("should initialize null papers count", () => {
      const FAKE_DATA = [...Array(42).keys()];
      const EXPECTED_VALUE = null;

      const initialState = {};
      const { configObject, contextObject } = setup({
        create_title_from_context_style: "base",
      });

      const result = contextLineReducer(
        initialState,
        initializeStore(
          configObject,
          contextObject,
          FAKE_DATA,
          null,
          500,
          null,
          null,
          500,
          {}
        )
      );

      expect(result).toHaveProperty("paperCount", EXPECTED_VALUE);
    });

    it("should initialize correct datasets count", () => {
      const FAKE_DATA = [
        { resulttype: ["dataset"] },
        { resulttype: ["dataset"] },
      ];
      const initialState = {};
      const { configObject, contextObject } = setup({
        create_title_from_context_style: "viper",
      });

      const result = contextLineReducer(
        initialState,
        initializeStore(
          configObject,
          contextObject,
          FAKE_DATA,
          null,
          500,
          null,
          null,
          500,
          {}
        )
      );

      expect(result).toHaveProperty("datasetCount", FAKE_DATA.length);
    });

    it("should initialize null dataset count", () => {
      const FAKE_DATA = [...Array(42).keys()];
      const EXPECTED_VALUE = null;

      const initialState = {};
      const { configObject, contextObject } = setup({
        create_title_from_context_style: "base",
      });

      const result = contextLineReducer(
        initialState,
        initializeStore(
          configObject,
          contextObject,
          FAKE_DATA,
          null,
          500,
          null,
          null,
          500,
          {}
        )
      );

      expect(result).toHaveProperty("datasetCount", EXPECTED_VALUE);
    });

    it("should initialize correct project runtime", () => {
      const START_DATE = "2009-01-01T13:30:22.112Z";
      const END_DATE = "2012-31-12T13:30:22.112Z";

      const initialState = {};
      const { configObject, contextObject } = setup(
        {
          create_title_from_context_style: "viper",
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
        initializeStore(
          configObject,
          contextObject,
          [],
          null,
          500,
          null,
          null,
          500,
          {}
        )
      );

      expect(result).toHaveProperty("projectRuntime", "2009–2012");
    });

    it("should initialize null project runtime if end date is missing", () => {
      const START_DATE = "2009-01-01T13:30:22.112Z";
      const END_DATE = undefined;

      const initialState = {};
      const { configObject, contextObject } = setup(
        {
          create_title_from_context_style: "viper",
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
        initializeStore(
          configObject,
          contextObject,
          [],
          null,
          500,
          null,
          null,
          500,
          {}
        )
      );

      expect(result).toHaveProperty("projectRuntime", null);
    });

    it("should initialize null project runtime if not viper", () => {
      const START_DATE = "2009-01-01T13:30:22.112Z";
      const END_DATE = "2012-31-12T13:30:22.112Z";

      const initialState = {};
      const { configObject, contextObject } = setup(
        {
          create_title_from_context_style: "base",
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
        initializeStore(
          configObject,
          contextObject,
          [],
          null,
          500,
          null,
          null,
          500,
          {}
        )
      );

      expect(result).toHaveProperty("projectRuntime", null);
    });

    it("should initialize correct language (base legacy)", () => {
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
        initializeStore(
          configObject,
          contextObject,
          [],
          null,
          500,
          null,
          null,
          500,
          {}
        )
      );

      expect(result).toHaveProperty(
        "legacySearchLanguage",
        "Language: čeština (Czech) "
      );
    });

    it("should initialize null language if wrong setting (base legacy)", () => {
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
        initializeStore(
          configObject,
          contextObject,
          [],
          null,
          500,
          null,
          null,
          500,
          {}
        )
      );

      expect(result).toHaveProperty("legacySearchLanguage", null);
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
        initializeStore(
          configObject,
          contextObject,
          [],
          null,
          500,
          null,
          null,
          500,
          {}
        )
      );

      expect(result).toHaveProperty("timestamp", LAST_UPDATED);
    });

    it("should initialize null metadata quality (undefined min_descsize)", () => {
      const SERVICE = "base";
      const MIN_DESCSIZE = undefined;
      const EXPECTED_QUALITY = null;

      const initialState = {};
      const { configObject, contextObject } = setup(
        {},
        {
          service: SERVICE,
          params: {
            min_descsize: MIN_DESCSIZE,
          },
        }
      );

      const result = contextLineReducer(
        initialState,
        initializeStore(
          configObject,
          contextObject,
          [],
          null,
          500,
          null,
          null,
          500,
          {}
        )
      );

      expect(result).toHaveProperty("metadataQuality", EXPECTED_QUALITY);
    });

    it("should initialize null metadata quality (unsupported service)", () => {
      const SERVICE = "doaj";
      const MIN_DESCSIZE = "300";
      const EXPECTED_QUALITY = null;

      const initialState = {};
      const { configObject, contextObject } = setup(
        {},
        {
          service: SERVICE,
          params: {
            min_descsize: MIN_DESCSIZE,
          },
        }
      );

      const result = contextLineReducer(
        initialState,
        initializeStore(
          configObject,
          contextObject,
          [],
          null,
          500,
          null,
          null,
          500,
          {}
        )
      );

      expect(result).toHaveProperty("metadataQuality", EXPECTED_QUALITY);
    });

    it("should initialize correct (low) metadata quality (base, min_descsize = 0)", () => {
      const SERVICE = "base";
      const MIN_DESCSIZE = "0";
      const EXPECTED_QUALITY = "low";

      const initialState = {};
      const { configObject, contextObject } = setup(
        {},
        {
          service: SERVICE,
          params: {
            min_descsize: MIN_DESCSIZE,
          },
        }
      );

      const result = contextLineReducer(
        initialState,
        initializeStore(
          configObject,
          contextObject,
          [],
          null,
          500,
          null,
          null,
          500,
          {}
        )
      );

      expect(result).toHaveProperty("metadataQuality", EXPECTED_QUALITY);
    });

    it("should initialize correct (high) metadata quality (base, min_descsize = 300)", () => {
      const SERVICE = "base";
      const MIN_DESCSIZE = "300";
      const EXPECTED_QUALITY = "high";

      const initialState = {};
      const { configObject, contextObject } = setup(
        {},
        {
          service: SERVICE,
          params: {
            min_descsize: MIN_DESCSIZE,
          },
        }
      );

      const result = contextLineReducer(
        initialState,
        initializeStore(
          configObject,
          contextObject,
          [],
          null,
          500,
          null,
          null,
          500,
          {}
        )
      );

      expect(result).toHaveProperty("metadataQuality", EXPECTED_QUALITY);
    });

    it("should initialize correct (low) metadata quality (pubmed, min_descsize = 0)", () => {
      const SERVICE = "pubmed";
      const MIN_DESCSIZE = "0";
      const EXPECTED_QUALITY = "low";

      const initialState = {};
      const { configObject, contextObject } = setup(
        {},
        {
          service: SERVICE,
          params: {
            min_descsize: MIN_DESCSIZE,
          },
        }
      );

      const result = contextLineReducer(
        initialState,
        initializeStore(
          configObject,
          contextObject,
          [],
          null,
          500,
          null,
          null,
          500,
          {}
        )
      );

      expect(result).toHaveProperty("metadataQuality", EXPECTED_QUALITY);
    });

    it("should initialize correct (high) metadata quality (pubmed, min_descsize = 300)", () => {
      const SERVICE = "pubmed";
      const MIN_DESCSIZE = "1";
      const EXPECTED_QUALITY = "high";

      const initialState = {};
      const { configObject, contextObject } = setup(
        {},
        {
          service: SERVICE,
          params: {
            min_descsize: MIN_DESCSIZE,
          },
        }
      );

      const result = contextLineReducer(
        initialState,
        initializeStore(
          configObject,
          contextObject,
          [],
          null,
          500,
          null,
          null,
          500,
          {}
        )
      );

      expect(result).toHaveProperty("metadataQuality", EXPECTED_QUALITY);
    });

    it("should not change the state if the action is canceled", () => {
      const INITIAL_STATE = { some_state: 1 };

      const result = contextLineReducer(INITIAL_STATE, { canceled: true });

      expect(result).toEqual(INITIAL_STATE);
    });

    it("should initialize correct language (triple)", () => {
      const LANG_ID = "en";

      const initialState = {};
      const { configObject, contextObject } = setup(
        {},
        {
          params: {
            language: LANG_ID,
          },
        }
      );

      const result = contextLineReducer(
        initialState,
        initializeStore(
          configObject,
          contextObject,
          [],
          null,
          500,
          null,
          null,
          500,
          {}
        )
      );

      expect(result).toHaveProperty("searchLanguage", LANG_ID);
    });
  });

  describe("service reducer", () => {
    it("should return the initial state", () => {
      const EXPECTED_RESULT = null;

      const result = serviceReducer(undefined, {});

      expect(result).toEqual(EXPECTED_RESULT);
    });

    it("should initialize null service", () => {
      const SERVICE = undefined;
      const EXPECTED_SERVICE = null;

      const initialState = {};
      const { configObject, contextObject } = setup(
        {},
        {
          service: SERVICE,
        }
      );

      const result = serviceReducer(
        initialState,
        initializeStore(
          configObject,
          contextObject,
          [],
          null,
          500,
          null,
          null,
          500,
          {}
        )
      );

      expect(result).toEqual(EXPECTED_SERVICE);
    });

    it("should initialize correct service", () => {
      const SERVICE = "base";

      const initialState = {};
      const { configObject, contextObject } = setup(
        {},
        {
          service: SERVICE,
        }
      );

      const result = serviceReducer(
        initialState,
        initializeStore(
          configObject,
          contextObject,
          [],
          null,
          500,
          null,
          null,
          500,
          {}
        )
      );

      expect(result).toEqual(SERVICE);
    });

    it("should not change the state if the action is canceled", () => {
      const INITIAL_STATE = { some_state: 1 };

      const result = serviceReducer(INITIAL_STATE, { canceled: true });

      expect(result).toEqual(INITIAL_STATE);
    });
  });

  describe("list reducer", () => {
    // initial state tested in listtoggle.test.js

    it("should initialize correct list visibility", () => {
      const SHOW_LIST = false;

      const { configObject, contextObject } = setup({
        show_list: SHOW_LIST,
      });

      const result = listReducer(
        {},
        initializeStore(
          configObject,
          contextObject,
          [],
          null,
          500,
          null,
          null,
          500,
          {}
        )
      );

      expect(result).toHaveProperty("show", SHOW_LIST);
    });

    it("should initialize correct filter visibility", () => {
      const SHOW_FILTER = false;

      const { configObject, contextObject } = setup({
        filter_menu_dropdown: SHOW_FILTER,
      });

      const result = listReducer(
        {},
        initializeStore(
          configObject,
          contextObject,
          [],
          null,
          500,
          null,
          null,
          500,
          {}
        )
      );

      expect(result).toHaveProperty("showFilter", SHOW_FILTER);
    });

    it("should initialize correct filter options and initial value", () => {
      const FILTER_OPTIONS = ["all", "open_access"];

      const { configObject, contextObject } = setup({
        filter_options: FILTER_OPTIONS,
      });

      const result = listReducer(
        {},
        initializeStore(
          configObject,
          contextObject,
          [],
          null,
          500,
          null,
          null,
          500,
          {}
        )
      );

      expect(result).toHaveProperty("filterOptions", FILTER_OPTIONS);
      expect(result).toHaveProperty("filterValue", FILTER_OPTIONS[0]);
    });

    it("should initialize correct sort options and initial value", () => {
      const SORT_OPTIONS = ["relevance", "readers", "year"];

      const { configObject, contextObject } = setup({
        sort_options: SORT_OPTIONS,
      });

      const result = listReducer(
        {},
        initializeStore(
          configObject,
          contextObject,
          [],
          null,
          500,
          null,
          null,
          500,
          {}
        )
      );

      expect(result).toHaveProperty("sortOptions", SORT_OPTIONS);
      expect(result).toHaveProperty("sortValue", SORT_OPTIONS[0]);
    });

    it("should initialize correct initial value if pre-specified", () => {
      const SORT_OPTIONS = ["relevance", "readers", "year"];
      const INITIAL_SORT = "readers";

      const { configObject, contextObject } = setup({
        sort_options: SORT_OPTIONS,
        initial_sort: INITIAL_SORT,
      });

      const result = listReducer(
        {},
        initializeStore(
          configObject,
          contextObject,
          [],
          null,
          500,
          null,
          null,
          500,
          {}
        )
      );

      expect(result).toHaveProperty("sortValue", INITIAL_SORT);
    });

    it("should not change the state if the action is canceled", () => {
      const INITIAL_STATE = { some_state: 1 };

      const result = listReducer(INITIAL_STATE, { canceled: true });

      expect(result).toEqual(INITIAL_STATE);
    });
  });
});
