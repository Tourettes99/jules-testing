import React, { useState } from 'react';
import { useTranslation } from 'react-i18next'; // Import useTranslation
import {
  Accordion, AccordionSummary, AccordionDetails,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, CircularProgress, Typography, Box, ThemeProvider, createTheme, Grid
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const defaultTheme = createTheme();

const getDisplayValue = (value) => {
  if (value === null || value === undefined || String(value).trim() === '') return '-';
  return String(value);
};

const findYearInHeaderData = (headerData) => {
  if (!headerData) return null;
  for (const key in headerData) {
    if (Object.prototype.hasOwnProperty.call(headerData, key)) {
      const value = headerData[key];
      if (value && typeof value === 'string' && /^\d{4}$/.test(value.trim())) return value.trim();
      if (value && typeof value === 'number' && value >= 1000 && value <= 9999) return String(value);
    }
  }
  return null;
};

const SectionHeaderSummary = ({ headerData, allHeaders, t }) => { // Receive t function as prop
  if (headerData.syntheticHeader) {
    return (
      <Typography variant="h6" component="div" sx={{ fontWeight: 'bold', width: '100%', color: defaultTheme.palette.primary.main }}>
        {t(headerData.title) || t('overviewSectionTitle')} {/* Translate synthetic title */}
      </Typography>
    );
  }

  const detectedYear = findYearInHeaderData(headerData);
  const yearDisplayValue = detectedYear ? getDisplayValue(detectedYear) : t('yearLabel') + ' N/A'; // Translate 'Year N/A' part?

  const details = {};
  const dateHeaderKey = allHeaders.find(h => h && h.trim().toLowerCase().includes('dato'));
  const categoryHeaderKey = allHeaders.find(h => h && h.trim().toLowerCase().includes('kategori'));
  const weekendHeaderKey = allHeaders.find(h => h && h.trim().toLowerCase() === 'weekend #');

  if (dateHeaderKey && headerData[dateHeaderKey]) details[t('dateLabel')] = getDisplayValue(headerData[dateHeaderKey]);
  if (categoryHeaderKey && headerData[categoryHeaderKey]) details[t('categoryLabel')] = getDisplayValue(headerData[categoryHeaderKey]);
  if (weekendHeaderKey && headerData[weekendHeaderKey]) details[t('weekendLabel')] = getDisplayValue(headerData[weekendHeaderKey]);

  let primaryTitle;
  if (detectedYear) {
    primaryTitle = `${t('yearLabel')}: ${yearDisplayValue}`;
  } else {
    const fallbackTitleParts = [];
    for (const key of allHeaders.slice(0,3)) {
        if (headerData[key] && String(headerData[key]).trim() !== '' && String(headerData[key]).toLowerCase() !== 'figur idé') {
            fallbackTitleParts.push(String(headerData[key]).trim());
        }
        if (fallbackTitleParts.length >= 2) break;
    }
    primaryTitle = fallbackTitleParts.length > 0 ? fallbackTitleParts.join(' - ') : t('sectionDetailsFallbackTitle');
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h6" component="div" sx={{ fontWeight: 'bold', color: defaultTheme.palette.primary.main, mb: 0.5 }}>
        {primaryTitle}
      </Typography>
      {detectedYear && Object.keys(details).length > 0 && (
        <Grid container spacing={1}>
          {Object.entries(details).map(([key, value]) => (
            <Grid item xs={12} sm={6} md={4} key={key}>
              <Typography variant="body2" component="span" sx={{ fontWeight: 'medium', color: defaultTheme.palette.text.secondary }}>
                {key}:{' '} {/* Key here is already translated label e.g. t('dateLabel') */}
              </Typography>
              <Typography variant="body2" component="span" sx={{ color: defaultTheme.palette.text.primary, wordBreak: 'break-word' }}>
                {value}
              </Typography>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

const AccordionView = ({ sections, isLoading, error, originalHeaders }) => {
  const { t } = useTranslation(); // Initialize useTranslation here

  let initialExpanded = false;
  if (sections && sections.length > 0 && sections[0].id === 'section-initial') {
    initialExpanded = sections[0].id;
  }
  const [expanded, setExpanded] = useState(initialExpanded);

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  if (isLoading) {
    return (<Box display="flex" justifyContent="center" alignItems="center" minHeight="200px"><CircularProgress /><Typography sx={{ml:1}}>{t('loadingData')}</Typography></Box>);
  }
  if (error) {
    return (<Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" minHeight="200px">
        <Typography color="error" variant="h6">{t('errorDisplayingData')}</Typography>
        <Typography color="error">{t('errorDetailsPrefix')}: {error.message}</Typography>
      </Box>);
  }
  if (!sections || sections.length === 0) {
    return (<Box display="flex" justifyContent="center" alignItems="center" minHeight="200px"><Typography>{t('noDataAvailable')}</Typography></Box>);
  }

  let contentTableHeaders = originalHeaders; // These are from sheet, not translated here
  if (sections.length > 0 && sections.some(s => s.contentRows && s.contentRows.length > 0)) {
    const firstSectionWithContent = sections.find(s => s.contentRows && s.contentRows.length > 0);
    if (firstSectionWithContent) {
        contentTableHeaders = originalHeaders.filter(header => {
            const lowerHeader = header ? String(header).toLowerCase() : "";
            if (lowerHeader.includes('figur idé') || lowerHeader.includes('kategori') || lowerHeader.includes('noter/inspiration')) return true;
            return firstSectionWithContent.contentRows.slice(0, 5).some(row => row[header] !== null && String(row[header]).trim() !== '');
        });
        if (contentTableHeaders.length === 0 && originalHeaders.length > 0) contentTableHeaders = originalHeaders.slice(0, Math.min(6, originalHeaders.length));
        else if (contentTableHeaders.length === 0 && originalHeaders.length === 0) contentTableHeaders = [t('sectionDetailsFallbackTitle')];
    }
  }

  return (
    <ThemeProvider theme={defaultTheme}>
      {sections.map((section, sectionIndex) => (
        <Accordion
          key={section.id}
          expanded={expanded === section.id}
          onChange={handleChange(section.id)}
          defaultExpanded={section.id === 'section-initial'}
          TransitionProps={{ timeout: 400 }}
          sx={{ mb: 1, '&:before': { display: 'none' } }}
          disableGutters elevation={1}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls={`${section.id}-content`} id={`${section.id}-header`}
            sx={{
              backgroundColor: expanded === section.id ? defaultTheme.palette.action.selected : defaultTheme.palette.background.default,
              borderBottom: `1px solid ${defaultTheme.palette.divider}`,
              '&:hover': { backgroundColor: defaultTheme.palette.action.hover },
            }}
          >
            {/* Pass t function to SectionHeaderSummary */}
            <SectionHeaderSummary headerData={section.headerData} allHeaders={originalHeaders} t={t} />
          </AccordionSummary>
          <AccordionDetails sx={{ backgroundColor: defaultTheme.palette.background.paper, p: 2 }}>
            {section.contentRows && section.contentRows.length > 0 ? (
              <TableContainer component={Paper} elevation={0} variant="outlined">
                <Table size="small" aria-label={`${t('sectionDetailsFallbackTitle')} for section ${sectionIndex + 1}`}>
                  <TableHead sx={{ backgroundColor: defaultTheme.palette.grey[50] }}>
                    <TableRow>
                      {contentTableHeaders.map((header) => (
                        <TableCell key={header} sx={{ fontWeight: 'bold' }}>{header}</TableCell> /* Headers from sheet not translated */
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
                {t('noContentInSection')}
              </Typography>
            )}
          </AccordionDetails>
        </Accordion>
      ))}
    </ThemeProvider>
  );
};

export default AccordionView;
