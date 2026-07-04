import { Server } from "../../../shared/config/axioconfig"
import { returnagentmessagedata, returnagentmessagefeedback, returnnodedata, returnnodefeedback } from "../types";

export const agentauth = {
    addnode: async (
        name: string,
        provider: string,
        actor: string,
        model: string,
        tool: string,
        prompt: string
    ): Promise<returnnodefeedback> => {
        const response = await Server.post("/agent/api/addnode", {
            name,
            provider,
            actor,
            model,
            tool,
            prompt
        })
        return response.data;
    },
    fetchnode: async (
    ): Promise<returnnodedata> => {
        const response = await Server.get("/agent/api/fetchnode")
        return response.data;
    },
    updatenode: async (
        nodeid: string,
        name: string,
        provider: string,
        actor: string,
        model: string,
        tool: string,
        prompt: string
    ): Promise<returnnodefeedback> => {
        const response = await Server.post("/agent/api/updatenode", {
            nodeid,
            name,
            provider,
            actor,
            model,
            tool,
            prompt
        })
        return response.data;
    },
    deletenode: async (
        nodeid: string
    ): Promise<returnnodefeedback> => {
        const response = await Server.post("/agent/api/deletenode", {
            nodeid
        });
        return response.data;
    },
    storeagentmessage: async (
        role: string,
        content: string,
        name?: string,
        provider?: string,
        model?: string
    ): Promise<returnagentmessagefeedback> => {
        const response = await Server.post("/agent/api/storeagentmessage", {
            role,
            content,
            name,
            provider,
            model
        });
        return response.data;
    },
    fetchagentmessages: async (cursor?: string, name?: string): Promise<returnagentmessagedata> => {
        const response = await Server.get("/agent/api/fetchagentmessage", {
            params: {
                ...(cursor ? { cursor } : {}),
                ...(name ? { name } : {})
            }
        })
        return response.data;
    },
    resetagentmessages: async (name?: string): Promise<returnagentmessagefeedback> => {
        const response = await Server.post("/agent/api/resetagentmessage", {
            ...(name ? { name } : {})
        })
        return response.data;
    },
    Decryptkey: async (
        encryptedHash : string,
        useremail : string
    ): Promise<returnagentmessagefeedback> => {
        const response = await Server.post("/agent/api/agentkey", {
            encryptedHash,
            useremail
        })
        return response.data;
    },
    Websearch: async (
        query : string
    ): Promise<returnagentmessagefeedback> => {
        const response = await Server.post("/agent/api/websearch", {
            query
        })
        return response.data;
    },
    FirecrawlScrape: async (
        url: string
    ): Promise<any> => {
        const response = await Server.post("/firecrawl/api/scrape", { url });
        return response.data;
    },
    FirecrawlInteract: async (
        url: string,
        prompt: string,
        sessionId?: string
    ): Promise<any> => {
        const response = await Server.post("/firecrawl/api/interact", { url, prompt, sessionId });
        return response.data;
    }
}