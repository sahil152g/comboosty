// 🧠 Chat memory
let history = [];

// 📩 Send user message to backend
async function getAiResponse(userInput) {
  history.push({ role: 'user', content: userInput });

  const response = await fetch('/ask-gemini', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      question: userInput,
      history: history
    })
  });

  const data = await response.json();
  const aiReply = data.answer || "No response from Commerce Booster.";

  history.push({ role: 'model', content: aiReply }); // Save AI reply

  return aiReply;
}

// 💬 Example usage: replace this with your button/input code
document.getElementById('sendBtn').addEventListener('click', async () => {
  const input = document.getElementById('userInput');
  const userMessage = input.value.trim();
  if (!userMessage) return;

  // Show user message
  showMessage(userMessage, 'user');
  input.value = '';

  // Get AI response
  const aiReply = await getAiResponse(userMessage);
  showMessage(aiReply, 'bot');
});

// 🖼️ Display messages
function showMessage(msg, sender) {
  const chatBox = document.getElementById('chatBox');
  const msgDiv = document.createElement('div');
  msgDiv.className = sender;
  msgDiv.innerHTML = msg.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>'); // support **bold**
  chatBox.appendChild(msgDiv);
  chatBox.scrollTop = chatBox.scrollHeight;
}