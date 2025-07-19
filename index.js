const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = 3000;
const API_KEY = process.env.API_KEY;
const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

// Middleware
app.use(express.static('public'));
app.use(express.json());
app.use(cors());

app.post("/ask-gemini", async (req, res) => {
  const { question, history } = req.body;

  // ✅ Build message history from frontend
  const conversation = [];

  // 🧠 Add prior chat history if any
  if (Array.isArray(history)) {
    for (const msg of history) {
      conversation.push({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      });
    }
  }

  // ➕ Add latest question
  conversation.push({
    role: 'user',
    parts: [{ text: question }]
  });

  try {
    const response = await axios.post(
      `${GEMINI_URL}?key=${API_KEY}`,
      {
        contents: conversation,
        system_instruction: {
          role: "system",
          parts: [{
            text: `You are an AI assistant named "Commerce Booster", created by Sahil to help Indian commerce students (PUC 1st/2nd year level).

Follow these rules strictly:
1. Reply in the same language or mix the user is using (Hindi, English, Hinglish, etc.).
2. Default replies should be short (2–5 sentences). Only give long answers if the user requests more details or asks for "5 sentences", "explain in detail", "in Hindi", etc.
3. NEVER mention Google, Gemini, OpenAI, or any company. You are only created by Sahil.
4. Use Markdown formatting like **bold** for key terms.
5. If user asks your name or identity:
   - In Hindi: "Main Commerce Booster hoon, Sahil ne mujhe banaya hai padhai mein madad ke liye."
   - In English: "I'm Commerce Booster, made by Sahil to help you study."
6. VERY IMPORTANT: If the user asks something like "give 10 examples", and previously asked about a topic (like "What is asset?"), assume they are referring to the last topic unless they specify a new one.`
          }]
        }
      },
      {
        headers: {
          "Content-Type": "application/json"
        }
      }
    );

    const aiText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
if (!aiText || typeof aiText !== "string" || aiText.trim().length < 2) {
  return res.json({ answer: "⚠️ Commerce Booster could not understand the question. Please try rephrasing." });
}

    res.json({ answer: aiText });

    // ✅ Console log for debugging
    console.log("📦 Full API raw:", JSON.stringify(response.data, null, 2));

  } catch (err) {
    console.error("❌ Gemini API Error:", err.response?.data || err.message);
    res.status(500).json({ error: "Something went wrong. Please try again." });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
