import React from 'react';
import { Dialog, DialogTitle, DialogContent, Typography, DialogActions, Button } from '@mui/material';

const ConfirmModals = ({
    openConfirmModal,
    setOpenConfirmModal,
    categoryToDelete,
    handleDeleteCategory,
    openEntryConfirmModal,
    setOpenEntryConfirmModal,
    handleConfirmDeleteEntry
}) => {
    return (
        <>
            {/* Confirmation Modal for Category Deletion */}
            <Dialog
                open={openConfirmModal}
                onClose={() => setOpenConfirmModal(false)}
                PaperProps={{ style: { borderRadius: '16px' } }}
            >
                <DialogTitle>Confirm Deletion</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete the category "{categoryToDelete}"?
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenConfirmModal(false)} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleDeleteCategory} color="secondary">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
            
            {/* New Confirmation Modal for Entries */}
            <Dialog
                open={openEntryConfirmModal}
                onClose={() => setOpenEntryConfirmModal(false)}
                PaperProps={{ style: { borderRadius: '16px' } }}
            >
                <DialogTitle>Confirm Entry Deletion</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete this entry? This action cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenEntryConfirmModal(false)} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleConfirmDeleteEntry} color="secondary">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default ConfirmModals;
