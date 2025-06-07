import Papa from 'papaparse';

// The URL provided by the user: https://docs.google.com/spreadsheets/d/1Js7j6E1PJ-YSrUmiNKxiAhGGjVACAaUf/edit?usp=drivesdk&ouid=106020730047053410158&rtpof=true&sd=true
// Extracted SHEET_ID: 1Js7j6E1PJ-YSrUmiNKxiAhGGjVACAaUf
// Extracted GID (from 'sd=true' which implies the first sheet, gid=0): 0
const SHEET_ID = '1Js7j6E1PJ-YSrUmiNKxiAhGGjVACAaUf';
const GID = '0'; // Assuming the first sheet as 'sd=true' usually points to the default sheet (gid=0)

const CSV_EXPORT_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${GID}`;

export const fetchSheetData = () => {
  return new Promise((resolve, reject) => {
    Papa.parse(CSV_EXPORT_URL, {
      download: true,
      header: true, // Assumes the first row of your CSV is the header row
      dynamicTyping: true, // Automatically converts strings to numbers, booleans, etc.
      complete: (results) => {
        if (results.data) {
          resolve(results.data);
        } else {
          reject(new Error('Error parsing CSV data or data is empty.'));
        }
      },
      error: (error) => {
        reject(new Error(`Error fetching or parsing sheet data: ${error.message}`));
      },
    });
  });
};
