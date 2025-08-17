import React, { useState, useMemo } from 'react';
import { Box, Container, Paper, Grid, Typography, FormControl, InputLabel, Select, MenuItem, TableContainer, Table, TableHead, TableBody, TableRow, TableCell, IconButton, List, ListItem, ListItemText } from '@mui/material';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import { motion } from 'framer-motion';
import DeleteIcon from '@mui/icons-material/Delete';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF19A3'];

// Helper function to get unique months from entries
const getUniqueMonths = (entries) => {
    const months = entries.map(entry => {
        const date = new Date(entry.date);
        return `${date.toLocaleString('default', { month: 'long' })} ${date.getFullYear()}`;
    });
    return [...new Set(months)].sort((a, b) => new Date(a) - new Date(b));
};

const getCategoryData = (entries) => {
  const categoryMap = {};
  entries.filter(e => e.type === 'Expense').forEach(entry => {
    categoryMap[entry.category] = (categoryMap[entry.category] || 0) + entry.amount;
  });
  return Object.keys(categoryMap).map(category => ({
    name: category,
    value: categoryMap[category],
  }));
};

const getMonthlyData = (entries) => {
  const monthlyIncome = {};
  const monthlyExpense = {};

  entries.forEach(entry => {
    const monthYear = new Date(entry.date).toLocaleString('default', { month: 'short', year: '2-digit' });
    if (entry.type === 'Income') {
      monthlyIncome[monthYear] = (monthlyIncome[monthYear] || 0) + entry.amount;
    } else {
      monthlyExpense[monthYear] = (monthlyExpense[monthYear] || 0) + entry.amount;
    }
  });

  const allMonths = Array.from(new Set([...Object.keys(monthlyIncome), ...Object.keys(monthlyExpense)])).sort((a, b) => {
    const [monthA, yearA] = a.split(' ');
    const [monthB, yearB] = b.split(' ');
    const dateA = new Date(`01 ${monthA} 20${yearA}`);
    const dateB = new Date(`01 ${monthB} 20${yearB}`);
    return dateA - dateB;
  });

  return allMonths.map(month => ({
    name: month,
    Income: monthlyIncome[month] || 0,
    Expense: monthlyExpense[month] || 0,
  }));
};


const calculateAnalytics = (entries) => {
  const totalIncome = entries.filter(e => e.type === 'Income').reduce((sum, entry) => sum + entry.amount, 0);
  const totalExpenses = entries.filter(e => e.type === 'Expense').reduce((sum, entry) => sum + entry.amount, 0);
  const balance = totalIncome - totalExpenses;

  const categorySpending = {};
  entries.filter(e => e.type === 'Expense').forEach(entry => {
    categorySpending[entry.category] = (categorySpending[entry.category] || 0) + entry.amount;
  });

  const sortedCategories = Object.entries(categorySpending).sort(([, a], [, b]) => b - a);
  const topSpendingCategory = sortedCategories.length > 0 ? sortedCategories[0][0] : 'N/A';

  const categoryBreakdown = Object.keys(categorySpending).map(category => ({
    category,
    amount: categorySpending[category],
    percentage: totalExpenses > 0 ? ((categorySpending[category] / totalExpenses) * 100).toFixed(1) : 0,
  }));

  return { totalIncome, totalExpenses, balance, topSpendingCategory, categoryBreakdown };
};

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

const MonthWise = ({ entries, darkTheme, handleDeleteEntry }) => {
    const uniqueMonths = useMemo(() => getUniqueMonths(entries), [entries]);
    const [selectedMonth, setSelectedMonth] = useState('');

    const filteredEntries = useMemo(() => {
        if (!selectedMonth) return [];
        return entries.filter(entry => {
            const date = new Date(entry.date);
            const entryMonth = `${date.toLocaleString('default', { month: 'long' })} ${date.getFullYear()}`;
            return entryMonth === selectedMonth;
        });
    }, [entries, selectedMonth]);

    const analytics = useMemo(() => calculateAnalytics(filteredEntries), [filteredEntries]);
    const categoryData = useMemo(() => getCategoryData(filteredEntries), [filteredEntries]);
    const monthlyData = useMemo(() => getMonthlyData(filteredEntries), [filteredEntries]);

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
                    Monthly Analysis
                </Typography>
                
                <Paper elevation={3} className="p-6 rounded-2xl mb-6">
                    <FormControl fullWidth>
                        <InputLabel id="month-select-label">Select Month</InputLabel>
                        <Select
                            labelId="month-select-label"
                            value={selectedMonth}
                            label="Select Month"
                            onChange={(e) => setSelectedMonth(e.target.value)}
                            sx={{ color: 'white' }}
                        >
                            <MenuItem value="">
                                <em>All Months</em>
                            </MenuItem>
                            {uniqueMonths.map(month => (
                                <MenuItem key={month} value={month}>{month}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Paper>

                {selectedMonth && (
                    <>
                        <Grid container spacing={3} className="mb-8">
                            <Grid item xs={12} sm={4}>
                                <Paper elevation={3} className="p-6 text-center shadow-lg rounded-2xl bg-gradient-to-br from-blue-700 to-blue-900 text-white">
                                    <Typography variant="h6" className="text-blue-200">Total Income</Typography>
                                    <Typography variant="h4" className="font-bold mt-2">₹ {analytics.totalIncome.toLocaleString()}</Typography>
                                </Paper>
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <Paper elevation={3} className="p-6 text-center shadow-lg rounded-2xl bg-gradient-to-br from-red-700 to-red-900 text-white">
                                    <Typography variant="h6" className="text-red-200">Total Expenses</Typography>
                                    <Typography variant="h4" className="font-bold mt-2">₹ {analytics.totalExpenses.toLocaleString()}</Typography>
                                </Paper>
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <Paper elevation={3} className="p-6 text-center shadow-lg rounded-2xl bg-gradient-to-br from-green-700 to-green-900 text-white">
                                    <Typography variant="h6" className="text-green-200">Balance</Typography>
                                    <Typography variant="h4" className="font-bold mt-2">₹ {analytics.balance.toLocaleString()}</Typography>
                                </Paper>
                            </Grid>
                        </Grid>

                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <Paper elevation={3} className="p-6 shadow-lg rounded-2xl">
                                    <Typography variant="h6" gutterBottom className="text-white font-semibold">
                                        Category-wise Spending
                                    </Typography>
                                    <div style={{ width: '100%', height: 300 }}>
                                        <ResponsiveContainer>
                                            <PieChart>
                                                <Pie
                                                    data={categoryData}
                                                    cx="50%"
                                                    cy="50%"
                                                    labelLine={false}
                                                    outerRadius={100}
                                                    fill="#8884d8"
                                                    dataKey="value"
                                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                                >
                                                    {categoryData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip />
                                                <Legend />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                </Paper>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Paper elevation={3} className="p-6 shadow-lg rounded-2xl">
                                    <Typography variant="h6" gutterBottom className="text-white font-semibold">
                                        Analytics Breakdown
                                    </Typography>
                                    <Box sx={{ mt: 2 }}>
                                        <Typography variant="body1" className="text-white">
                                            <span className="font-bold">Top Spending Category:</span> {analytics.topSpendingCategory}
                                        </Typography>
                                        <Typography variant="body1" className="mt-2 text-white font-bold">
                                            Category Percentage Breakdown:
                                        </Typography>
                                        <List dense className="text-gray-300">
                                            {analytics.categoryBreakdown.length > 0 ? (
                                                analytics.categoryBreakdown.map((item, index) => (
                                                    <ListItem key={index}>
                                                        <ListItemText primary={`${item.category}: ₹${item.amount.toLocaleString()} (${item.percentage}%)`} />
                                                    </ListItem>
                                                ))
                                            ) : (
                                                <ListItem>
                                                    <ListItemText primary="No expense data to show breakdown." />
                                                </ListItem>
                                            )}
                                        </List>
                                    </Box>
                                </Paper>
                            </Grid>
                        </Grid>
                    </>
                )}
                
                {filteredEntries.length > 0 && (
                    <Paper elevation={3} className="p-4 rounded-2xl overflow-hidden mt-6">
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
                                    {filteredEntries.map((entry) => (
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
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                )}
                
                {selectedMonth && filteredEntries.length === 0 && (
                    <Paper elevation={3} className="p-6 rounded-2xl mt-6 text-center">
                        <Typography variant="body1" className="text-white">
                            No entries found for {selectedMonth}.
                        </Typography>
                    </Paper>
                )}
                
                {!selectedMonth && (
                    <Paper elevation={3} className="p-6 rounded-2xl mt-6 text-center">
                        <Typography variant="body1" className="text-white">
                            Please select a month to view a detailed report.
                        </Typography>
                    </Paper>
                )}
            </Container>
        </motion.div>
    );
};

export default MonthWise;
