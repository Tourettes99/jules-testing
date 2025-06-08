import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AccordionView from '../AccordionView';

// Mock ExpandMoreIcon as it's just decorative for tests
jest.mock('@mui/icons-material/ExpandMore', () => () => <div data-testid="expand-icon"></div>);

describe('AccordionView Component', () => {
  const mockHeaders = ['Dato (Lør-Søn 2025)', 'Kategori', 'Figur Idé', 'Noter/Inspiration', 'year', 'Weekend #'];
  const defaultProps = {
    isLoading: false,
    error: null,
    originalHeaders: mockHeaders,
  };

  test('renders loading spinner when isLoading is true', () => {
    render(<AccordionView {...defaultProps} isLoading={true} sections={[]} />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  test('renders error message when error object is provided', () => {
    render(<AccordionView {...defaultProps} error={{ message: 'Test Error' }} sections={[]} />);
    expect(screen.getByText(/error displaying data/i)).toBeInTheDocument();
  });

  test('renders "No data available" when sections are empty', () => {
    render(<AccordionView {...defaultProps} sections={[]} />);
    expect(screen.getByText('No data available or no sections processed.')).toBeInTheDocument();
  });

  const regularSections = [
    {
      id: 'section-1',
      headerData: { 'Dato (Lør-Søn 2025)': 'Date 1', 'Kategori': 'Category A', 'year': '2025', 'Weekend #': 'W1' },
      contentRows: [{ 'Figur Idé': 'Idea 1.1', 'Noter/Inspiration': 'Note 1.1' }]
    },
    {
      id: 'section-2',
      headerData: { 'Dato (Lør-Søn 2025)': 'Date 2', 'Kategori': 'Category B', 'year': '2026', 'Weekend #': 'W2' },
      contentRows: [{ 'Figur Idé': 'Idea 2.1', 'Noter/Inspiration': 'Note 2.1' }]
    },
  ];

  const sectionsWithInitial = [
    {
      id: 'section-initial',
      headerData: { syntheticHeader: true, title: 'Overview' },
      contentRows: [{ 'Figur Idé': 'Overview Content 1', 'Noter/Inspiration': 'Overview Note' }]
    },
    ...regularSections
  ];

  test('renders correct number of accordions', () => {
    render(<AccordionView {...defaultProps} sections={regularSections} />);
    const accordionSummaries = screen.getAllByRole('button', { name: /Date|Category/i });
    expect(accordionSummaries.length).toBe(regularSections.length);
  });

  test('renders initial "Overview" section first if present and handles its title', () => {
    render(<AccordionView {...defaultProps} sections={sectionsWithInitial} />);
    const accordionSummaries = screen.getAllByRole('button'); // Get all accordion buttons
    expect(accordionSummaries.length).toBe(sectionsWithInitial.length);
    expect(screen.getByText('Overview')).toBeInTheDocument(); // Check for synthetic header title
    expect(screen.getByText(/Date 1/i)).toBeInTheDocument(); // Check for regular section
  });

  test('initial "Overview" section is expanded by default, others are not', async () => {
    render(<AccordionView {...defaultProps} sections={sectionsWithInitial} />);

    // Check Overview content is visible (expanded by default)
    expect(await screen.findByText('Overview Content 1')).toBeVisible();

    // Check regular section content is NOT visible
    expect(screen.queryByText('Idea 1.1')).not.toBeVisible();
  });

  test('if no initial "Overview" section, first regular section is NOT expanded by default', () => {
    render(<AccordionView {...defaultProps} sections={regularSections} />);
    // Check regular section content is NOT visible
    expect(screen.queryByText('Idea 1.1')).not.toBeVisible();
  });

  test('expands regular accordion on click and shows content when initial section exists', async () => {
    const user = userEvent.setup();
    render(<AccordionView {...defaultProps} sections={sectionsWithInitial} />);

    const overviewAccordionSummary = screen.getByRole('button', { name: 'Overview' });
    const regularAccordionSummary = screen.getByRole('button', { name: /Date 1/i });

    // Overview is expanded by default
    expect(await screen.findByText('Overview Content 1')).toBeVisible();

    // Click to expand the regular accordion
    await user.click(regularAccordionSummary);
    expect(await screen.findByText('Idea 1.1')).toBeVisible(); // Content of regular accordion

    // Overview content should now be hidden (single expansion behavior)
    expect(screen.queryByText('Overview Content 1')).not.toBeVisible();
  });

  test('clicking an already expanded initial section should close it', async () => {
    const user = userEvent.setup();
    render(<AccordionView {...defaultProps} sections={sectionsWithInitial} />);
    const overviewAccordionSummary = screen.getByRole('button', { name: 'Overview' });

    // Initially expanded
    expect(await screen.findByText('Overview Content 1')).toBeVisible();
    await user.click(overviewAccordionSummary);
    // Should be collapsed now
    expect(screen.queryByText('Overview Content 1')).not.toBeVisible();

  });
});
