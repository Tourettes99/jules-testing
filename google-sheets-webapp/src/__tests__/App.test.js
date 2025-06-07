import { render, screen, waitFor } from '@testing-library/react';
import App from '../App';
import { fetchSheetData } from '../services/sheetService';

// Mock the sheetService
jest.mock('../services/sheetService');

describe('App Component', () => {
  beforeEach(() => {
    // Reset mocks before each test
    fetchSheetData.mockClear();
  });

  test('renders loading state initially', () => {
    fetchSheetData.mockResolvedValueOnce([]); // Mock a promise that doesn't resolve immediately
    render(<App />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  test('renders data table after successful fetch', async () => {
    const mockData = [
      { Header1: 'Val1', Header2: 'Val2' },
      { Header1: 'Val3', Header2: 'Val4' },
    ];
    fetchSheetData.mockResolvedValueOnce(mockData);
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Header1')).toBeInTheDocument();
      expect(screen.getByText('Val1')).toBeInTheDocument();
      expect(screen.getByText('Val4')).toBeInTheDocument();
    });
  });

  test('renders error message on fetch failure', async () => {
    fetchSheetData.mockRejectedValueOnce(new Error('Failed to fetch'));
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/error loading data/i)).toBeInTheDocument();
      // expect(screen.getByText('Failed to fetch')).toBeInTheDocument(); // Check for specific error message if needed
    });
  });

  test('renders "No data available" when fetch returns empty array', async () => {
    fetchSheetData.mockResolvedValueOnce([]);
    render(<App />);

    await waitFor(() => {
      // The SheetDataTable component shows "No data available."
      // App component itself doesn't directly render this, but its child does.
      expect(screen.getByText('No data available.')).toBeInTheDocument();
    });
  });
});
