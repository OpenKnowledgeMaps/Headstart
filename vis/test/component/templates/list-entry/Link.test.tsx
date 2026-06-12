import { render } from "@testing-library/react";
import Link from "../../../../js/templates/listentry/Link";
import React from "react";
import LocalizationProvider from "../../../../js/components/LocalizationProvider";
import { Localization } from "../../../../js/i18n/localization";

describe("Link in the ListEntry component", () => {
  const setup = (isDoi: boolean, url?: string | null) => {
    const LOCALIZATION_OBJECT_MOCK = {
      link: "link",
      notAvailable: "n/a",
    } as Localization;

    const { container } = render(
      <LocalizationProvider localization={LOCALIZATION_OBJECT_MOCK}>
        <Link isDoi={isDoi} address={url as string} />,
      </LocalizationProvider>,
    );

    return container;
  };

  it('Link named as "doi"', () => {
    const container = setup(true, "");

    expect(container).toHaveTextContent("doi");
  });

  it('Link named as "link"', () => {
    const container = setup(false, "");

    expect(container).toHaveTextContent("link");
  });

  it('Link named as "link" and displays url correctly', () => {
    const container = setup(false, "https://some.url.com/");

    expect(container).toHaveTextContent("[link]: https://some.url.com/");
  });

  it('Link named as "doi" and displays url correctly', () => {
    const container = setup(true, "https://some.url.com/");

    expect(container).toHaveTextContent("[doi]: https://some.url.com/");
  });

  it('Link named as "doi" and displays "not available" message', () => {
    const container = setup(true, undefined);

    expect(container).toHaveTextContent("[doi]: n/a");
  });

  it('Link named as "link" and displays "not available" message', () => {
    const container = setup(false, undefined);

    expect(container).toHaveTextContent("[link]: n/a");
  });
});
