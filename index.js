import OpenAI from 'openai';
import fs from "fs";



const openai = new OpenAI({
    apiKey: "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",
    dangerouslyAllowBrowser: true
});


async function transcribeAudio() {
    // const audioData = await fs.createReadStream("./input_audio(en).wav");

    // const transcription = await openai.audio.transcriptions.create({
    //     model: "whisper-1", 
    //     file: audioData,
    //     // language: "en" // ISO-639-1 format
    // });

    // console.log("transcription", transcription);
    // const transcriptionObj = { text: 'Où se trouve le musée du Getty?' };
    const transcriptionObj = { text: 'Where is the Getty Museum located?' };
    getAnswer(transcriptionObj.text);
}

transcribeAudio();

async function getAnswer(question) {
    
    const completion = await openai.chat.completions.create({
        messages: [
            {"role": "system", "content": "You are a helpful assistant that gives short succint replies."},
            {"role": "user", "content": question}
        ],
        model: "gpt-4-1106-preview",
        // max_tokens: 60,
    });

    console.log(".choices[0].message.content", completion.choices[0].message.content);
    console.log("completion: ", completion);
    respondToAudio(completion.choices[0].message.content)
}

// "The Getty Museum is located in Los Angeles, California. It actually consists of two campuses: 1. The Getty Center: Located in the Brentwood neighborhood of Los Angeles, the Getty Center is well-known for its architecture, gardens, and views overlooking Los Angeles. The museum at this campus houses an extensive"

async function respondToAudio(input) {
    const mp3 = await openai.audio.speech.create({
        model: "tts-1",
        voice: "onyx",
        input: input,
        speed: 0.5
      });

      const buffer = Buffer.from(await mp3.arrayBuffer());
      await fs.promises.writeFile("./speech.mp3", buffer);
}

// completionEN: {id: "chatcmpl-8VudWT5n7Wonmmnc4cCBdrGDjrvmM", object: "chat.completion", created: 1702616570, model: "gpt-4-1106-preview", choices: [{index: 0, message: {role: "assistant", content: "The Getty Museum is located in Los Angeles, California. It actually consists of two campuses: 1. The Getty Center: Located in the Brentwood neighborhood of Los Angeles, the Getty Center is well-known for its architecture, gardens, and views overlooking Los Angeles. The museum at this campus houses an extensive"}, finish_reason: "length"}], usage: {prompt_tokens: 24, completion_tokens: 60, total_tokens: 84}, system_fingerprint: "fp_3905aa4f79"}

//completionFR: {id: "chatcmpl-8VueIMpcbj1YN9Ykg63xLYxvBajGp", object: "chat.completion", created: 1702616618, model: "gpt-4-1106-preview", choices: [{index: 0, message: {role: "assistant", content: "Le musée du Getty, connu sous le nom de Getty Center, est situé à Los Angeles, en Californie, plus précisément à l'adresse 1200 Getty Center Drive, Los Angeles, CA 90049, États-Unis. Il est perché dans les"}, finish_reason: "length"}], usage: {prompt_tokens: 27, completion_tokens: 60, total_tokens: 87}, system_fingerprint: "fp_6aca3b5ce1"}