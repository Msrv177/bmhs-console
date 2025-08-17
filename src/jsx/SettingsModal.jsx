import React from 'react';
import { Dialog, DialogTitle, DialogContent, Box, Button, Typography, Divider, Chip, TextField } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

const SettingsModal = ({
    open,
    setOpen,
    activeSettingsTab,
    setActiveSettingsTab,
    incomeCategories,
    expenseCategories,
    newCategoryName,
    setNewCategoryName,
    handleAddCategory,
    handleConfirmDelete,
    darkTheme
}) => {
    return (
        <Dialog open={open} onClose={() => setOpen(false)} PaperProps={{ style: { borderRadius: '16px' } }}>
            <DialogTitle className="text-white bg-gray-800 rounded-t-2xl">Manage Categories</DialogTitle>
            <DialogContent className="bg-gray-800 p-6 rounded-b-2xl">
                <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                    <Button
                        variant={activeSettingsTab === 'Income' ? 'contained' : 'text'}
                        onClick={() => setActiveSettingsTab('Income')}
                        sx={{ mr: 2 }}
                    >
                        Income
                    </Button>
                    <Button
                        variant={activeSettingsTab === 'Expense' ? 'contained' : 'text'}
                        onClick={() => setActiveSettingsTab('Expense')}
                    >
                        Expense
                    </Button>
                </Box>
                
                <Box>
                    <Typography variant="h6" gutterBottom>
                        {activeSettingsTab} Categories
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                        {(activeSettingsTab === 'Income' ? incomeCategories : expenseCategories).map((cat) => (
                            <Chip
                                key={cat}
                                label={cat}
                                onDelete={() => handleConfirmDelete(cat)}
                                deleteIcon={<DeleteIcon />}
                                color="secondary"
                                variant="outlined"
                                sx={{ color: 'white' }}
                            />
                        ))}
                    </Box>
                    <TextField
                        margin="dense"
                        label={`New ${activeSettingsTab} Category`}
                        type="text"
                        fullWidth
                        variant="outlined"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        sx={{ input: { color: 'white' }, '& .MuiInputLabel-root': { color: 'gray' } }}
                    />
                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                        <Button onClick={handleAddCategory} variant="contained" color="primary" disabled={!newCategoryName.trim()}>
                            Add Category
                        </Button>
                    </Box>
                </Box>

                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button onClick={() => setOpen(false)} variant="outlined" color="secondary">
                        Close
                    </Button>
                </Box>
            </DialogContent>
        </Dialog>
    );
};

export default SettingsModal;
