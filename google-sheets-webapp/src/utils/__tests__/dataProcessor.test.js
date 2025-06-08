import { isRowEmpty, isHeaderRow, groupDataIntoSections } from '../dataProcessor';

describe('dataProcessor Utilities', () => {
  // Define headers that include 'Figur Idé' as it's key for isHeaderRow
  const figurIdeColName = 'Figur Idé'; // This must match the actual key in your data objects
  const testHeaders = ['year', 'Weekend #', 'Dato', figurIdeColName, 'Kategori', 'Noter'];
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
  });

  describe('isHeaderRow', () => {
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
    it('should return false if "Figur Idé" column is missing from data, even if headers imply it could exist', () => {
      const row = { 'year': '2025', 'Weekend #': '1', 'Dato': 'Some Date', 'Kategori': 'Kat A', 'Noter': 'Note' };
      expect(isHeaderRow(row, testHeaders)).toBe(false); // 'Figur Idé' key is not in row object
    });
  });

  describe('groupDataIntoSections', () => {
    // Re-using figurIdeColName and testHeaders from isHeaderRow describe block
    const initialContent1 = { [figurIdeColName]: 'Initial Idea 1', 'year': '', 'Dato': '', 'Kategori': 'Init', 'Weekend #': '', 'Noter': 'IC1' };
    const initialContent2 = { [figurIdeColName]: 'Initial Idea 2', 'year': '', 'Dato': '', 'Kategori': 'Init', 'Weekend #': '', 'Noter': 'IC2' };

    const headerRow1Data = { [figurIdeColName]: 'Figur Idé', 'year': '2025', 'Dato': 'Date1', 'Kategori': 'A', 'Weekend #': '1', 'Noter': 'N1' };
    const contentRow1_1 = { [figurIdeColName]: 'Idea 1.1', 'year': '', 'Dato': '', 'Kategori': 'A', 'Weekend #': '', 'Noter': 'C1.1' };

    const emptyRowData = testHeaders.reduce((acc, h) => ({ ...acc, [h]: '' }), {}); // Truly empty based on testHeaders

    const headerRow2Data = { [figurIdeColName]: 'Figur Idé', 'year': '2026', 'Dato': 'Date2', 'Kategori': 'B', 'Weekend #': '2', 'Noter': 'N2' };
    const contentRow2_1 = { [figurIdeColName]: 'Idea 2.1', 'year': '', 'Dato': '', 'Kategori': 'B', 'Weekend #': '', 'Noter': 'C2.1' };

    it('should capture initial content as the first section, then process subsequent explicit sections', () => {
      const rawData = [
        initialContent1, initialContent2,
        emptyRowData, emptyRowData, // Gap
        headerRow1Data, contentRow1_1,
        emptyRowData, emptyRowData, // Gap
        headerRow2Data, contentRow2_1
      ];
      const sections = groupDataIntoSections(rawData);
      expect(sections.length).toBe(3);

      expect(sections[0].id).toBe('section-initial');
      expect(sections[0].headerData).toEqual({ syntheticHeader: true, title: 'Overview' });
      expect(sections[0].contentRows).toEqual([initialContent1, initialContent2]);

      expect(sections[1].headerData).toEqual(headerRow1Data);
      expect(sections[1].contentRows).toEqual([contentRow1_1]);

      expect(sections[2].headerData).toEqual(headerRow2Data);
      expect(sections[2].contentRows).toEqual([contentRow2_1]);
    });

    it('should handle data that starts directly with an explicit header row', () => {
      const rawData = [
        headerRow1Data, contentRow1_1,
        emptyRowData, emptyRowData,
        headerRow2Data, contentRow2_1
      ];
      const sections = groupDataIntoSections(rawData);
      expect(sections.length).toBe(2);
      expect(sections[0].id).not.toBe('section-initial'); // No initial section
      expect(sections[0].headerData).toEqual(headerRow1Data);
      expect(sections[0].contentRows).toEqual([contentRow1_1]);
      expect(sections[1].headerData).toEqual(headerRow2Data);
      expect(sections[1].contentRows).toEqual([contentRow2_1]);
    });

    it('should capture only initial content if no explicit headers or gaps follow', () => {
      const rawData = [initialContent1, initialContent2];
      const sections = groupDataIntoSections(rawData);
      expect(sections.length).toBe(1);
      expect(sections[0].id).toBe('section-initial');
      expect(sections[0].headerData).toEqual({ syntheticHeader: true, title: 'Overview' });
      expect(sections[0].contentRows).toEqual([initialContent1, initialContent2]);
    });

    it('should capture initial content then an explicit section without gaps in between', () => {
      const rawData = [initialContent1, headerRow1Data, contentRow1_1];
      const sections = groupDataIntoSections(rawData);
      expect(sections.length).toBe(2);
      expect(sections[0].id).toBe('section-initial');
      expect(sections[0].contentRows).toEqual([initialContent1]);
      expect(sections[1].headerData).toEqual(headerRow1Data);
      expect(sections[1].contentRows).toEqual([contentRow1_1]);
    });

    it('should handle initial content followed by a double gap, then NO explicit header (content after gap is ignored)', () => {
      const rawData = [
        initialContent1, initialContent2,
        emptyRowData, emptyRowData, // Gap
        initialContent1 // This content will be ignored as it's not an explicit header after a gap
      ];
      const sections = groupDataIntoSections(rawData);
      expect(sections.length).toBe(1);
      expect(sections[0].id).toBe('section-initial');
      expect(sections[0].contentRows).toEqual([initialContent1, initialContent2]);
    });

    it('should return empty array for empty input', () => {
      expect(groupDataIntoSections([])).toEqual([]);
    });

    it('should return empty array if input contains only empty/gap rows', () => {
      const rawData = [emptyRowData, emptyRowData, emptyRowData];
      expect(groupDataIntoSections(rawData)).toEqual([]);
    });

    it('should handle a single explicit header section correctly', () => {
        const rawData = [headerRow1Data, contentRow1_1, contentRow1_1];
        const sections = groupDataIntoSections(rawData);
        expect(sections.length).toBe(1);
        expect(sections[0].headerData).toEqual(headerRow1Data);
        expect(sections[0].contentRows.length).toBe(2);
    });

    it('should correctly process data with no content for an explicit section', () => {
        const rawData = [headerRow1Data, emptyRowData, emptyRowData, headerRow2Data];
        const sections = groupDataIntoSections(rawData);
        expect(sections.length).toBe(2);
        expect(sections[0].headerData).toEqual(headerRow1Data);
        expect(sections[0].contentRows.length).toBe(0);
        expect(sections[1].headerData).toEqual(headerRow2Data);
        expect(sections[1].contentRows.length).toBe(0);
    });
  });
});
