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
    Avatar,
    IconButton,
    Snackbar,
} from '@mui/material';
import { motion } from 'framer-motion';
import { Edit } from '@mui/icons-material';
import { doc, setDoc } from 'firebase/firestore';

// The Google Apps Script Web App URL
const webAppUrl = "https://script.google.com/macros/s/AKfycbzwQflZ4WGdsmcUcL7Eyb3vPYdUjKNcAwAYCe6eL5zJZZ7zSG9Pvmj72nL1kBNk_Utbyw/exec";

// Function to send email using the Apps Script Web App
async function sendEmail(email, subject, body) {
  const url = `${webAppUrl}?email=${encodeURIComponent(email)}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  try {
    const response = await fetch(url);
    const result = await response.json();
    console.log(result); // { success: true/false, message: "..." }
    return result;
  } catch (err) {
    console.error("Error:", err.message);
    return { success: false, message: err.message };
  }
}

const ProfileModal = ({ open, setOpen, userEmail, darkTheme, db, collectionName, Personal_Data }) => {
    const [feedback, setFeedback] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [userName, setUserName] = useState(userEmail || '');
    const [profilePhoto, setProfilePhoto] = useState('');
    const [fileToUpload, setFileToUpload] = useState(null);
    const [openFeedbackSnackbar, setOpenFeedbackSnackbar] = useState(false);
    const [feedbackMessage, setFeedbackMessage] = useState('');
    const [isSavingProfile, setIsSavingProfile] = useState(false);
    const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

    // Use a useEffect hook to update state when Personal_Data prop changes
    useEffect(() => {
        if (Personal_Data) {
            setUserName(Personal_Data.userName || userEmail);
            setProfilePhoto(Personal_Data.profilePhoto || '');
        }
    }, [Personal_Data, userEmail]);

    // Save profile changes to Firebase
    const handleSaveProfile = async () => {
        if (!userName.trim()) return;
        setIsSavingProfile(true);

        try {
            // The profilePhoto state already holds the Base64 data URL
            const photoData = profilePhoto;

            // Save the user data to Firestore
            const userDocRef = doc(db, collectionName, 'Personal_Data');
            await setDoc(userDocRef, {
                userName: userName,
                profilePhoto: photoData // Save the Base64 string directly
            }, { merge: true });

            console.log('Profile saved successfully!');
            setIsEditing(false);
        } catch (error) {
            console.error("Error saving profile:", error);
        } finally {
            setIsSavingProfile(false);
        }
    };

    // Send feedback using the Apps Script Web App, now including user details
    const handleSendFeedback = async () => {
        if (!feedback.trim()) return;
        setIsSubmittingFeedback(true);

        try {
            const feedbackBody = `User Name: ${userName}\nUser Email: ${userEmail}\n\nFeedback:\n${feedback}`;
            const result = await sendEmail(userEmail, "BudgetWing App Feedback", feedbackBody);
            
            if (result.success) {
                setFeedbackMessage('Thank you for your feedback!');
                setFeedback('');
            } else {
                setFeedbackMessage('Failed to submit feedback. Please try again.');
            }
            setOpenFeedbackSnackbar(true);
        } catch (error) {
            console.error("Error submitting feedback:", error);
            setFeedbackMessage('Failed to submit feedback. Please try again.');
            setOpenFeedbackSnackbar(true);
        } finally {
            setIsSubmittingFeedback(false);
        }
    };

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFileToUpload(file); // Store the file for upload
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfilePhoto(reader.result); // Set the preview photo with a data URL
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCloseSnackbar = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setOpenFeedbackSnackbar(false);
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
            <DialogTitle className="text-white bg-gray-800 rounded-t-2xl">
                User Profile
                <IconButton
                    onClick={() => setIsEditing(!isEditing)}
                    sx={{ position: 'absolute', right: 8, top: 8, color: darkTheme.palette.text.secondary }}
                >
                    <Edit />
                </IconButton>
            </DialogTitle>
            <DialogContent className="bg-gray-800 p-6">
                {/* Profile Section */}
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 2, mb: 4 }}>
                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                        <label htmlFor="profile-photo-upload">
                            <Avatar
                                sx={{
                                    width: 80,
                                    height: 80,
                                    mb: 2,
                                    bgcolor: darkTheme.palette.secondary.main,
                                    fontSize: '2rem',
                                    border: `2px solid ${darkTheme.palette.primary.main}`,
                                    cursor: isEditing ? 'pointer' : 'default',
                                }}
                                src={profilePhoto}
                            >
                                {!profilePhoto && (userName ? userName.charAt(0).toUpperCase() : '?')}
                            </Avatar>
                        </label>
                        {isEditing && (
                            <input
                                type="file"
                                id="profile-photo-upload"
                                style={{ display: 'none' }}
                                onChange={handlePhotoChange}
                                accept="image/*"
                            />
                        )}
                    </motion.div>

                    {isEditing ? (
                        <TextField
                            value={userName}
                            onChange={(e) => setUserName(e.target.value)}
                            fullWidth
                            variant="outlined"
                            label="User Name"
                            sx={{ mt: 2 }}
                            InputLabelProps={{ style: { color: darkTheme.palette.text.secondary } }}
                            inputProps={{ style: { color: 'white', textAlign: 'center' } }}
                        />
                    ) : (
                        <Typography variant="h6" className="text-white mb-1">
                            {userName}
                        </Typography>
                    )}
                    <Typography variant="body2" className="text-gray-400">
                        {userEmail}
                    </Typography>
                </Box>
                {isEditing && (
                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                        <Button
                            onClick={handleSaveProfile}
                            variant="contained"
                            color="primary"
                            disabled={!userName.trim() || isSavingProfile}
                        >
                            {isSavingProfile ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </Box>
                )}

                {/* Feedback Section */}
                <Box sx={{ mt: 4 }}>
                    <Typography variant="h6" className="text-white font-semibold mb-2">
                        Feedback & Suggestions
                    </Typography>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="feedback"
                        label="Your Feedback"
                        type="text"
                        fullWidth
                        multiline
                        rows={4}
                        variant="outlined"
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        InputLabelProps={{ style: { color: darkTheme.palette.text.secondary } }}
                        sx={{
                            input: { color: 'white' },
                            '& .MuiOutlinedInput-root': {
                                '& fieldset': {
                                    borderColor: darkTheme.palette.text.secondary,
                                },
                                '&:hover fieldset': {
                                    borderColor: darkTheme.palette.primary.main,
                                },
                                '&.Mui-focused fieldset': {
                                    borderColor: darkTheme.palette.primary.main,
                                },
                            },
                        }}
                    />
                </Box>
            </DialogContent>
            <DialogActions className="bg-gray-800 p-4 rounded-b-2xl">
                <Button onClick={() => setOpen(false)} variant="outlined" color="secondary">
                    Close
                </Button>
                <Button
                    onClick={handleSendFeedback}
                    variant="contained"
                    color="primary"
                    disabled={!feedback.trim() || isSubmittingFeedback}
                >
                    {isSubmittingFeedback ? 'Submitting...' : 'Submit Feedback'}
                </Button>
            </DialogActions>
            <Snackbar
                open={openFeedbackSnackbar}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                message={feedbackMessage}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            />
        </Dialog>
    );
};

export default ProfileModal;
