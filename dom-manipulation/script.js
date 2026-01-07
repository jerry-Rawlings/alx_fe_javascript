// ===============================
// INITIAL SETUP & STORAGE
// ===============================

// Load quotes from localStorage or default
let quotes = JSON.parse(localStorage.getItem("quotes")) || [
  { text: "Learning never exhausts the mind.", category: "Education" },
  { text: "Talk is cheap. Show me the code.", category: "Programming" },
  { text: "Success is the sum of small efforts repeated daily.", category: "Motivation" }
];

// DOM elements
const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteButton = document.getElementById("newQuote");
const addQuoteBtn = document.getElementById("addQuoteBtn");
const exportQuotesBtn = document.getElementById("exportQuotes");
const importFileInput = document.getElementById("importFile");
const categoryFilter = document.getElementById("categoryFilter");
const syncStatus = document.getElementById("syncStatus");
const syncServerBtn = document.getElementById("syncServer");

// Server simulation
const SERVER_URL = "https://jsonplaceholder.typicode.com/posts";

// ===============================
// LOCAL STORAGE FUNCTIONS
// ===============================
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// ===============================
// RANDOM QUOTE DISPLAY
// ===============================
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

// Load last session quote if exists
const lastQuote = sessionStorage.getItem("lastQuote");
if (lastQuote) {
  const q = JSON.parse(lastQuote);
  quoteDisplay.innerHTML = `<p>"${q.text}"</p><small>Category: ${q.category}</small>`;
}

// ===============================
// ADD NEW QUOTE
// ===============================
function addQuote() {
  const textInput = document.getElementById("newQuoteText").value.trim();
  const categoryInput = document.getElementById("newQuoteCategory").value.trim();

  if (!textInput || !categoryInput) {
    alert("Please enter both quote text and category");
    return;
  }

  quotes.push({ text: textInput, category: categoryInput });
  saveQuotes();

  // Clear input fields
  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";

  populateCategories();
  filterQuotes();

  quoteDisplay.innerHTML = "<p>Quote added successfully!</p>";
}

addQuoteBtn.addEventListener("click", addQuote);

// ===============================
// JSON EXPORT / IMPORT
// ===============================
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

// ===============================
// CATEGORY FILTERING
// ===============================
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

// ===============================
// SERVER SYNC + CONFLICT RESOLUTION
// ===============================
async function syncQuotes() {
  try {
    // GET server quotes
    const res = await fetch(SERVER_URL);
    const serverData = await res.json();
    const serverQuotes = serverData.slice(0, 5).map(item => ({
      text: item.title,
      category: "Server"
    }));

    // Conflict resolution: server overrides local
    quotes = [...serverQuotes];
    saveQuotes();

    // POST local quotes to server
    await fetch(SERVER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(quotes)
    });

    populateCategories();
    filterQuotes();
    notifyUser("Quotes synced with server!");
  } catch (err) {
    console.error("Sync failed:", err);
    notifyUser("Sync failed.");
  }
}

function notifyUser(msg) {
  syncStatus.textContent = msg;
  setTimeout(() => (syncStatus.textContent = ""), 5000);
}

// Manual + periodic sync
syncServerBtn.addEventListener("click", syncQuotes);
setInterval(syncQuotes, 30000); // every 30 seconds

// ===============================
// INITIALIZATION
// ===============================
document.addEventListener("DOMContentLoaded", () => {
  populateCategories();
  filterQuotes();
  showRandomQuote();
  syncQuotes();
});
