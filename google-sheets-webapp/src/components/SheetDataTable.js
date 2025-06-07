import React, { memo } from 'react';
import {
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
  createTheme
} from '@mui/material';

// A simple default theme for now, can be expanded later
const defaultTheme = createTheme();

const SheetDataTable = ({ data, isLoading, error }) => {
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
        <Typography color="error">Error loading data: {error.message}</Typography>
      </Box>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <Typography>No data available.</Typography>
      </Box>
    );
  }

  // Assuming all objects have the same keys, use the first object to get headers
  const headers = Object.keys(data[0]);

  return (
    <ThemeProvider theme={defaultTheme}>
      <TableContainer component={Paper} sx={{ margin: 2 }}>
        <Table aria-label="sheet data table">
          <TableHead sx={{ backgroundColor: defaultTheme.palette.grey[200] }}>
            <TableRow>
              {headers.map((header) => (
                <TableCell key={header} sx={{ fontWeight: 'bold' }}>{header}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row, index) => (
              <TableRow key={index} sx={{ '&:nth-of-type(odd)': { backgroundColor: defaultTheme.palette.action.hover } }}>
                {headers.map((header) => (
                  <TableCell key={header}>{String(row[header])}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </ThemeProvider>
  );
};

export default memo(SheetDataTable);
