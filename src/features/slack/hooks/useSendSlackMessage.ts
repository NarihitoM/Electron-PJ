import { slackauth } from "../api/api";

export const useSendSlackMessage = () => slackauth.sendmessage;
