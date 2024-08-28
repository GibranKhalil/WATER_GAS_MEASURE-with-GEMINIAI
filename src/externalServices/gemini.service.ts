import { GoogleGenerativeAI } from '@google/generative-ai';

class GeminiService {
  private prompt: string = '';

  constructor(private readonly genAi: GoogleGenerativeAI) {}

  getPrompt() {
    return this.prompt;
  }

  setPrompt(prompt: string) {
    this.prompt = prompt;
  }

  private get genAIModel() {
    return this.genAi.getGenerativeModel({ model: 'gemini-1.5-flash' });
  }

  async fileToText(base64String: string, mimeType: string) {
    const inlineData = {
      inlineData: {
        data: base64String,
        mimeType,
      },
    };
    const model = this.genAIModel;
    const result = await model.generateContent([this.prompt, inlineData]);
    return result.response.text();
  }
}

const apiKey = process.env.GEMINI_API_KEY as string;
const genAI = new GoogleGenerativeAI(apiKey);
const geminiService = new GeminiService(genAI);

export { geminiService };
