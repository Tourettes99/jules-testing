import React, { useState, useEffect } from 'react';
import { fetchSheetData } from './services/sheetService';
import SheetDataTable from './components/SheetDataTable';
import { CssBaseline, Container, Typography, AppBar, Toolbar, ThemeProvider, createTheme } from '@mui/material';

// Basic Material UI 3 theme
const theme = createTheme({
  palette: {
    mode: 'light', // or 'dark'
    primary: {
      main: '#6750A4', // Example Material 3 primary color
    },
    secondary: {
      main: '#E8DEF8', // Example Material 3 secondary color
    },
    background: {
      default: '#FFFBFE', // Example Material 3 background
    },
  },
  typography: {
    fontFamily: 'Roboto, sans-serif',
  },
});

function App() {
  const [sheetData, setSheetData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await fetchSheetData();
        // Filter out any potential empty rows that papaparse might return if the CSV has trailing newlines
        const filteredData = data.filter(row => Object.values(row).some(cell => cell !== null && cell !== '' && cell !== undefined));
        setSheetData(filteredData);
      } catch (e) {
        console.error("Failed to fetch sheet data:", e);
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
      <Container maxWidth="lg" sx={{ marginTop: 2, marginBottom: 2 }}>
        <SheetDataTable data={sheetData} isLoading={isLoading} error={error} />
      </Container>
    </ThemeProvider>
  );
}

export default App;
