import { ChatOpenAI } from "@langchain/openai";
import { ChatAnthropic } from "@langchain/anthropic";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatGroq } from "@langchain/groq";
import { ChatOpenRouter } from "@langchain/openrouter"
import { ChatMistralAI } from "@langchain/mistralai"
import { toolRegistry } from "../tools/toolsregister";
import { agentauth } from "../../src/api/agentauth";

interface Config {
    provider: string,
    model: string,
}

export const getLLM = async (
    config: Config,
    keyMap: Record<string, string>,
    useremail: string,
    tool: string,
) => {
    const provider = config.provider.toLowerCase();
    const encryptedHash = keyMap[provider];
    const selecttool = toolRegistry[tool];

    const tools = Array.isArray(selecttool) ? selecttool : [selecttool];
    if (!encryptedHash) {
        throw new Error(`No API key found for provider: ${provider}`);
    }


    const data = await agentauth.Decryptkey(encryptedHash, useremail);
    
    switch (provider) {
        case "openai":
            return new ChatOpenAI({
                apiKey: data.key,
                model: config.model,
                streaming: true,
            }).bindTools(tools);

        case "anthropic":
            return new ChatAnthropic({
                anthropicApiKey: data.key,
                model: config.model,
                streaming: true,
            }).bindTools(tools);

        case "gemini":
            return new ChatGoogleGenerativeAI({
                apiKey: data.key,
                model: config.model,
                streaming: true
            }).bindTools(tools);

        case "groq":
            return new ChatGroq({
                apiKey: data.key,
                model: config.model,
                streaming: true
            }).bindTools(tools)

        case "openrouter":
            return new ChatOpenRouter({
                apiKey: data.key,
                model: config.model,
                streamUsage: true
            }).bindTools(tools)

        case "mistral":
            return new ChatMistralAI({
                apiKey: data.key,
                model: config.model,
                streaming: true
            }).bindTools(tools);


        default:
            throw new Error(`Unsupported provider: ${provider}`);
    }
};