# Making An Assistant That Can Respond With Speech

This article will walk you through building a simple TTS aplication using the openai API. To supplement this article I also created an interactive screencast (scrim) version of this article [here](https://scrimba.com/scrim/ckVm9rfM).

## Setup Our Dependencies
First we need to install our dependencies

- fs
- path
- openai

Both `fs` and `path` will be used to create/access files in our local system.

## Start Building Our Project
Make our connection to the openai API server.

```
const openai = new OpenAI({
    apiKey: "You_API_Key_here"
});
```

## Get User Input
There are many ways to get user input. Whether you get the user input from an input field on you webpage or from a CLI input we can handle that response in the same way.

## Send User Input To OpenAI

Using our openai API connection, we can send the user input to the completions endpoint and create a new completion object. 

```
  const completion = await openai.chat.completions.create({
    messages: [{"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": userInput}],
    model: "gpt-4-1106-preview",
  });
  ```

  _Note: To control the length of the response we get back, we could use the `max_tokens` property or change the `"content"` within the `"role": "system"` object to tell the AI to give shorter responses. ex `{"role": "system", "content": "You are a helpful assistant that only responds with three sentences."}`_

## Handle API Response
When you receive your response it will look something like:

```
{
    "id":"chatcmpl-8StkDpBwqTeuRtmp9UvNNxsG5bL4O",
    "object":"chat.completion",
    "created":1701898157,
    "model":"gpt-4-1106-preview",
    "choices": [
        {
            "index":0,
            "message":{
                "role":"assistant",
                "content":"Quantum computing is a field of computing that utilizes the principles of quantum mechanics to perform calculations."
            },
            "finish_reason":"length"
        }
    ],
    "usage": {
        "prompt_tokens":34,
        "completion_tokens":60,
        "total_tokens":94
    },
    "system_fingerprint":null
}
```

The part that we are most concerned with is the `completion.choices[0].message.content` for now.

## Create Speech From Response

Now that we have our text response from ChatGPT, we need to turn that into speech.

```
    const mp3 = await openai.audio.speech.create({
        model: "tts-1",
        voice: "alloy",
        input: completion.choices[0].message.content,
      });
```

Here we use the `openai.audio.speech.create` endpoint to send the text response we got back from GPT to the TTS model. Once we receive the mp3 file back from TTS, we need to resolve the path where we plan to send the file then create a buffer for the file before we write it locally.

```
const speechFile = path.resolve("./speech.mp3");
const buffer = Buffer.from(await mp3.arrayBuffer());
await fs.promises.writeFile(speechFile, buffer);
```

If everything worked properly, we should have our speech saved in a file called `speech.mp3`, where we can then handle it accordingly.

## Conclusion

We can collect user inputs in many ways and once we receive our mp3 we can handle that in many ways as well. The same idea, with different execution, could be used to create a continuous chat thread between a user and a speech capable AI.