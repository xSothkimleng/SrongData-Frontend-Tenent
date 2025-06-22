import CustomToolbar from '@/components/DataGridToolbar';
import { DataGrid, GridColDef, GridSlots } from '@mui/x-data-grid';
import { Box, Button, Typography, Paper, LinearProgress } from '@mui/material';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface DataTableProps {
  gridCols: GridColDef[];
  gridRows: { [key: string]: string | { en: string; km: string } }[];
  rowSize: number;
  isDataLoading: boolean;
  paginationModel: { page: number; pageSize: number };
  setPaginationModel: React.Dispatch<React.SetStateAction<{ page: number; pageSize: number }>>;
}

const DataViewTable: React.FC<DataTableProps> = ({
  gridCols,
  gridRows,
  rowSize,
  isDataLoading,
  paginationModel,
  setPaginationModel,
}) => {
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const router = useRouter();

  const handleSelectionChange = (newSelection: string | any[]) => {
    // Limit to single selection
    const singleSelection = newSelection.length > 0 ? [newSelection[newSelection.length - 1]] : [];
    setSelectedRows(singleSelection);

    // Get the actual row data if needed
    if (singleSelection.length > 0) {
      const selectedRowData = gridRows.find(row => row.id === singleSelection[0]);
      console.log('Selected row:', selectedRowData);
    }
  };

  const handleEditRecord = () => {
    // Check if there are any selected rows first
    if (!selectedRows || selectedRows.length === 0) {
      console.error('No row selected for editing');
      return;
    }

    // The selectedRow is the ID itself, not an object
    const responseId = selectedRows[0];
    console.log('Selected row for editing:', responseId);

    if (responseId == undefined || responseId == null || responseId === '') {
      console.error('Selected row does not have a valid id');
      return;
    }

    router.push(`/dashboard/data-view/edit-record/${responseId}`);
  };

  return (
    gridCols.length > 0 && (
      <Paper variant='outlined' sx={{ p: 2, mb: 2 }}>
        <Typography variant='subtitle1' fontWeight='bold' gutterBottom>
          4. Data Table
        </Typography>

        {selectedRows.length > 0 && (
          <Box
            sx={{
              mb: 2,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
            <Typography variant='body2' color='text.secondary'>
              {selectedRows.length} Record Selected
            </Typography>
            <Button variant='contained' color='error' onClick={() => handleEditRecord()}>
              Edit
            </Button>
          </Box>
        )}

        <DataGrid
          columns={gridCols}
          rows={gridRows}
          rowCount={rowSize}
          paginationMode='server'
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          loading={isDataLoading}
          autoHeight
          disableColumnFilter
          disableColumnSelector
          disableDensitySelector
          disableRowSelectionOnClick
          disableColumnSorting
          disableColumnMenu
          checkboxSelection
          rowSelectionModel={selectedRows}
          onRowSelectionModelChange={handleSelectionChange}
          pageSizeOptions={[10, 25, 50, 100]}
          slots={{
            toolbar: CustomToolbar,
            loadingOverlay: LinearProgress as GridSlots['loadingOverlay'],
          }}
          slotProps={{
            toolbar: {
              showQuickFilter: true,
            },
          }}
          sx={{
            width: '100%',
            height: '100%',
            marginTop: '1rem',
          }}
        />
      </Paper>
    )
  );
};

export default DataViewTable;
