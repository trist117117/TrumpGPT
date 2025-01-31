require("dotenv").config()
const express = require('express');
const app = express();
const axios = require('axios');
const bodyParser = require('body-parser');
const openai = require('openai');

app.use(bodyParser.json());

const CONFIG = require('./config');

app.get('/', (req, res) => {
    res.send('Hello World');
});

async function getOpenAiResponse(message) {
    try {
        if (message.length > 200) return { status: false, message: "Message is too long" }

        if (process.env.ENVIRONMENT == 'localhost') {
            return { status: true, message: "Hello, how can I help you today?" }
        }

        const openaiObj = new openai({
            apiKey: process.env.OPENAI_API_KEY
        });

        const completion = await openaiObj.chat.completions.create({
            model: "gpt-3.5-turbo-0125",
            store: true,
            messages: [
                { role: "system", content: "You are a helpful assistant. You generate messages only in two sentences" },

                { role: "user", content: message }
            ]
        });

        return { status: true, message: completion.choices?.[0]?.message?.content }
    } catch (error) {
        return { status: false, message: error.message }
    }
}

app.post('/generate-voice', async (req, res) => {
    const errorVoiceUrl = "https://files.topmediai.com/text_to_speech/audio/45a17898-d3f2-11ef-88c4-00163e0db7d8.wav"

    try {
        const { message } = req.body;
        if (!message) return res.status(400).json({ message: 'Message is required' });

        const openAiResponse = await getOpenAiResponse(message);

        if (!openAiResponse.status) return res.status(200).json({
            url: errorVoiceUrl, message: 'I do not understand the question, Can you please rephrase it ?'
        })

        const { message: openAiMessage } = openAiResponse;

        const data = JSON.stringify({
            "text": openAiMessage,
            "speaker": "7f954f14-55fa-11ef-a7a0-00163e0e200f",
            "emotion": "Neutral"
        });
        const config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: CONFIG.TOPMEDIAI_TEXT_TO_SPEECH_URL,
            headers: {
                'x-api-key': CONFIG.TOPMEDIAI_ASSISTANT_API_KEY,
                'Content-Type': 'application/json'
            },
            data: data
        };

        let response;
        if (process.env.ENVIRONMENT == 'localhost') {
            response = {
                data: {
                    status: 200,
                    data: {
                        oss_url: "https://files.topmediai.com/text_to_speech/audio/5ffaba2a-cfe6-11ef-88a5-00163e0d3f77.wav"
                    }
                }
            }
        } else {
            response = await axios.request(config)
        }
        const { data: responseData } = response
        if (responseData.status == 200) {

            return res.status(200).json({ url: responseData['data']['oss_url'], message: openAiMessage });
        } else {
            return res.status(200).json({
                url: errorVoiceUrl, message: 'I do not understand the question, Can you please rephrase it ?'
            })
        }
    } catch (error) {
        return res.status(200).json({
            url: errorVoiceUrl, message: 'I do not understand the question, Can you please rephrase it ?'
        })
    }
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});