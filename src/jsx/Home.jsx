import React, { useState, useEffect, useMemo } from 'react';
import { AppBar, Toolbar, Typography, IconButton, Drawer, List, ListItem, ListItemText, Box, Container, Paper, Grid, Button, Dialog, DialogTitle, DialogContent, TextField, MenuItem, Select, InputLabel, FormControl, Divider, Chip, TableContainer, Table, TableHead, TableBody, TableRow, TableCell, DialogActions } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import ReceiptIcon from '@mui/icons-material/Receipt';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import DeleteIcon from '@mui/icons-material/Delete';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'; // New icon for MonthWise
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { motion } from 'framer-motion'; 
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, onSnapshot, query, setDoc, doc, deleteDoc, getDoc, orderBy } from 'firebase/firestore'; 
import { db } from "../firebase-config";
import { useNavigate } from "react-router-dom";

// Import the new components
import Dashboard from './Dashboard';
import Reports from './Reports';
import AddEntryModal from './AddEntryModal';
import SettingsModal from './SettingsModal';
import ConfirmModals from './ConfirmModals';
import MonthWise from './MonthWise';

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

function Home( { mail } ) {
  const [openDrawer, setOpenDrawer] = useState(false);
  const [openEntryModal, setOpenEntryModal] = useState(false);
  const [openSettingsModal, setOpenSettingsModal] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [entryType, setEntryType] = useState('Expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [remarks, setRemarks] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]); 
  const [entries, setEntries] = useState([]);
  const [userId, setUserId] = useState(null);
  const navigate = useNavigate();  

  const [incomeCategories, setIncomeCategories] = useState([]);
  const [expenseCategories, setExpenseCategories] = useState([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [activeSettingsTab, setActiveSettingsTab] = useState('Income');
  const [openConfirmModal, setOpenConfirmModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [openEntryConfirmModal, setOpenEntryConfirmModal] = useState(false);
  const [entryIdToDelete, setEntryIdToDelete] = useState(null);

  const defaultIncomeCategories = ['Salary', 'Freelance', 'Investment', 'Gift', 'Bonus', 'Other Income'];
  const defaultExpenseCategories = ['Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Education', 'Health', 'Rent', 'Other Expense'];

  useEffect(() => {
    if (!mail) {
      navigate("/Login");
      return;
    }

    const auth = getAuth();
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        setUserId(null);
      }
    });

    const categoriesDocRef = doc(db, mail, 'IncomCategoryList');
    const unsubscribeIncomeCats = onSnapshot(categoriesDocRef, async (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setIncomeCategories(data.categories || []);
      } else {
        await setDoc(categoriesDocRef, { categories: defaultIncomeCategories });
        setIncomeCategories(defaultIncomeCategories);
      }
    });

    const expenseCatsDocRef = doc(db, mail, 'ExpenseCategoryList');
    const unsubscribeExpenseCats = onSnapshot(expenseCatsDocRef, async (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setExpenseCategories(data.categories || []);
      } else {
        await setDoc(expenseCatsDocRef, { categories: defaultExpenseCategories });
        setExpenseCategories(defaultExpenseCategories);
      }
    });

    const userCollectionRef = collection(db, mail);
    const entriesQuery = query(userCollectionRef, orderBy("date", "asc"));
    const unsubscribeEntries = onSnapshot(entriesQuery, (snapshot) => {
      const fetchedEntries = snapshot.docs
        .filter((doc) => !["IncomCategoryList", "ExpenseCategoryList"].includes(doc.id))
        .map((doc) => ({ id: doc.id, ...doc.data() }));
      setEntries(fetchedEntries);
    });

    return () => {
      unsubscribeAuth();
      unsubscribeEntries();
      unsubscribeIncomeCats();
      unsubscribeExpenseCats();
    };
  }, [mail, navigate]);

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
      console.log(`Successfully added new category: ${newCategoryName} to Firebase at ${docRef.path}`);
    } catch (e) {
      console.error("Error adding category: ", e);
    }
  };

  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return;
    const categoryType = activeSettingsTab === 'Income' ? 'IncomCategoryList' : 'ExpenseCategoryList';
    const categories = activeSettingsTab === 'Income' ? incomeCategories : expenseCategories;
    const docRef = doc(db, mail, categoryType);
    const newCategories = categories.filter(cat => cat !== categoryToDelete);
    try {
      await setDoc(docRef, { categories: newCategories }, { merge: true });
      setOpenConfirmModal(false);
      setCategoryToDelete(null);
      console.log(`Successfully deleted category: ${categoryToDelete}`);
    } catch (e) {
      console.error("Error deleting category: ", e);
    }
  };

  const handleConfirmDelete = (category) => {
    setCategoryToDelete(category);
    setOpenConfirmModal(true);
  };

  const handleAddEntry = async () => {
    if (!mail || !amount || !category) {
      console.warn("User email, amount, or category not available. Cannot save entry.");
      return;
    }
    if (!category.trim()) {
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

  const handleDeleteEntry = (entryId) => {
    setEntryIdToDelete(entryId);
    setOpenEntryConfirmModal(true);
  };

  const handleConfirmDeleteEntry = async () => {
    if (!entryIdToDelete) return;
    try {
      await deleteDoc(doc(db, mail, entryIdToDelete));
      console.log("Document successfully deleted!");
      setOpenEntryConfirmModal(false);
      setEntryIdToDelete(null);
    } catch (error) {
      console.error("Error removing document: ", error);
    }
  };
  
  const handleLogout = () => {
    localStorage.clear();
    navigate("/Login");
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard entries={entries} />;
      case 'reports':
        return <Reports entries={entries} handleDeleteEntry={handleDeleteEntry} darkTheme={darkTheme} />;
      case 'monthwise':
        return <MonthWise entries={entries} darkTheme={darkTheme} handleDeleteEntry={handleDeleteEntry} />;
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
              <span className="font-bold text-blue-300">FinTrack</span> {activeTab === 'dashboard' ? 'Dashboard' : (activeTab === 'reports' ? 'Reports' : (activeTab === 'monthwise' ? 'Monthly Analysis' : 'Settings'))}
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
              <ListItem button onClick={() => { setActiveTab('monthwise'); setOpenDrawer(false); }}>
                <CalendarMonthIcon className="mr-3" />
                <ListItemText primary="MonthWise" />
              </ListItem>
              <ListItem button onClick={() => { setOpenSettingsModal(true); setOpenDrawer(false); }}>
                <SettingsIcon className="mr-3" />
                <ListItemText primary="Settings" />
              </ListItem>
              <ListItem button onClick={handleLogout} className="mt-auto">
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
              <ListItem button onClick={() => setActiveTab('monthwise')}>
                <CalendarMonthIcon className="mr-3" />
                <ListItemText primary="MonthWise" />
              </ListItem>
              <ListItem button onClick={() => setOpenSettingsModal(true)}>
                <SettingsIcon className="mr-3" />
                <ListItemText primary="Settings" />
              </ListItem>
              <ListItem button onClick={handleLogout} className="mt-auto">
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

        <AddEntryModal
          open={openEntryModal}
          setOpen={setOpenEntryModal}
          entryType={entryType}
          setEntryType={setEntryType}
          amount={amount}
          setAmount={setAmount}
          category={category}
          setCategory={setCategory}
          remarks={remarks}
          setRemarks={setRemarks}
          date={date}
          setDate={setDate}
          handleAddEntry={handleAddEntry}
          categoryOptions={entryType === 'Income' ? incomeCategories : expenseCategories}
          darkTheme={darkTheme}
        />

        <SettingsModal
          open={openSettingsModal}
          setOpen={setOpenSettingsModal}
          activeSettingsTab={activeSettingsTab}
          setActiveSettingsTab={setActiveSettingsTab}
          incomeCategories={incomeCategories}
          expenseCategories={expenseCategories}
          newCategoryName={newCategoryName}
          setNewCategoryName={setNewCategoryName}
          handleAddCategory={handleAddCategory}
          handleConfirmDelete={handleConfirmDelete}
          darkTheme={darkTheme}
        />

        <ConfirmModals
          openConfirmModal={openConfirmModal}
          setOpenConfirmModal={setOpenConfirmModal}
          categoryToDelete={categoryToDelete}
          handleDeleteCategory={handleDeleteCategory}
          openEntryConfirmModal={openEntryConfirmModal}
          setOpenEntryConfirmModal={setOpenEntryConfirmModal}
          handleConfirmDeleteEntry={handleConfirmDeleteEntry}
        />

      </Box>
    </ThemeProvider>
  );
}

export default Home;
