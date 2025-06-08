import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AccordionView from '../AccordionView';

jest.mock('@mui/icons-material/ExpandMore', () => () => <div data-testid="expand-icon"></div>);

describe('AccordionView Component', () => {
  const mockOriginalHeaders = ['year', 'Weekend #', 'Dato (Lør-Søn 2025)', 'Kategori', 'Figur Idé', 'Noter/Inspiration', 'SomeRandomCol'];
  const defaultProps = {
    isLoading: false,
    error: null,
    originalHeaders: mockOriginalHeaders,
  };

  // Section Data
  const overviewSection = {
    id: 'section-initial',
    headerData: { syntheticHeader: true, title: 'Test Overview' },
    contentRows: [{ 'Figur Idé': 'Overview Content' }]
  };

  const sectionWithYearInYearCol = {
    id: 'section-year-col',
    headerData: { 'year': '2025', 'Weekend #': 'W1', 'Dato (Lør-Søn 2025)': 'Date 1', 'Kategori': 'Cat A', 'Figur Idé': 'Figur Idé' },
    contentRows: [{ 'Figur Idé': 'Content A' }]
  };

  const sectionWithYearInRandomCol = {
    id: 'section-year-random',
    headerData: { 'SomeRandomCol': '2026', 'Weekend #': 'W2', 'Dato (Lør-Søn 2025)': 'Date 2', 'Kategori': 'Cat B', 'Figur Idé': 'Figur Idé' },
    contentRows: [{ 'Figur Idé': 'Content B' }]
  };

  const sectionWithNumericYear = {
    id: 'section-year-numeric',
    headerData: { 'year': 2027, 'Weekend #': 'W3', 'Dato (Lør-Søn 2025)': 'Date 3', 'Kategori': 'Cat C', 'Figur Idé': 'Figur Idé' },
    contentRows: [{ 'Figur Idé': 'Content C' }]
  };

  const sectionWithoutYear = {
    id: 'section-no-year',
    headerData: { 'Weekend #': 'W4', 'Dato (Lør-Søn 2025)': 'Date 4', 'Kategori': 'Cat D', 'Figur Idé': 'Figur Idé', 'SomeRandomCol': 'NotAYear' },
    contentRows: [{ 'Figur Idé': 'Content D' }]
  };

  const sectionWithOnlyNonFigurIdeHeadersForFallback = {
    id: 'section-fallback-title',
    headerData: { 'Dato (Lør-Søn 2025)': 'Important Date', 'Kategori': 'Special Category', 'Figur Idé': 'Figur Idé', 'year': 'NoYearHere' },
    contentRows: []
  };


  test('renders synthetic "Overview" header correctly', () => {
    render(<AccordionView {...defaultProps} sections={[overviewSection]} />);
    expect(screen.getByText('Test Overview')).toBeInTheDocument();
  });

  test('renders "Year: [year]" when year is in "year" column', () => {
    render(<AccordionView {...defaultProps} sections={[sectionWithYearInYearCol]} />);
    expect(screen.getByText(/Year: 2025/i)).toBeInTheDocument();
    // Check details are shown
    expect(screen.getByText(/Date 1/i)).toBeInTheDocument();
    expect(screen.getByText(/Cat A/i)).toBeInTheDocument();
  });

  test('renders "Year: [year]" when year is in a different column as a string', () => {
    render(<AccordionView {...defaultProps} sections={[sectionWithYearInRandomCol]} />);
    expect(screen.getByText(/Year: 2026/i)).toBeInTheDocument();
    expect(screen.getByText(/Date 2/i)).toBeInTheDocument();
  });

  test('renders "Year: [year]" when year is a number', () => {
    render(<AccordionView {...defaultProps} sections={[sectionWithNumericYear]} />);
    expect(screen.getByText(/Year: 2027/i)).toBeInTheDocument();
     expect(screen.getByText(/Date 3/i)).toBeInTheDocument();
  });

  test('renders fallback title when no 4-digit year is detected in headerData', () => {
    // originalHeaders for SectionHeaderSummary are ['year', 'Weekend #', 'Dato (Lør-Søn 2025)', ...]
    // headerData for sectionWithoutYear: { 'Weekend #': 'W4', 'Dato (Lør-Søn 2025)': 'Date 4', 'Kategori': 'Cat D', 'Figur Idé': 'Figur Idé', 'SomeRandomCol': 'NotAYear' }
    // Expected fallback title from first 3 originalHeaders: 'W4 - Date 4' (as 'year' is empty/not a year)
    render(<AccordionView {...defaultProps} sections={[sectionWithoutYear]} />);
    // The first 3 headers are 'year', 'Weekend #', 'Dato (Lør-Søn 2025)'
    // sectionWithoutYear.headerData['year'] is undefined.
    // sectionWithoutYear.headerData['Weekend #'] is 'W4'.
    // sectionWithoutYear.headerData['Dato (Lør-Søn 2025)'] is 'Date 4'.
    // So, fallback should be 'W4 - Date 4'
    expect(screen.getByText("W4 - Date 4")).toBeInTheDocument();
    // Details grid should NOT be shown
    expect(screen.queryByText(/Kategori:/i)).not.toBeInTheDocument();
  });

  test('renders fallback title from first few non-empty values if year is not found', () => {
    render(<AccordionView {...defaultProps} sections={[sectionWithOnlyNonFigurIdeHeadersForFallback]} />);
    // headerData: { 'Dato (Lør-Søn 2025)': 'Important Date', 'Kategori': 'Special Category', 'Figur Idé': 'Figur Idé', 'year': 'NoYearHere' }
    // allHeaders.slice(0,3) are 'year', 'Weekend #', 'Dato (Lør-Søn 2025)'
    // headerData['year'] is 'NoYearHere' (not a year)
    // headerData['Weekend #'] is undefined
    // headerData['Dato (Lør-Søn 2025)'] is 'Important Date'
    // Fallback parts: 'NoYearHere', 'Important Date'
    expect(screen.getByText("NoYearHere - Important Date")).toBeInTheDocument();
  });


  test('details grid (Date, Kategori, etc.) is hidden when no year is detected', () => {
    render(<AccordionView {...defaultProps} sections={[sectionWithoutYear]} />);
    expect(screen.getByText("W4 - Date 4")).toBeInTheDocument(); // Fallback title
    // These details should not be present as no year was detected
    expect(screen.queryByText("Dato (Lør-Søn 2025):")).not.toBeInTheDocument();
    expect(screen.queryByText("Kategori:")).not.toBeInTheDocument();
  });

  test('default expansion of initial section still works', async () => {
    render(<AccordionView {...defaultProps} sections={[overviewSection, sectionWithYearInYearCol]} />);
    expect(await screen.findByText('Overview Content')).toBeVisible();
    expect(screen.queryByText('Content A')).not.toBeVisible();
  });

});
