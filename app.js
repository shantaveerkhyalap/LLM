require("dotenv").config();
const express = require("express");

const app = express();
app.use(express.json());

console.log("GEMINI KEY:", process.env.GEMINI_API_KEY);

app.post("/api/ai", async (req, res) => {
  try {
    const userPrompt = req.body.prompt;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: userPrompt }]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 256
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_NONE"
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_NONE"
            },
            {
              category: "HARM_CATEGORY_SEXUAL_CONTENT",
              threshold: "BLOCK_NONE"
            },
            {
              category: "HARM_CATEGORY_DANGEROUS_CONTENT",
              threshold: "BLOCK_NONE"
            }
          ]
        })
      }
    );

    const data = await response.json();

    // 🔍 Log Gemini response (keep for debugging)
    console.log("🤖 FULL GEMINI RESPONSE:");
    console.log(JSON.stringify(data, null, 2));

    let aiReply = "No response";

    if (data.candidates?.length > 0) {
      const parts = data.candidates[0].content?.parts;
      if (parts?.length > 0) {
        aiReply = parts.map(p => p.text).join("");
      }
    }

    console.log("\n🤖 AI REPLY:\n", aiReply);
    res.json({ reply: aiReply });

  } catch (err) {
    console.error("❌ ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000, () => {
  console.log("🚀 Server running at http://localhost:3000");
});
