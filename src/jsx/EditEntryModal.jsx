import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Box,
    Typography,
    Button,
    TextField,
    MenuItem,
    FormControl,
    InputLabel,
    Select,
    CircularProgress
} from '@mui/material';
import { motion } from 'framer-motion';

const EditEntryModal = ({ open, setOpen, editingEntry, handleSaveEdit, categoryOptions, darkTheme }) => {
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('');
    const [remarks, setRemarks] = useState('');
    const [date, setDate] = useState('');
    const [entryType, setEntryType] = useState('Expense');
    const [isSaving, setIsSaving] = useState(false);

    // This useEffect hook runs whenever the 'editingEntry' prop changes.
    // It's crucial for populating the modal's form fields with the data of the selected entry.
    useEffect(() => {
        if (editingEntry) {
            setAmount(editingEntry.amount.toString());
            setCategory(editingEntry.category);
            setRemarks(editingEntry.remarks);
            setDate(editingEntry.date);
            setEntryType(editingEntry.type);
        }
    }, [editingEntry]);

    const handleSave = async () => {
        setIsSaving(true);
        if (amount.trim() === '' || category.trim() === '') {
            console.log('Please fill in all required fields.');
            setIsSaving(false);
            return;
        }

        const updatedEntry = {
            ...editingEntry,
            amount: parseFloat(amount),
            category: category,
            remarks: remarks,
            date: date,
            type: entryType,
        };

        // Call the parent component's function to update the data in Firebase
        await handleSaveEdit(updatedEntry);
        setIsSaving(false);
        setOpen(false);
    };

    return (
        <Dialog
            open={open}
            onClose={() => setOpen(false)}
            PaperProps={{
                style: {
                    borderRadius: '16px',
                    backgroundColor: darkTheme.palette.background.paper,
                    color: darkTheme.palette.text.primary,
                },
            }}
        >
            <DialogTitle className="text-white bg-gray-800 rounded-t-2xl">Edit Entry</DialogTitle>
            <DialogContent className="bg-gray-800 p-6">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
                    <Box component="form" noValidate autoComplete="off" sx={{ '& > :not(style)': { m: 1, width: '100%' } }}>
                        {/* Type Selection */}
                        <FormControl fullWidth variant="outlined" sx={{ '& .MuiOutlinedInput-root': { color: 'white' } }}>
                            <InputLabel id="entry-type-label" sx={{ color: darkTheme.palette.text.secondary }}>Type</InputLabel>
                            <Select
                                labelId="entry-type-label"
                                id="entry-type-select"
                                value={entryType}
                                onChange={(e) => setEntryType(e.target.value)}
                                label="Type"
                                sx={{
                                    '& .MuiSelect-icon': { color: darkTheme.palette.text.secondary },
                                    '& .MuiOutlinedInput-notchedOutline': { borderColor: darkTheme.palette.text.secondary },
                                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: darkTheme.palette.primary.main },
                                }}
                            >
                                <MenuItem value="Expense">Expense</MenuItem>
                                <MenuItem value="Income">Income</MenuItem>
                            </Select>
                        </FormControl>

                        {/* Amount */}
                        <TextField
                            label="Amount"
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            InputLabelProps={{ shrink: true, style: { color: darkTheme.palette.text.secondary } }}
                            sx={{
                                input: { color: 'white' },
                                '& .MuiOutlinedInput-root': {
                                    '& fieldset': { borderColor: darkTheme.palette.text.secondary },
                                    '&:hover fieldset': { borderColor: darkTheme.palette.primary.main },
                                    '&.Mui-focused fieldset': { borderColor: darkTheme.palette.primary.main },
                                }
                            }}
                        />

                        {/* Category */}
                        <FormControl fullWidth variant="outlined" sx={{ '& .MuiOutlinedInput-root': { color: 'white' } }}>
                            <InputLabel id="category-label" sx={{ color: darkTheme.palette.text.secondary }}>Category</InputLabel>
                            <Select
                                labelId="category-label"
                                id="category-select"
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                label="Category"
                                sx={{
                                    '& .MuiSelect-icon': { color: darkTheme.palette.text.secondary },
                                    '& .MuiOutlinedInput-notchedOutline': { borderColor: darkTheme.palette.text.secondary },
                                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: darkTheme.palette.primary.main },
                                }}
                            >
                                {categoryOptions.length > 0 ? (
                                    categoryOptions.map((cat, index) => (
                                        <MenuItem key={index} value={cat}>{cat}</MenuItem>
                                    ))
                                ) : (
                                    <MenuItem disabled>No categories available</MenuItem>
                                )}
                            </Select>
                        </FormControl>

                        {/* Remarks */}
                        <TextField
                            label="Remarks"
                            value={remarks}
                            onChange={(e) => setRemarks(e.target.value)}
                            InputLabelProps={{ style: { color: darkTheme.palette.text.secondary } }}
                            sx={{
                                input: { color: 'white' },
                                '& .MuiOutlinedInput-root': {
                                    '& fieldset': { borderColor: darkTheme.palette.text.secondary },
                                    '&:hover fieldset': { borderColor: darkTheme.palette.primary.main },
                                    '&.Mui-focused fieldset': { borderColor: darkTheme.palette.primary.main },
                                }
                            }}
                        />

                        {/* Date */}
                        <TextField
                            label="Date"
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            InputLabelProps={{ shrink: true, style: { color: darkTheme.palette.text.secondary } }}
                            sx={{
                                input: { color: 'white' },
                                '& .MuiOutlinedInput-root': {
                                    '& fieldset': { borderColor: darkTheme.palette.text.secondary },
                                    '&:hover fieldset': { borderColor: darkTheme.palette.primary.main },
                                    '&.Mui-focused fieldset': { borderColor: darkTheme.palette.primary.main },
                                }
                            }}
                        />
                    </Box>
                </motion.div>
            </DialogContent>
            <DialogActions className="bg-gray-800 p-4 rounded-b-2xl">
                <Button onClick={() => setOpen(false)} color="secondary" disabled={isSaving}>
                    Cancel
                </Button>
                <Button
                    onClick={handleSave}
                    variant="contained"
                    color="primary"
                    disabled={isSaving}
                    startIcon={isSaving && <CircularProgress size={20} color="inherit" />}
                >
                    {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default EditEntryModal;
