# Making A Speech To Speech AI Assistant With Node JS And The OpenAI API

![Slide 1](./Slides/Whisper-%20Walkthrough%20Slide-1.png)

This article will walk you through how you can turn a user's audio prompt into text with Whisper. Then send that prompt to the OpenAI GPT and, when you get the response back, turn it back into audio with TTS. We will do all of this using Node JS and the OpenAI API. To supplement this article I have created an [interactive screencast](https://scrimba.com/scrim/cZ2QLwTG) (scrim) to walk you through the steps. I also suggest looking through the [OpenAI API reference](https://platform.openai.com/docs/api-reference/introduction) to get a better understanding of the tools we will be using.

> What is a GPT?
> - Generative pre-trained transformers (GPT) are a type of large language model (LLM) and a prominent framework for generative artificial intelligence. They are artificial neural networks that are used in natural language processing tasks.

## Setting Up Our Dependencies And Autheticating With OpenAI
First we need to install our dependencies:

- `import OpenAI from 'openai';`
- `import fs from "fs";`

Now we make our connection to the OpenAI API server, using our API key. If you're watching the [scrim](https://scrimba.com/scrim/cZ2QLwTG) above, you can store your API key in the environment variables for the browser environment by following the steps in [this article](https://different-marmoset-f7b.notion.site/How-to-set-environment-variables-in-Scrimba-f8edc638005a4e97b557c6ab1752248a).

```
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});
```

## Transcribe User Audio Prompt

![Slide 2](./Slides/Whisper-%20Walkthrough%20Slide-2.png)

Firstly we will demonstrate how to turn spoken word audio into text using the Whisper model. It is also good to follow along in the [API reference](https://platform.openai.com/docs/api-reference/audio/createTranscription) as we go over things. The API endpoint `openai.audio.transcriptions.create` accepts up to six request body attributes:

- file: file, ___Required___
    - The audio file object (not file name) to transcribe, in one of these formats: flac, mp3, mp4, mpeg, mpga, m4a, ogg, wav, or webm.
- model: string, ___Required___
    - ID of the model to use. Only “whisper-1” is currently available.
- language: string, Optional
    - The language of the input audio. Supplying the input language in ISO-639-1 format will improve accuracy and latency.
- prompt: string, Optional
    - An optional text to guide the model's style or continue a previous audio segment. The prompt should match the audio language.
- response_format: string, Optional, Default to JSON
    - The format of the transcript output, in one of these options: json, text, srt, verbose_json, or vtt.
- temperature: number, Optional, Default to 0
    - The sampling temperature, between 0 and 1. Higher values like 0.8 will make the output more random, while lower values like 0.2 will make it more focused and deterministic. If set to 0, the model will use log probability to automatically increase the temperature until certain thresholds are hit.

Using our OpenAI API connection, we can send our audio to the Whisper model to transcribe the audio into text. We will send a request to the `transcriptions` endpoint, but first we have to create a read stream for the audio file using `fs.createReadStream` so that we can send that audio file to the API.

```
const audioData = await fs.createReadStream(audioFilePath);
const transcription = await openai.audio.transcriptions.create({
    model: "whisper-1", 
    file: audioData,
    language: "en" // ISO-639-1 format
});
```

It will respond with a simple object that looks like this:

```
// transcription
{ text: 'Where is the Getty Museum located?' }
```

As an aside, we can also use the same API endpoint to translate our audio to another language by changing the `language` attribute in our request body to reflect the language we intend to translate to:

```
const transcription = await openai.audio.transcriptions.create({
    model: "whisper-1", 
    file: audioData,
    language: "fr" // ISO-639-1 format
});
```

This will translate our audio to French, but you can use any language in ISO-639-1 format:

```
// transcription
{ text: 'Où se trouve le musée du Getty?' }
```

## Sending The Transcription To The OpenAI GPT

![Slide 3](./Slides/Whisper-%20Walkthrough%20Slide-3.png)

In the next step we will be sending the transcription text we just received from `openai.audio.transcriptions.create` to the `openai.chat.completions.create` endpoint. I very much suggest looking at the [API Reference](https://platform.openai.com/docs/api-reference/chat/create) to see all of your request body attributes for this endpoint because there are many:

- messages: array, ___Required___
    - A list of messages comprising the conversation so far. Check API Reference docs for more info.
- model: string, ___Required___
    - ID of the model to use. See the model endpoint compatibility table for details on which models work with the Chat API.
- max_tokens: integer or null, Optional
    - The maximum number of tokens to generate in the chat completion. The total length of input tokens and generated tokens is limited by the model’s context length.
- n: integer or null, Optional, Defaults to 1
    - How many chat completion choices to generate for each input message. Note that you will be charged based on the number of generated tokens across all of the choices. Keep n as 1 to minimize costs.
- response_format: object, Optional
    - An object specifying the format that the model must output. Setting to { "type": "json_object" } enables JSON mode, which guarantees the message the model generates is valid JSON.
- tools: array, Optional
    - A list of tools the model may call. Currently, only functions are supported as a tool. Use this to provide a list of functions the model may generate JSON inputs for.
- etc...

A Note on `role` within our request body `messages` attribute:

```
messages: [
        {"role": "system", "content": "You are a helpful assistant that gives short succint replies."},
        {"role": "user", "content": question}
    ]
``` 

Roles are a way to guide the model’s responses. Commonly used roles include “system,” “user,” and “assistant.” The “system” provides high-level instructions, the “user” presents queries or prompts, and the “assistant” is the model’s response. Using roles strategically can significantly improve the model's output.

**System Role:** Set clear context for the system. Begin with a system message to define the context or behavior you desire from the model. This acts as a guidepost for subsequent interactions. Notice we told the system to be "succinct" in its description, to keep the response length shorter.

**User Role:** Make explicit/direct user prompts. Being clear and concise in the user role ensures the model grasps the exact requirement, leading to more accurate responses.

Our request body for the `openai.chat.completions.create` endpoint will look something like the following:

```
// transcription = { text: 'Where is the Getty Museum located?' }
const question = transcription.text 
const completion = await openai.chat.completions.create({
    messages: [
        {"role": "system", "content": "You are a helpful assistant that gives short succint replies."},
        {"role": "user", "content": question}
    ],
    model: "gpt-4-1106-preview"
});
```

## Taking A Look At The OpenAI GPT Response

The completion object we receive from the OpenAI GPT will look something like this:

```
{
    id: "chatcmpl-8VudWT5n7Wpnmmnc4cCFkrGDjrvmM", 
    object: "chat.completion", 
    created: 1702616570, 
    model: "gpt-4-1106-preview", 
    choices: [
        {
            index: 0, 
            message: {
                role: "assistant",
                content: "The Getty Museum comprises two locations: the Getty Center in Los Angeles and the Getty Villa in Pacific Palisades, California."
                }, 
            finish_reason: "stop"
        }
    ], 
    usage: {
        prompt_tokens: 30, 
        completion_tokens: 25, 
        total_tokens: 55
    }, 
    system_fingerprint: "fp_3677ac4g89"
}
```

Notice that the response has an attribute `finish_reason` that has a value of `"stop"`. This means that the response finished successfully. If you see `finish_reason: "length"`, that means that the response was cut short because it surpassed the maximum length. You may need to change your prompt to ask more explicitly for a more concise response.

## Create Speech From Response

![Slide 4](./Slides/Whisper-%20Walkthrough%20Slide-4.png)

Lastly, we will turn the OpenAI GPT response into speech. Here is the [API Reference Docs](https://platform.openai.com/docs/api-reference/audio/createSpeech) portion pertaining to the `openai.audio.speech.create` endpoint, and here are the request body attributes:

- model: string, ___Required___
    - One of the available TTS models: “tts-1” or “tts-1-hd”
- input: string, ___Required___
    - The text to generate audio for. The maximum length is 4096 characters.
- voice: string, ___Required___
    - The voice to use when generating the audio. Supported voices are “alloy”, “echo”, “fable”, “onyx”, “nova”, and “shimmer”. Previews of the voices are available in the [text to speech guide](https://platform.openai.com/docs/guides/text-to-speech/voice-options).
- response_format: string, Optional, Defaults to MP3
    - The format to audio in. Supported formats are “mp3”, “opus”, “aac”, and “flac”.
- speed: number, Optional, Default to 1
    - The speed of the generated audio. Select a value from 0.25 to 4.0. 1.0 is the default.

For real-time applications, the standard `tts-1` model provides the lowest latency but at a lower quality than the `tts-1-hd` model. Due to the way the audio is generated, `tts-1` is likely to generate content that has more static in certain situations than `tts-1-hd`.

If we study the completion object above, we can see that the part we need in this case is `completion.choices[0].message.content`. This portion of the completion object contains the assitant's response to our question. We will send this as the `input` value in our request body.

```
const mp3 = await openai.audio.speech.create({
    model: "tts-1",
    voice: "alloy",
    input: completion.choices[0].message.content,
});
```

Here we use the `openai.audio.speech.create` endpoint to send the text response we got back from the OpenAI GPT to the TTS model in order to receive an audio file back. Once we receive the audio file from the TTS model, we need to create a buffer for the file then write it locally to our machine.

```
const buffer = Buffer.from(await mp3.arrayBuffer());
await fs.promises.writeFile("./speech.mp3", buffer);
```

If everything worked properly, we should have our speech saved in an audio file called `speech.mp3`, where we can then handle it accordingly.

## Conclusion

Hopefully this gave you some ideas of how to use the OpenAI API. We could have made a loop that continuously asks a user for audio prompts, then responds in audio as well. We could also use this to create a translation application. Give it a try on your local computer and build it out into your next cool application. Good luck, and have fun!