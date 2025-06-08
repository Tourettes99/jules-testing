import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AccordionView from '../AccordionView';

// Mock ExpandMoreIcon as it's just decorative for tests
jest.mock('@mui/icons-material/ExpandMore', () => () => <div data-testid="expand-icon"></div>);

describe('AccordionView Component', () => {
  const mockHeaders = ['Dato (Lør-Søn 2025)', 'Kategori', 'Figur Idé', 'Noter/Inspiration', 'year', 'Weekend #'];
  const defaultSectionProps = {
    isLoading: false,
    error: null,
    originalHeaders: mockHeaders,
  };

  test('renders loading spinner when isLoading is true', () => {
    render(<AccordionView {...defaultSectionProps} isLoading={true} sections={[]} />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  test('renders error message when error object is provided', () => {
    render(<AccordionView {...defaultSectionProps} error={{ message: 'Test Error' }} sections={[]} />);
    expect(screen.getByText(/error displaying data/i)).toBeInTheDocument();
  });

  test('renders "No data available" when sections are empty', () => {
    render(<AccordionView {...defaultSectionProps} sections={[]} />);
    expect(screen.getByText('No data available or no sections processed.')).toBeInTheDocument();
  });

  const mockSections = [
    {
      id: 'section-1',
      headerData: { 'Dato (Lør-Søn 2025)': 'Date 1', 'Kategori': 'Category A', 'year': '2025', 'Weekend #': 'W1' },
      contentRows: [{ 'Figur Idé': 'Idea 1.1', 'Noter/Inspiration': 'Note 1.1' }]
    },
    {
      id: 'section-2',
      headerData: { 'Dato (Lør-Søn 2025)': 'Date 2', 'Kategori': 'Category B', 'year': '2026', 'Weekend #': 'W2' },
      contentRows: [
        { 'Figur Idé': 'Idea 2.1', 'Noter/Inspiration': 'Note 2.1' },
        { 'Figur Idé': 'Idea 2.2', 'Noter/Inspiration': 'Note 2.2' }
      ]
    },
    {
      id: 'section-3',
      headerData: { 'Dato (Lør-Søn 2025)': 'Date 3', 'Kategori': 'Category C', 'year': '2027', 'Weekend #': 'W3' },
      contentRows: [] // Section with no content rows
    },
  ];

  test('renders correct number of accordions for given sections', () => {
    render(<AccordionView {...defaultSectionProps} sections={mockSections} />);
    // MUI Accordion role is often 'button' for the summary, or check for summary text
    // Each AccordionSummary will have a button role
    const accordionSummaries = screen.getAllByRole('button', { name: /Date|Category/i });
    expect(accordionSummaries.length).toBe(mockSections.length);
    expect(screen.getByText(/Date 1/i)).toBeInTheDocument();
    expect(screen.getByText(/Date 2/i)).toBeInTheDocument();
    expect(screen.getByText(/Date 3/i)).toBeInTheDocument();

  });

  test('expands accordion on click and shows content, collapses others', async () => {
    const user = userEvent.setup();
    render(<AccordionView {...defaultSectionProps} sections={mockSections} />);

    const firstAccordionSummary = screen.getByRole('button', { name: /Date 1/i });
    const secondAccordionSummary = screen.getByRole('button', { name: /Date 2/i });

    // Accordion content is not visible initially
    expect(screen.queryByText('Idea 1.1')).not.toBeVisible();
    expect(screen.queryByText('Idea 2.1')).not.toBeVisible();

    // Click to expand first accordion
    await user.click(firstAccordionSummary);
    expect(await screen.findByText('Idea 1.1')).toBeVisible(); // Content of first accordion
    expect(screen.queryByText('Idea 2.1')).not.toBeVisible(); // Content of second still not visible

    // Click to expand second accordion
    await user.click(secondAccordionSummary);
    expect(await screen.findByText('Idea 2.1')).toBeVisible(); // Content of second accordion
    // Due to single expansion logic, first accordion's content should now be hidden
    // MUI Collapse unmounts children when collapsed, so queryByText should be null or not visible
    expect(screen.queryByText('Idea 1.1')).not.toBeVisible();
  });

  test('displays content table correctly within an expanded accordion', async () => {
    const user = userEvent.setup();
    render(<AccordionView {...defaultSectionProps} sections={mockSections} />);

    const secondAccordionSummary = screen.getByRole('button', { name: /Date 2/i });
    await user.click(secondAccordionSummary);

    // Wait for content to be visible
    expect(await screen.findByText('Idea 2.1')).toBeVisible();
    expect(screen.getByText('Note 2.1')).toBeVisible();
    expect(screen.getByText('Idea 2.2')).toBeVisible();
    expect(screen.getByText('Note 2.2')).toBeVisible();

    // Check for table headers (heuristic, actual headers depend on contentTableHeaders logic)
    // For this test, assume 'Figur Idé' and 'Noter/Inspiration' are shown.
    expect(screen.getByText((content, element) => element.tagName.toLowerCase() === 'th' && content.startsWith('Figur Idé'))).toBeVisible();
    expect(screen.getByText((content, element) => element.tagName.toLowerCase() === 'th' && content.startsWith('Noter/Inspiration'))).toBeVisible();
  });

  test('displays "No content items" message for sections with empty contentRows', async () => {
    const user = userEvent.setup();
    render(<AccordionView {...defaultSectionProps} sections={mockSections} />);

    const thirdAccordionSummary = screen.getByRole('button', { name: /Date 3/i });
    await user.click(thirdAccordionSummary);

    expect(await screen.findByText('No content items in this section.')).toBeVisible();
  });
});
