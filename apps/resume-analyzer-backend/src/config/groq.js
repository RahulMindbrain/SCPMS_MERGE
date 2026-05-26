const Groq = require("groq-sdk");

let groqInstance = null;

const getGroq = () => {
  if (!groqInstance) {
    if (!process.env.GROQ_API_KEY) {
      console.warn("[Groq Warning] GROQ_API_KEY is not defined. AI features will fail.");
    }
    groqInstance = new Groq({
      apiKey: process.env.GROQ_API_KEY || "dummy_key",
    });
  }
  return groqInstance;
};

// Export the getter function and the instance (lazily initialized)
module.exports = {
  get groq() {
    return getGroq();
  }
};
