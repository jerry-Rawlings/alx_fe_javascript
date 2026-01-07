// Quotes array (objects with text and category)
const quotes = [
  { text: "Learning never exhausts the mind.", category: "Education" },
  { text: "Talk is cheap. Show me the code.", category: "Programming" },
  { text: "Success is the sum of small efforts repeated daily.", category: "Motivation" }
];

// DOM elements
const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteBtn = document.getElementById("newQuote");

// Function to show a random quote
function showRandomQuote() {
  const randomIndex = Math.floor(Math.random() * quotes.length);
  const quote = quotes[randomIndex];

  quoteDisplay.textContent = `"${quote.text}" — ${quote.category}`;
}

// Button event listener
newQuoteBtn.addEventListener("click", showRandomQuote);

// Function to create the Add Quote form dynamically
function createAddQuoteForm() {
  const formDiv = document.createElement("div");

  const quoteInput = document.createElement("input");
  quoteInput.id = "newQuoteText";
  quoteInput.type = "text";
  quoteInput.placeholder = "Enter a new quote";

  const categoryInput = document.createElement("input");
  categoryInput.id = "newQuoteCategory";
  categoryInput.type = "text";
  categoryInput.placeholder = "Enter quote category";

  const addButton = document.createElement("button");
  addButton.textContent = "Add Quote";
  addButton.addEventListener("click", addQuote);

  formDiv.appendChild(quoteInput);
  formDiv.appendChild(categoryInput);
  formDiv.appendChild(addButton);

  document.body.appendChild(formDiv);
}

// Function to add a new quote
function addQuote() {
  const text = document.getElementById("newQuoteText").value.trim();
  const category = document.getElementById("newQuoteCategory").value.trim();

  if (text === "" || category === "") {
    alert("Please fill in both fields");
    return;
  }

  quotes.push({ text, category });

  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";

  quoteDisplay.textContent = "Quote added successfully!";
}

// Create the form on page load
createAddQuoteForm();
