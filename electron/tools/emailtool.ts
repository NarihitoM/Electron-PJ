import { tool } from "@langchain/core/tools";
import { z } from "zod";
import net from "net";
import tls from "tls";
import { Server } from "../../src/shared/config/axioconfig";

function encodeBase64(str: string): string {
    return Buffer.from(str).toString("base64");
}

async function sendSmtpMail(params: {
    host: string;
    port: number;
    user: string;
    pass: string;
    to: string;
    subject: string;
    body: string;
    html?: string;
}): Promise<string> {
    return new Promise((resolve, reject) => {
        const { host, port, user, pass, to, subject, body, html } = params;
        const from = user;
        let socket: net.Socket | tls.TLSSocket;
        let buffer = "";
        let step = 0;

        const send = (cmd: string) => {
            if (socket.destroyed) return;
            socket.write(cmd + "\r\n");
        };

        let ehloBuffer = "";
        let upgrading = false;
        let tlsUpgraded = false;

        const handleData = (data: string) => {
            if (upgrading) return;

            buffer += data;
            const lines = buffer.split("\r\n");
            buffer = lines.pop() || "";

            for (const line of lines) {
                if (!line) continue;
                const code = parseInt(line.substring(0, 3), 10);

                if (code >= 400 && step !== 2) {
                    socket.destroy();
                    reject(new Error(`SMTP error: ${line}`));
                    return;
                }

                if (step === 0 && line.includes("220")) {
                    step = 1;
                    send(`EHLO MultimateAgent`);
                } else if (step === 1 && line.includes("250")) {
                    ehloBuffer += line + "\n";
                    const isLast = line[3] === " ";
                    if (isLast) {
                        if (ehloBuffer.includes("STARTTLS") && port === 587 && !tlsUpgraded) {
                            step = 2;
                            send("STARTTLS");
                        } else {
                            step = 3;
                            send("AUTH LOGIN");
                        }
                        ehloBuffer = "";
                    }
                } else if (step === 2 && line.includes("220")) {
                    upgrading = true;
                    tlsUpgraded = true;
                    const rawSocket = socket;
                    const tlsSocket = tls.connect({ socket: rawSocket as net.Socket, host, rejectUnauthorized: true });
                    socket = tlsSocket;
                    buffer = "";
                    tlsSocket.on("error", (err) => {
                        upgrading = false;
                        reject(err);
                    });
                    tlsSocket.on("secureConnect", () => {
                        upgrading = false;
                        tlsSocket.on("data", onData);
                        tlsSocket.write(`EHLO MultimateAgent\r\n`);
                        step = 1;
                    });
                    return;
                } else if (step === 3 && line.includes("334")) {
                    step = 4;
                    send(encodeBase64(user || ""));
                } else if (step === 4 && line.includes("334")) {
                    step = 5;
                    send(encodeBase64(pass || ""));
                } else if (step === 5 && line.includes("235")) {
                    step = 6;
                    send(`MAIL FROM:<${from}>`);
                } else if (step === 6 && line.includes("250")) {
                    step = 7;
                    send(`RCPT TO:<${to}>`);
                } else if (step === 7 && line.includes("250")) {
                    step = 8;
                    send("DATA");
                } else if (step === 8 && line.includes("354")) {
                    step = 9;
                    const headers = [
                        `From: ${from}`,
                        `To: ${to}`,
                        `Subject: ${subject}`,
                        `MIME-Version: 1.0`,
                        html
                            ? `Content-Type: multipart/alternative; boundary="multimate_boundary"`
                            : `Content-Type: text/plain; charset="UTF-8"`,
                        "",
                        ""
                    ].join("\r\n");

                    let emailBody: string;
                    if (html) {
                        emailBody = [
                            headers,
                            `--multimate_boundary`,
                            `Content-Type: text/plain; charset="UTF-8"`,
                            "",
                            body,
                            "",
                            `--multimate_boundary`,
                            `Content-Type: text/html; charset="UTF-8"`,
                            "",
                            html,
                            "",
                            `--multimate_boundary--`,
                            "."
                        ].join("\r\n");
                    } else {
                        const plainBody = body.replace(/^\./gm, "..");
                        emailBody = [headers, plainBody, "", "."].join("\r\n");
                    }

                    send(emailBody);
                } else if (step === 9 && line.includes("250")) {
                    step = 10;
                    send("QUIT");
                } else if (step === 10 && line.includes("221")) {
                    socket.end();
                    resolve(`Email sent successfully to ${to}`);
                }
            }
        };

        const onData = (d: Buffer) => handleData(d.toString());
        const onError = (err: Error) => reject(err);

        if (port === 465) {
            const tlsSocket = tls.connect({ host, port, rejectUnauthorized: true });
            socket = tlsSocket;
            tlsSocket.on("data", onData);
            tlsSocket.on("error", onError);
        } else {
            socket = net.createConnection(port, host);
            socket.on("data", onData);
            socket.on("error", onError);
        }

        socket.setTimeout(30000);
        socket.on("timeout", () => {
            socket.destroy();
            reject(new Error("SMTP connection timed out"));
        });
    });
}

async function sendViaBackend(params: {
    to: string;
    subject: string;
    body: string;
    html?: string;
}): Promise<string> {
    const response = await Server.post("/email/api/send", {
        to: params.to,
        subject: params.subject,
        body: params.body,
        html_body: params.html
    });
    if (!response.data.success) {
        throw new Error(response.data.message || "Backend email request failed");
    }
    return `Email sent successfully to ${params.to}`;
}

export const emailtool = tool(
    async ({ to, subject, body, html_body, smtp_host, smtp_port, smtp_user, smtp_pass }) => {
        try {
            if (smtp_host) {
                const port = smtp_port || 587;
                const user = smtp_user || process.env.VITE_SMTP_USER || "";
                const pass = smtp_pass || process.env.VITE_SMTP_PASS || "";
                if (!user || !pass) {
                    return "Error: SMTP username and password required when using custom SMTP host.";
                }
                const result = await sendSmtpMail({ host: smtp_host, port, user, pass, to, subject, body, html: html_body });
                return result;
            }

            if (process.env.VITE_SMTP_HOST) {
                const host = process.env.VITE_SMTP_HOST;
                const port = parseInt(process.env.VITE_SMTP_PORT || "587", 10);
                const user = process.env.VITE_SMTP_USER || "";
                const pass = process.env.VITE_SMTP_PASS || "";
                if (user && pass) {
                    const result = await sendSmtpMail({ host, port, user, pass, to, subject, body, html: html_body });
                    return result;
                }
            }

            if (process.env.CURRENT_AUTH_TOKEN) {
                try {
                    return await sendViaBackend({ to, subject, body, html: html_body });
                } catch (backendErr: any) {
                    return `Email send failed: ${backendErr.message}. Save your SMTP credentials in LocalAgent first.`;
                }
            }

            return `Error: No email sending method available. Provide smtp_host or configure SMTP credentials in LocalAgent.`;
        } catch (err: any) {
            return `Email error: ${err.message}`;
        }
    },
    {
        name: "send_email",
        description: "Send an email. Priority: 1) custom SMTP host if provided, 2) backend API (uses server's Gmail OAuth or user's stored SMTP creds), 3) SMTP from env vars. Supports plain text and HTML.",
        schema: z.object({
            to: z.string().describe("Recipient email address"),
            subject: z.string().describe("Email subject line"),
            body: z.string().describe("Plain text body of the email"),
            html_body: z.string().optional().describe("Optional HTML version of the email body"),
            smtp_host: z.string().optional().describe("SMTP server hostname (uses env defaults if omitted)"),
            smtp_port: z.number().optional().describe("SMTP port (default: 587)"),
            smtp_user: z.string().optional().describe("SMTP username (overrides VITE_SMTP_USER)"),
            smtp_pass: z.string().optional().describe("SMTP password (overrides VITE_SMTP_PASS)")
        })
    }
);
