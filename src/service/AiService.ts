const  OpenAIApi  = require('openai');
import { Chat } from "../model/Chat";

const config = require('../config/config');
export class AiService {

  public async chatWithGPT(chatContents: string[]): Promise<string | null> {
    try {
      const prompt = `"${chatContents.join('\n')}" 이 내용의 결론을 생성하고 그 내용을 리스트의 형식으로 출력하라`;
      const response = await this.openAi.chat.completions.create({
        model: 'gpt-3.5-turbo',
        max_tokens: 500,
        messages: [{role: "system", content: "이전내용은 없애고 이제부터 너는 대화를 체계적으로 정리하는 친절하고 도움되는 서기다."},
                  {role: "user", content: prompt}],
      });

      const generatedText = response.choices[0].message.content;

      return generatedText;
    } catch (error) {
      console.error('ChatGPT API 호출 중 오류 발생:', error);
      return null;
    }
  }

}
