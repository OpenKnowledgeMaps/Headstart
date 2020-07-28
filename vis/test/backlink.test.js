import React from "react";
import { render, unmountComponentAtNode } from "react-dom";
import { act } from "react-dom/test-utils";
import { shallow } from "enzyme";

import { Backlink } from "../js/components/Backlink";

const setup = (overrideProps) => {
  const props = Object.assign(
    {
      hidden: false,
      onClick: jest.fn(),
    },
    overrideProps
  );

  const wrapper = shallow(<Backlink {...props} />);

  return { wrapper, props };
};

/**
 * Redux state tests are missing.
 * They probably belong in a separate file...
 */

/**
 * All the tests for the Backlink component, including its template, can be found here.
 */
describe("Backlink component", () => {
  /**
   * Basic render test
   *   using Enzyme for shallow rendering (no children rendered)
   */
  it("renders", () => {
    const { wrapper } = setup();
    expect(wrapper.exists()).toBe(true);
  });

  /**
   * Component render tests
   *   using Enzyme again, so just shallow rendering
   */
  describe("visibility", () => {
    it("renders shown", () => {
      const { wrapper } = setup({ hidden: false });
      expect(wrapper.exists()).toBe(true);
    });

    it("renders hidden", () => {
      const { wrapper } = setup({ hidden: true });
      expect(wrapper.type()).toEqual(null);
    });
  });

  /**
   * Component event tests
   *   using react-dom, because we need full DOM for that
   *
   * More component integration tests can be added here too.
   */
  describe("onclick", () => {
    // suppressing the info warns in the backlink onClick handler
    global.console = {
      log: jest.fn(),
      warn: jest.fn(),
      error: console.error,
      info: console.info,
      debug: console.debug,
    };

    let container = null;
    beforeEach(() => {
      container = document.createElement("div");
      document.body.appendChild(container);
    });

    afterEach(() => {
      unmountComponentAtNode(container);
      container.remove();
      container = null;
    });

    it("triggers the onClick function when clicked", () => {
      const onClick = jest.fn();
      act(() => {
        render(<Backlink onClick={onClick} />, container);
      });

      const link = document.querySelector("a.underline");
      act(() => {
        link.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      });

      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it("doesn't crash when onClick is not a function", () => {
      const onClick = null;
      act(() => {
        render(<Backlink onClick={onClick} />, container);
      });

      const link = document.querySelector("a.underline");
      act(() => {
        link.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      });
    });
  });

  /**
   * Redux/React integration tests probably belong here...
   */
});
