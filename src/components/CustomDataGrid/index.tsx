'use client';
import React from 'react';
import { DataGrid, GridColDef, GridSlots, GridToolbarContainer } from '@mui/x-data-grid';
import { Box, LinearProgress } from '@mui/material';
import CustomToolbar from '@/components/DataGridToolbar';

type CustomDataGridProps = {
  rows: any[];
  columns: GridColDef[];
  loading: boolean;
  filterSection?: JSX.Element;
  [key: string]: any;
  noBorder?: boolean;
  quickFilter?: boolean;
};

const DefaultToolbar: React.FC = () => (
  <GridToolbarContainer>
    <Box sx={{ width: '100%', marginBottom: '0.3rem' }}>
      <CustomToolbar />
    </Box>
  </GridToolbarContainer>
);

const CustomDataGrid: React.FC<CustomDataGridProps> = ({
  rows,
  columns,
  loading,
  filterSection,
  //   columnVisibilityModel,
  border = true,
  quickFilter = true,
  ...props
}) => {
  const ToolbarComponent = filterSection ? () => filterSection : DefaultToolbar;

  return (
    <Box className={`${border && 'border-1'} bg-[white]`}>
      <DataGrid
        autoHeight
        rows={rows}
        columns={columns}
        loading={loading}
        disableColumnFilter
        disableColumnSelector
        disableDensitySelector
        disableRowSelectionOnClick
        disableColumnSorting
        disableColumnMenu
        // columnVisibilityModel={columnVisibilityModel}
        slots={{
          // toolbar: ToolbarComponent,
          toolbar: quickFilter ? ToolbarComponent : null,
          loadingOverlay: LinearProgress as GridSlots['loadingOverlay'],
        }}
        slotProps={{
          toolbar: {
            showQuickFilter: true,
          },
        }}
        initialState={{
          filter: {
            filterModel: {
              items: [],
              quickFilterValues: [''],
            },
          },
          pagination: {
            paginationModel: {
              pageSize: 10,
            },
          },
        }}
        pageSizeOptions={[10]}
        sx={{
          width: '100%',
          height: '100%',
          border: 'none',
          borderRadius: '0px',
          '& .super-app-theme--header': {
            backgroundColor: 'rgba(230,242,242,0.5)',
          },
          '& .MuiDataGrid-columnHeaders': {
            fontSize: '1rem',
          },
          '& .MuiDataGrid-columnHeaderTitle': {
            fontWeight: 'semibold',
          },
          '& .MuiDataGrid-main > *:first-of-type': {
            borderTopRightRadius: '0px',
            borderTopLeftRadius: '0px',
          },
        }}
        {...props}
      />
    </Box>
  );
};

export default CustomDataGrid;
