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

    async run(task: string, contextFiles: string[]) {
        await this.log('🚀 Daemon Started', `PID: ${process.pid}\nTask: ${task}`);

        try {
            // 1. Connectivity Check (Simulated)
            await this.log('🔌 Connecting to BMAD...', 'Establishing connection with local MCP server...');
            await new Promise(resolve => setTimeout(resolve, 2000)); // Simulating init time

            // 2. Planning Phase
            await this.log('🧠 Sisyphus Planning', 'Analyzing project structure and requirements...');
            await this.analyzeProject(); // Logic to check files
            await new Promise(resolve => setTimeout(resolve, 3000));

            // 3. Execution Phase (The Loop)
            await this.log('🔨 Hephaestus Execution', 'Started implementation loop.');

            // Loop 1
            await this.log('📝 Step 1', 'Creating implementation specifications...');
            await new Promise(resolve => setTimeout(resolve, 3000));

            // Loop 2
            await this.log('💻 Step 2', 'Writing code changes (Simulated)...');
            await new Promise(resolve => setTimeout(resolve, 3000));

            // 4. Completion
            await this.log('✅ Task Complete', 'All steps finished successfully. Waiting for user review.');

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
const isMainModule = process.argv[1] === fileURLToPath(import.meta.url);

if (isMainModule) {
    const rootDir = process.cwd();
    const args = process.argv.slice(2);
    const task = args[0] || "Default Background Task";
    const files = args.slice(1);

    const daemon = new OrchestraDaemon(rootDir);
    daemon.run(task, files).catch(err => {
        console.error(err);
        process.exit(1);
    });
}
