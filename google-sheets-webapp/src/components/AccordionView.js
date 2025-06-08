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

const defaultTheme = createTheme();

const getDisplayValue = (value) => {
  if (value === null || value === undefined || String(value).trim() === '') {
    return '-';
  }
  return String(value);
};

const SectionHeaderSummary = ({ headerData, allHeaders }) => {
  if (headerData.syntheticHeader) {
    return (
      <Typography variant="h6" component="div" sx={{ fontWeight: 'bold', width: '100%', color: defaultTheme.palette.primary.main }}>
        {headerData.title || 'Overview'}
      </Typography>
    );
  }

  // For regular sections, use 'year' as the main title.
  // Find the actual header name for 'year' (case-insensitive)
  const yearHeaderKey = allHeaders.find(h => h && h.trim().toLowerCase() === 'year');
  const yearValue = yearHeaderKey ? headerData[yearHeaderKey] : 'Year N/A';

  // Prepare other details for secondary display
  const details = {};
  const dateHeaderKey = allHeaders.find(h => h && h.toLowerCase().includes('dato'));
  const categoryHeaderKey = allHeaders.find(h => h && h.toLowerCase().includes('kategori'));
  // const notesHeaderKey = allHeaders.find(h => h && h.toLowerCase().includes('noter')); // Notes might be too long for summary

  if (dateHeaderKey && headerData[dateHeaderKey]) {
    details[`${dateHeaderKey}`] = getDisplayValue(headerData[dateHeaderKey]);
  }
  if (categoryHeaderKey && headerData[categoryHeaderKey]) {
     details[`${categoryHeaderKey}`] = getDisplayValue(headerData[categoryHeaderKey]);
  }
  // Add Weekend # if available
  const weekendHeaderKey = allHeaders.find(h => h && h.trim().toLowerCase() === 'weekend #');
  if (weekendHeaderKey && headerData[weekendHeaderKey]) {
    details[`${weekendHeaderKey}`] = getDisplayValue(headerData[weekendHeaderKey]);
  }


  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h6" component="div" sx={{ fontWeight: 'bold', color: defaultTheme.palette.primary.main, mb: 0.5 }}>
        Year: {getDisplayValue(yearValue)}
      </Typography>
      <Grid container spacing={1}>
        {Object.entries(details).map(([key, value]) => (
          <Grid item xs={12} sm={6} md={4} key={key}>
            <Typography variant="body2" component="span" sx={{ fontWeight: 'medium', color: defaultTheme.palette.text.secondary }}>
              {key}:{' '}
            </Typography>
            <Typography variant="body2" component="span" sx={{ color: defaultTheme.palette.text.primary, wordBreak: 'break-word' }}>
              {value}
            </Typography>
          </Grid>
        ))}
      </Grid>
      {Object.keys(details).length === 0 && !yearValue && ( // Fallback if no details found
        <Grid item xs={12}>
            <Typography variant="subtitle1" component="div">Section Header</Typography>
        </Grid>
      )}
    </Box>
  );
};


const AccordionView = ({ sections, isLoading, error, originalHeaders }) => {
  // Default expanded state: expand 'section-initial' or the first section if 'section-initial' doesn't exist and there's only one section.
  // Otherwise, start with all collapsed unless a specific section ID is provided to be expanded.
  let initialExpanded = false;
  if (sections && sections.length > 0) {
    if (sections[0].id === 'section-initial') {
      initialExpanded = sections[0].id;
    }
    // else if (sections.length === 1) { // Optionally expand if only one non-overview section
    //   initialExpanded = sections[0].id;
    // }
  }
  const [expanded, setExpanded] = useState(initialExpanded);


  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  if (isLoading) {
    return (<Box display="flex" justifyContent="center" alignItems="center" minHeight="200px"><CircularProgress /></Box>);
  }
  if (error) {
    return (<Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" minHeight="200px">
        <Typography color="error" variant="h6">Error Displaying Data</Typography>
        <Typography color="error">Details: {error.message}</Typography>
      </Box>);
  }
  if (!sections || sections.length === 0) {
    return (<Box display="flex" justifyContent="center" alignItems="center" minHeight="200px"><Typography>No data available or no sections processed.</Typography></Box>);
  }

  let contentTableHeaders = originalHeaders;
  if (sections.length > 0 && sections.some(s => s.contentRows && s.contentRows.length > 0)) {
    const firstSectionWithContent = sections.find(s => s.contentRows && s.contentRows.length > 0);
    if (firstSectionWithContent) {
        contentTableHeaders = originalHeaders.filter(header => {
            const lowerHeader = header.toLowerCase();
            // Prioritize Figur Idé, Kategori, Noter for content rows
            if (lowerHeader.includes('figur idé') || lowerHeader.includes('kategori') || lowerHeader.includes('noter/inspiration')) return true;
            // Include other columns if they have data in content rows
            return firstSectionWithContent.contentRows.slice(0, 5).some(row => row[header] !== null && String(row[header]).trim() !== '');
        });
        // Fallback if filtering is too aggressive or no priority headers found
        if (contentTableHeaders.length === 0 && originalHeaders.length > 0) contentTableHeaders = originalHeaders.slice(0, Math.min(6, originalHeaders.length));
        else if (contentTableHeaders.length === 0 && originalHeaders.length === 0) contentTableHeaders = ["Details"]; // Absolute fallback
    }
  }


  return (
    <ThemeProvider theme={defaultTheme}> {/* App.js also has a ThemeProvider, this could be removed if theme is passed or inherited */}
      {sections.map((section, sectionIndex) => (
        <Accordion
          key={section.id}
          expanded={expanded === section.id}
          onChange={handleChange(section.id)}
          defaultExpanded={section.id === 'section-initial'}
          TransitionProps={{ timeout: 400 }}
          sx={{ mb: 1, '&:before': { display: 'none' } }} // '&:before' removes the top border line for a cleaner look when stacked
          disableGutters // Removes left/right padding from Accordion, details will handle padding
          elevation={1} // Subtle shadow
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls={`${section.id}-content`}
            id={`${section.id}-header`}
            sx={{
              backgroundColor: expanded === section.id ? defaultTheme.palette.action.selected : defaultTheme.palette.background.default,
              borderBottom: `1px solid ${defaultTheme.palette.divider}`,
              '&:hover': {
                backgroundColor: defaultTheme.palette.action.hover,
              },
            }}
          >
            <SectionHeaderSummary headerData={section.headerData} allHeaders={originalHeaders} />
          </AccordionSummary>
          <AccordionDetails sx={{ backgroundColor: defaultTheme.palette.background.paper, p: 2 }}> {/* Consistent padding */}
            {section.contentRows && section.contentRows.length > 0 ? (
              <TableContainer component={Paper} elevation={0} variant="outlined">
                <Table size="small" aria-label={`details for section ${section.headerData.title || `section ${sectionIndex + 1}`}`}>
                  <TableHead sx={{ backgroundColor: defaultTheme.palette.grey[50] }}>
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
              <Typography sx={{ p: 2, textAlign: 'center', color: defaultTheme.palette.text.secondary }}>
                No content items in this section.
              </Typography>
            )}
          </AccordionDetails>
        </Accordion>
      ))}
    </ThemeProvider>
  );
};

export default AccordionView;
