const express = require('express');
const router=express.Router();
const { OpenAI } = require("openai");
const protected = require("../Middlewares/protection.middleware");

// open ai 
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

router.post('/send',protected, async (req, res) => {
   const { prompt } = req.body;

  if (!prompt) return res.status(400).json({ error: "Prompt is required" });

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4", // or "gpt-3.5-turbo"
      messages: [{ role: "user", content: prompt }],
    });

    const reply = response.choices[0]?.message?.content;
    res.json({ data: reply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "OpenAI API error" });
  }
});



module.exports = router;