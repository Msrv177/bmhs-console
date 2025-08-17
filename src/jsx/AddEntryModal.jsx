import React from 'react';
import { Dialog, DialogTitle, DialogContent, TextField, MenuItem, Select, InputLabel, FormControl, Box, Button } from '@mui/material';

const AddEntryModal = ({
    open,
    setOpen,
    entryType,
    setEntryType,
    amount,
    setAmount,
    category,
    setCategory,
    remarks,
    setRemarks,
    date,
    setDate,
    handleAddEntry,
    categoryOptions,
    darkTheme
}) => {
    return (
        <Dialog open={open} onClose={() => setOpen(false)} PaperProps={{ style: { borderRadius: '16px' } }}>
            <DialogTitle className="text-white bg-gray-800 rounded-t-2xl">Add New Entry</DialogTitle>
            <DialogContent className="bg-gray-800 p-6 rounded-b-2xl">
                <FormControl fullWidth margin="normal">
                    <InputLabel id="entry-type-label">Type</InputLabel>
                    <Select
                        labelId="entry-type-label"
                        value={entryType}
                        label="Type"
                        onChange={(e) => setEntryType(e.target.value)}
                        sx={{ color: 'white', '.MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.3)' } }}
                    >
                        <MenuItem value="Income">Income</MenuItem>
                        <MenuItem value="Expense">Expense</MenuItem>
                    </Select>
                </FormControl>
                <TextField
                    autoFocus
                    margin="dense"
                    label="Amount"
                    type="number"
                    fullWidth
                    variant="outlined"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    sx={{ input: { color: 'white' }, '& .MuiInputLabel-root': { color: 'gray' }, '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' }, '&:hover fieldset': { borderColor: 'white' }, '&.Mui-focused fieldset': { borderColor: darkTheme.palette.primary.main } } }}
                />
                <FormControl fullWidth margin="normal">
                    <InputLabel id="category-label">Category</InputLabel>
                    <Select
                        labelId="category-label"
                        value={category}
                        label="Category"
                        onChange={(e) => setCategory(e.target.value)}
                        sx={{ color: 'white', '.MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.3)' } }}
                    >
                        {categoryOptions.length > 0 ? (
                            categoryOptions.map((cat) => (
                                <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                            ))
                        ) : (
                            <MenuItem disabled>No categories available</MenuItem>
                        )}
                    </Select>
                </FormControl>
                <TextField
                    margin="dense"
                    label="Remarks"
                    type="text"
                    fullWidth
                    variant="outlined"
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    sx={{ input: { color: 'white' }, '& .MuiInputLabel-root': { color: 'gray' }, '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' }, '&:hover fieldset': { borderColor: 'white' }, '&.Mui-focused fieldset': { borderColor: darkTheme.palette.primary.main } } }}
                />
                <TextField
                    margin="dense"
                    label="Date"
                    type="date"
                    fullWidth
                    variant="outlined"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    InputLabelProps={{ shrink: true, style: { color: 'gray' } }}
                    sx={{ input: { color: 'white' }, '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' }, '&:hover fieldset': { borderColor: 'white' }, '&.Mui-focused fieldset': { borderColor: darkTheme.palette.primary.main } } }}
                />
                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                    <Button onClick={() => setOpen(false)} variant="outlined" color="secondary">
                        Cancel
                    </Button>
                    <Button onClick={handleAddEntry} variant="contained" color="primary">
                        Add Entry
                    </Button>
                </Box>
            </DialogContent>
        </Dialog>
    );
};

export default AddEntryModal;
