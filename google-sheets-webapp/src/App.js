import React, { useState, useEffect } from 'react';
import { fetchSheetData } from './services/sheetService';
import AccordionView from './components/AccordionView';
import { groupDataIntoSections, isRowEmpty } from './utils/dataProcessor'; // Import the functions
import { CssBaseline, Container, Typography, AppBar, Toolbar, ThemeProvider, createTheme } from '@mui/material';

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

// isRowEmpty, isHeaderRow, groupDataIntoSections are now imported from ./utils/dataProcessor.js

function App() {
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

        // Filter out rows that are completely empty according to the utility function
        const nonEmptyRows = rawData.filter(row => !isRowEmpty(row, actualHeaders));

        if (nonEmptyRows.length === 0) {
             setProcessedData([]);
        } else {
            const sections = groupDataIntoSections(nonEmptyRows); // Use imported function
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

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6">Google Sheets Data Viewer</Typography>
        </Toolbar>
      </AppBar>
      <Container maxWidth="xl" sx={{ marginTop: 2, marginBottom: 2 }}>
        <AccordionView
          sections={processedData}
          isLoading={isLoading}
          error={error}
          originalHeaders={originalHeaders}
        />
      </Container>
    </ThemeProvider>
  );
}

export default App;
