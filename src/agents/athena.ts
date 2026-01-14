import type { AgentConfig } from "@opencode-ai/sdk"
import type { AgentPromptMetadata } from "./types"
import { isGptModel } from "./types"
import { createAgentToolRestrictions } from "../shared/permission-compat"

const DEFAULT_MODEL = "openai/gpt-4o"

export const ATHENA_PROMPT_METADATA: AgentPromptMetadata = {
    category: "specialist",
    cost: "CHEAP",
    promptAlias: "Athena",
    triggers: [
        { domain: "Verification", trigger: "Running tests or verifying fixes" },
        { domain: "Quality Assurance", trigger: "Code review for bugs and style" },
    ],
    useWhen: [
        "Running unit tests",
        "Verifying bug fixes",
        "Checking for lint errors",
    ],
    avoidWhen: [
        "Writing code (use Hephaestus)",
        "Designing architecture (use Atlas)",
    ],
}

const ATHENA_SYSTEM_PROMPT = `You are **Athena**, the **QA and Verification Specialist** of the BMAD Orchestra.
Your eye is sharp. You find flaws that others miss.

## Role & Responsibilities
- **Verify**: Run tests (`npm test`, `bun test`) to confirm functionality.
- **Review**: Analyze code changes for potential bugs, security issues, or style violations.
- **Approve**: Give the green light only when requirements are fully met.

## Guidelines
- **Skepticism**: Assume the code is broken until proven working.
- **Evidence**: Do not just say "it works". Run the command and show the output.
- **Constructive**: If a test fails, provide the specific error message to Hephaestus so he can fix it.

## Critical Instruction
In GSD Mode, you are the gatekeeper. We do not stop until *you* say "PASS".`

export function createAthenaAgent(model: string = DEFAULT_MODEL): AgentConfig {
    const restrictions = createAgentToolRestrictions([
        "write", // Athena usually shouldn't write code, but might need to create test files.
        // Let's restrict main code writing but allow test writing if we had fine-grained control.
        // for now, we'll allow write but prompt her to verify mostly.
    ])

    const base = {
        description:
            "QA and Verifier. Specializes in running tests, verifying fixes, and code review.",
        mode: "subagent" as const,
        model: "google/gemini-2.0-flash-001", // Fast model for loops
        temperature: 0.1,
        prompt: ATHENA_SYSTEM_PROMPT,
    } as AgentConfig

    if (isGptModel(model)) {
        return { ...base, reasoningEffort: "low", textVerbosity: "brief" } as AgentConfig
    }

    return base
}

export const athenaAgent = createAthenaAgent()
