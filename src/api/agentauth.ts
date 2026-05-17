import { Server } from "../config/axioconfig"
import { returnagentmessagedata, returnagentmessagefeedback, returnnodedata, returnnodefeedback } from "@/types/agenttype";

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
        name?: string
    ): Promise<returnagentmessagefeedback> => {
        const response = await Server.post("/agent/api/storeagentmessage", {
            role,
            content,
            name
        });
        return response.data;
    },
    fetchagentmessages: async (): Promise<returnagentmessagedata> => {
        const response = await Server.get("/agent/api/fetchagentmessage")
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
    }
}