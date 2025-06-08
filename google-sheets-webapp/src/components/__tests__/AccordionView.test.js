import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event'; // For interaction tests
import AccordionView from '../AccordionView';
// react-i18next is mocked via __mocks__

// Mock ExpandMoreIcon as it's just decorative for tests
jest.mock('@mui/icons-material/ExpandMore', () => () => <div data-testid="expand-icon"></div>);

describe('AccordionView Component', () => {
  const mockOriginalHeaders = ['year', 'Dato (Lør-Søn 2025)', 'Kategori', 'Figur Idé', 'Noter/Inspiration'];
  const defaultProps = {
    isLoading: false,
    error: null,
    originalHeaders: mockOriginalHeaders,
  };

  test('renders loading spinner with translated text', () => {
    render(<AccordionView {...defaultProps} isLoading={true} sections={[]} />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    // Mocked t('loadingData') returns 'loadingData'
    expect(screen.getByText('loadingData')).toBeInTheDocument();
  });

  test('renders error message with translated text', () => {
    render(<AccordionView {...defaultProps} error={{ message: 'Network Error' }} sections={[]} />);
    // Mocked t('errorDisplayingData') returns 'errorDisplayingData'
    expect(screen.getByText('errorDisplayingData')).toBeInTheDocument();
    // Mocked t('errorDetailsPrefix') returns 'errorDetailsPrefix'
    expect(screen.getByText((content, node) => {
        // Check for text containing "errorDetailsPrefix: Network Error"
        return content.startsWith('errorDetailsPrefix') && content.includes('Network Error');
    })).toBeInTheDocument();
  });

  test('renders "no data" message with translated text', () => {
    render(<AccordionView {...defaultProps} sections={[]} />);
    expect(screen.getByText('noDataAvailable')).toBeInTheDocument();
  });

  const mockSectionsData = [
    {
      id: 'section-initial',
      headerData: { syntheticHeader: true, title: 'overviewSectionTitle' }, // Use key for title
      contentRows: [{ [mockOriginalHeaders[3]]: 'Initial Idea', [mockOriginalHeaders[4]]: 'Initial Note' }]
    },
    {
      id: 'section-1',
      headerData: { [mockOriginalHeaders[0]]: '2023', [mockOriginalHeaders[1]]: 'Date 1', [mockOriginalHeaders[2]]: 'Category A' },
      contentRows: [{ [mockOriginalHeaders[3]]: 'Idea 1.1', [mockOriginalHeaders[4]]: 'Note 1.1' }]
    },
  ];

  test('renders "Overview" section with translated title', () => {
    render(<AccordionView {...defaultProps} sections={mockSectionsData} />);
    // Mocked t('overviewSectionTitle') returns 'overviewSectionTitle'
    // The AccordionSummary button role contains this text
    expect(screen.getByRole('button', { name: /overviewSectionTitle/i })).toBeInTheDocument();
  });

  test('renders regular section with translated "Year:" label', async () => {
    render(<AccordionView {...defaultProps} sections={mockSectionsData} />);
    // Mocked t('yearLabel') returns 'Year:'
    // The text would be "Year: 2023"
    const yearButton = await screen.findByRole('button', {name: /Year: 2023/i});
    expect(yearButton).toBeInTheDocument();
  });

  test('renders "no content" message with translated text', async () => {
    const user = userEvent.setup();
    const sectionsWithEmptyContent = [
        { id: 'section-empty', headerData: { [mockOriginalHeaders[0]]: '2024' }, contentRows: [] }
    ];
    render(<AccordionView {...defaultProps} sections={sectionsWithEmptyContent} />);

    const accordionButton = screen.getByRole('button', { name: /Year: 2024/i });
    await user.click(accordionButton);
    // Mocked t('noContentInSection') returns 'noContentInSection'
    expect(await screen.findByText('noContentInSection')).toBeVisible();
  });
});
