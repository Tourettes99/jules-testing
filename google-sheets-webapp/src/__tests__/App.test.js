import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';
import { fetchSheetData } from '../services/sheetService';
import { useTranslation } from 'react-i18next'; // Will use the mock

// Mock the sheetService
jest.mock('../services/sheetService');
// Mock AccordionView to simplify App tests
jest.mock('../components/AccordionView', () => ({ sections, isLoading, error, originalHeaders }) => (
  <div data-testid="accordion-view">
    {isLoading && <div role="progressbar">Mock Loading</div>}
    {error && <div>Error: {error.message}</div>}
    {sections && sections.length > 0 && sections.map(s => <div key={s.id}>{s.headerData.title || s.headerData.year || 'Section'}</div>)}
    {sections && sections.length === 0 && !isLoading && !error && <div>No Sections Mock</div>}
  </div>
));

// Mock react-i18next (Jest will automatically pick up from __mocks__ folder)
// No explicit jest.mock('react-i18next'); needed here if it's in __mocks__

describe('App Component', () => {
  const { i18n } = useTranslation(); // Get mocked i18n instance for spy

  beforeEach(() => {
    fetchSheetData.mockClear();
    // Reset i18n mock states if necessary, e.g., language
    i18n.language = 'en'; // Reset to default for each test
    i18n.changeLanguage.mockClear();
  });

  test('renders AppBar with translated title', () => {
    fetchSheetData.mockResolvedValueOnce([]);
    render(<App />);
    // The mock t('appTitle') returns 'myclaysuggestions.com'
    expect(screen.getByText('myclaysuggestions.com')).toBeInTheDocument();
  });

  test('renders loading state initially (via mocked AccordionView)', () => {
    fetchSheetData.mockImplementation(() => new Promise(() => {})); // Promise that never resolves for loading state
    render(<App />);
    expect(screen.getByRole('progressbar')).toHaveTextContent('Mock Loading');
  });

  test('renders data via AccordionView after successful fetch', async () => {
    const mockRawData = [
      { 'Figur Idé': 'Figur Idé', year: '2023', title: 'Section 1 Header' }, // Mock header row
      { 'Figur Idé': 'Content 1' }
    ];
    fetchSheetData.mockResolvedValueOnce(mockRawData);
    render(<App />);
    await waitFor(() => {
      // Check for content rendered by mocked AccordionView based on processed sections
      // The title for the section in the mock would be '2023' (from headerData.year)
      expect(screen.getByText('2023')).toBeInTheDocument();
    });
  });

  test('renders error message on fetch failure (via mocked AccordionView)', async () => {
    fetchSheetData.mockRejectedValueOnce(new Error('Failed to fetch'));
    render(<App />);
    await waitFor(() => {
      expect(screen.getByText('Error: Failed to fetch')).toBeInTheDocument();
    });
  });

  test('language toggle button changes language and text', async () => {
    const user = userEvent.setup();
    fetchSheetData.mockResolvedValueOnce([]);
    render(<App />);

    // Initially, language is 'en', button shows 'toggleLanguageToDanish' (mocked t function returns the key)
    let toggleButton = screen.getByRole('button', { name: 'toggleLanguageToDanish' });
    expect(toggleButton).toBeInTheDocument();

    // Click to change to Danish
    await user.click(toggleButton);
    expect(i18n.changeLanguage).toHaveBeenCalledWith('da');

    // Simulate language change effect for the mock
    act(() => {
      i18n.language = 'da';
    });
    // Re-render or wait for component to update based on new i18n.language state
    // Here, we re-query for the button, its text should change
    // The button itself is re-rendered due to i18n.language change triggering a state update in App's perspective
    toggleButton = screen.getByRole('button', { name: 'toggleLanguageToEnglish' });
    expect(toggleButton).toBeInTheDocument();

    // Click to change back to English
    await user.click(toggleButton);
    expect(i18n.changeLanguage).toHaveBeenCalledWith('en');
    act(() => {
      i18n.language = 'en';
    });
    toggleButton = screen.getByRole('button', { name: 'toggleLanguageToDanish' });
    expect(toggleButton).toBeInTheDocument();
  });
});
