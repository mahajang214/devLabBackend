const express = require('express');
const router=express.Router();
// const axios=require("axios");
// const { OpenAI } = require("openai");
const protected = require("../Middlewares/protection.middleware");

// open ai 
// const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// router.post('/send',protected, async (req, res) => {
//    const { prompt } = req.body;

//   if (!prompt) {
//     return res.status(400).json({ error: "Prompt is required" });
//   }

//   try {
//     const response = await axios.post(
//       "https://openrouter.ai/api/v1/chat/completions",
//       {
//         model: "mistralai/mistral-7b-instruct", // or "meta-llama/llama-3-8b-instruct"
//         messages: [{ role: "user", content: prompt }],
//       },
//       {
//         headers: {
//           "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
//           "Content-Type": "application/json",
//         },
//       }
//     );

//     const reply = response.data.choices[0]?.message?.content;
//     res.json({ response: reply });
//   } catch (err) {
//     console.error(err?.response?.data || err.message);
//     res.status(500).json({ error: "Failed to fetch AI response" });
//   }
//   //  const { prompt } = req.body;

//   // if (!prompt) return res.status(400).json({ error: "Prompt is required" });

//   // try {
//   //   const response = await openai.chat.completions.create({
//   //     model: "gpt-3.5-turbo", // or "gpt-3.5-turbo"
//   //     messages: [{ role: "user", content: prompt }],
//   //   });

//   //   const reply = response.choices[0]?.message?.content;
//   //   res.json({ data: reply });
//   // } catch (err) {
//   //   console.error(err);
//   //   res.status(500).json({ error: "OpenAI API error" });
//   // }
// });



module.exports = router;