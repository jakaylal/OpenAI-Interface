const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const OpenAI = require('openai');
const app = express();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.get('/', function (req, res) {
  res.render('index', { openaiResponse: null, error: null, prompt: '' });
});
app.post('/', async function (req, res) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY environment variable is not set.');
    }
    const prompt = req.body.prompt;
    if (!prompt) {
      return res.status(400).render('index', {
        openaiResponse: null,
        error: 'Prompt is required.',
        prompt: ''
      });
    }
    const response = await openai.responses.create({
    model: 'o3-deep-research',
    // 'gpt-5'
    input: prompt,
    tools: [{ type: "web_search_preview" }] //type: web_search
  });

    res.render('index', {
      openaiResponse: response.output_text || null,
      error: null,
      prompt
    });
  } catch (err) {
    console.error('Failed to fetch OpenAI response:', err.message);
    res.status(500).render('index', {
      openaiResponse: null,
      error: 'Error fetching OpenAI data',
      prompt: req.body ? req.body.prompt || '' : ''
    });
  }
});
app.listen(3000, function () {
  console.log('Our app is running on port 3000');
});
