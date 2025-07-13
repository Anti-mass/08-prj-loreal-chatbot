// Get DOM elements
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");

// This array will store the conversation history for context
let conversationHistory = [
  {
    role: "system",
    content:
      "You are a helpful assistant for L’Oréal. Only answer questions related to L’Oréal products, beauty routines, skincare, haircare, and product recommendations. If a question is not about L’Oréal or beauty advice, politely guide the user back to topics about L’Oréal products and routines.",
  },
];

// Show a welcome message when the page loads
chatWindow.innerHTML = `<div class="msg ai">👋 Hello! How can I help you today?</div>`;

// Function to add a chat bubble to the chat window
function addMessage(text, sender) {
  // sender: "user" or "ai"
  const msgDiv = document.createElement("div");
  msgDiv.className = `msg ${sender}`;
  msgDiv.textContent = text;
  chatWindow.appendChild(msgDiv);
  chatWindow.scrollTop = chatWindow.scrollHeight; // Scroll to bottom
}

// Listen for form submit
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const message = userInput.value.trim();
  if (!message) return;

  // Add user's message to the conversation history
  conversationHistory.push({ role: "user", content: message });

  // Show user's message in the chat window
  addMessage(message, "user");
  userInput.value = "";

  // Show a loading message while waiting for the AI
  addMessage("...", "ai");

  try {
    // Make the API call with the full conversation history for context
    const response = await fetch("https://lorealbot.oosawe.workers.dev/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: conversationHistory,
        max_tokens: 150,
      }),
    });

    const data = await response.json();

    // Remove the loading message
    const loadingMsg = chatWindow.querySelector(".msg.ai:last-child");
    if (loadingMsg && loadingMsg.textContent === "...") {
      chatWindow.removeChild(loadingMsg);
    }

    // Show the AI's response in the chat window and add it to the conversation history
    if (data.choices && data.choices[0] && data.choices[0].message) {
      const aiMessage = data.choices[0].message.content;
      addMessage(aiMessage, "ai");
      conversationHistory.push({ role: "assistant", content: aiMessage });
    } else {
      addMessage("Sorry, I couldn't get a response. Please try again.", "ai");
    }
  } catch (error) {
    // Remove the loading message if there's an error
    const loadingMsg = chatWindow.querySelector(".msg.ai:last-child");
    if (loadingMsg && loadingMsg.textContent === "...") {
      chatWindow.removeChild(loadingMsg);
    }
    // Print error details to the console for debugging
    console.error("OpenAI API error:", error);
    addMessage("There was an error connecting to the API.", "ai");
  }
});
