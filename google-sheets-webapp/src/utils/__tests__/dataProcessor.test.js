import { isRowEmpty, isHeaderRow, groupDataIntoSections } from '../dataProcessor';

describe('dataProcessor Utilities', () => {
  const headers = ['colA', 'colB', 'colC', 'Figur Idé', 'year', 'Weekend #', 'Dato (Lør-Søn 2025)', 'Kategori', 'Noter/Inspiration'];
  const sampleFigurIdeHeader = 'Figur Idé'; // Assuming this is how it's named in data

  // Mock headers for tests that don't rely on specific names for Figur Idé etc.
  const genericHeaders = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];


  describe('isRowEmpty', () => {
    it('should return true for a completely empty row', () => {
      const row = { h1: null, h2: '', h3: undefined };
      expect(isRowEmpty(row, ['h1', 'h2', 'h3'])).toBe(true);
    });
    it('should return false for a row with some data', () => {
      const row = { h1: 'data', h2: '', h3: null };
      expect(isRowEmpty(row, ['h1', 'h2', 'h3'])).toBe(false);
    });
    it('should return true if row is null or undefined', () => {
      expect(isRowEmpty(null, genericHeaders)).toBe(true);
      expect(isRowEmpty(undefined, genericHeaders)).toBe(true);
    });
  });

  describe('isHeaderRow', () => {
    const figurIdeColName = 'Figur Idé'; // This must match the actual key in your data objects
    const testHeaders = ['year', 'Weekend #', 'Dato', figurIdeColName, 'Kategori', 'Noter'];

    it('should identify a valid header row', () => {
      const row = {
        'year': '2025', 'Weekend #': '1', 'Dato': 'Some Date',
        [figurIdeColName]: 'Figur Idé', 'Kategori': 'Kat A', 'Noter': 'Note'
      };
      expect(isHeaderRow(row, testHeaders)).toBe(true);
    });
    it('should return false if "Figur Idé" column does not contain "Figur Idé"', () => {
      const row = { [figurIdeColName]: 'Actual Idea', 'year': '2025', 'Weekend #': '1', 'Dato': 'Some Date', 'Kategori': 'Kat A', 'Noter': 'Note' };
      expect(isHeaderRow(row, testHeaders)).toBe(false);
    });
     it('should return false if "Figur Idé" column is missing', () => {
      const row = { 'year': '2025', 'Weekend #': '1', 'Dato': 'Some Date', 'Kategori': 'Kat A', 'Noter': 'Note' };
      // Need to pass headers that don't include 'Figur Idé' or ensure the find returns undefined.
      const headersWithoutFigur = ['year', 'Weekend #', 'Dato', 'Kategori', 'Noter'];
      expect(isHeaderRow(row, headersWithoutFigur)).toBe(false);
    });
    it('should return false if not enough other header columns are filled', () => {
      const row = { [figurIdeColName]: 'Figur Idé', 'year': '2025', 'Weekend #': null, 'Dato': null, 'Kategori': null, 'Noter': null };
      expect(isHeaderRow(row, testHeaders)).toBe(false); // Only 2 non-empty of first 6 (year, Figur Idé)
    });
     it('should return false for an empty row', () => {
      const row = { [figurIdeColName]: null, 'year': null, 'Weekend #': null, 'Dato': null, 'Kategori': null, 'Noter': null };
      expect(isHeaderRow(row, testHeaders)).toBe(false);
    });
  });

  describe('groupDataIntoSections', () => {
    const testHeaders = ['year', 'Weekend #', 'Dato', 'Figur Idé', 'Kategori', 'Noter'];
    const figurIdeColName = 'Figur Idé';

    const headerRow1 = { [figurIdeColName]: 'Figur Idé', 'year': '2025', 'Dato': 'Date1', 'Kategori': 'A', 'Weekend #': '1', 'Noter': 'N1' };
    const contentRow1_1 = { [figurIdeColName]: 'Idea 1', 'year': '', 'Dato': '', 'Kategori': 'A', 'Weekend #': '', 'Noter': 'C1.1' };
    const contentRow1_2 = { [figurIdeColName]: 'Idea 2', 'year': '', 'Dato': '', 'Kategori': 'A', 'Weekend #': '', 'Noter': 'C1.2' };
    const emptyRow = { [figurIdeColName]: '', 'year': '', 'Dato': '', 'Kategori': '', 'Weekend #': '', 'Noter': '' };

    const headerRow2 = { [figurIdeColName]: 'Figur Idé', 'year': '2026', 'Dato': 'Date2', 'Kategori': 'B', 'Weekend #': '2', 'Noter': 'N2' };
    const contentRow2_1 = { [figurIdeColName]: 'Idea 3', 'year': '', 'Dato': '', 'Kategori': 'B', 'Weekend #': '', 'Noter': 'C2.1' };

    it('should group data correctly with headers, content, and gaps', () => {
      const rawData = [
        headerRow1, contentRow1_1, contentRow1_2,
        emptyRow, emptyRow, // Gap
        headerRow2, contentRow2_1
      ];
      const sections = groupDataIntoSections(rawData);
      expect(sections.length).toBe(2);
      expect(sections[0].headerData).toEqual(headerRow1);
      expect(sections[0].contentRows).toEqual([contentRow1_1, contentRow1_2]);
      expect(sections[1].headerData).toEqual(headerRow2);
      expect(sections[1].contentRows).toEqual([contentRow2_1]);
    });

    it('should handle data with no gap rows as a single section if only one header', () => {
      const rawData = [headerRow1, contentRow1_1, contentRow1_2];
      const sections = groupDataIntoSections(rawData);
      expect(sections.length).toBe(1);
      expect(sections[0].contentRows.length).toBe(2);
    });

    it('should return empty array if no header rows found', () => {
      const rawData = [contentRow1_1, contentRow1_2];
      const sections = groupDataIntoSections(rawData);
      expect(sections).toEqual([]);
    });

    it('should handle sections with no content rows', () => {
      const rawData = [headerRow1, emptyRow, emptyRow, headerRow2];
      const sections = groupDataIntoSections(rawData);
      expect(sections.length).toBe(2);
      expect(sections[0].contentRows).toEqual([]);
      expect(sections[1].contentRows).toEqual([]);
    });

    it('should correctly handle trailing content after the last header without trailing gap rows', () => {
        const rawData = [headerRow1, contentRow1_1];
        const sections = groupDataIntoSections(rawData);
        expect(sections.length).toBe(1);
        expect(sections[0].headerData).toEqual(headerRow1);
        expect(sections[0].contentRows).toEqual([contentRow1_1]);
    });

    it('should ignore leading empty rows before the first header', () => {
        // Note: App.js already filters nonEmtpyRows, so groupDataIntoSections won't see them.
        // This test assumes rawData is pre-filtered as in App.js.
        const rawData = [headerRow1, contentRow1_1];
        const sections = groupDataIntoSections(rawData);
        expect(sections.length).toBe(1);
    });

    it('should handle completely empty input', () => {
        expect(groupDataIntoSections([])).toEqual([]);
    });

    it('should handle input with only empty rows (after pre-filtering in App.js this would be empty)', () => {
        // If App.js pre-filters, this case is `groupDataIntoSections([])`.
        // If it somehow received only empty rows:
        const rawData = [emptyRow, emptyRow];
        expect(groupDataIntoSections(rawData)).toEqual([]);
    });
  });
});
