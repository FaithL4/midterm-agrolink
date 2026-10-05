import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  TablePagination,
  TextField,
  InputAdornment,
  Box,
  Typography
} from '@mui/material';
import { Search } from 'lucide-react';

export default function MuiDataTable({ 
  columns = [], 
  data = [], 
  title = "Data Table",
  searchPlaceholder = "Search records..." 
}) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [filterText, setFilterText] = useState('');

  const filteredData = data.filter(row =>
    columns.some(col => {
      const val = row[col.id];
      return val && String(val).toLowerCase().includes(filterText.toLowerCase());
    })
  );

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getChipColor = (status) => {
    if (!status) return 'default';
    const s = String(status).toLowerCase();
    if (s.includes('completed') || s.includes('delivered') || s.includes('active') || s.includes('paid')) return 'success';
    if (s.includes('pending') || s.includes('processing') || s.includes('transit')) return 'warning';
    if (s.includes('cancelled') || s.includes('failed')) return 'error';
    return 'info';
  };

  return (
    <Paper elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: '16px', overflow: 'hidden', p: 2, background: '#ffffff' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2} flexWrap="wrap" gap={2}>
        <Typography variant="h6" fontWeight="bold" color="#1e293b">
          {title}
        </Typography>
        <TextField
          size="small"
          placeholder={searchPlaceholder}
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search size={18} className="text-slate-400" />
              </InputAdornment>
            ),
          }}
          sx={{ background: '#f8fafc', borderRadius: '8px', width: { xs: '100%', sm: '240px' } }}
        />
      </Box>

      <TableContainer>
        <Table sx={{ minWidth: 650 }} size="medium">
          <TableHead sx={{ backgroundColor: '#f8fafc' }}>
            <TableRow>
              {columns.map((col) => (
                <TableCell key={col.id} sx={{ fontWeight: 'bold', color: '#475569' }}>
                  {col.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} align="center" sx={{ py: 3, color: '#94a3b8' }}>
                  No matching records found
                </TableCell>
              </TableRow>
            ) : (
              filteredData
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row, idx) => (
                  <TableRow key={row.id || idx} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                    {columns.map((col) => {
                      const val = row[col.id];
                      if (col.isStatus) {
                        return (
                          <TableCell key={col.id}>
                            <Chip 
                              label={val || 'N/A'} 
                              color={getChipColor(val)} 
                              size="small" 
                              sx={{ fontWeight: 'bold', fontSize: '0.75rem', textTransform: 'capitalize' }} 
                            />
                          </TableCell>
                        );
                      }
                      return (
                        <TableCell key={col.id} sx={{ color: '#334155' }}>
                          {col.format ? col.format(val, row) : (val ?? '—')}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={filteredData.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  );
}
