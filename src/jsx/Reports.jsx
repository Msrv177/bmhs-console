import React from 'react';
import { Box, Container, Paper, TableContainer, Table, TableHead, TableBody, TableRow, TableCell, IconButton, Typography } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { motion } from 'framer-motion';

const pageVariants = {
    initial: { opacity: 0, y: 20 },
    in: { opacity: 1, y: 0 },
    out: { opacity: 0, y: -20 },
};

const pageTransition = {
    type: "tween",
    ease: "anticipate",
    duration: 0.5
};

const Reports = ({ entries, handleDeleteEntry, darkTheme }) => {
    return (
        <motion.div
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
        >
            <Container maxWidth="lg" className="py-6">
                <Typography variant="h4" gutterBottom className="text-white font-semibold mb-6">
                    Reports
                </Typography>
                <Paper elevation={3} className="p-4 rounded-2xl overflow-hidden">
                    <TableContainer>
                        <Table sx={{ minWidth: 650 }} aria-label="simple table">
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ color: darkTheme.palette.primary.main, fontWeight: 'bold' }}>Date</TableCell>
                                    <TableCell align="right" sx={{ color: darkTheme.palette.primary.main, fontWeight: 'bold' }}>Type</TableCell>
                                    <TableCell align="right" sx={{ color: darkTheme.palette.primary.main, fontWeight: 'bold' }}>Category</TableCell>
                                    <TableCell align="right" sx={{ color: darkTheme.palette.primary.main, fontWeight: 'bold' }}>Amount</TableCell>
                                    <TableCell sx={{ color: darkTheme.palette.primary.main, fontWeight: 'bold' }}>Remarks</TableCell>
                                    <TableCell sx={{ color: darkTheme.palette.primary.main, fontWeight: 'bold' }}>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {entries.length > 0 ? (
                                    entries.map((entry) => (
                                        <TableRow
                                            key={entry.id}
                                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                        >
                                            <TableCell component="th" scope="row" sx={{ color: darkTheme.palette.text.secondary }}>
                                                {entry.date}
                                            </TableCell>
                                            <TableCell align="right" sx={{ color: entry.type === 'Income' ? '#82ca9d' : '#F48FB1' }}>{entry.type}</TableCell>
                                            <TableCell align="right" sx={{ color: darkTheme.palette.text.secondary }}>{entry.category}</TableCell>
                                            <TableCell align="right" sx={{ color: darkTheme.palette.text.secondary }}>₹{entry.amount.toLocaleString()}</TableCell>
                                            <TableCell sx={{ color: darkTheme.palette.text.secondary }}>{entry.remarks}</TableCell>
                                            <TableCell>
                                                <IconButton
                                                    onClick={() => handleDeleteEntry(entry.id)}
                                                    color="secondary"
                                                    aria-label="delete entry"
                                                >
                                                    <DeleteIcon />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center" sx={{ color: darkTheme.palette.text.secondary }}>
                                            No entries found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
            </Container>
        </motion.div>
    );
};

export default Reports;
