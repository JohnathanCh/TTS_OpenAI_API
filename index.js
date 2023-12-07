import OpenAI from 'openai';
import fs from "fs";
import path from "path";

const process2 = {
    env: {
        OPENAI_API_KEY: "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",
    }
}

const openai = new OpenAI({
    apiKey: process2.env.OPENAI_API_KEY,
    dangerouslyAllowBrowser: true
});

async function main() {
    console.log("Hello! I am your assistant, ask me anything!")
    // This is where we would get some sort of user input.
    const userInput = "What is quantum computing?"
    
  const completion = await openai.chat.completions.create({
    messages: [
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": userInput}
    ],
    model: "gpt-4-1106-preview",
    max_tokens: 10,
  });

  console.log("completion.choices", completion.choices[0]);
  transcribeAudio(completion.choices[0].message.content)
}
main();

const speechFile = path.resolve("./speech.mp3");

async function transcribeAudio(input) {
    const mp3 = await openai.audio.speech.create({
        model: "tts-1",
        voice: "alloy",
        input,
      });

      const buffer = Buffer.from(await mp3.arrayBuffer());
      await fs.promises.writeFile("./speech.mp3", buffer);
}
