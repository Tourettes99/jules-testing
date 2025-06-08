export const isRowEmpty = (row, headers) => {
  if (!row) return true;
  return headers.every(header => {
    const value = row[header];
    return value === null || value === undefined || String(value).trim() === '';
  });
};

export const isHeaderRow = (row, headers) => {
  if (!row || isRowEmpty(row, headers)) return false;

  // Check for the 'Figur Idé' column and its specific content
  const figurIdeHeader = headers.find(h => h && h.trim().toLowerCase() === 'figur idé');
  if (!figurIdeHeader || row[figurIdeHeader] !== 'Figur Idé') {
      return false;
  }

  // Check if other key header columns (first 6 generally) are present and not empty
  let nonEmptyHeaders = 0;
  if (headers.length > 0) {
    const firstSixHeaders = headers.slice(0, 6); // Assuming these are year, Weekend #, Dato, Figur Idé, Kategori, Noter
    nonEmptyHeaders = firstSixHeaders.filter(header => row[header] !== null && String(row[header]).trim() !== '').length;
  }

  // A section header row must have 'Figur Idé' as "Figur Idé" AND at least 3 of the first 6 columns non-empty.
  return nonEmptyHeaders >= 3;
};

export const groupDataIntoSections = (rawData) => {
  if (!rawData || rawData.length === 0) return [];

  const sections = [];
  let currentSection = null;
  let potentialGapRowCount = 0;
  let rowIndex = 0;

  const headers = rawData.length > 0 ? Object.keys(rawData[0]) : [];
  if (headers.length === 0) return [];

  // Phase 1: Capture initial content block if it doesn't start with a defined header row
  let initialContentRows = [];
  while (rowIndex < rawData.length && !isHeaderRow(rawData[rowIndex], headers)) {
    if (isRowEmpty(rawData[rowIndex], headers)) {
      potentialGapRowCount++;
      if (potentialGapRowCount >= 2) {
        // Found a double gap before any explicit header row, ending initial content phase
        rowIndex++; // Consume the second gap row as well for the main loop
        break;
      }
    } else {
      potentialGapRowCount = 0; // Reset if non-empty row found
      initialContentRows.push(rawData[rowIndex]);
    }
    rowIndex++;
  }

  if (initialContentRows.length > 0) {
    // Remove trailing empty rows from initialContentRows that might have been single gap markers
    while (initialContentRows.length > 0 && isRowEmpty(initialContentRows[initialContentRows.length - 1], headers)) {
      initialContentRows.pop();
    }
    if (initialContentRows.length > 0) {
      sections.push({
        id: 'section-initial',
        // Create a synthetic header. The actual sheet column headers are keys in each row object.
        // We can use the first content row's data or a generic title.
        // For AccordionSummary, it expects an object similar to other headerData.
        // Let's use a generic title for now. The AccordionView can then display this.
        headerData: { syntheticHeader: true, title: 'Overview' }, // Mark as synthetic
        contentRows: initialContentRows
      });
    }
  }
   // Reset potentialGapRowCount if it was fired during initial content scan but didn't result in termination
  potentialGapRowCount = 0;


  // Phase 2: Process remaining rows for explicitly defined sections
  for (; rowIndex < rawData.length; rowIndex++) {
    const row = rawData[rowIndex];
    if (isHeaderRow(row, headers)) {
      if (currentSection) {
        // Clean up trailing empty rows from the previous section's content
        while (currentSection.contentRows.length > 0 &&
               isRowEmpty(currentSection.contentRows[currentSection.contentRows.length -1], headers)) {
            currentSection.contentRows.pop();
        }
        if (currentSection.contentRows.length > 0 || currentSection.headerData) { // Ensure not adding empty section
            sections.push(currentSection);
        }
      }
      currentSection = {
        id: `section-${rowIndex}`, // Use original row index for a more stable ID
        headerData: row,
        contentRows: [],
      };
      potentialGapRowCount = 0;
    } else if (currentSection) { // We are inside a section, collecting content rows
      if (isRowEmpty(row, headers)) {
        potentialGapRowCount++;
        if (potentialGapRowCount >= 2) { // End of section due to double gap
            while (currentSection.contentRows.length > 0 &&
                    isRowEmpty(currentSection.contentRows[currentSection.contentRows.length -1], headers)) {
                 currentSection.contentRows.pop();
            }
            if (currentSection.contentRows.length > 0 || currentSection.headerData) {
                sections.push(currentSection);
            }
            currentSection = null; // Reset current section, wait for a new header
            potentialGapRowCount = 0;
        }
        // If it's just a single empty row within content, it's currently ignored unless logic changes to add it.
        // For now, content rows are only added if not empty.
      } else { // Non-empty row, add to current section's content
        potentialGapRowCount = 0;
        currentSection.contentRows.push(row);
      }
    }
    // If row is not a header and currentSection is null (e.g. after a double gap), these rows are ignored
    // until a new header is found. This is consistent with the "section-based" structure.
  }

  // Add the last processed section if it exists
  if (currentSection) {
    while (currentSection.contentRows.length > 0 &&
           isRowEmpty(currentSection.contentRows[currentSection.contentRows.length -1], headers)) {
        currentSection.contentRows.pop();
    }
    if (currentSection.contentRows.length > 0 || currentSection.headerData) {
        sections.push(currentSection);
    }
  }

  return sections;
};
