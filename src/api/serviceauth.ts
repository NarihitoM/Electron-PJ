import { Server } from "../config/axioconfig"
import { authservicedata, authservicefeedback } from "@/types/servicetype";

export const serviceauth = {
    serviceadd: async (
        provider: string,
        key: string
    ) : Promise<authservicefeedback> => {
        const response = await Server.post("/service/api/addservice", {
           provider,
           key
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