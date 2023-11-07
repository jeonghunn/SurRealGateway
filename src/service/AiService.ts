const  OpenAIApi  = require('openai');
const config = require('../config/config');

export class AiService {

  public openAi: any = new OpenAIApi(config.openAI);
  public SYSTEM_ROLE: string = 'Organize only final concluded information in a bullet form without any greetings. Answer in language that used in the conversation.';

  public async getChatGPTAnswer(
    prompt: string,
    maxTokens: number = 500,
    model: string = 'gpt-3.5-turbo',
    ): Promise<string | null> {
    try {
      const response = await this.openAi.chat.completions.create({
        model,
        max_tokens: maxTokens,
        messages: [
          {
            role: "system",
            content: this.SYSTEM_ROLE,
          },
          {
            role: "user",
            content: prompt,
          },
        ],
      });

      const generatedText = response.choices[0].message.content;

      return generatedText;
    } catch (error) {
      console.error('Error: getChatGPTAnswer from AiService', error);
      return null;
    }
  }

}
