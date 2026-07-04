export const isValidUrl = (text: string) => {
    const urlregex = /(https?:\/\/[^\s]+)/i;
    const match = text.match(urlregex);
    
    if (!match) return false;

    try {
        const url = new URL(match[0].replace(/[.,;]+$/, ""));
        return ["http:", "https:"].includes(url.protocol);
    } catch {
        return false;
    }
};