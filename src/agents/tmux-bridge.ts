/**
 * tmux Bridge for B:Essential Gemini CLI Integration
 * 
 * Enables Sisyphus to delegate tasks to tmux sessions running Gemini CLI agents.
 * This is the hybrid approach (Option C) combining oh-my-opencode with bessential.
 */

import { exec } from "child_process"
import { promisify } from "util"

const execAsync = promisify(exec)

/**
 * Agent ID mapping (aligned with B:Essential)
 */
export const TMUX_AGENT_IDS = {
    JIAN: 0,      // Orchestrator (Antigravity IDE)
    MIR: 10,      // Marketing Master
    WEB_SCRAPER: 11,
    CODE_ANALYZER: 12,
    ROY: 20,      // Development Master
    TEST_WRITER: 21,
    DEBUGGER: 22,
} as const

export type TmuxAgentId = typeof TMUX_AGENT_IDS[keyof typeof TMUX_AGENT_IDS]

/**
 * Check if tmux is available on the system
 */
export async function isTmuxAvailable(): Promise<boolean> {
    try {
        await execAsync("tmux -V")
        return true
    } catch {
        return false
    }
}

/**
 * Check if a tmux session exists
 */
export async function sessionExists(sessionId: number): Promise<boolean> {
    try {
        await execAsync(`tmux has-session -t ${sessionId} 2>/dev/null`)
        return true
    } catch {
        return false
    }
}

/**
 * List all B:Essential tmux sessions
 */
export async function listBessentialSessions(): Promise<Array<{ id: number; name: string }>> {
    try {
        const { stdout } = await execAsync("tmux list-sessions -F '#{session_name}'")
        const sessions = stdout.trim().split("\n").filter(Boolean)

        return sessions
            .map(name => {
                const id = parseInt(name, 10)
                return isNaN(id) ? null : { id, name }
            })
            .filter((s): s is { id: number; name: string } => s !== null)
    } catch {
        return []
    }
}

/**
 * Send a message to a tmux session (Gemini CLI agent)
 * 
 * @param agentId - The agent ID (10=MIR, 20=ROY, etc.)
 * @param message - The message/command to send
 * @returns Whether the message was sent successfully
 */
export async function delegateToTmux(
    agentId: TmuxAgentId,
    message: string
): Promise<{ success: boolean; error?: string }> {
    try {
        // Check tmux availability
        const tmuxAvailable = await isTmuxAvailable()
        if (!tmuxAvailable) {
            return {
                success: false,
                error: "tmux is not installed. Install with: brew install tmux (macOS) or apt install tmux (Linux)"
            }
        }

        // Check if session exists
        const exists = await sessionExists(agentId)
        if (!exists) {
            return {
                success: false,
                error: `tmux session ${agentId} not found. Start B:Essential agents first with: ./.orchestration/orchestrate.sh start`
            }
        }

        // Escape the message for shell
        const escapedMessage = message.replace(/"/g, '\\"').replace(/\$/g, '\\$')

        // Send the message
        await execAsync(`tmux send-keys -t ${agentId} "${escapedMessage}" Enter`)

        return { success: true }
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : String(error)
        }
    }
}

/**
 * Create a new tmux session for an agent
 * 
 * @param agentId - The agent ID
 * @param command - Optional initial command (e.g., "gemini")
 */
export async function createTmuxSession(
    agentId: TmuxAgentId,
    command: string = "gemini"
): Promise<{ success: boolean; error?: string }> {
    try {
        const tmuxAvailable = await isTmuxAvailable()
        if (!tmuxAvailable) {
            return { success: false, error: "tmux is not installed" }
        }

        // Create detached session with the command
        await execAsync(`tmux new-session -d -s ${agentId} "${command}"`)

        return { success: true }
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : String(error)
        }
    }
}

/**
 * Kill a tmux session
 */
export async function killTmuxSession(agentId: TmuxAgentId): Promise<boolean> {
    try {
        await execAsync(`tmux kill-session -t ${agentId}`)
        return true
    } catch {
        return false
    }
}

/**
 * High-level function: Delegate to MIR (Marketing)
 */
export async function delegateToMir(message: string) {
    return delegateToTmux(TMUX_AGENT_IDS.MIR, message)
}

/**
 * High-level function: Delegate to ROY (Development)
 */
export async function delegateToRoy(message: string) {
    return delegateToTmux(TMUX_AGENT_IDS.ROY, message)
}

/**
 * Start all B:Essential agents in tmux sessions
 * This replicates the orchestrate.sh start command
 */
export async function startBessentialAgents(): Promise<{
    success: boolean
    started: TmuxAgentId[]
    errors: string[]
}> {
    const agentsToStart: Array<{ id: TmuxAgentId; name: string }> = [
        { id: TMUX_AGENT_IDS.MIR, name: "MIR" },
        { id: TMUX_AGENT_IDS.ROY, name: "ROY" },
    ]

    const started: TmuxAgentId[] = []
    const errors: string[] = []

    for (const agent of agentsToStart) {
        const result = await createTmuxSession(agent.id)
        if (result.success) {
            started.push(agent.id)
        } else {
            errors.push(`${agent.name}: ${result.error}`)
        }
    }

    return {
        success: errors.length === 0,
        started,
        errors,
    }
}

/**
 * Stop all B:Essential agents
 */
export async function stopBessentialAgents(): Promise<number> {
    let killed = 0
    for (const id of Object.values(TMUX_AGENT_IDS)) {
        if (await killTmuxSession(id)) killed++
    }
    return killed
}
