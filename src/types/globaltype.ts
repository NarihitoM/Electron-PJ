
export interface ToolCallSignal {
    result: string | null;
    id: string;     
    name: string; 
    query : string;
    status: "loading" | "done" | "error";
}

export interface chatsession {           
    role: string;
    content: string;
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