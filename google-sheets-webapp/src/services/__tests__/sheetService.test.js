import { fetchSheetData } from '../sheetService';
import Papa from 'papaparse';

// Mock papaparse
jest.mock('papaparse');

describe('sheetService', () => {
  const MOCK_CSV_URL_REGEX = /^https:\/\/docs\.google\.com\/spreadsheets\/d\/1Js7j6E1PJ-YSrUmiNKxiAhGGjVACAaUf\/export\?format=csv&gid=0$/;


  beforeEach(() => {
    Papa.parse.mockReset();
  });

  test('fetchSheetData successfully fetches and parses data', async () => {
    const mockCSVData = [{ Header1: 'Val1', Header2: 'Val2' }];
    Papa.parse.mockImplementation((url, config) => {
      if (MOCK_CSV_URL_REGEX.test(url)) {
        config.complete({ data: mockCSVData });
      } else {
        config.error(new Error('Invalid URL for mock'));
      }
    });

    const data = await fetchSheetData();
    expect(data).toEqual(mockCSVData);
    expect(Papa.parse).toHaveBeenCalledWith(
      expect.stringMatching(MOCK_CSV_URL_REGEX),
      expect.objectContaining({
        download: true,
        header: true,
      })
    );
  });

  test('fetchSheetData handles parsing error', async () => {
    const mockError = new Error('Parsing failed');
    Papa.parse.mockImplementation((url, config) => {
      config.error(mockError);
    });

    await expect(fetchSheetData()).rejects.toThrow('Error fetching or parsing sheet data: Parsing failed');
  });

  test('fetchSheetData handles empty or no data from parser', async () => {
    Papa.parse.mockImplementation((url, config) => {
        config.complete({ data: null }); // Simulate parser returning null data
    });

    await expect(fetchSheetData()).rejects.toThrow('Error parsing CSV data or data is empty.');
  });
});
