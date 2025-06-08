import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AccordionView from '../AccordionView';

// Mock ExpandMoreIcon as it's just decorative for tests
jest.mock('@mui/icons-material/ExpandMore', () => () => <div data-testid="expand-icon"></div>);

describe('AccordionView Component', () => {
  const mockOriginalHeaders = ['year', 'Weekend #', 'Dato (Lør-Søn 2025)', 'Kategori', 'Figur Idé', 'Noter/Inspiration'];
  const defaultProps = {
    isLoading: false,
    error: null,
    originalHeaders: mockOriginalHeaders,
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

  const regularSection1Data = {
    id: 'section-1',
    headerData: { 'year': '2025', 'Weekend #': 'W1', 'Dato (Lør-Søn 2025)': 'Date 1', 'Kategori': 'Category A', 'Figur Idé': 'Figur Idé' },
    contentRows: [{ 'Figur Idé': 'Idea 1.1', 'Noter/Inspiration': 'Note 1.1' }]
  };
  const regularSection2Data = {
    id: 'section-2',
    headerData: { 'year': '2026', 'Weekend #': 'W2', 'Dato (Lør-Søn 2025)': 'Date 2', 'Kategori': 'Category B', 'Figur Idé': 'Figur Idé' },
    contentRows: [{ 'Figur Idé': 'Idea 2.1', 'Noter/Inspiration': 'Note 2.1' }]
  };

  const sectionsWithInitial = [
    {
      id: 'section-initial',
      headerData: { syntheticHeader: true, title: 'Overview Title' }, // Use a distinct title for testing
      contentRows: [{ 'Figur Idé': 'Overview Content 1', 'Noter/Inspiration': 'Overview Note' }]
    },
    regularSection1Data,
    regularSection2Data,
  ];

  const regularSectionsOnly = [regularSection1Data, regularSection2Data];


  test('renders "Overview Title" for synthetic initial section header', () => {
    render(<AccordionView {...defaultProps} sections={sectionsWithInitial} />);
    expect(screen.getByText('Overview Title')).toBeInTheDocument();
  });

  test('renders "Year: [yearValue]" as title for regular section headers', () => {
    render(<AccordionView {...defaultProps} sections={regularSectionsOnly} />);
    expect(screen.getByText(/Year: 2025/i)).toBeInTheDocument();
    expect(screen.getByText(/Year: 2026/i)).toBeInTheDocument();
  });

  test('displays details like Date, Category, Weekend # in regular section summary', () => {
    render(<AccordionView {...defaultProps} sections={regularSectionsOnly} />);
    // Check for section 1 details
    expect(screen.getByText((content, node) => {
        const hasText = (text) => node.textContent.includes(text);
        return hasText('Dato (Lør-Søn 2025):') && hasText('Date 1');
    })).toBeInTheDocument();
    expect(screen.getByText((content, node) => {
        const hasText = (text) => node.textContent.includes(text);
        return hasText('Kategori:') && hasText('Category A');
    })).toBeInTheDocument();
     expect(screen.getByText((content, node) => {
        const hasText = (text) => node.textContent.includes(text);
        return hasText('Weekend #:') && hasText('W1');
    })).toBeInTheDocument();
  });


  test('initial "Overview" section is expanded by default', async () => {
    render(<AccordionView {...defaultProps} sections={sectionsWithInitial} />);
    expect(await screen.findByText('Overview Content 1')).toBeVisible();
    expect(screen.queryByText('Idea 1.1')).not.toBeVisible(); // Regular section not auto-expanded
  });

  test('if no initial section, first regular section is NOT auto-expanded', () => {
    render(<AccordionView {...defaultProps} sections={regularSectionsOnly} />);
    expect(screen.queryByText('Idea 1.1')).not.toBeVisible();
  });

  test('expands regular accordion on click and shows content', async () => {
    const user = userEvent.setup();
    render(<AccordionView {...defaultProps} sections={sectionsWithInitial} />);
    const regularAccordionSummary = screen.getByRole('button', { name: /Year: 2025/i }); // Target by new title format

    await user.click(regularAccordionSummary);
    expect(await screen.findByText('Idea 1.1')).toBeVisible();
    // Overview should collapse
    expect(screen.queryByText('Overview Content 1')).not.toBeVisible();
  });
});
