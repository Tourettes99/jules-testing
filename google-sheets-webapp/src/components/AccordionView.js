import React, { useState } from 'react';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Typography,
  Box,
  ThemeProvider,
  createTheme,
  Grid
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

// A simple default theme for now, can be expanded later if needed from App's theme
const defaultTheme = createTheme();

// Helper to get a displayable value
const getDisplayValue = (value) => {
  if (value === null || value === undefined || String(value).trim() === '') {
    return '-'; // Or an empty string, depending on preference
  }
  return String(value);
};

// Component to render the details of a header row in a more structured way
const SectionHeaderSummary = ({ headerData, allHeaders }) => {
  // Define which headers from the headerData row are important for the summary
  // These are typically the main identifying fields of the section.
  const summaryHeaders = allHeaders.slice(0, 3); // Example: First 3 columns like 'year', 'Weekend #', 'Dato'
  const detailHeaders = allHeaders.slice(3, 6); // Example: Next 3 like 'Figur Idé', 'Kategori', 'Noter'
                                                // 'Figur Idé' in headerData is "Figur Idé", so maybe skip or show differently.
                                                // 'Kategori' and 'Noter/Inspiration' might be good for summary.

  // Let's pick specific headers by their names for a better summary
  const displaySummary = {};
  const dateHeader = allHeaders.find(h => h && h.toLowerCase().includes('dato'));
  const categoryHeader = allHeaders.find(h => h && h.toLowerCase().includes('kategori'));
  const notesHeader = allHeaders.find(h => h && h.toLowerCase().includes('noter'));

  if (dateHeader && headerData[dateHeader]) displaySummary[dateHeader] = headerData[dateHeader];
  if (categoryHeader && headerData[categoryHeader]) displaySummary[categoryHeader] = headerData[categoryHeader];
  if (notesHeader && headerData[notesHeader]) displaySummary[notesHeader] = headerData[notesHeader];

  // Fallback if specific headers aren't found, use first few, excluding 'Figur Idé' itself
   if (Object.keys(displaySummary).length === 0) {
    allHeaders.slice(0,5).forEach(h => {
        if (h && headerData[h] && headerData[h].toLowerCase() !== 'figur idé') {
            displaySummary[h] = headerData[h];
        }
    });
  }


  return (
    <Grid container spacing={2} sx={{ width: '100%' }}>
      {Object.entries(displaySummary).map(([key, value]) => (
        <Grid item xs={12} sm={6} md={4} key={key}>
          <Typography variant="body2" component="div" sx={{ fontWeight: 'bold' }}>
            {key}:
          </Typography>
          <Typography variant="body2" component="div" sx={{ wordBreak: 'break-word' }}>
            {getDisplayValue(value)}
          </Typography>
        </Grid>
      ))}
    </Grid>
  );
};


const AccordionView = ({ sections, isLoading, error, originalHeaders }) => {
  const [expanded, setExpanded] = useState(false); // Can be section.id to control individually

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <Typography color="error" variant="h6">Error Displaying Data</Typography>
        <Typography color="error">Details: {error.message}</Typography>
      </Box>
    );
  }

  if (!sections || sections.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <Typography>No data available or no sections processed.</Typography>
      </Box>
    );
  }

  // Determine relevant headers for content rows.
  // These are headers that typically have data in content rows.
  // Exclude headers that are only relevant for section headers (like 'year', 'Weekend #', 'Dato') if they are always empty in content.
  // For now, let's use a heuristic: show headers that have at least one non-empty value in the content rows of the first section.
  // A more robust way might be to pre-calculate this in App.js or define fixed content headers.
  let contentTableHeaders = originalHeaders;
  if (sections.length > 0 && sections[0].contentRows.length > 0) {
    const firstSectionContent = sections[0].contentRows;
    contentTableHeaders = originalHeaders.filter(header => {
        // Keep 'Figur Idé', 'Kategori', 'Noter/Inspiration' by default if they exist
        const lowerHeader = header.toLowerCase();
        if (lowerHeader.includes('figur') || lowerHeader.includes('kategori') || lowerHeader.includes('noter')) {
            return true;
        }
        // For other headers, check if they have any data in the first few content rows
        return firstSectionContent.slice(0, 5).some(row => row[header] !== null && String(row[header]).trim() !== '');
    });
    // Ensure we always have some headers if filtering is too aggressive
    if (contentTableHeaders.length === 0) contentTableHeaders = originalHeaders.slice(0,6); // Fallback
  }


  return (
    <ThemeProvider theme={defaultTheme}> {/* Or use theme passed from App.js */}
      {sections.map((section, sectionIndex) => (
        <Accordion
          key={section.id}
          expanded={expanded === section.id}
          onChange={handleChange(section.id)}
          TransitionProps={{ timeout: 400 }} // Smooth fade/collapse
          sx={{ mb: 1 }} // Margin bottom for spacing between accordions
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls={`${section.id}-content`}
            id={`${section.id}-header`}
            sx={{ backgroundColor: expanded === section.id ? defaultTheme.palette.action.selected : defaultTheme.palette.action.hover }}
          >
            <SectionHeaderSummary headerData={section.headerData} allHeaders={originalHeaders} />
          </AccordionSummary>
          <AccordionDetails sx={{ backgroundColor: defaultTheme.palette.background.paper, pt: 0, pb: 2, pl:2, pr:2 }}>
            {section.contentRows && section.contentRows.length > 0 ? (
              <TableContainer component={Paper} elevation={0} variant="outlined">
                <Table size="small" aria-label={`details for section ${sectionIndex + 1}`}>
                  <TableHead sx={{ backgroundColor: defaultTheme.palette.grey[100] }}>
                    <TableRow>
                      {contentTableHeaders.map((header) => (
                        <TableCell key={header} sx={{ fontWeight: 'bold' }}>{header}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {section.contentRows.map((row, rowIndex) => (
                      <TableRow key={rowIndex} sx={{ '&:nth-of-type(odd)': { backgroundColor: defaultTheme.palette.action.hover } }}>
                        {contentTableHeaders.map((header) => (
                          <TableCell key={header}>{getDisplayValue(row[header])}</TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography sx={{ p: 2, textAlign: 'center' }}>No content items in this section.</Typography>
            )}
          </AccordionDetails>
        </Accordion>
      ))}
    </ThemeProvider>
  );
};

export default AccordionView;
