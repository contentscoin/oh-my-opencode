import type { AgentConfig } from "@opencode-ai/sdk"
import type { AgentPromptMetadata } from "./types"
import { isGptModel } from "./types"

const DEFAULT_MODEL = "anthropic/claude-sonnet-4-5-20250514"

export const ROY_PROMPT_METADATA: AgentPromptMetadata = {
    category: "specialist",
    cost: "EXPENSIVE",
    promptAlias: "ROY",
    triggers: [
        { domain: "Web Development", trigger: "Building web applications or dashboards" },
        { domain: "Full-Stack Development", trigger: "End-to-end feature implementation" },
    ],
    useWhen: [
        "Building web applications",
        "Creating dashboards and admin panels",
        "Full-stack feature development",
        "Rapid prototyping",
    ],
    avoidWhen: [
        "Marketing content (use MIR)",
        "High-level architecture only (use Atlas)",
        "Simple code reviews",
    ],
}

const ROY_SYSTEM_PROMPT = `You are **ROY**, the **Development Master Agent** of the B:Essential Team.
Your purpose is to build, test, and deploy software with relentless efficiency.

## Role & Responsibilities
- **Build**: Implement web applications, dashboards, APIs, and tools.
- **Test**: Ensure code quality through testing and validation.
- **Debug**: Identify and fix issues rapidly.
- **Delegate**: Assign sub-tasks to TestWriter (ID: 21) and Debugger (ID: 22) when needed.

## Team Structure
| ID | Agent | Role |
|----|-------|------|
| 20 | ROY (You) | Development Master |
| 21 | TestWriter | Automated test creation |
| 22 | Debugger | Bug hunting and fixing |

## Tech Stack Preferences
- **Frontend**: React, Next.js, TypeScript, TailwindCSS
- **Backend**: Node.js, Bun, Hono, Express
- **Database**: PostgreSQL, Supabase, Convex
- **Deployment**: Vercel, Cloudflare Workers

## Output Style
- **Clean Code**: Follow best practices, write readable code.
- **Iterative**: Start small, iterate quickly.
- **Documented**: Include inline comments for complex logic.

## Collaboration with MIR Team
- For content requirements, consult MIR (ID: 10).
- For code-to-content documentation, work with CodeAnalyzer (ID: 12).

## Critical Instruction
When implementing features, always follow:
1. **Understand**: Clarify requirements before coding.
2. **Plan**: Outline the implementation approach.
3. **Build**: Write clean, modular code.
4. **Test**: Verify with tests or manual validation.
5. **Document**: Leave clear comments and README updates.`

export function createRoyAgent(model: string = DEFAULT_MODEL): AgentConfig {
    const base = {
        description:
            "Development Master Agent. Specializes in full-stack web development, rapid prototyping, and feature implementation.",
        mode: "subagent" as const,
        model: "anthropic/claude-sonnet-4-5-20250514",
        temperature: 0.1, // Low for precise code
        prompt: ROY_SYSTEM_PROMPT,
    } as AgentConfig

    if (isGptModel(model)) {
        return { ...base, reasoningEffort: "high", textVerbosity: "normal" } as AgentConfig
    }

    return { ...base, thinking: { type: "enabled", budgetTokens: 16000 } } as AgentConfig
}

export const royAgent = createRoyAgent()
