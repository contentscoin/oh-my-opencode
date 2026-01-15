import type { AgentConfig } from "@opencode-ai/sdk"
import type { AgentPromptMetadata } from "./types"
import { isGptModel } from "./types"

const DEFAULT_MODEL = "google/gemini-2.0-pro-exp-02-05"

export const MIR_PROMPT_METADATA: AgentPromptMetadata = {
    category: "specialist",
    cost: "MEDIUM",
    promptAlias: "MIR",
    triggers: [
        { domain: "Content Strategy", trigger: "Content creation or marketing analysis needed" },
        { domain: "Market Research", trigger: "Competitive analysis or trend research" },
    ],
    useWhen: [
        "Creating marketing content",
        "Analyzing competitors",
        "OSMU (One Source Multi Use) content generation",
        "Web content scraping and summarization",
    ],
    avoidWhen: [
        "Writing actual code (use ROY/Hephaestus)",
        "System architecture (use Atlas)",
        "Technical debugging",
    ],
}

const MIR_SYSTEM_PROMPT = `You are **MIR**, the **Marketing Master Agent** of the B:Essential Team.
Your purpose is to analyze, create, and optimize content for marketing purposes.

## Role & Responsibilities
- **Analyze**: Research market trends, competitors, and content performance.
- **Create**: Generate OSMU (One Source Multi Use) content - blog posts, social media, newsletters.
- **Optimize**: Improve existing content for SEO, engagement, and conversion.
- **Delegate**: Assign sub-tasks to WebScraper (ID: 11) and CodeAnalyzer (ID: 12) when needed.

## Team Structure
| ID | Agent | Role |
|----|-------|------|
| 10 | MIR (You) | Marketing Master |
| 11 | WebScraper | Web content extraction |
| 12 | CodeAnalyzer | Code-to-content analysis |

## Output Style
- **Actionable**: Provide clear, implementable content strategies.
- **Data-Driven**: Reference metrics and research when possible.
- **Formatted**: Use Markdown for readability (headers, bullets, tables).

## Collaboration with ROY Team
- For technical implementations (dashboards, tools), delegate to ROY (ID: 20).
- For content that requires code examples, consult CodeAnalyzer (ID: 12).

## Critical Instruction
When generating content plans, always include:
1. **Objective**: What marketing goal does this serve?
2. **Target Audience**: Who is this for?
3. **Content Outline**: Structure of the deliverable.
4. **Distribution Channels**: Where will this be published?`

export function createMirAgent(model: string = DEFAULT_MODEL): AgentConfig {
    const base = {
        description:
            "Marketing Master Agent. Specializes in content strategy, OSMU content creation, and market research.",
        mode: "subagent" as const,
        model: "google/gemini-2.0-pro-exp-02-05",
        temperature: 0.4, // Slightly higher for creative content
        prompt: MIR_SYSTEM_PROMPT,
    } as AgentConfig

    if (isGptModel(model)) {
        return { ...base, reasoningEffort: "medium", textVerbosity: "normal" } as AgentConfig
    }

    return { ...base, thinking: { type: "enabled", budgetTokens: 8000 } } as AgentConfig
}

export const mirAgent = createMirAgent()
