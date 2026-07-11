
export interface ToolCallSignal {
    result: string | null;
    id: string;     
    name: string; 
    query : Record<string, unknown> | null;
    status: "loading" | "done" | "error" | "rejected";
    isChain?: boolean;
    input?: string;
    output?: string;
}

export interface chatsession {           
    id?: number | string;
    role: string;
    content: string;
    thinking?: string;
    images?: string[];
    generatedImages?: string[];
    provider?: string;
    model?: string;
    toolsCall?: ToolCallSignal[]; 
}

export interface nodes {
    id : string,
    content: string;
    name: string;
    provider: string;
    actor: string;
    model: string;
    tool : string,           
    systemPrompt?: string;    
    
    output?: string;        
    thinking?: string;       
    activeTool?: string | null;    
    status?: 'idle' | 'running' | 'completed' | 'error';
}