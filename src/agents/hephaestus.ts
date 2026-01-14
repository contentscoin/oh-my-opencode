import type { AgentConfig } from "@opencode-ai/sdk"
import type { AgentPromptMetadata } from "./types"
import { isGptModel } from "./types"
import { createAgentToolRestrictions } from "../shared/permission-compat"

const DEFAULT_MODEL = "openai/gpt-4o"

export const HEPHAESTUS_PROMPT_METADATA: AgentPromptMetadata = {
    category: "specialist",
    cost: "EXPENSIVE",
    promptAlias: "Hephaestus",
    triggers: [
        { domain: "Implementation", trigger: "Writing new files or complex refactoring" },
        { domain: "Bug Fixing", trigger: "Applying concrete code changes to fix errors" },
    ],
    useWhen: [
        "Writing code",
        "Refactoring existing files",
        "Implementing features based on Atlas plans",
    ],
    avoidWhen: [
        "Planning/Architecture (use Atlas)",
        "Running tests only (use Athena)",
    ],
}

const HEPHAESTUS_SYSTEM_PROMPT = `You are **Hephaestus**, the **Builder** of the BMAD Orchestra.
Your sole purpose is to write high-quality, working code. You do not plan; you execute.

## Role & Responsibilities
- **Build**: creating new files and implementing features.
- **Refactor**: Improving code structure without changing behavior.
- **Fix**: Resolving bugs identified by Athena or Sisyphus.

## Guidelines
- **Precision**: You are a master smith. Your code must be syntactically correct and follow project style.
- **Safety**: Always read a file before modifying it. Use `view_file` or `grep_search` to understand the context.
- **Relentless**: In GSD mode, if an edit fails, try a different approach immediately.

## Output
- Your output is primarily Tool Calls (`write_to_file`, `replace_file_content`).
- Explain *what* you changed briefly.`

export function createHephaestusAgent(model: string = DEFAULT_MODEL): AgentConfig {
    // Hephaestus is the primary writer
    const restrictions = createAgentToolRestrictions([]) // No restrictions on writing

    const base = {
        description:
            "The Builder. Specialized in writing code, refactoring, and implementing features. Has full write access.",
        mode: "subagent" as const,
        model: "google/gemini-2.0-pro-exp-02-05", // Strong coding model
        temperature: 0.1,
        prompt: HEPHAESTUS_SYSTEM_PROMPT,
    } as AgentConfig

    if (isGptModel(model)) {
        return { ...base, reasoningEffort: "high", textVerbosity: "normal" } as AgentConfig
    }

    return { ...base, thinking: { type: "enabled", budgetTokens: 16000 } } as AgentConfig
}

export const hephaestusAgent = createHephaestusAgent()
