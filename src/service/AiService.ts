const  OpenAIApi  = require('openai');
const config = require('../config/config');

export class AiService {

  public openAi: any = new OpenAIApi(config.openAI);

  public readonly SYSTEM_ROLE_2 : string = 'Answer in language that used in the conversation. 1. Write the topic of the conversation at the first line without declaring Title. 2. After writing a title, Write the summary by organizing only final concluded information in a bullet form without any greetings.';

  public getChatGPTAnswer(
    prompt: string,
    maxTokens: number = 500,
    model: string = 'gpt-4-1106-preview',
    ): Promise<string | null> {

      return this.openAi.chat.completions.create({
        model,
        max_tokens: maxTokens,
        messages: [
          {
            role: "system",
            content: this.SYSTEM_ROLE_2,
          },
          {
            role: "user",
            content: prompt,
          },
        ],
      }).then((response: any) => {
        const generatedText = response.choices[0].message.content;
        return generatedText;
      });
  }

}
