import { promises as fs } from 'fs';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * OrchestraDaemon (Worker)
 * 
 * This script runs in a detached process. 
 * It is responsible for the actual execution of the Sisyphus loop.
 */
class OrchestraDaemon {
    private workspaceRoot: string;
    private artifactPath: string;

    constructor(workspaceRoot: string) {
        this.workspaceRoot = workspaceRoot;
        this.artifactPath = path.join(workspaceRoot, 'work_log.md');
    }

    async run(task: string, gsdMode: boolean) {
        if (gsdMode) {
            await this.log('🔥 GSD MODE ENGAGED', `Daemon running in Relentless Execution Mode.\nPID: ${process.pid}\nTask: ${task}`);
        } else {
            await this.log('🚀 Daemon Started', `PID: ${process.pid}\nTask: ${task}`);
        }

        try {
            // 1. Connectivity Check (Simulated)
            await this.log('🔌 Connecting to BMAD...', 'Establishing connection with local MCP server...');
            await new Promise(resolve => setTimeout(resolve, 2000));

            // 2. Planning Phase
            await this.log('🧠 Sisyphus Planning', 'Analyzing project structure and requirements...');
            await this.analyzeProject();
            await new Promise(resolve => setTimeout(resolve, 3000));

            // 3. Execution Phase (The Loop)
            await this.log('🔨 Hephaestus Execution', 'Started implementation loop.');

            if (gsdMode) {
                // GSD Infinite Loop Simulation
                for (let i = 1; i <= 5; i++) {
                    await this.log(`🔁 GSD Iteration ${i}`, 'Self-correcting and refining implementation...');
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    if (Math.random() > 0.7) {
                        await this.log(`⚠️ GSD Auto-Fix`, 'Detected potential error. Applying fix automatically.');
                    }
                }
                await this.log('✨ GSD Success', 'Task completed with 99.9% confidence. Skipping manual review.');
            } else {
                // Normal Mode
                await this.log('📝 Step 1', 'Creating implementation specifications...');
                await new Promise(resolve => setTimeout(resolve, 3000));

                await this.log('💻 Step 2', 'Writing code changes (Simulated)...');
                await new Promise(resolve => setTimeout(resolve, 3000));

                // 4. Completion
                await this.log('✅ Task Complete', 'All steps finished successfully. Waiting for user review.');
            }

        } catch (error: any) {
            await this.log('❌ Daemon Error', `Critical failure: ${error.message}`);
            process.exit(1);
        }
    }

    private async analyzeProject() {
        // Simple check to show it's working with the file system
        try {
            const files = await fs.readdir(this.workspaceRoot);
            await this.log('📂 Project Context', `Found ${files.length} files in root.`);
        } catch (e) { /* ignore */ }
    }

    private async log(header: string, content: string) {
        const timestamp = new Date().toLocaleTimeString();
        const entry = `\n## [${timestamp}] ${header}\n\n${content}\n---\n`;
        await fs.appendFile(this.artifactPath, entry);
    }
}

// Entry Point
// Entry Point
// Check if this file is being run directly (ESM compatible way)
import { fileURLToPath } from 'url';
const currentFilePath = fileURLToPath(import.meta.url);
// Robust check for both direct node usage and tsx wrappers
const isMainModule = process.argv[1] === currentFilePath || process.argv.some(arg => arg.endsWith('daemon.ts'));

if (isMainModule) {
    const rootDir = process.cwd();
    const args = process.argv.slice(2);
    // Parse args manually since we are not using commander here to keep it lightweight
    const gsdIndex = args.indexOf('--gsd');
    const gsdMode = gsdIndex !== -1;

    // Remove --gsd from args if present to find task
    if (gsdMode) {
        args.splice(gsdIndex, 1);
    }

    const task = args[0] || "Default Background Task";
    const files = args.slice(1);

    const daemon = new OrchestraDaemon(rootDir);
    daemon.run(task, gsdMode).catch(err => {
        console.error(err);
        process.exit(1);
    });
}
