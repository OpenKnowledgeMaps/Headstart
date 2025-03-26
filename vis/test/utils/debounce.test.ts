import { describe, it, expect, vi } from "vitest";
import debounce from "../../js/utils/debounce";

describe("Debounce function", () => {
  const getDelayTimeouts = () => {
    const BASE_DELAY = 100;
    const DELAY_WITH_TIMEOUT = BASE_DELAY + 50;
    const TIMEOUT_BELOW_BASE_DELAY = BASE_DELAY - 50;

    return { BASE_DELAY, DELAY_WITH_TIMEOUT, TIMEOUT_BELOW_BASE_DELAY };
  };

  it("Should call a callback after delay timeout", async () => {
    // Getting delay values
    const { BASE_DELAY, DELAY_WITH_TIMEOUT } = getDelayTimeouts();

    // Mocking callback function to check
    // how many times it would be called
    const mockFunc = vi.fn();

    // Create debounced function
    const debouncedFunc = debounce(mockFunc, BASE_DELAY, false);

    // Call function two times (without delay)
    debouncedFunc();
    debouncedFunc();

    // Check that function was not called immediately
    expect(mockFunc).not.toHaveBeenCalled();

    // Waiting more then delay was configured
    await new Promise((resolve) => setTimeout(resolve, DELAY_WITH_TIMEOUT));

    // Check that mocked callback function was called once
    expect(mockFunc).toHaveBeenCalledTimes(1);
  });

  it("Callback function must be called immediately if immediate is true", async () => {
    // Getting delay values
    const { BASE_DELAY, DELAY_WITH_TIMEOUT } = getDelayTimeouts();

    // Mocking callback function to check
    // how many times it would be called
    const mockFunc = vi.fn();

    // Create debounced function
    const debouncedFunc = debounce(mockFunc, BASE_DELAY, true);

    // Call function
    debouncedFunc();

    // Check that function was called immediately
    expect(mockFunc).toHaveBeenCalledTimes(1);

    // Waiting more then delay was configured
    await new Promise((resolve) => setTimeout(resolve, DELAY_WITH_TIMEOUT));

    // Check that mocked callback function was called once
    expect(mockFunc).toHaveBeenCalledTimes(1);
  });

  it("Callback function should be called during a delay time", async () => {
    // Getting delay values
    const { BASE_DELAY, TIMEOUT_BELOW_BASE_DELAY } = getDelayTimeouts();

    // Mocking callback function to check
    // how many times it would be called
    const mockFunc = vi.fn();

    // Create debounced function
    const debouncedFunc = debounce(mockFunc, BASE_DELAY, false);

    // Call function two times (without delay)
    debouncedFunc();
    debouncedFunc();

    //  Waiting less the delay was configured
    await new Promise((resolve) =>
      setTimeout(resolve, TIMEOUT_BELOW_BASE_DELAY)
    );

    // Check that mocked callback function was NOT called
    expect(mockFunc).not.toHaveBeenCalled();

    //  Waiting until the end of delay
    await new Promise((resolve) => setTimeout(resolve, BASE_DELAY));

    // Check that mocked callback function was called once
    expect(mockFunc).toHaveBeenCalledTimes(1);
  });

  it("Maintaining the context of this", async () => {
    // Getting delay values
    const { BASE_DELAY, DELAY_WITH_TIMEOUT } = getDelayTimeouts();

    // Defining context value
    const VALUE = 5;

    // Mock object to test that this is working correctly
    const MOCK_OBJECT_WITH_CONTEXT = { value: VALUE };

    // Mocking callback function to check
    // how many times it would be called
    const mockFunc = vi.fn(function () {
      // @ts-ignore
      return this.value;
    });

    // Create debounced function
    const debouncedFunc = debounce(
      mockFunc.bind(MOCK_OBJECT_WITH_CONTEXT),
      BASE_DELAY,
      false
    );

    // Calling function once
    debouncedFunc();

    // Function must not been called
    expect(mockFunc).not.toHaveBeenCalled();

    // Waiting until the end of delay
    await new Promise((resolve) => setTimeout(resolve, DELAY_WITH_TIMEOUT));

    // Check that callback function was called once
    expect(mockFunc).toHaveBeenCalledTimes(1);

    // Check that callback function was called with correct context
    expect(mockFunc).toHaveReturnedWith(VALUE);
  });
});
