import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next'; // Import useTranslation
import { fetchSheetData } from './services/sheetService';
import AccordionView from './components/AccordionView';
import { groupDataIntoSections, isRowEmpty } from './utils/dataProcessor';
import {
  CssBaseline, Container, Typography, AppBar, Toolbar,
  ThemeProvider, createTheme, Button, Box
} from '@mui/material';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#6750A4',
    },
    secondary: {
      main: '#E8DEF8',
    },
    background: {
      default: '#FFFBFE',
    },
  },
  typography: {
    fontFamily: 'Roboto, sans-serif',
  },
});

function App() {
  const { t, i18n } = useTranslation(); // Initialize useTranslation

  const [processedData, setProcessedData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [originalHeaders, setOriginalHeaders] = useState([]);

  useEffect(() => {
    const getData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const rawData = await fetchSheetData();

        const actualHeaders = rawData.length > 0 ? Object.keys(rawData[0]) : [];
        setOriginalHeaders(actualHeaders);

        const nonEmptyRows = rawData.filter(row => !isRowEmpty(row, actualHeaders));

        if (nonEmptyRows.length === 0) {
             setProcessedData([]);
        } else {
            const sections = groupDataIntoSections(nonEmptyRows);
            setProcessedData(sections);
        }
      } catch (e) {
        console.error("Failed to fetch or process sheet data:", e);
        setError(e);
      } finally {
        setIsLoading(false);
      }
    };
    getData();
  }, []);

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {t('appTitle')} {/* Use t function for app title */}
          </Typography>
          <Box>
            {i18n.language === 'en' && (
              <Button variant="text" color="inherit" onClick={() => changeLanguage('da')} sx={{color: "white"}}>
                {t('toggleLanguageToDanish')}
              </Button>
            )}
            {i18n.language === 'da' && (
              <Button variant="text" color="inherit" onClick={() => changeLanguage('en')} sx={{color: "white"}}>
                {t('toggleLanguageToEnglish')}
              </Button>
            )}
          </Box>
        </Toolbar>
      </AppBar>
      <Container maxWidth="xl" sx={{ marginTop: 2, marginBottom: 2 }}>
        <AccordionView
          sections={processedData}
          isLoading={isLoading}
          error={error}
          originalHeaders={originalHeaders}
          // Pass t function and current language if needed by AccordionView for dynamic labels not covered by its own t()
          // For now, AccordionView will instantiate its own useTranslation
        />
      </Container>
    </ThemeProvider>
  );
}

export default App;
