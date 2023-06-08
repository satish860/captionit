import { NextRequest, NextResponse } from "next/server"
import { OpenAI } from "langchain/llms/openai"
import { PromptTemplate } from "langchain/prompts"

const Template = `
Below is a description of the picture.
Your goal is to:
- Generate upto 5 social media caption for a picture of the following description. 
- Create an intriguing caption that sparks curiosity.
- Create a caption with positive tone. 

Here are some examples:
-Lost in the beauty of the great outdoors, finding solace in nature's embrace. 🌿✨ #NatureTherapy #PeacefulEscape
-Standing tall against all odds, we conquer the challenges that come our way. 💪🌱 #StrengthInUnity #OvercomingObstacles
-On top of the world, with the wind in our hair and a breathtaking view before us. 🌍❤️ #AdventureAwaits #UnforgettableMoments
-Amidst the rolling hills, we find serenity and create memories that will last a lifetime. 🌄💑 #LoveInTheWild #HillsAreAlive
-Witnessing the beauty of nature's canvas, we are reminded of the wonders that surround us. 🎨🌿 #NatureInspired #AweStruck

Below is the sentence:
sentence: {text}

YOUR RESPONSE:
`

export async function POST(request: NextRequest) {
  const res = await request.json()
  const text = res.text
  const Envir = process.env.OPENAI_API_KEY
  const model = new OpenAI({ openAIApiKey: Envir, temperature: 0.9 })
  var promptTemplate = Template
  const prompt = new PromptTemplate({
    template: promptTemplate,
    inputVariables: ['text'],
  })
  const promptText = await prompt.format({ text: text })
  const modelresponse = await model.call(promptText)
  console.log(modelresponse)
  return NextResponse.json(modelresponse)
}
