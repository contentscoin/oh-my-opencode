/**
 * B:Essential Team Structure
 * 
 * Integrates MIR (Marketing) and ROY (Development) teams into oh-my-opencode.
 * Based on bessential-Multi-agent-orchestration architecture.
 */

import type { AgentConfig } from "@opencode-ai/sdk"
import { mirAgent, MIR_PROMPT_METADATA } from "./mir"
import { royAgent, ROY_PROMPT_METADATA } from "./roy"

// Re-export agents
export { mirAgent, createMirAgent, MIR_PROMPT_METADATA } from "./mir"
export { royAgent, createRoyAgent, ROY_PROMPT_METADATA } from "./roy"

/**
 * Agent ID Registry (aligned with B:Essential)
 */
export const AGENT_IDS = {
    // Orchestrator
    JIAN: 0,

    // Marketing Team (10-19)
    MIR: 10,
    WEB_SCRAPER: 11,
    CODE_ANALYZER: 12,

    // Development Team (20-29)
    ROY: 20,
    TEST_WRITER: 21,
    DEBUGGER: 22,
} as const

export type AgentId = typeof AGENT_IDS[keyof typeof AGENT_IDS]

/**
 * Team configuration structure
 */
export interface TeamConfig {
    name: string
    master: AgentConfig
    masterMetadata: typeof MIR_PROMPT_METADATA
    subagents: Array<{
        id: AgentId
        name: string
        agent: AgentConfig | null // null = TBD
        status: "ready" | "tbd"
    }>
}

/**
 * MIR Marketing Team
 */
export const mirTeam: TeamConfig = {
    name: "Marketing",
    master: mirAgent,
    masterMetadata: MIR_PROMPT_METADATA,
    subagents: [
        { id: AGENT_IDS.WEB_SCRAPER, name: "WebScraper", agent: null, status: "tbd" },
        { id: AGENT_IDS.CODE_ANALYZER, name: "CodeAnalyzer", agent: null, status: "tbd" },
    ],
}

/**
 * ROY Development Team
 */
export const royTeam: TeamConfig = {
    name: "Development",
    master: royAgent,
    masterMetadata: ROY_PROMPT_METADATA,
    subagents: [
        { id: AGENT_IDS.TEST_WRITER, name: "TestWriter", agent: null, status: "tbd" },
        { id: AGENT_IDS.DEBUGGER, name: "Debugger", agent: null, status: "tbd" },
    ],
}

/**
 * All B:Essential teams
 */
export const bessentialTeams = {
    marketing: mirTeam,
    development: royTeam,
}

/**
 * Get agent by ID
 */
export function getAgentById(id: AgentId): AgentConfig | null {
    switch (id) {
        case AGENT_IDS.MIR:
            return mirAgent
        case AGENT_IDS.ROY:
            return royAgent
        // Subagents TBD
        default:
            return null
    }
}

/**
 * Get team by agent ID
 */
export function getTeamByAgentId(id: AgentId): TeamConfig | null {
    if (id >= 10 && id < 20) return mirTeam
    if (id >= 20 && id < 30) return royTeam
    return null
}
