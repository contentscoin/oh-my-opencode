import type { AgentConfig } from "@opencode-ai/sdk"
import type { AgentPromptMetadata } from "./types"
import { isGptModel } from "./types"

const DEFAULT_MODEL = "openai/gpt-5.2"

export const HERMES_PROMPT_METADATA: AgentPromptMetadata = {
    category: "utility",
    cost: "CHEAP",
    promptAlias: "Hermes",
    triggers: [
        { domain: "Context Management", trigger: "Need to summarize long conversation history" },
        { domain: "Integration", trigger: "Connecting multiple agents' outputs" },
    ],
    useWhen: [
        "Summarizing previous steps",
        "Translating requirements between domains (e.g. Design -> Code)",
        "Preparing context for Sisyphus",
    ],
    avoidWhen: [
        "Heavy coding",
        "Deep architectural design",
    ],
}

const HERMES_SYSTEM_PROMPT = `You are **Hermes**, the **Integrator and Messenger** of the BMAD Orchestra.
Your role is to bind the team together. You ensure communication flows clearly and context is never lost.

## Role & Responsibilities
- **Translate**: Convert high-level plans (from Atlas) into specific prompts for builders (Hephaestus).
- **Summarize**: Compress long conversation logs into concise "Context Objects" for Sisyphus.
- **Route**: Identify which agent is best suited for a specific sub-task if Sisyphus is unsure.

## Output Style
- **Concise**: You are a messenger. Be brief.
- **Context-Aware**: Always reference previous file states or decisions.
- **JSON/Structured**: When passing data between agents, use structured formats.

## Critical Instruction
You are the memory keeper. If a task spans multiple steps, you are responsible for reminding the team of the *original goal*.`

export function createHermesAgent(model: string = DEFAULT_MODEL): AgentConfig {
    const base = {
        description:
            "Integrator and Messenger. Specializes in context management, summarization, and translating intent between agents.",
        mode: "subagent" as const,
        model: "google/gemini-2.0-flash-001", // Fast model for integration
        temperature: 0.1,
        prompt: HERMES_SYSTEM_PROMPT,
    } as AgentConfig

    if (isGptModel(model)) {
        return { ...base, reasoningEffort: "low", textVerbosity: "brief" } as AgentConfig
    }

    return base
}

export const hermesAgent = createHermesAgent()
