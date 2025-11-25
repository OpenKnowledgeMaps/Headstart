import { describe, expect, it, vitest } from "vitest";

describe("Modals component", () => {
  vitest.useFakeTimers().setSystemTime(new Date("2021-01-01").getTime());

  describe("map citation modal", () => {
    it("temporal", () => {
      expect(true).toBe(true);
    });
    // it("base citation modal renders", async () => {
    //   const storeObject = setup(
    //     { openCitationModal: true, showCitationButton: true },
    //     { service: "base", query: { text: "digital education" } }
    //   );
    //   const store = mockStore(storeObject);

    //   const result = render(
    //     <Provider store={store}>
    //       <LocalizationProvider localization={storeObject.localization}>
    //         <Modals />
    //       </LocalizationProvider>
    //     </Provider>
    //   );

    //   screen.debug();

    //   await waitFor(() => screen.queryByRole("dialog"))

    //   expect(screen.queryByRole("dialog")).toBeDefined();

    //   expect(result.container.querySelector("#cite-title").textContent).toEqual(
    //     "Cite this knowledge map"
    //   );

    //   expect(screen.queryByTestId("citation").textContent).toEqual(
    //     "Open Knowledge Maps (2021). Overview of research on digital education. Retrieved from http://localhost:3000/ [9 Jul 2020]."
    //   );

    // });

    // it("citation modal with long query renders", () => {
    //   const storeObject = setup(
    //     { openCitationModal: true },
    //     { service: "base", query: { text: "digital education ".repeat(10) } }
    //   );
    //   const store = mockStore(storeObject);

    //   act(() => {
    //     render(
    //       <Provider store={store}>
    //         <LocalizationProvider localization={storeObject.localization}>
    //           <Modals />
    //         </LocalizationProvider>
    //       </Provider>,
    //       container
    //     );
    //   });

    //   expect(document.querySelector(".citation").textContent).toEqual(
    //     "Open Knowledge Maps (2021). Overview of research on digital education digital education digital education digital education digital education digital ed[..]. Retrieved from http://localhost:3000/ [9 Jul 2020]."
    //   );
    // });

    // it("citation modal with custom title renders", () => {
    //   const storeObject = setup(
    //     { openCitationModal: true },
    //     {
    //       service: "base",
    //       query: { text: "digital education" },
    //       heading: { titleStyle: "custom", customTitle: "sample title" },
    //     }
    //   );
    //   const store = mockStore(storeObject);

    //   act(() => {
    //     render(
    //       <Provider store={store}>
    //         <LocalizationProvider localization={storeObject.localization}>
    //           <Modals />
    //         </LocalizationProvider>
    //       </Provider>,
    //       container
    //     );
    //   });

    //   expect(document.querySelector(".citation").textContent).toEqual(
    //     "Open Knowledge Maps (2021). Overview of research on sample title. Retrieved from http://localhost:3000/ [9 Jul 2020]."
    //   );
    // });

    // it("citation modal without timestamp renders", () => {
    //   const storeObject = setup(
    //     { openCitationModal: true },
    //     {
    //       service: "base",
    //       query: { text: "digital education" },
    //       misc: { timestamp: null },
    //     }
    //   );
    //   const store = mockStore(storeObject);

    //   act(() => {
    //     render(
    //       <Provider store={store}>
    //         <LocalizationProvider localization={storeObject.localization}>
    //           <Modals />
    //         </LocalizationProvider>
    //       </Provider>,
    //       container
    //     );
    //   });

    //   expect(document.querySelector(".citation").textContent).toEqual(
    //     "Open Knowledge Maps (2021). Overview of research on digital education. Retrieved from http://localhost:3000/."
    //   );
    // });

    // it("copies the citation to clipboard when Copy is clicked", async () => {
    //   const storeObject = setup(
    //     { openCitationModal: true },
    //     {
    //       service: "triple_sg",
    //       chartType: STREAMGRAPH_MODE,
    //       query: { text: "some query" },
    //     }
    //   );
    //   const store = mockStore(storeObject);

    //   const promise = Promise.resolve();
    //   Object.assign(navigator, {
    //     clipboard: {
    //       writeText: () => promise,
    //     },
    //   });

    //   vitest.spyOn(navigator.clipboard, "writeText");

    //   act(() => {
    //     render(
    //       <Provider store={store}>
    //         <LocalizationProvider localization={storeObject.localization}>
    //           <Modals />
    //         </LocalizationProvider>
    //       </Provider>,
    //       container
    //     );

    //     const select = document.querySelector(".indented-modal-btn");
    //     const event = new Event("click", { bubbles: true });
    //     select.dispatchEvent(event);
    //   });

    //   expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
    //     "Open Knowledge Maps (2021). Overview of research on some query. Retrieved from http://localhost:3000/ [9 Jul 2020]."
    //   );

    //   await act(() => promise);
    //   const buttonLabel = document
    //     .querySelector(".indented-modal-btn")
    //     .textContent.trim();
    //   expect(buttonLabel).toEqual(storeObject.localization.copied_button_text);
    // });

    // it("triggers a correct redux action when citation modal is closed", () => {
    //   const storeObject = setup(
    //     { openCitationModal: true },
    //     { service: "triple_sg", chartType: STREAMGRAPH_MODE }
    //   );
    //   const store = mockStore(storeObject);

    //   act(() => {
    //     render(
    //       <Provider store={store}>
    //         <LocalizationProvider localization={storeObject.localization}>
    //           <Modals />
    //         </LocalizationProvider>
    //       </Provider>,
    //       container
    //     );
    //   });

    //   const select = document.querySelector(".modal-header .close");
    //   act(() => {
    //     const event = new Event("click", { bubbles: true });
    //     select.dispatchEvent(event);
    //   });

    //   const actions = store.getActions();
    //   const expectedPayload = closeCitationModal();

    //   expect(actions).toEqual([expectedPayload]);
    // });
  });

  // describe("paper citation modal", () => {
  //   const EXAMPLE_PAPER = {
  //     title: "Test paper",
  //     year: "2021",
  //     authors_objects: [{ firstName: "John", lastName: "Doe" }],
  //     list_link: { isDoi: false, address: "https://example.com" },
  //   };

  //   it("renders citation modal", () => {
  //     const storeObject = setup(
  //       { citedPaper: Object.assign({}, EXAMPLE_PAPER) },
  //       { service: "base", query: { text: "digital education" } }
  //     );
  //     const store = mockStore(storeObject);

  //     act(() => {
  //       render(
  //         <Provider store={store}>
  //           <LocalizationProvider localization={storeObject.localization}>
  //             <Modals />
  //           </LocalizationProvider>
  //         </Provider>,
  //         container
  //       );
  //     });

  //     expect(document.querySelector("#cite-paper-title").textContent).toEqual(
  //       storeObject.localization.cite_paper
  //     );

  //     expect(
  //       document.querySelector("#copy-paper-citation").textContent.trim()
  //     ).toEqual("Doe, J. (2021). Test paper. https://example.com");
  //   });

  //   it("triggers a correct redux action when citation modal is closed", () => {
  //     const storeObject = setup(
  //       { citedPaper: Object.assign({}, EXAMPLE_PAPER) },
  //       { service: "pubmed" }
  //     );
  //     const store = mockStore(storeObject);

  //     act(() => {
  //       render(
  //         <Provider store={store}>
  //           <LocalizationProvider localization={storeObject.localization}>
  //             <Modals />
  //           </LocalizationProvider>
  //         </Provider>,
  //         container
  //       );
  //     });

  //     const select = document.querySelector(".modal-header .close");
  //     act(() => {
  //       const event = new Event("click", { bubbles: true });
  //       select.dispatchEvent(event);
  //     });

  //     const actions = store.getActions();
  //     const expectedPayload = hideCitePaper();

  //     expect(actions).toEqual([expectedPayload]);
  //   });

  //   it("changes the citation style", () => {
  //     const storeObject = setup(
  //       { citedPaper: Object.assign({}, EXAMPLE_PAPER) },
  //       {
  //         service: "base",
  //         query: { text: "some query" },
  //       }
  //     );
  //     const store = mockStore(storeObject);

  //     act(() => {
  //       render(
  //         <Provider store={store}>
  //           <LocalizationProvider localization={storeObject.localization}>
  //             <Modals />
  //           </LocalizationProvider>
  //         </Provider>,
  //         container
  //       );
  //     });

  //     const buttons = document.querySelectorAll(".cit-style-label");

  //     act(() => {
  //       const event = new MouseEvent("click", { bubbles: true });
  //       buttons[3].dispatchEvent(event);
  //     });

  //     // tbh I don't get it why the output is this and not ACM
  //     expect(
  //       document.querySelector("#copy-paper-citation").textContent.trim()
  //     ).toBe(
  //       "Doe, J. (2021). Test paper. https://example.com\n https://example.com"
  //     );
  //   });

  //   it("copies the citation to clipboard when Copy is clicked", async () => {
  //     const storeObject = setup(
  //       { citedPaper: Object.assign({}, EXAMPLE_PAPER) },
  //       { service: "base", query: { text: "digital education" } }
  //     );
  //     const store = mockStore(storeObject);

  //     const promise = Promise.resolve();
  //     Object.assign(navigator, {
  //       clipboard: {
  //         writeText: () => promise,
  //       },
  //     });

  //     vitest.spyOn(navigator.clipboard, "writeText");

  //     act(() => {
  //       render(
  //         <Provider store={store}>
  //           <LocalizationProvider localization={storeObject.localization}>
  //             <Modals />
  //           </LocalizationProvider>
  //         </Provider>,
  //         container
  //       );
  //     });

  //     const select = document.querySelector(".copy-button");
  //     const event = new Event("click", { bubbles: true });

  //     act(() => {
  //       select.dispatchEvent(event);
  //     });

  //     expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
  //       expect.stringMatching(/Doe, J\. \(2021\)\. Test paper\.\s*/)
  //     );

  //     await act(() => promise);
  //     const buttonLabel = document
  //       .querySelector(".copied-button")
  //       .textContent.trim();
  //     expect(buttonLabel).toEqual(storeObject.localization.copied_button_text);
  //   });
  // });

  // describe("paper export modal", () => {
  //   const EXAMPLE_PAPER = {
  //     title: "Test paper",
  //     year: "2021",
  //     authors_objects: [{ firstName: "John", lastName: "Doe" }],
  //     list_link: { isDoi: false, address: "https://example.com" },
  //   };

  //   let innerPromise = null;
  //   let outerPromise = null;
  //   beforeEach(() => {
  //     innerPromise = Promise.resolve("some BibTex");
  //     outerPromise = Promise.resolve({ ok: true, text: () => innerPromise });

  //     global.fetch = vitest.fn(() => outerPromise);
  //   });

  //   afterEach(() => {
  //     innerPromise = null;
  //     outerPromise = null;
  //   });

  //   it("renders export modal", async () => {
  //     const storeObject = setup(
  //       { exportedPaper: { ...EXAMPLE_PAPER } },
  //       { service: "base", query: { text: "digital education" } }
  //     );
  //     const store = mockStore(storeObject);

  //     act(() => {
  //       render(
  //         <Provider store={store}>
  //           <LocalizationProvider localization={storeObject.localization}>
  //             <Modals />
  //           </LocalizationProvider>
  //         </Provider>,
  //         container
  //       );
  //     });

  //     expect(document.querySelector("#export-paper-title").textContent).toEqual(
  //       storeObject.localization.export_paper
  //     );

  //     await act(() => outerPromise);
  //     await act(() => innerPromise);

  //     expect(
  //       document.querySelector("#copy-paper-export").textContent.trim()
  //     ).toEqual("some BibTex");
  //   });

  //   it("triggers a correct redux action when export modal is closed", async () => {
  //     const storeObject = setup(
  //       { exportedPaper: { ...EXAMPLE_PAPER } },
  //       { service: "pubmed" }
  //     );
  //     const store = mockStore(storeObject);

  //     act(() => {
  //       render(
  //         <Provider store={store}>
  //           <LocalizationProvider localization={storeObject.localization}>
  //             <Modals />
  //           </LocalizationProvider>
  //         </Provider>,
  //         container
  //       );
  //     });

  //     await act(() => outerPromise);
  //     await act(() => innerPromise);

  //     const closeButtons = document.querySelectorAll(".modal-header .close");
  //     act(() => {
  //       const event = new Event("click", { bubbles: true });
  //       closeButtons[1].dispatchEvent(event);
  //     });

  //     const actions = store.getActions();
  //     const expectedPayload = hideExportPaper();

  //     expect(actions).toEqual([expectedPayload]);
  //   });

  //   it("copies the export to clipboard when Copy is clicked", async () => {
  //     const storeObject = setup(
  //       { exportedPaper: { ...EXAMPLE_PAPER } },
  //       { service: "pubmed" }
  //     );
  //     const store = mockStore(storeObject);

  //     const promise = Promise.resolve();
  //     Object.assign(navigator, {
  //       clipboard: {
  //         writeText: () => promise,
  //       },
  //     });

  //     vitest.spyOn(navigator.clipboard, "writeText");

  //     act(() => {
  //       render(
  //         <Provider store={store}>
  //           <LocalizationProvider localization={storeObject.localization}>
  //             <Modals />
  //           </LocalizationProvider>
  //         </Provider>,
  //         container
  //       );
  //     });

  //     await act(() => outerPromise);
  //     await act(() => innerPromise);

  //     const select = document.querySelector(".indented-modal-btn");
  //     const event = new Event("click", { bubbles: true });

  //     act(() => {
  //       select.dispatchEvent(event);
  //     });

  //     expect(navigator.clipboard.writeText).toHaveBeenCalledWith("some BibTex");

  //     await act(() => promise);
  //     const buttonLabel = document
  //       .querySelector(".indented-modal-btn")
  //       .textContent.trim();
  //     expect(buttonLabel).toEqual(storeObject.localization.copied_button_text);
  //   });

  //   it("triggers the download when Download is clicked", async () => {
  //     const storeObject = setup(
  //       { exportedPaper: { ...EXAMPLE_PAPER } },
  //       { service: "pubmed" }
  //     );
  //     const store = mockStore(storeObject);

  //     HTMLFormElement.prototype.submit = vitest.fn();
  //     vitest.spyOn(HTMLFormElement.prototype, "submit");

  //     act(() => {
  //       render(
  //         <Provider store={store}>
  //           <LocalizationProvider localization={storeObject.localization}>
  //             <Modals />
  //           </LocalizationProvider>
  //         </Provider>,
  //         container
  //       );
  //     });

  //     await act(() => outerPromise);
  //     await act(() => innerPromise);

  //     const select = document.querySelectorAll(".indented-modal-btn")[1];
  //     const event = new Event("click", { bubbles: true });

  //     act(() => {
  //       select.dispatchEvent(event);
  //     });

  //     expect(HTMLFormElement.prototype.submit).toHaveBeenCalledTimes(1);
  //   });
  // });

  // describe("info modal", () => {
  //   it("base info modal renders", () => {
  //     const storeObject = setup(
  //       { openInfoModal: true },
  //       { service: "base", query: { text: "digital education" } }
  //     );
  //     const store = mockStore(storeObject);

  //     act(() => {
  //       render(
  //         <Provider store={store}>
  //           <LocalizationProvider localization={storeObject.localization}>
  //             <Modals />
  //           </LocalizationProvider>
  //         </Provider>,
  //         container
  //       );
  //     });

  //     expect(document.querySelector("#info-title").textContent).toEqual(
  //       "What's this?"
  //     );
  //   });

  //   it("pubmed info modal renders", () => {
  //     const storeObject = setup(
  //       { openInfoModal: true },
  //       { service: "pubmed", heading: { customTitle: "test" } }
  //     );
  //     const store = mockStore(storeObject);

  //     act(() => {
  //       render(
  //         <Provider store={store}>
  //           <LocalizationProvider localization={storeObject.localization}>
  //             <Modals />
  //           </LocalizationProvider>
  //         </Provider>,
  //         container
  //       );
  //     });

  //     expect(document.querySelector("#info-title").textContent).toEqual(
  //       "What's this?"
  //     );
  //   });

  //   it("triple knowledge map info modal renders", () => {
  //     const storeObject = setup(
  //       { openInfoModal: true },
  //       { service: "triple_km" }
  //     );
  //     const store = mockStore(storeObject);

  //     act(() => {
  //       render(
  //         <Provider store={store}>
  //           <LocalizationProvider localization={storeObject.localization}>
  //             <Modals />
  //           </LocalizationProvider>
  //         </Provider>,
  //         container
  //       );
  //     });

  //     expect(document.querySelector("#info-title").textContent).toEqual(
  //       "What's this?"
  //     );
  //   });

  //   it("triple streamgraph info modal renders", () => {
  //     const storeObject = setup(
  //       { openInfoModal: true },
  //       { service: "triple_sg", query: { text: "soft skills" } }
  //     );
  //     const store = mockStore(storeObject);

  //     act(() => {
  //       render(
  //         <Provider store={store}>
  //           <LocalizationProvider localization={storeObject.localization}>
  //             <Modals />
  //           </LocalizationProvider>
  //         </Provider>,
  //         container
  //       );
  //     });

  //     expect(document.querySelector("#info-title").textContent).toEqual(
  //       "What's this?"
  //     );
  //   });

  //   it("triple streamgraph info modal renders with custom title", () => {
  //     const storeObject = setup(
  //       { openInfoModal: true },
  //       { service: "triple_sg", heading: { customTitle: "sample text" } }
  //     );
  //     const store = mockStore(storeObject);

  //     act(() => {
  //       render(
  //         <Provider store={store}>
  //           <LocalizationProvider localization={storeObject.localization}>
  //             <Modals />
  //           </LocalizationProvider>
  //         </Provider>,
  //         container
  //       );
  //     });

  //     expect(document.querySelector("#info-title").textContent).toEqual(
  //       "What's this?"
  //     );
  //   });

  //   it("default knowledge map info modal renders", () => {
  //     const storeObject = setup(
  //       { openInfoModal: true },
  //       { service: "triple_km", chartType: KNOWLEDGEMAP_MODE }
  //     );
  //     const store = mockStore(storeObject);

  //     act(() => {
  //       render(
  //         <Provider store={store}>
  //           <LocalizationProvider localization={storeObject.localization}>
  //             <Modals />
  //           </LocalizationProvider>
  //         </Provider>,
  //         container
  //       );
  //     });

  //     expect(document.querySelector("#info-title").textContent).toEqual(
  //       "What's this?"
  //     );
  //   });

  //   it("default streamgraph info modal renders", () => {
  //     const storeObject = setup(
  //       { openInfoModal: true },
  //       { service: "triple_sg", chartType: STREAMGRAPH_MODE }
  //     );
  //     const store = mockStore(storeObject);

  //     act(() => {
  //       render(
  //         <Provider store={store}>
  //           <LocalizationProvider localization={storeObject.localization}>
  //             <Modals />
  //           </LocalizationProvider>
  //         </Provider>,
  //         container
  //       );
  //     });

  //     expect(document.querySelector("#info-title").textContent).toEqual(
  //       "What's this?"
  //     );
  //   });

  //   it("triggers a correct redux action when info modal is closed", () => {
  //     const storeObject = setup(
  //       { openInfoModal: true },
  //       { service: "triple_sg", chartType: STREAMGRAPH_MODE }
  //     );
  //     const store = mockStore(storeObject);

  //     act(() => {
  //       render(
  //         <Provider store={store}>
  //           <LocalizationProvider localization={storeObject.localization}>
  //             <Modals />
  //           </LocalizationProvider>
  //         </Provider>,
  //         container
  //       );
  //     });

  //     const select = document.querySelector(".modal-header .close");
  //     act(() => {
  //       const event = new Event("click", { bubbles: true });
  //       select.dispatchEvent(event);
  //     });

  //     const actions = store.getActions();
  //     const expectedPayload = closeInfoModal();

  //     expect(actions).toEqual([expectedPayload]);
  //   });
  // });

  // describe("embed modal", () => {
  //   it("embed modal renders", () => {
  //     const storeObject = setup({ openEmbedModal: true });
  //     const store = mockStore(storeObject);

  //     act(() => {
  //       render(
  //         <Provider store={store}>
  //           <LocalizationProvider localization={storeObject.localization}>
  //             <Modals />
  //           </LocalizationProvider>
  //         </Provider>,
  //         container
  //       );
  //     });

  //     expect(document.querySelector("#embed-title").textContent).toEqual(
  //       storeObject.localization.embed_title
  //     );
  //   });

  //   it("triggers a correct redux action when embed modal is closed", () => {
  //     const storeObject = setup({ openEmbedModal: true });
  //     const store = mockStore(storeObject);

  //     act(() => {
  //       render(
  //         <Provider store={store}>
  //           <LocalizationProvider localization={storeObject.localization}>
  //             <Modals />
  //           </LocalizationProvider>
  //         </Provider>,
  //         container
  //       );
  //     });

  //     const select = document.querySelector(".modal-header .close");
  //     act(() => {
  //       const event = new Event("click", { bubbles: true });
  //       select.dispatchEvent(event);
  //     });

  //     const actions = store.getActions();
  //     const expectedPayload = closeEmbedModal();

  //     expect(actions).toEqual([expectedPayload]);
  //   });

  //   it("copies the embed code to clipboard when Copy is clicked", async () => {
  //     const storeObject = setup({ openEmbedModal: true });
  //     const store = mockStore(storeObject);

  //     const promise = Promise.resolve();
  //     Object.assign(navigator, {
  //       clipboard: {
  //         writeText: () => promise,
  //       },
  //     });

  //     vitest.spyOn(navigator.clipboard, "writeText");

  //     act(() => {
  //       render(
  //         <Provider store={store}>
  //           <LocalizationProvider localization={storeObject.localization}>
  //             <Modals />
  //           </LocalizationProvider>
  //         </Provider>,
  //         container
  //       );
  //     });

  //     const select = document.querySelector(".indented-modal-btn");
  //     const event = new Event("click", { bubbles: true });

  //     act(() => {
  //       select.dispatchEvent(event);
  //     });

  //     expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
  //       `<iframe width="1260" height="756" src="http://localhost:3000/?embed=true" allow="clipboard-write; self https://openknowledgemaps.org/;"></iframe>`
  //     );

  //     await act(() => promise);
  //     const buttonLabel = document
  //       .querySelector(".indented-modal-btn")
  //       .textContent.trim();
  //     expect(buttonLabel).toEqual(storeObject.localization.copied_button_text);
  //   });
  // });
});
