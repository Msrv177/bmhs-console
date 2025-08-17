const webAppUrl = "https://script.google.com/macros/s/AKfycbzwQflZ4WGdsmcUcL7Eyb3vPYdUjKNcAwAYCe6eL5zJZZ7zSG9Pvmj72nL1kBNk_Utbyw/exec"; // Replace with your Apps Script Web App URL

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

// Example usage:
sendEmail("msrv.live@gmail.com", "Hello", "This is a test message");
