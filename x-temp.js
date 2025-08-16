
async function sendOtp(email) {
  try {
    const url = `https://script.google.com/macros/s/AKfycbzFxptwCpZreyB6msSiRopRi8FrXOrsAbkGYdqxbGcJVR-YekxpKPgzqC_exKN8EnyAoQ/exec?email=${encodeURIComponent(email)}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.success) {
      console.log("OTP sent successfully:", data.otp); 
      alert("OTP sent to your email!");
    } else {
      console.error("Error:", data.message);
      alert("Failed to send OTP: " + data.message);
    }
  } catch (error) {
    console.error("Request failed:", error);
    alert("Something went wrong. Please try again.");
  }
}


sendOtp("msrv.live@gmail.com")