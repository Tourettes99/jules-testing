export const isRowEmpty = (row, headers) => {
  if (!row) return true;
  return headers.every(header => {
    const value = row[header];
    return value === null || value === undefined || String(value).trim() === '';
  });
};

export const isHeaderRow = (row, headers) => {
  if (!row || isRowEmpty(row, headers)) return false;

  const figurIdeHeader = headers.find(h => h && h.trim().toLowerCase() === 'figur idé');
  if (!figurIdeHeader || row[figurIdeHeader] !== 'Figur Idé') {
      return false;
  }

  let nonEmptyHeaders = 0;
  if (headers.length > 0) {
    const firstSixHeaders = headers.slice(0, 6);
    nonEmptyHeaders = firstSixHeaders.filter(header => row[header] !== null && String(row[header]).trim() !== '').length;
  }

  return nonEmptyHeaders >= 3;
};

export const groupDataIntoSections = (rawData) => {
  if (!rawData || rawData.length === 0) return [];

  const sections = [];
  let currentSection = null;
  let potentialGapRowCount = 0;

  const headers = rawData.length > 0 ? Object.keys(rawData[0]) : [];
  if (headers.length === 0) return [];

  rawData.forEach((row, index) => {
    if (isHeaderRow(row, headers)) {
      if (currentSection) {
        while (currentSection.contentRows.length > 0 &&
               isRowEmpty(currentSection.contentRows[currentSection.contentRows.length -1], headers)) {
            currentSection.contentRows.pop();
        }
        // Only add if it has content or a header (though header is guaranteed by isHeaderRow)
        if (currentSection.contentRows.length > 0 || currentSection.headerData) {
             sections.push(currentSection);
        }
      }
      currentSection = {
        id: `section-${index}`,
        headerData: row,
        contentRows: [],
      };
      potentialGapRowCount = 0;
    } else if (currentSection) {
      if (isRowEmpty(row, headers)) {
        potentialGapRowCount++;
         if (potentialGapRowCount >= 2) {
            while (currentSection.contentRows.length > 0 &&
                    isRowEmpty(currentSection.contentRows[currentSection.contentRows.length -1], headers)) {
                 currentSection.contentRows.pop();
            }
            if (currentSection.contentRows.length > 0 || currentSection.headerData) {
                sections.push(currentSection);
            }
            currentSection = null;
            potentialGapRowCount = 0;
        }
      } else {
        potentialGapRowCount = 0;
        currentSection.contentRows.push(row);
      }
    }
  });

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
