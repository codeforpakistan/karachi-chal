import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from "@google/generative-ai";
import MarkdownIt from 'markdown-it';

import './style.css';



// 🔥 https://g.co/ai/idxGetGeminiKey 🔥
let API_KEY = import.meta.env.VITE_GEMINI_KEY

let form = document.querySelector('form');
let promptInput = document.querySelector('input[name="prompt"]');
let output = document.querySelector('.output');
let message = document.querySelector('.message');
  
message.style.display = 'none';

form.onsubmit = async (ev) => {
  ev.preventDefault();

  message.style.display = 'block'

  try {
    
    ga('send', 'event', 'generate_itinerary', 'submit', 'prompt');



    // Assemble the prompt by combining the text with the chosen image
    let contents = [
      {
        role: 'user',
        parts: [
          { text:  `You are a knowledgeable travel guide specializing in Karachi. 
          When a visitor asks you about their upcoming trip using the 
          variable "${promptInput.value}", provide a comprehensive response. 
          Include detailed daily itineraries, top dining spots, and must-see attractions. 
          Ensure you account for travel logistics, such as travel times and 
          operational hours of venues.`, }
        ]
      }
    ];

    // Call the gemini-pro model, and get a stream of results
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({
      model: "gemini-pro",

      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
        },
      ],
    });

    const result = await model.generateContentStream({ contents });

    // Read from the stream and interpret the output as markdown
    let buffer = [];
    let md = new MarkdownIt();
    for await (let response of result.stream) {
      buffer.push(response.text());
      output.innerHTML = md.render(buffer.join(''));
    }
  } catch (e) {
    output.innerHTML += '<hr>' + e;
  }
};

// You can delete this once you've filled out an API key