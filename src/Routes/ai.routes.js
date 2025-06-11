require("dotenv").config();
const express = require('express');
const router = express.Router();
const axios = require("axios");
// const { OpenAI } = require("openai");
const protected = require("../Middlewares/protection.middleware");

// open ai 
// const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

router.post('/ask-ai', protected, async (req, res) => {
  try {
    const { query } = req.body;
    // console.log("api key:", process.env.OPENROUTER_API_KEY)

    const openRes = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'meta-llama/llama-3-70b-instruct',
        messages: [{ role: 'user', content: query }],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          //   'HTTP-Referer': 'https://mahajang214.github.io/devLab',
          // 'X-Title': 'devLab'
        },
      }
    );
    // console.log("openai response:", openRes.data);

    res.status(200).json({ data: openRes.data });
  } catch (err) {
    console.error("OpenRouter Error:", err.response?.data || err.message);
    res.status(500).json({ error: 'AI request failed' });
  }
});



module.exports = router;