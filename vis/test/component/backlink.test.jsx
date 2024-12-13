import { render, screen, fireEvent } from '@testing-library/react';
import { cleanup } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { expect, describe, it, vi, afterEach } from 'vitest';

import BackLinkContainer from '../../js/components/Backlink';
import BackLinkTemplate from '../../js/templates/Backlink';
import { BackLink } from '../../js/components/Backlink';
import { zoomOut } from '../../js/actions';

// Setup function for Backlink component tests
const setup = (overrideProps = {}) => {
  const props = {
    hidden: false,
    onClick: vi.fn(),
    localization: {
      backlink: 'Sample backlink label',
    },
    ...overrideProps,
  };

  render(<BackLink {...props} />);
  return { props };
};

// Basic component render tests using @testing-library/react
describe('Backlink component', () => {
  // Cleanup after each test
  afterEach(() => {
    cleanup();
  });

  it('renders', () => {
    setup();
    expect(screen.getByText('Sample backlink label')).toBeInTheDocument();
  });

  describe('visibility', () => {
    it('renders shown', () => {
      setup({ hidden: false });
      expect(screen.getByText('Sample backlink label')).toBeInTheDocument();
    });

    it('renders hidden', () => {
      setup({ hidden: true });
      const backlinkElement = screen.queryByText('Sample backlink label');
      expect(backlinkElement).toBeNull();
    });
  });

  describe('dom tests', () => {
    /**
     * Component event tests
     */
    describe('onclick', () => {
      it('triggers the onClick function when clicked', () => {
        const onClick = vi.fn();
        setup({ onClick });

        // Use `getByText` if it's not a semantic link
        const link = screen.getByText(/Sample backlink label/i);
        fireEvent.click(link);

        expect(onClick).toHaveBeenCalledTimes(1);
      });

      it("doesn't crash when onClick is not a function", () => {
        setup({ onClick: null });

        const link = screen.getByText(/Sample backlink label/i);
        fireEvent.click(link); // Should not throw an error even though `onClick` is `null`
      });
    });

    /**
     * Redux/React integration tests
     */
    describe('onclick (redux integration)', () => {
      const mockStore = configureStore([]);

      it('should dispatch zoomOut when clicked', () => {
        const store = mockStore({
          zoom: true,
          chartType: 'knowledgeMap',
          localization: {
            backlink: 'Sample backlink label',
          },
        });

        render(
          <Provider store={store}>
            <BackLinkContainer />
          </Provider>
        );

        const link = screen.getByText(/Sample backlink label/i);
        fireEvent.click(link);

        const actions = store.getActions();
        const expectedAction = zoomOut();

        expect(actions).toHaveLength(1);
        expect(actions[0].type).toEqual(expectedAction.type);
      });
    });
  });
});

// Backlink template tests
describe('Backlink template', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders with the default classname', () => {
    render(<BackLinkTemplate label="sample text" onClick={vi.fn()} />);
    expect(screen.getByText('sample text')).toBeInTheDocument();
  });
});