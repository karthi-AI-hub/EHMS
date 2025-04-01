import React from 'react';
import { Pagination, Select, MenuItem, Box, Typography, useTheme } from '@mui/material';

const CustomPagination = ({
  count,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  darkMode = false
}) => {
  const theme = useTheme();

  return (
    <Box sx={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center',
      mt: 2,
      p: 1,
      backgroundColor: darkMode ? theme.palette.grey[800] : theme.palette.grey[100],
      borderRadius: 1
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="body2">Rows per page:</Typography>
        <Select
          value={rowsPerPage}
          onChange={(e) => onRowsPerPageChange(Number(e.target.value))}
          size="small"
          sx={{
            '& .MuiSelect-select': {
              py: 0.5
            }
          }}
        >
          {[5, 10, 25, 50].map((rows) => (
            <MenuItem key={rows} value={rows}>
              {rows}
            </MenuItem>
          ))}
        </Select>
      </Box>
      
      <Pagination
        count={count}
        page={page}
        onChange={onPageChange}
        color="primary"
        showFirstButton
        showLastButton
        sx={{
          '& .MuiPaginationItem-root': {
            color: darkMode ? theme.palette.text.primary : undefined
          }
        }}
      />
      
      <Typography variant="body2">
        Page {page} of {count}
      </Typography>
    </Box>
  );
};

export default CustomPagination;