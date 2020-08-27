import { initializeStore } from "../../js/actions";

import headingReducer from "../../js/reducers/heading";
import localizationReducer from "../../js/reducers/localization";
import queryReducer from "../../js/reducers/query";
import filesReducer from "../../js/reducers/files";

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
      },
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
});
