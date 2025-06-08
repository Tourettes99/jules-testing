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
      <Typography variant="h6" component="div" sx={{ fontWeight: 'bold', width: '100%' }}>
        {headerData.title || 'Overview'}
      </Typography>
    );
  }

  const displaySummary = {};
  const dateHeader = allHeaders.find(h => h && h.toLowerCase().includes('dato'));
  const categoryHeader = allHeaders.find(h => h && h.toLowerCase().includes('kategori'));
  const notesHeader = allHeaders.find(h => h && h.toLowerCase().includes('noter'));

  if (dateHeader && headerData[dateHeader]) displaySummary[dateHeader] = headerData[dateHeader];
  if (categoryHeader && headerData[categoryHeader]) displaySummary[categoryHeader] = headerData[categoryHeader];
  if (notesHeader && headerData[notesHeader]) displaySummary[notesHeader] = headerData[notesHeader];

   if (Object.keys(displaySummary).length === 0) {
    allHeaders.slice(0,5).forEach(h => {
        if (h && headerData[h] && String(headerData[h]).toLowerCase() !== 'figur idé') { // Check type before toLowerCase
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
      {Object.keys(displaySummary).length === 0 && (
        <Grid item xs={12}>
            <Typography variant="subtitle1" component="div">Section Header</Typography>
        </Grid>
      )}
    </Grid>
  );
};


const AccordionView = ({ sections, isLoading, error, originalHeaders }) => {
  const [expanded, setExpanded] = useState(sections && sections.length > 0 && sections[0].id === 'section-initial' ? sections[0].id : false);

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
            if (lowerHeader.includes('figur') || lowerHeader.includes('kategori') || lowerHeader.includes('noter')) return true;
            return firstSectionWithContent.contentRows.slice(0, 5).some(row => row[header] !== null && String(row[header]).trim() !== '');
        });
        if (contentTableHeaders.length === 0 && originalHeaders.length > 0) contentTableHeaders = originalHeaders.slice(0, Math.min(6, originalHeaders.length));
        else if (contentTableHeaders.length === 0 && originalHeaders.length === 0) contentTableHeaders = ["Column"]; // Absolute fallback
    }
  }


  return (
    <ThemeProvider theme={defaultTheme}>
      {sections.map((section, sectionIndex) => (
        <Accordion
          key={section.id}
          expanded={expanded === section.id}
          onChange={handleChange(section.id)}
          defaultExpanded={section.id === 'section-initial'} // Default expand initial section
          TransitionProps={{ timeout: 400 }}
          sx={{ mb: 1 }}
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
                <Table size="small" aria-label={`details for section ${section.headerData.title || `section ${sectionIndex + 1}`}`}>
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
