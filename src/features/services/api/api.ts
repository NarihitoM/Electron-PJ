import { Server } from "../../../shared/config/axioconfig"
import { authservicedata, authservicefeedback } from "../types";

export const serviceauth = {
    serviceadd: async (
        provider: string,
        key: string,
        host?: string
    ) : Promise<authservicefeedback> => {
        const response = await Server.post("/service/api/addservice", {
           provider,
           key,
           host: host || undefined,
        })
        return response.data;
    },
    servicefetch: async () : Promise<authservicedata> => {
        const response = await Server.get("/service/api/fetchservice")
        return response.data;
    },
    servicedelete : async (
        id : number
    ) : Promise<authservicefeedback> => {
        const response = await Server.post("/service/api/deleteservice" , {
            id 
        });
        return response.data;
    }
}