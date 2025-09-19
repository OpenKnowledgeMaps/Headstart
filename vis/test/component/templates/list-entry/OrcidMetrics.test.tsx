import React from "react";
import { render } from "@testing-library/react";
import OrcidMetrics from "../../../../js/templates/listentry/OrcidMetrics";

describe("OrcidMetrics in the ListEntry component", () => {
  type PossibleMetricsTypes = null | undefined | number | string;

  const setup = (
    citations: PossibleMetricsTypes,
    socialMedia: PossibleMetricsTypes,
    referencesOutsideAcademia: PossibleMetricsTypes,
    baseUnit: null | string,
  ) => {
    const { container } = render(
      <OrcidMetrics
        citations={citations}
        social_media={socialMedia}
        references_outside_academia={referencesOutsideAcademia}
        baseUnit={baseUnit}
      />,
    );

    return container;
  };

  describe("Citations", () => {
    it('Showing "n/a" if citations are not defined', () => {
      const container = setup(undefined, "n/a", null, null);

      const spansWithMetrics = container.querySelectorAll(".list_metrics_item");
      const spanWithCitationsMetricSpan = spansWithMetrics[0];

      expect(spanWithCitationsMetricSpan).toBeInTheDocument();
      expect(spanWithCitationsMetricSpan).toHaveTextContent("n/a");
    });

    it('Showing "n/a" if citations are equals to null', () => {
      const container = setup(null, "n/a", null, null);

      const spansWithMetrics = container.querySelectorAll(".list_metrics_item");
      const spanWithCitationsMetricSpan = spansWithMetrics[0];

      expect(spanWithCitationsMetricSpan).toBeInTheDocument();
      expect(spanWithCitationsMetricSpan).toHaveTextContent("n/a");
    });

    it("Shows citations when they are defined and presented as number", () => {
      const container = setup(100, "n/a", null, null);

      const spansWithMetrics = container.querySelectorAll(".list_metrics_item");
      const spanWithCitationsMetricSpan = spansWithMetrics[0];

      expect(spanWithCitationsMetricSpan).toBeInTheDocument();
      expect(spanWithCitationsMetricSpan).toHaveTextContent("100");
    });

    it("Shows citations when they are defined and presented as string", () => {
      const container = setup("100", "n/a", null, null);

      const spansWithMetrics = container.querySelectorAll(".list_metrics_item");
      const spanWithCitationsMetricSpan = spansWithMetrics[0];

      expect(spanWithCitationsMetricSpan).toBeInTheDocument();
      expect(spanWithCitationsMetricSpan).toHaveTextContent("100");
    });

    it('Apply additional styles if "citations" is a base unit', () => {
      const container = setup("100", "n/a", null, "citations");

      const spansWithMetrics = container.querySelectorAll(".list_metrics_item");
      const spanWithCitationsMetricSpan = spansWithMetrics[0];

      expect(spanWithCitationsMetricSpan).toBeInTheDocument();
      expect(spanWithCitationsMetricSpan).toHaveTextContent("100");
      expect(spanWithCitationsMetricSpan).toHaveClass("scaled-metric");
    });
  });

  describe("Social media", () => {
    it('Showing "n/a" if social media metrics are not defined', () => {
      const container = setup(100, undefined, null, null);

      const spansWithMetrics = container.querySelectorAll(".list_metrics_item");
      const spanWithCitationsMetricSpan = spansWithMetrics[1];

      expect(spanWithCitationsMetricSpan).toBeInTheDocument();
      expect(spanWithCitationsMetricSpan).toHaveTextContent("n/a");
    });

    it('Showing "n/a" if social media metrics are equals to null', () => {
      const container = setup(100, null, null, null);

      const spansWithMetrics = container.querySelectorAll(".list_metrics_item");
      const spanWithCitationsMetricSpan = spansWithMetrics[1];

      expect(spanWithCitationsMetricSpan).toBeInTheDocument();
      expect(spanWithCitationsMetricSpan).toHaveTextContent("n/a");
    });

    it("Shows social media metrics if they are defined and presented as number", () => {
      const container = setup(100, 101, null, null);

      const spansWithMetrics = container.querySelectorAll(".list_metrics_item");
      const spanWithCitationsMetricSpan = spansWithMetrics[1];

      expect(spanWithCitationsMetricSpan).toBeInTheDocument();
      expect(spanWithCitationsMetricSpan).toHaveTextContent("101");
    });

    it("Shows social media metrics if they are defined and presented as string", () => {
      const container = setup(100, "101", null, null);

      const spansWithMetrics = container.querySelectorAll(".list_metrics_item");
      const spanWithCitationsMetricSpan = spansWithMetrics[1];

      expect(spanWithCitationsMetricSpan).toBeInTheDocument();
      expect(spanWithCitationsMetricSpan).toHaveTextContent("101");
    });

    it('Apply additional styles if "social" is a base unit', () => {
      const container = setup(100, "101", null, "social");

      const spansWithMetrics = container.querySelectorAll(".list_metrics_item");
      const spanWithCitationsMetricSpan = spansWithMetrics[1];

      expect(spanWithCitationsMetricSpan).toBeInTheDocument();
      expect(spanWithCitationsMetricSpan).toHaveTextContent("101");
      expect(spanWithCitationsMetricSpan).toHaveClass("scaled-metric");
    });
  });

  describe("References outside academia", () => {
    it('Showing "n/a" if references outside academia are not defined', () => {
      const container = setup(100, 101, undefined, null);

      const spansWithMetrics = container.querySelectorAll(".list_metrics_item");
      const spanWithCitationsMetricSpan = spansWithMetrics[2];

      expect(spanWithCitationsMetricSpan).toBeInTheDocument();
      expect(spanWithCitationsMetricSpan).toHaveTextContent("n/a");
    });

    it('Showing "n/a" if references outside academia are equals to null', () => {
      const container = setup(100, 101, null, null);

      const spansWithMetrics = container.querySelectorAll(".list_metrics_item");
      const spanWithCitationsMetricSpan = spansWithMetrics[2];

      expect(spanWithCitationsMetricSpan).toBeInTheDocument();
      expect(spanWithCitationsMetricSpan).toHaveTextContent("n/a");
    });

    it("Shows references outside academia metrics if they are defined and presented as number", () => {
      const container = setup(100, 101, 102, null);

      const spansWithMetrics = container.querySelectorAll(".list_metrics_item");
      const spanWithCitationsMetricSpan = spansWithMetrics[2];

      expect(spanWithCitationsMetricSpan).toBeInTheDocument();
      expect(spanWithCitationsMetricSpan).toHaveTextContent("102");
    });

    it("Shows references outside academia metrics if they are defined and presented as string", () => {
      const container = setup(100, 101, "102", null);

      const spansWithMetrics = container.querySelectorAll(".list_metrics_item");
      const spanWithCitationsMetricSpan = spansWithMetrics[2];

      expect(spanWithCitationsMetricSpan).toBeInTheDocument();
      expect(spanWithCitationsMetricSpan).toHaveTextContent("102");
    });

    it('Apply additional styles if "references" is a base unit', () => {
      const container = setup(100, 101, 102, "references");

      const spansWithMetrics = container.querySelectorAll(".list_metrics_item");
      const spanWithCitationsMetricSpan = spansWithMetrics[2];

      expect(spanWithCitationsMetricSpan).toBeInTheDocument();
      expect(spanWithCitationsMetricSpan).toHaveTextContent("102");
      expect(spanWithCitationsMetricSpan).toHaveClass("scaled-metric");
    });
  });
});
