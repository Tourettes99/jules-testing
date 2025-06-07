import { render, screen } from '@testing-library/react';
import SheetDataTable from '../SheetDataTable';

describe('SheetDataTable Component', () => {
  test('renders loading spinner when isLoading is true', () => {
    render(<SheetDataTable isLoading={true} data={[]} error={null} />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  test('renders error message when error object is provided', () => {
    render(<SheetDataTable isLoading={false} data={[]} error={{ message: 'Test Error' }} />);
    expect(screen.getByText(/error loading data: test error/i)).toBeInTheDocument();
  });

  test('renders "No data available" when data is empty or null', () => {
    render(<SheetDataTable isLoading={false} data={[]} error={null} />);
    expect(screen.getByText('No data available.')).toBeInTheDocument();

    render(<SheetDataTable isLoading={false} data={null} error={null} />);
    expect(screen.getByText('No data available.')).toBeInTheDocument();
  });

  test('renders table with headers and data correctly', () => {
    const sampleData = [
      { id: 1, name: 'Alice', age: 30 },
      { id: 2, name: 'Bob', age: 24 },
    ];
    render(<SheetDataTable isLoading={false} data={sampleData} error={null} />);

    // Check for headers
    expect(screen.getByText('id')).toBeInTheDocument();
    expect(screen.getByText('name')).toBeInTheDocument();
    expect(screen.getByText('age')).toBeInTheDocument();

    // Check for data
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('30')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
    expect(screen.getByText('24')).toBeInTheDocument();
  });

  test('renders stringified values for various data types in cells', () => {
    const complexData = [
      { colA: 'text', colB: 123, colC: true, colD: null, colE: undefined },
    ];
    render(<SheetDataTable isLoading={false} data={complexData} error={null} />);

    expect(screen.getByText('text')).toBeInTheDocument();
    expect(screen.getByText('123')).toBeInTheDocument();
    expect(screen.getByText('true')).toBeInTheDocument();
    // Note: null and undefined are typically rendered as empty strings by String() in the component
    // Check for their headers to ensure the row rendered.
    expect(screen.getByText('colD')).toBeInTheDocument(); // Header for null value column
    expect(screen.getByText('colE')).toBeInTheDocument(); // Header for undefined value column
  });
});
