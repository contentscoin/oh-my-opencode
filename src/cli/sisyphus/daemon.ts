
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

// ============================================================================
// Brain Link Layer (File-based AI Bridge)
// ============================================================================

const BRAIN_LINK_FILE = path.resolve(process.cwd(), 'brain_link.json');

async function getAccessToken(): Promise<string | null> {
    return "BRAIN_LINK_DUMMY_TOKEN";
}

async function callAgent(agentName: string, agentSystemPrompt: string, userMessage: string, token: string): Promise<AgentResponse> {
    const payload = {
        agent: agentName,
        system: agentSystemPrompt,
        message: userMessage,
        status: "pending",
        response: null,
        timestamp: Date.now()
    };

    // 1. Write Request
    await fs.writeFile(BRAIN_LINK_FILE, JSON.stringify(payload, null, 2));

    // 2. Poll for Response
    console.log(`[Brain Link] Waiting for Antigravity response for ${agentName}...`);

    while (true) {
        await new Promise(resolve => setTimeout(resolve, 2000)); // Poll every 2s

        try {
            const content = await fs.readFile(BRAIN_LINK_FILE, "utf-8");
            const data = JSON.parse(content);

            if (data.status === "completed" && data.response) {
                return { text: data.response };
            }
        } catch (e) {
            // Ignore read errors (race conditions)
        }
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
    console.log("[DEBUG] Daemon process started");
    console.log("[DEBUG] Arguments:", process.argv);
    try {
        const args = process.argv.slice(2);
        const gsdIndex = args.indexOf('--gsd');
        let gsdMode = false;

        if (gsdIndex !== -1) {
            gsdMode = true;
            args.splice(gsdIndex, 1); // Remove flag from task args
        }

        const task = args[0] || "Default Task";
        new OrchestraDaemon().run(task, gsdMode);
    } catch (err) {
        console.error("[DEBUG] Daemon crashed:", err);
        process.exit(1);
    }
}
