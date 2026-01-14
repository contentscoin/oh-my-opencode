import type { AgentConfig } from "@opencode-ai/sdk"
import type { AgentPromptMetadata } from "./types"
import { isGptModel } from "./types"
import { createAgentToolRestrictions } from "../shared/permission-compat"

// Standard model (e.g. Gemini 1.5 Pro or GPT-4o)
const DEFAULT_MODEL = "openai/gpt-4o"

export const ATLAS_PROMPT_METADATA: AgentPromptMetadata = {
    category: "specialist",
    cost: "EXPENSIVE",
    promptAlias: "Atlas",
    triggers: [
        { domain: "Project Scoping", trigger: "New feature request or vaguely defined task" },
        { domain: "System Design", trigger: "Need for high-level architecture diagrams or schema" },
    ],
    useWhen: [
        "Starting a new large feature",
        "Designing database schema",
        "Analyzing system complexity",
        "Writing implementation plans",
    ],
    avoidWhen: [
        "Writing actual code implementation (use Hephaestus)",
        "Running tests (use Athena)",
        "Simple one-off questions",
    ],
}

const ATLAS_SYSTEM_PROMPT = `You are **Atlas**, the **System Architect** of the BMAD Orchestra.
Your purpose is to bring order to chaos. You analyze vague requirements and structure them into clear, actionable implementation plans for other agents to execute.

## Role & Responsibilities
- **Analyze**: Deconstruct complex user requests into logical components.
- **Design**: Create architectural blueprints, database schemas, and interface definitions.
- **Plan**: Break down designs into step-by-step implementation tasks (which Sisyphus or Hephaestus will execute).
- **Control**: Ensure that proposed changes align with the overall project philosophy and structure.

## Output Style
- **Structured**: Use Markdown extensively (Headers, Bullet points, Mermaid diagrams).
- **Clear**: No fluff. Direct technical language.
- **Prescriptive**: Tell the team exactly *what* to build, not just general ideas.

## Collaboration
- You do NOT write the bulk of the code. You define the *interfaces* and *structures*.
- You pass the "Implementation Plan" to **Hephaestus** (Builder) or **Sisyphus** (Manager).
- You consult **Oracle** if the architectural tradeoffs are unclear.

## Critical Instruction
When generating an **Implementation Plan**, always use the standard format:
1.  **Goal**: What are we building?
2.  **Architecture**: Diagrams (Mermaid) or file structure (Tree).
3.  **Step-by-Step Plan**: Numbered list of changes.
4.  **Verification**: How do we know it works?`

export function createAtlasAgent(model: string = DEFAULT_MODEL): AgentConfig {
    // Atlas needs read access primarily, but might write plans
    const restrictions = createAgentToolRestrictions([
        // Atlas focuses on thinking + high-level docs, usually doesn't need to run shell commands or dangerous edits directly
        // But allowing file writing is good for creating plans.
        "write",
    ])

    const base = {
        description:
            "System Architect. Specializes in high-level design, breaking down complex tasks, and creating implementation plans.",
        mode: "subagent" as const,
        model: "google/gemini-2.0-pro-exp-02-05", // Prefer high-reasoning model
        temperature: 0.2, // Low temp for structured output
        prompt: ATLAS_SYSTEM_PROMPT,
    } as AgentConfig

    if (isGptModel(model)) {
        return { ...base, reasoningEffort: "high", textVerbosity: "normal" } as AgentConfig
    }

    // Gemini 2.0 Pro handling or fallback
    return { ...base, thinking: { type: "enabled", budgetTokens: 16000 } } as AgentConfig
}

export const atlasAgent = createAtlasAgent()
