
import { spawn } from "child_process";
import * as fs from "fs/promises";
import * as path from "path";
import * as os from "os";
import { format } from "util";
import { atlasAgent, hephaestusAgent, athenaAgent, hermesAgent } from "../../agents";

// ============================================================================
// Types & Interfaces
// ============================================================================

interface TaskContext {
    taskId: string;
    originalPrompt: string;
    plan?: string;
    currentStep: number;
    maxSteps: number;
    history: string[];
}

interface AgentResponse {
    text: string;
    toolCalls?: any[];
}

// ============================================================================
// Auth & Network Layer
// ============================================================================

async function getAccessToken(): Promise<string | null> {
    try {
        const homeDir = os.homedir();
        const storagePath = path.join(homeDir, ".local", "share", "opencode", "oh-my-opencode-accounts.json");

        const content = await fs.readFile(storagePath, "utf-8");
        const data = JSON.parse(content);

        if (data.accounts && data.accounts.length > 0) {
            // Simply take the first available token for now
            // In a full implementation, we'd use the AccountManager logic
            return data.accounts[0].accessToken;
        }
    } catch (e) {
        // Fallback for debugging/dev environments
        if (process.env.ANTIGRAVITY_ACCESS_TOKEN) {
            return process.env.ANTIGRAVITY_ACCESS_TOKEN;
        }
        console.error("Failed to load auth token:", e);
    }
    return null;
}

async function callAgent(agentName: string, agentSystemPrompt: string, userMessage: string, token: string): Promise<AgentResponse> {
    const EPOCH_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent";

    const body = {
        contents: [{
            role: "user",
            parts: [{ text: `[System: You are ${agentName}. ${agentSystemPrompt}]\n\nUser: ${userMessage}` }]
        }],
        generationConfig: {
            temperature: 0.2, // Structured output
            maxOutputTokens: 8192
        }
    };

    try {
        const response = await fetch(EPOCH_ENDPOINT, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}` // Antigravity/Gemini Auth
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`API Call Failed: ${response.status} - ${errText}`);
        }

        const data = await response.json() as any;
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "No response generated.";

        return { text };
    } catch (error) {
        return { text: `[Error calling ${agentName}]: ${error}` };
    }
}

// ============================================================================
// Orchestra Daemon
// ============================================================================

export class OrchestraDaemon {
    private isRunning = false;
    private logFile = path.resolve(process.cwd(), 'work_log.md');

    async run(task: string, gsdMode: boolean) {
        this.isRunning = true;
        await this.log('🚀 Daemon Started', `PID: ${process.pid}\nTask: ${task}\nMode: ${gsdMode ? '🔥 GSD (Relentless)' : 'Standard'}`);

        const token = await getAccessToken();
        if (!token) {
            await this.log('❌ Auth Error', 'Could not find valid Access Token in ~/.local/share/opencode/oh-my-opencode-accounts.json');
            return;
        }

        if (gsdMode) {
            await this.runGSDLoop(task, token);
        } else {
            await this.runStandardMode(task);
        }

        this.isRunning = false;
    }

    private async runGSDLoop(task: string, token: string) {
        await this.log('🔥 GSD Mode Engaged', 'Initializing BMAD Orchestra...');

        // 1. ATLAS (Architect)
        await this.log('🏛️ Atlas (Architect)', 'Analyzing task and generating plan...');
        const atlasResponse = await callAgent('Atlas', atlasAgent.prompt!, `Analyze this task and provide a strict JSON implementation plan:\n${task}`, token);
        await this.log('📝 Atlas Plan', atlasResponse.text);

        // 2. HEPHAESTUS (Builder) - Iterative Implementation
        let attempts = 0;
        const maxAttempts = 5;
        let currentCodeContext = ""; // Simplified context passing

        while (attempts < maxAttempts) {
            attempts++;
            await this.log(`🔨 Hephaestus (Builder) - Iteration ${attempts}`, 'Implementing/Refining code...');

            const hephPrompt = `Based on the Atlas Plan, implement the code. 
            Verification feedback (if any): ${currentCodeContext}
            Task: ${task}`;

            const hephResponse = await callAgent('Hephaestus', hephaestusAgent.prompt!, hephPrompt, token);
            await this.log('💻 Hephaestus Output', hephResponse.text);

            // 3. ATHENA (QA) - Verification
            await this.log('🛡️ Athena (QA)', 'Verifying implementation...');
            const athenaPrompt = `Review the following implementation code. 
            Does it satisfy the task: "${task}"?
            If PASS, reply with "VERDICT: PASS".
            If FAIL, reply with "VERDICT: FAIL" and explain why.
            
            Code to review:
            ${hephResponse.text}`;

            const athenaResponse = await callAgent('Athena', athenaAgent.prompt!, athenaPrompt, token);
            await this.log('🧐 Athena Verdict', athenaResponse.text);

            if (athenaResponse.text.includes("VERDICT: PASS")) {
                await this.log('✅ Success', 'Athena approved the implementation. Mission Complete.');
                break;
            } else {
                await this.log('⚠️ Verification Failed', 'Athena rejected the code. Retrying...');
                currentCodeContext = `Previous attempt failed. Athena's feedback: ${athenaResponse.text}`;
            }

            await new Promise(resolve => setTimeout(resolve, 2000)); // Cool down
        }

        if (attempts >= maxAttempts) {
            await this.log('❌ GSD Failed', 'Max iterations reached without Athena approval.');
        }
    }

    private async runStandardMode(task: string) {
        // Original simulation for non-GSD
        await this.log('ℹ️ Standard Mode', 'Running single pass execution (Simulation).');
        await new Promise(resolve => setTimeout(resolve, 1000));
        await this.log('✅ Task Complete', 'Waiting for user review.');
    }

    private async log(title: string, message: string) {
        const timestamp = new Date().toISOString();
        const logEntry = `\n## [${timestamp}] ${title}\n${message}\n`;

        try {
            await fs.appendFile(this.logFile, logEntry);
        } catch (error) {
            console.error('Failed to write to work log:', error);
        }
    }
}

// Entry Point
if (import.meta.main) { // Bun/ESM check
    const args = process.argv.slice(2);
    const gsdIndex = args.indexOf('--gsd');
    let gsdMode = false;

    if (gsdIndex !== -1) {
        gsdMode = true;
        args.splice(gsdIndex, 1); // Remove flag from task args
    }

    const task = args[0] || "Default Task";
    new OrchestraDaemon().run(task, gsdMode);
}
