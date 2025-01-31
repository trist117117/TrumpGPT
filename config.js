require("dotenv").config() //instatiate environment variables

let CONFIG = {} //Make this global to use all over the application

CONFIG.TOPMEDIAI_ASSISTANT_API_KEY = process.env.TOPMEDIAI_ASSISTANT_API_KEY
CONFIG.VOICE_LIST_URL = process.env.VOICE_LIST_URL
CONFIG.TOPMEDIAI_TEXT_TO_SPEECH_URL = process.env.TOPMEDIAI_TEXT_TO_SPEECH_URL
CONFIG.OPENAI_API_URL = process.env.OPENAI_API_URL

module.exports = CONFIG
