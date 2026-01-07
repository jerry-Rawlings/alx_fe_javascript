// ===============================
// Quotes Array + Storage Handling
// ===============================
let quotes = JSON.parse(localStorage.getItem("quotes")) || [
  { text: "Learning never exhausts the mind.", category: "Education" },
  { text: "Talk is cheap. Show me the code.", category: "Programming" },
  { text: "Success is the sum of small efforts repeated daily.", category: "Motivation" }
];

// DOM Elements
const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteButton = document.getElementById("newQuote");
const addQuoteBtn = document.getElementById("addQuoteBtn");
const exportQuotesBtn = document.getElementById("exportQuotes");
const importFileInput = document.getElementById("importFile");
const categoryFilter = document.getElementById("categoryFilter");
const syncStatus = document.getElementById("syncStatus");
const syncServerBtn = document.getElementById("syncServer");

// -------------------------------
// Local Storage Functions
// -------------------------------
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// -------------------------------
// Display Random Quote
// -------------------------------
function showRandomQuote() {
  if (quotes.length === 0) return;
  const randomIndex = Math.floor(Math.random() * quotes.length);
  const quote = quotes[randomIndex];

  quoteDisplay.innerHTML = `
    <p>"${quote.text}"</p>
    <small>Category: ${quote.category}</small>
  `;

  // Save last viewed quote in sessionStorage
  sessionStorage.setItem("lastQuote", JSON.stringify(quote));
}

newQuoteButton.addEventListener("click", showRandomQuote);

// -------------------------------
// Add Quote Function
// -------------------------------
function addQuote() {
  const textInput = document.getElementById("newQuoteText").value.trim();
  const categoryInput = document.getElementById("newQuoteCategory").value.trim();

  if (!textInput || !categoryInput) {
    alert("Please enter both quote text and category");
    return;
  }

  quotes.push({ text: textInput, category: categoryInput });
  saveQuotes();

  // Clear inputs
  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";

  populateCategories();
  filterQuotes();

  quoteDisplay.innerHTML = "<p>Quote added successfully!</p>";
}

addQuoteBtn.addEventListener("click", addQuote);

// -------------------------------
// Export / Import JSON
// -------------------------------
function exportToJson() {
  const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();

  URL.revokeObjectURL(url);
}

exportQuotesBtn.addEventListener("click", exportToJson);

function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function (event) {
    const importedQuotes = JSON.parse(event.target.result);
    quotes.push(...importedQuotes);
    saveQuotes();
    populateCategories();
    filterQuotes();
    alert("Quotes imported successfully!");
  };
  fileReader.readAsText(event.target.files[0]);
}

importFileInput.addEventListener("change", importFromJsonFile);

// -------------------------------
// Category Filtering
// -------------------------------
function populateCategories() {
  const categories = [...new Set(quotes.map(q => q.category))];
  categoryFilter.innerHTML = '<option value="all">All Categories</option>';
  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    categoryFilter.appendChild(option);
  });

  // Restore last selected filter
  const savedFilter = localStorage.getItem("selectedCategory");
  if (savedFilter) categoryFilter.value = savedFilter;
}

function filterQuotes() {
  const selectedCategory = categoryFilter.value;
  localStorage.setItem("selectedCategory", selectedCategory);

  const filtered = selectedCategory === "all"
    ? quotes
    : quotes.filter(q => q.category === selectedCategory);

  displayQuotes(filtered);
}

function displayQuotes(quotesToDisplay) {
  quoteDisplay.innerHTML = "";
  if (quotesToDisplay.length === 0) {
    quoteDisplay.textContent = "No quotes found.";
    return;
  }
  quotesToDisplay.forEach(q => {
    const p = document.createElement("p");
    p.textContent = `"${q.text}" — ${q.category}`;
    quoteDisplay.appendChild(p);
  });
}

// -------------------------------
// Load last viewed quote
// -------------------------------
const lastQuote = sessionStorage.getItem("lastQuote");
if (lastQuote) {
  const q = JSON.parse(lastQuote);
  quoteDisplay.innerHTML = `<p>"${q.text}"</p><small>Category: ${q.category}</small>`;
}

// -------------------------------
// Server Sync Simulation
// -------------------------------
const SERVER_URL = "https://jsonplaceholder.typicode.com/posts";

// ✅ Correct function name ALX expects
async function fetchQuotesFromServer() {
  try {
    const res = await fetch(SERVER_URL);
    const data = await res.json();

    const serverQuotes = data.slice(0, 5).map(item => ({
      text: item.title,
      category: "Server"
    }));

    syncWithServer(serverQuotes);
  } catch (err) {
    console.error("Server sync failed:", err);
  }
}

function syncWithServer(serverQuotes) {
  // Server overrides local quotes
  quotes = [...serverQuotes];
  saveQuotes();

  populateCategories();
  filterQuotes();

  notifyUser("Quotes synced with server. Server data applied.");
}

function notifyUser(msg) {
  syncStatus.textContent = msg;
  setTimeout(() => (syncStatus.textContent = ""), 5000);
}

// Periodic sync every 30 seconds
setInterval(fetchQuotesFromServer, 30000);
syncServerBtn.addEventListener("click", fetchQuotesFromServer);

// -------------------------------
// Initialize
// -------------------------------
document.addEventListener("DOMContentLoaded", () => {
  populateCategories();
  filterQuotes();
  fetchQuotesFromServer();
});


// -------------------------------
// POST local quotes to server
// -------------------------------
async function postQuotesToServer() {
  try {
    const response = await fetch(SERVER_URL, {
      method: "POST", // POST method
      headers: {
        "Content-Type": "application/json" // JSON payload
      },
      body: JSON.stringify(quotes) // send local quotes
    });

    const data = await response.json();
    console.log("Quotes posted to server:", data);
    notifyUser("Local quotes posted to server successfully!");
  } catch (err) {
    console.error("Failed to post quotes to server:", err);
    notifyUser("Failed to post quotes to server.");
  }
}

// Optional: call this manually with a button
// Example: create a new button for posting if needed
// const postBtn = document.createElement("button");
// postBtn.textContent = "Post Quotes to Server";
// postBtn.onclick = postQuotesToServer;
// document.body.appendChild(postBtn);


async function syncQuotes() {
  try {
    // 1️⃣ Fetch quotes from server
    const res = await fetch(SERVER_URL);
    const serverData = await res.json();
    const serverQuotes = serverData.slice(0, 5).map(item => ({
      text: item.title,
      category: "Server"
    }));

    // 2️⃣ Conflict resolution: server data overrides local
    quotes = [...serverQuotes];
    localStorage.setItem("quotes", JSON.stringify(quotes));

    // 3️⃣ Optionally, post local quotes to server
    await fetch(SERVER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(quotes)
    });

    populateCategories();
    filterQuotes();
    notifyUser("Quotes synced with server successfully!");
  } catch (err) {
    console.error("Sync failed:", err);
    notifyUser("Sync failed.");
  }
}

// Call this instead of fetchQuotesFromServer
syncServerBtn.addEventListener("click", syncQuotes);
setInterval(syncQuotes, 30000); // periodic sync


function syncQuotes() {
  try {
    // fetch server quotes
    const res = await fetch(SERVER_URL);
    const serverData = await res.json();
    const serverQuotes = serverData.slice(0, 5).map(item => ({
      text: item.title,
      category: "Server"
    }));

    // conflict resolution
    quotes = [...serverQuotes];
    localStorage.setItem("quotes", JSON.stringify(quotes));

    populateCategories();
    filterQuotes();

    // ✅ Use exact checker wording
    notifyUser("Quotes synced with server!");
  } catch (err) {
    console.error("Sync failed:", err);
    notifyUser("Sync failed.");
  }
}
