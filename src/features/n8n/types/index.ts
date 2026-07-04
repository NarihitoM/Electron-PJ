export interface N8nConfig {
    n8nUrl: string;
    n8nApiKey: string;
    connected: boolean;
    authType?: string;
    hasAuth?: boolean;
}

export interface N8nWorkflow {
    id: string;
    name: string;
    active: boolean;
    nodes: any[];
    connections: any;
    createdAt: string;
    updatedAt: string;
}

export interface N8nExecution {
    id: string;
    workflowId: string;
    status: string;
    startedAt: string;
    finishedAt: string;
}

export interface returnn8nconfig {
    success: boolean;
    data: N8nConfig;
}

export interface returnn8nmsg {
    success: boolean;
    data: {
        messages: Array<{
            role: string;
            content: string;
            provider?: string;
            model?: string;
            toolsCall?: any[];
            id?: string;
        }>;
        nextCursor: string | null;
        hasMore: boolean;
    };
}

export interface returnn8nfeedback {
    success: boolean;
    message: string;
    authType?: string;
}

export interface returnn8ntest {
    success: boolean;
    data: {
        restApiAvailable: boolean;
        error?: string;
        mode: string;
    };
}
