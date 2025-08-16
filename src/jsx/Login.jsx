import React, { useState, useEffect } from 'react';
import { Mail, Lock, CheckCircle, XCircle, Loader2 } from 'lucide-react'; // Importing icons
import { app, database, db, storage } from '../firebase-config';
import { collection, query, where, getDocs } from "firebase/firestore";
import { checkUserByMailInDb, saveUserData } from '../utility'; 
import { useNavigate } from "react-router-dom";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";  

export default function LoginPage( { setMail  }) {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.classList.add("dark");

    const mail = localStorage.getItem("email");
    if (mail) {
      (async () => {
        try {
          const result = await checkUserByMailInDb(mail);
          console.log("User check result:", result);

          if (result) { 
            setMail(mail); // ✅ set mail if user exists
            navigate("/Home"); // ✅ redirect if user exists
          } else {
            setLoading(false); // show login
          }
        } catch (error) {
          console.error("Error checking user:", error);
          setLoading(false);
        }
      })();
    } else {
      setLoading(false); // no mail, show login
    }
  }, [navigate]);


  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4 transition-colors duration-300">
      {loading ? (
        <Box className="min-h-screen flex items-center justify-center bg-gray-900">
            <CircularProgress color="inherit" />
        </Box>
      ) : <Login setMail={setMail} /> }

    </div>
  );
}

 
function Login( { setMail } ) {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [serverOtp, setServerOtp] = useState(null); // Stores OTP received from server
  const [isOtpSent, setIsOtpSent] = useState(false); // Flag to control UI flow
  const [loading, setLoading] = useState(false); // Loading state for API calls
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();
    // Function to handle requesting the OTP
    const handleRequestOtp = async (e) => {
        e.preventDefault();
        setErrorMessage('');
        setSuccessMessage('');

        if (!email) {
        setErrorMessage('Please enter your email address.');
        return;
        }

        setLoading(true); // Start loading

        try {
        // Construct the API URL with the encoded email
        const apiUrl = `https://script.google.com/macros/s/AKfycbzFxptwCpZreyB6msSiRopRi8FrXOrsAbkGYdqxbGcJVR-YekxpKPgzqC_exKN8EnyAoQ/exec?email=${encodeURIComponent(email)}`;

        // Fetch the OTP from the Google Apps Script
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (data.success) {
            setServerOtp(data.otp); // Store the OTP from the server
            setIsOtpSent(true); // Move to OTP verification step
            setSuccessMessage('OTP sent to your email. Please check your inbox.');
        } else {
            setErrorMessage(data.message || 'Failed to send OTP. Please try again.');
        }
        } catch (error) {
        console.error('Error requesting OTP:', error);
        setErrorMessage('Network error or unable to reach the server. Please try again.');
        } finally {
        setLoading(false); // End loading
        }
    };

    // Function to handle OTP verification and login
    const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!otp) {
        setErrorMessage('Please enter the OTP.');
        return;
    }

    const enteredOtp = parseInt(otp, 10);

    if (enteredOtp === serverOtp) {
        try {
        setSuccessMessage('Login successful! Redirecting to Home...');
        localStorage.setItem('email', email);

        // ✅ Await saving user data
        await saveUserData({ mail: email, creationDate: Date.now() });
        setMail(email); // Set the email in the parent component   
        setTimeout(() => {
            console.log('Redirecting to home...');
            navigate("/Home");
        }, 1500);
        } catch (error) {
        console.error("Error saving user:", error);
        setErrorMessage("Something went wrong while saving user data.");
        }
    } else {
        setErrorMessage('Invalid OTP. Please try again.');
    }
    };


  return (
    <div className="relative bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-md mx-auto transform transition-transform duration-300 border border-gray-700">
      <h2 className="text-3xl font-extrabold text-center text-white mb-6">
        Welcome to BudgetWiz 💰
      </h2>
      <p className="text-center text-gray-400 mb-8">
        Your personal budget planner. Please log in with OTP to continue.
      </p>

      {/* Error and Success Messages */}
      {errorMessage && (
        <div
          className="bg-red-900 border border-red-700 text-red-300 px-4 py-3 rounded-lg relative mb-4 flex items-center"
          role="alert"
        >
          <XCircle className="h-5 w-5 mr-2" />
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline ml-2">{errorMessage}</span>
        </div>
      )}
      {successMessage && (
        <div
          className="bg-green-900 border border-green-700 text-green-300 px-4 py-3 rounded-lg relative mb-4 flex items-center"
          role="alert"
        >
          <CheckCircle className="h-5 w-5 mr-2" />
          <strong className="font-bold">Success!</strong>
          <span className="block sm:inline ml-2">{successMessage}</span>
        </div>
      )}

      <form onSubmit={isOtpSent ? handleVerifyOtp : handleRequestOtp} className="space-y-6">
        {!isOtpSent ? (
          /* Email Input and Request OTP Button */
          <>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                Email address
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-500" aria-hidden="true" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-600 rounded-md shadow-sm placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-gray-700 text-white"
                  placeholder="you@example.com"
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-900 transition-all duration-300 transform hover:scale-105"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="animate-spin mr-2 h-5 w-5" />
                ) : null}
                Request OTP
              </button>
            </div>
          </>
        ) : (
          /* OTP Input and Verify OTP Button */
          <>
            <p className="text-center text-sm text-gray-400">
              An OTP has been sent to <span className="font-semibold text-white">{email}</span>. Please enter it below.
            </p>
            <div>
              <label htmlFor="otp" className="block text-sm font-medium text-gray-300 mb-1">
                Enter OTP
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-500" aria-hidden="true" />
                </div>
                <input
                  id="otp"
                  name="otp"
                  type="number" // Use type number for OTP
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-600 rounded-md shadow-sm placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-gray-700 text-white"
                  placeholder="••••"
                  disabled={loading}
                  maxLength="6" // Assuming OTP is typically 4-6 digits
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-green-600 to-teal-700 hover:from-green-700 hover:to-teal-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:focus:ring-offset-gray-900 transition-all duration-300 transform hover:scale-105"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="animate-spin mr-2 h-5 w-5" />
                ) : null}
                Verify OTP & Log In
              </button>
            </div>
            <button
              type="button"
              onClick={() => {
                setIsOtpSent(false); // Go back to email input
                setOtp('');
                setServerOtp(null);
                setErrorMessage('');
                setSuccessMessage('');
              }}
              className="w-full flex justify-center py-2 px-4 border border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-300 bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 dark:focus:ring-offset-gray-900 transition-all duration-300 mt-4"
            >
              Back to Email
            </button>
          </>
        )}
      </form>
    </div>
  );
}

