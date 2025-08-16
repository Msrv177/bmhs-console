import React, { useState, useEffect, useMemo } from 'react';
import { AppBar, Toolbar, Typography, IconButton, Drawer, List, ListItem, ListItemText, Box, Container, Paper, Grid, Button, Dialog, DialogTitle, DialogContent, TextField, MenuItem, Select, InputLabel, FormControl, Divider, Chip, TableContainer, Table, TableHead, TableBody, TableRow, TableCell } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import ReceiptIcon from '@mui/icons-material/Receipt';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import DeleteIcon from '@mui/icons-material/Delete';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { motion } from 'framer-motion'; 
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, addDoc, getDocs, onSnapshot, query, setDoc, doc, where, orderBy, deleteDoc, getDoc } from 'firebase/firestore'; 
import { db } from "../firebase-config";
import { useNavigate } from "react-router-dom";

// Define the dark theme for Material UI
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#90CAF9', // Light blue for primary actions
    },
    secondary: {
      main: '#F48FB1', // Pink for secondary actions
    },
    background: {
      default: '#121212', // Dark background
      paper: '#1E1E1E', // Slightly lighter dark for cards/dialogs
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#B0B0B0',
    },
  },
  typography: {
    fontFamily: '"Inter", sans-serif',
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: '16px', // Rounded corners for Paper components (cards, dialogs)
          background: 'linear-gradient(145deg, rgba(30,30,30,0.8), rgba(40,40,40,0.8))', // Glassmorphism effect
          backdropFilter: 'blur(10px)',
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)', // Soft shadows
          border: '1px solid rgba(255, 255, 255, 0.18)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'rgba(30,30,30,0.8)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          background: 'rgba(25,25,25,0.9)',
          backdropFilter: 'blur(10px)',
          borderRight: '1px solid rgba(255, 255, 255, 0.1)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '12px',
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
        },
      },
    },
  },
});

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF19A3'];

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
 
function Home( { mail } ) {
  const [openDrawer, setOpenDrawer] = useState(false);
  const [openEntryModal, setOpenEntryModal] = useState(false);
  const [openSettingsModal, setOpenSettingsModal] = useState(false); // New state for settings modal
  const [activeTab, setActiveTab] = useState('dashboard'); // New state for managing the active tab
  const [entryType, setEntryType] = useState('Expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [remarks, setRemarks] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]); 
  const [entries, setEntries] = useState([]);
  const [userId, setUserId] = useState(null);
  const navigate = useNavigate();  

  // New states for managing categories in settings
  const [incomeCategories, setIncomeCategories] = useState([]);
  const [expenseCategories, setExpenseCategories] = useState([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [activeSettingsTab, setActiveSettingsTab] = useState('Income');

  useEffect(() => {
    if (!mail) {
      navigate("/Login");
      return;
    }

    // Auth listener to get user ID
    const auth = getAuth();
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        // Handle case where user signs out
        setUserId(null);
      }
    });

    // Firestore listener for entries
    const userCollectionRef = collection(db, mail);
    const entriesQuery = query(userCollectionRef, orderBy("date", "asc"));
    const unsubscribeEntries = onSnapshot(entriesQuery, (snapshot) => {
      const fetchedEntries = snapshot.docs
        .filter((doc) => !["IncomCategoryList", "ExpenseCategoryList"].includes(doc.id))
        .map((doc) => ({ id: doc.id, ...doc.data() }));
      setEntries(fetchedEntries);
    });

    // Firestore listener for categories
    const categoriesDocRef = doc(db, mail, 'IncomCategoryList');
    const unsubscribeIncomeCats = onSnapshot(categoriesDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setIncomeCategories(data.categories || []);
      }
    });

    const expenseCatsDocRef = doc(db, mail, 'ExpenseCategoryList');
    const unsubscribeExpenseCats = onSnapshot(expenseCatsDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setExpenseCategories(data.categories || []);
      }
    });

    return () => {
      unsubscribeAuth();
      unsubscribeEntries();
      unsubscribeIncomeCats();
      unsubscribeExpenseCats();
    };
  }, [mail, navigate]);

  // Handler to add a new category
  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;

    const categoryType = activeSettingsTab === 'Income' ? 'IncomCategoryList' : 'ExpenseCategoryList';
    const categories = activeSettingsTab === 'Income' ? incomeCategories : expenseCategories;
    
    if (categories.includes(newCategoryName.trim())) {
      console.warn("Category already exists.");
      return;
    }

    const docRef = doc(db, mail, categoryType);
    const newCategories = [...categories, newCategoryName.trim()];

    try {
      await setDoc(docRef, { categories: newCategories }, { merge: true });
      setNewCategoryName('');
      console.log(`Successfully added new category: ${newCategoryName}`);
    } catch (e) {
      console.error("Error adding category: ", e);
    }
  };

  // Handler to delete a category
  const handleDeleteCategory = async (categoryToDelete) => {
    const categoryType = activeSettingsTab === 'Income' ? 'IncomCategoryList' : 'ExpenseCategoryList';
    const categories = activeSettingsTab === 'Income' ? incomeCategories : expenseCategories;

    const docRef = doc(db, mail, categoryType);
    const newCategories = categories.filter(cat => cat !== categoryToDelete);

    try {
      await setDoc(docRef, { categories: newCategories }, { merge: true });
      console.log(`Successfully deleted category: ${categoryToDelete}`);
    } catch (e) {
      console.error("Error deleting category: ", e);
    }
  };

  const handleAddEntry = async () => {
    if (!mail || !amount || !category) {
      console.warn("User email, amount, or category not available. Cannot save entry.");
      return;
    }
    if (!category.trim()) {
      // Replaced alert with a console warning for better dev experience
      console.warn("Please select a category.");
      return;
    }

    try {
      const entryDocRef = doc(collection(db, mail));
      await setDoc(entryDocRef, {
          type: entryType,
          amount: parseFloat(amount),
          category,
          remarks,
          date, 
        }, { merge: true }
      );
      setOpenEntryModal(false);
      setAmount("");
      setCategory("");
      setRemarks("");
      setDate(new Date().toISOString().split("T")[0]);
    } catch (error) {
      console.error("Error saving entry:", error);
    }
  };  

  const handleDeleteEntry = async (entryId) => {
    try {
      await deleteDoc(doc(db, mail, entryId));
      console.log("Document successfully deleted!");
    } catch (error) {
      console.error("Error removing document: ", error);
    }
  };
  
  // Use useMemo for performance optimization
  const analytics = useMemo(() => calculateAnalytics(entries), [entries]);
  const categoryData = useMemo(() => getCategoryData(entries), [entries]);
  const monthlyData = useMemo(() => getMonthlyData(entries), [entries]);
  
  // Dynamically set category options based on fetched data
  const categoryOptions = entryType === 'Income' ? incomeCategories : expenseCategories;

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

  // Main content render based on activeTab
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
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
                Dashboard
              </Typography>

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
                      Income vs. Expense Trends
                    </Typography>
                    <div style={{ width: '100%', height: 300 }}>
                      <ResponsiveContainer>
                        <BarChart
                          data={monthlyData}
                          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                          <XAxis dataKey="name" stroke="#bbb" />
                          <YAxis stroke="#bbb" />
                          <Tooltip contentStyle={{ backgroundColor: '#333', border: 'none', borderRadius: '8px' }} itemStyle={{ color: '#fff' }} />
                          <Legend />
                          <Bar dataKey="Income" fill="#8884d8" radius={[10, 10, 0, 0]} />
                          <Bar dataKey="Expense" fill="#82ca9d" radius={[10, 10, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </Paper>
                </Grid>
              </Grid>

              <Grid container spacing={3} className="mt-8">
                <Grid item xs={12}>
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

              <Box className="fixed bottom-6 right-6 md:hidden">
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  onClick={() => setOpenEntryModal(true)}
                  startIcon={<AddCircleIcon />}
                  className="rounded-full shadow-lg"
                >
                  Add Entry
                </Button>
              </Box>
            </Container>
          </motion.div>
        );
      case 'reports':
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
      default:
        return null;
    }
  };


  return (
    <ThemeProvider theme={darkTheme}>
      <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: darkTheme.palette.background.default }}>
        <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={() => setOpenDrawer(true)}
              sx={{ mr: 2, display: { md: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
              <span className="font-bold text-blue-300">FinTrack</span> {activeTab === 'dashboard' ? 'Dashboard' : (activeTab === 'reports' ? 'Reports' : 'Settings')}
            </Typography>
            {userId && <Typography variant="body2" sx={{ mr: 2 }}>User ID: {userId}</Typography>}
          </Toolbar>
        </AppBar>

        <Drawer
          variant="temporary"
          open={openDrawer}
          onClose={() => setOpenDrawer(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            width: 240,
            flexShrink: 0,
            [`& .MuiDrawer-paper`]: { width: 240, boxSizing: 'border-box' },
          }}
          className="md:hidden"
        >
          <Toolbar />
          <Box sx={{ overflow: 'auto' }}>
            <List>
              <ListItem button onClick={() => { setActiveTab('dashboard'); setOpenDrawer(false); }}>
                <DashboardIcon className="mr-3" />
                <ListItemText primary="Dashboard" />
              </ListItem>
              <ListItem button onClick={() => { setOpenEntryModal(true); setOpenDrawer(false); }}>
                <AddCircleIcon className="mr-3" />
                <ListItemText primary="Add Entry" />
              </ListItem>
              <ListItem button onClick={() => { setActiveTab('reports'); setOpenDrawer(false); }}>
                <ReceiptIcon className="mr-3" />
                <ListItemText primary="Reports" />
              </ListItem>
              <ListItem button onClick={() => { setOpenSettingsModal(true); setOpenDrawer(false); }}>
                <SettingsIcon className="mr-3" />
                <ListItemText primary="Settings" />
              </ListItem>
              <ListItem button className="mt-auto">
                <LogoutIcon className="mr-3" />
                <ListItemText primary="Logout" />
              </ListItem>
            </List>
          </Box>
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            width: 240,
            flexShrink: 0,
            [`& .MuiDrawer-paper`]: { width: 240, boxSizing: 'border-box' },
          }}
          open
        >
          <Toolbar />
          <Box sx={{ overflow: 'auto' }}>
            <List>
              <ListItem button onClick={() => setActiveTab('dashboard')}>
                <DashboardIcon className="mr-3" />
                <ListItemText primary="Dashboard" />
              </ListItem>
              <ListItem button onClick={() => setOpenEntryModal(true)}>
                <AddCircleIcon className="mr-3" />
                <ListItemText primary="Add Entry" />
              </ListItem>
              <ListItem button onClick={() => setActiveTab('reports')}>
                <ReceiptIcon className="mr-3" />
                <ListItemText primary="Reports" />
              </ListItem>
              <ListItem button onClick={() => setOpenSettingsModal(true)}>
                <SettingsIcon className="mr-3" />
                <ListItemText primary="Settings" />
              </ListItem>
              <ListItem button className="mt-auto">
                <LogoutIcon className="mr-3" />
                <ListItemText primary="Logout" />
              </ListItem>
            </List>
          </Box>
        </Drawer>


        <Box
          component="main"
          sx={{ flexGrow: 1, p: 3, mt: 8, width: { sm: `calc(100% - 240px)` } }}
          className="overflow-auto"
        >
          {renderContent()}

          <Box className="fixed bottom-6 right-6 md:hidden">
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={() => setOpenEntryModal(true)}
              startIcon={<AddCircleIcon />}
              className="rounded-full shadow-lg"
            >
              Add Entry
            </Button>
          </Box>
        </Box>

        {/* Add/Edit Entry Modal */}
        <Dialog open={openEntryModal} onClose={() => setOpenEntryModal(false)} PaperProps={{ style: { borderRadius: '16px' } }}>
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
              <Button onClick={() => setOpenEntryModal(false)} variant="outlined" color="secondary">
                Cancel
              </Button>
              <Button onClick={handleAddEntry} variant="contained" color="primary">
                Add Entry
              </Button>
            </Box>
          </DialogContent>
        </Dialog>

        {/* Settings Modal */}
        <Dialog open={openSettingsModal} onClose={() => setOpenSettingsModal(false)} PaperProps={{ style: { borderRadius: '16px' } }}>
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
                    onDelete={() => handleDeleteCategory(cat)}
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
              <Button onClick={() => setOpenSettingsModal(false)} variant="outlined" color="secondary">
                Close
              </Button>
            </Box>
          </DialogContent>
        </Dialog>
      </Box>
    </ThemeProvider>
  );
}

export default Home;
