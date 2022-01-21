import PaperSanitizer from "../../js/utils/PaperSanitizer";

const CONFIG = {
  scale_types: [],
  language: "en",
  localization: {
    en: {
      default_readers: 0,
    },
  },
};

describe("PaperSanitizer class tests", () => {
  let mockWarn = null;
  beforeEach(() => {
    mockWarn = jest.fn();
    global.console = { ...global.console, warn: mockWarn };
  });

  afterEach(() => {
    mockWarn = null;

    global.console = { ...global.console, warn: console.warn };
  });

  it("doesn't delete a property with a correct type", () => {
    const ps = new PaperSanitizer(CONFIG);
    const papers = [{ testProp: "correct" }, { testProp: 0 }];
    const scheme = [{ name: "testProp", type: ["string"] }];

    const result = ps.sanitizeProps(papers, scheme);

    expect(result[0]).toHaveProperty("testProp");
  });

  it("deletes a property with a wrong type", () => {
    const ps = new PaperSanitizer(CONFIG);
    const papers = [{ testProp: "correct" }, { testProp: 0 }];
    const scheme = [{ name: "testProp", type: ["string"] }];

    const result = ps.sanitizeProps(papers, scheme);

    expect(result[1]).not.toHaveProperty("testProp");
  });

  it("doesn't delete a property with a correct format", () => {
    const ps = new PaperSanitizer(CONFIG);
    const papers = [{ testProp: "2021-12-07" }, { testProp: "7.12.2021" }];
    const scheme = [
      {
        name: "testProp",
        type: ["string"],
        validator: (val) => val.match(/^\d{4}-\d{2}-\d{2}$/),
      },
    ];

    const result = ps.sanitizeProps(papers, scheme);

    expect(result[0]).toHaveProperty("testProp");
  });

  it("deletes a property with a wrong format", () => {
    const ps = new PaperSanitizer(CONFIG);
    const papers = [{ testProp: "2021-12-07" }, { testProp: "7.12.2021" }];
    const scheme = [
      {
        name: "testProp",
        type: ["string"],
        validator: (val) => val.match(/^\d{4}-\d{2}-\d{2}$/),
      },
    ];

    const result = ps.sanitizeProps(papers, scheme);

    expect(result[1]).not.toHaveProperty("testProp");
  });

  it("sanitizes a property with a wrong type", () => {
    const ps = new PaperSanitizer(CONFIG);
    const papers = [{ testProp: 0 }, { testProp: "1" }];
    const scheme = [
      { name: "testProp", type: ["number"], sanitizer: (val) => parseInt(val) },
    ];

    const result = ps.sanitizeProps(papers, scheme);

    expect(result[1]).toHaveProperty("testProp", 1);
  });

  it("doesn't add a fallback to an initialized property", () => {
    const ps = new PaperSanitizer(CONFIG);
    const papers = [
      { testProp: "val", otherProp: "sth" },
      { otherProp: "sth" },
    ];
    const scheme = [{ name: "testProp", fallback: () => "test fallback" }];

    const result = ps.sanitizeProps(papers, scheme);

    expect(result[0]).toHaveProperty("testProp", "val");
  });

  it("adds a fallback to a missing property", () => {
    const ps = new PaperSanitizer(CONFIG);
    const papers = [
      { testProp: "val", otherProp: "sth" },
      { otherProp: "sth" },
    ];
    const scheme = [{ name: "testProp", fallback: () => "test fallback" }];

    const result = ps.sanitizeProps(papers, scheme);

    expect(result[1]).toHaveProperty("testProp", "test fallback");
  });

  it("doesn't add a fallback to defined scale types", () => {
    const ps = new PaperSanitizer({ ...CONFIG, scale_types: ["readers"] });
    const papers = [{ readers: 10, otherProp: "sth" }, { otherProp: "sth" }];
    const scheme = [];

    const result = ps.sanitizeProps(papers, scheme);

    expect(result[0]).toHaveProperty("readers", 10);
  });

  it("adds a fallback to undefined scale types", () => {
    const ps = new PaperSanitizer({ ...CONFIG, scale_types: ["readers"] });
    const papers = [{ readers: 10, otherProp: "sth" }, { otherProp: "sth" }];
    const scheme = [];

    const result = ps.sanitizeProps(papers, scheme);

    expect(result[1]).toHaveProperty(
      "readers",
      CONFIG.localization.en.default_readers
    );
  });

  it("doesn't raise a warning if no props are missing", () => {
    const ps = new PaperSanitizer(CONFIG);

    ps.checkRequiredProps(
      [
        { requiredProp: "sample text" },
        { requiredProp: "sample text", nonrequiredProp: 42 },
      ],
      [
        {
          name: "requiredProp",
          required: true,
        },
        {
          name: "nonrequiredProp",
        },
      ]
    );

    expect(mockWarn).not.toHaveBeenCalled();
  });

  it("raises a warning if a prop is missing", () => {
    const ps = new PaperSanitizer(CONFIG);

    ps.checkRequiredProps(
      [
        { nonrequiredProp: 9 },
        { requiredProp: "sample text", nonrequiredProp: 42 },
      ],
      [
        {
          name: "requiredProp",
          required: true,
        },
        {
          name: "nonrequiredProp",
        },
      ]
    );

    expect(mockWarn).toHaveBeenCalledTimes(1);
  });

  it("raises a warning if a prop is missing in all papers", () => {
    const ps = new PaperSanitizer(CONFIG);

    ps.checkRequiredProps(
      [{ nonrequiredProp: 9 }, { nonrequiredProp: 42 }],
      [
        {
          name: "requiredProp",
          required: true,
        },
        {
          name: "nonrequiredProp",
        },
      ]
    );

    expect(mockWarn).toHaveBeenCalledTimes(1);
  });

  it("doesn't raise a warning if no unique props have duplicate values", () => {
    const ps = new PaperSanitizer(CONFIG);

    ps.checkUniqueProps(
      [
        { uniqueProp: 1, nonuniqueProp: 1 },
        { uniqueProp: 2, nonuniqueProp: 1 },
      ],
      [
        {
          name: "uniqueProp",
          unique: true,
        },
        {
          name: "nonuniqueProp",
        },
      ]
    );

    expect(mockWarn).not.toHaveBeenCalled();
  });

  it("raises a warning if an unique prop has duplicate values", () => {
    const ps = new PaperSanitizer(CONFIG);

    ps.checkUniqueProps(
      [
        { uniqueProp: 1, nonuniqueProp: 1 },
        { uniqueProp: 1, nonuniqueProp: 2 },
      ],
      [
        {
          name: "uniqueProp",
          unique: true,
        },
        {
          name: "nonuniqueProp",
        },
      ]
    );

    expect(mockWarn).toHaveBeenCalledTimes(1);
  });
});
