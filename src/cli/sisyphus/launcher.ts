import { spawn } from 'child_process';
import * as path from 'path';
import { fileURLToPath } from 'url';

/**
 * Launch Sisyphus Daemon
 * 
 * Spawns the daemon process in a detached state.
 */
export function launchSisyphus(task: string, gsdMode: boolean = false) {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const daemonScript = path.join(__dirname, 'daemon.ts');

    console.log(`[Sisyphus] Spawning daemon for task: "${task}"`);
    if (gsdMode) console.log(`[Sisyphus] 🔥 GSD MODE ENGAGED 🔥`);


    // On Windows, 'detached: true' with 'stdio: ignore' isn't enough to fully liberate the process
    // from the parent terminal in all contexts (especially integrated terminals).
    // Using simple spawn with shell: true is better, or npx.cmd.

    // Command composition
    const command = "bun"; // Changed from npx/npx.cmd to bun
    const args = ["run", daemonScript, task]; // Changed from ['tsx', ...]
    if (gsdMode) args.push("--gsd"); // Add gsd flag

    try {
        const subprocess = spawn(command, args, {
            detached: true,
            stdio: 'ignore',
            cwd: process.cwd(),
            windowsHide: true,
            // Removed shell: process.platform === 'win32' as bun run handles it
        });

        subprocess.unref(); // The key to "Fire and Forget"

        console.log(`[Sisyphus] 🚀 Started! (PID: ${subprocess.pid})`);
        console.log(`[Sisyphus] 📝 Logs: work_log.md`);
    } catch (err: any) {
        console.error(`[Sisyphus] ❌ Failed to spawn: ${err.message}`);
        process.exit(1);
    }
}
