/**
 * Gemini CLI Direct Integration
 * 
 * Provides direct integration with Google's Gemini CLI (@google/gemini-cli)
 * for executing AI prompts from oh-my-opencode.
 */

import { spawn, exec } from "child_process"
import { promisify } from "util"

const execAsync = promisify(exec)

/**
 * Check if Gemini CLI is installed and available
 */
export async function isGeminiCliInstalled(): Promise<boolean> {
    try {
        await execAsync("gemini --version")
        return true
    } catch {
        return false
    }
}

/**
 * Install Gemini CLI globally
 */
export async function installGeminiCli(): Promise<{ success: boolean; error?: string }> {
    try {
        await execAsync("npm install -g @google/gemini-cli")
        return { success: true }
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : String(error)
        }
    }
}

/**
 * Result from a Gemini CLI execution
 */
export interface GeminiCliResult {
    success: boolean
    output: string
    error?: string
}

/**
 * Execute a prompt using Gemini CLI in non-interactive (headless) mode
 * 
 * @param prompt - The prompt to send to Gemini
 * @param options - Additional options
 * @returns The result from Gemini CLI
 */
export async function executeGeminiPrompt(
    prompt: string,
    options: {
        /** Working directory for the command */
        cwd?: string
        /** Timeout in milliseconds (default: 5 minutes) */
        timeout?: number
        /** Use sandbox mode for security */
        sandbox?: boolean
    } = {}
): Promise<GeminiCliResult> {
    const { cwd = process.cwd(), timeout = 5 * 60 * 1000, sandbox = false } = options

    try {
        // Check if Gemini CLI is installed
        const installed = await isGeminiCliInstalled()
        if (!installed) {
            return {
                success: false,
                output: "",
                error: "Gemini CLI is not installed. Run: npm install -g @google/gemini-cli"
            }
        }

        // Build command arguments
        const args = ["--prompt", prompt]
        if (sandbox) {
            args.push("--sandbox")
        }

        // Execute Gemini CLI
        const { stdout, stderr } = await execAsync(
            `gemini ${args.map(a => `"${a.replace(/"/g, '\\"')}"`).join(" ")}`,
            { cwd, timeout }
        )

        return {
            success: true,
            output: stdout,
            error: stderr || undefined
        }
    } catch (error) {
        return {
            success: false,
            output: "",
            error: error instanceof Error ? error.message : String(error)
        }
    }
}

/**
 * Start an interactive Gemini CLI session
 * Returns a handle to interact with the session
 */
export function startGeminiSession(options: {
    cwd?: string
    onOutput?: (data: string) => void
    onError?: (data: string) => void
    onClose?: (code: number | null) => void
} = {}): {
    process: ReturnType<typeof spawn>
    send: (input: string) => void
    close: () => void
} {
    const { cwd = process.cwd(), onOutput, onError, onClose } = options

    const geminiProcess = spawn("gemini", [], {
        cwd,
        shell: true,
        stdio: ["pipe", "pipe", "pipe"]
    })

    if (onOutput && geminiProcess.stdout) {
        geminiProcess.stdout.on("data", (data) => onOutput(data.toString()))
    }

    if (onError && geminiProcess.stderr) {
        geminiProcess.stderr.on("data", (data) => onError(data.toString()))
    }

    if (onClose) {
        geminiProcess.on("close", onClose)
    }

    return {
        process: geminiProcess,
        send: (input: string) => {
            if (geminiProcess.stdin) {
                geminiProcess.stdin.write(input + "\n")
            }
        },
        close: () => {
            geminiProcess.kill()
        }
    }
}

/**
 * Execute a prompt for MIR (Marketing) tasks using Gemini CLI
 */
export async function geminiMirPrompt(task: string): Promise<GeminiCliResult> {
    const mirContext = `You are MIR, a Marketing Master Agent. Your specialties include:
- Content strategy and OSMU (One Source Multi Use) content creation
- Market research and competitive analysis
- SEO optimization and engagement metrics

Task: ${task}

Provide a detailed, actionable response.`

    return executeGeminiPrompt(mirContext)
}

/**
 * Execute a prompt for ROY (Development) tasks using Gemini CLI
 */
export async function geminiRoyPrompt(task: string): Promise<GeminiCliResult> {
    const royContext = `You are ROY, a Development Master Agent. Your specialties include:
- Full-stack web development (React, Next.js, Node.js)
- API design and database architecture
- Testing and debugging

Task: ${task}

Provide clean, well-documented code with explanations.`

    return executeGeminiPrompt(royContext)
}

/**
 * Gemini CLI configuration for GEMINI.md file
 */
export const GEMINI_MD_TEMPLATE = `# GEMINI.md - B:Essential Agent Configuration

## Agent Identity
This project uses the B:Essential Multi-Agent Orchestration system.

## Available Agents
| ID | Name | Role |
|----|------|------|
| 00 | JIAN | Orchestrator |
| 10 | MIR | Marketing Master |
| 20 | ROY | Development Master |

## Communication Protocol
- Use tmux sessions for parallel agent execution
- Delegate marketing tasks to MIR (ID: 10)
- Delegate development tasks to ROY (ID: 20)

## Project Context
[Add your project-specific context here]
`

/**
 * Create a GEMINI.md file in the project root
 */
export async function createGeminiMdFile(
    projectPath: string,
    customContent?: string
): Promise<{ success: boolean; path: string; error?: string }> {
    const fs = await import("fs/promises")
    const path = await import("path")

    const geminiMdPath = path.join(projectPath, "GEMINI.md")
    const content = customContent || GEMINI_MD_TEMPLATE

    try {
        await fs.writeFile(geminiMdPath, content, "utf-8")
        return { success: true, path: geminiMdPath }
    } catch (error) {
        return {
            success: false,
            path: geminiMdPath,
            error: error instanceof Error ? error.message : String(error)
        }
    }
}
