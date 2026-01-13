/**
 * BMAD Orchestra MCP Server
 * 
 * Antigravity IDE에서 시지푸스 기능을 사용할 수 있게 해주는 MCP 서버
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js"
import { z } from "zod"

// ============================================================================
// Types
// ============================================================================

interface Agent {
    id: string
    name: string
    icon: string
    role: string
    triggers: string[]
    whenToUse: string
}

interface Assignment {
    agentId: string
    confidence: number
    reason: string
}

interface ComplexityResult {
    score: number
    recommendedAgents: number
    reasoning: string
    subtasks: string[]
}

// ============================================================================
// Built-in BMAD Agents
// ============================================================================

const BMAD_AGENTS: Record<string, Agent> = {
    atlas: {
        id: "atlas",
        name: "Atlas",
        icon: "🧠",
        role: "architect",
        triggers: ["llm", "프롬프트", "ai", "모델", "토큰", "prompt", "gpt", "claude", "gemini"],
        whenToUse: "LLM 통합, 프롬프트 엔지니어링, AI 시스템 설계",
    },
    hermes: {
        id: "hermes",
        name: "Hermes",
        icon: "🔗",
        role: "integrator",
        triggers: ["연동", "플러그인", "oauth", "mcp", "ide", "api", "integration"],
        whenToUse: "외부 시스템 연동, OAuth, MCP 서버 개발",
    },
    prometheus: {
        id: "prometheus",
        name: "Prometheus",
        icon: "🏛️",
        role: "architect",
        triggers: ["아키텍처", "설계", "훅", "세션", "구조", "architecture", "design"],
        whenToUse: "시스템 아키텍처 분석, 플러그인 시스템 설계",
    },
    hephaestus: {
        id: "hephaestus",
        name: "Hephaestus",
        icon: "⚡",
        role: "developer",
        triggers: ["typescript", "javascript", "테스트", "개발", "코드", "bun", "node", "react"],
        whenToUse: "TypeScript/JavaScript 개발, 테스트 작성",
    },
    athena: {
        id: "athena",
        name: "Athena",
        icon: "🔍",
        role: "analyst",
        triggers: ["분석", "문서화", "리팩토링", "의존성", "레거시", "analyze", "refactor"],
        whenToUse: "코드 분석, 의존성 매핑, 기술 문서 작성",
    },
}

// ============================================================================
// Core Logic
// ============================================================================

function analyzeComplexity(description: string): ComplexityResult {
    const words = description.split(/\s+/).length
    const triggers = findMatchingTriggers(description)
    const subtasks = identifySubtasks(description)

    // 복잡도 점수 계산 (1-10)
    let score = 1
    score += Math.min(words / 50, 3)
    score += Math.min(triggers.length, 3)
    score += Math.min(subtasks.length, 3)
    score = Math.min(Math.round(score), 10)

    // 추천 에이전트 수 계산
    const recommendedAgents = Math.min(Math.max(1, Math.ceil(score / 3)), 5)

    return {
        score,
        recommendedAgents,
        reasoning: `복잡도 ${score}/10. 트리거 ${triggers.length}개 매칭, 서브태스크 ${subtasks.length}개 식별`,
        subtasks,
    }
}

function findMatchingTriggers(description: string): string[] {
    const matches: string[] = []
    const lowerDesc = description.toLowerCase()

    for (const agent of Object.values(BMAD_AGENTS)) {
        for (const trigger of agent.triggers) {
            if (lowerDesc.includes(trigger.toLowerCase())) {
                matches.push(`${agent.name}: ${trigger}`)
            }
        }
    }

    return matches
}

function identifySubtasks(description: string): string[] {
    const subtasks: string[] = []

    // 숫자 목록 패턴
    const numbered = description.match(/\d+\.\s*[^.]+/g)
    if (numbered) subtasks.push(...numbered)

    // 불릿 목록 패턴
    const bulleted = description.match(/[-*•]\s*[^-*•\n]+/g)
    if (bulleted) subtasks.push(...bulleted.map(s => s.replace(/^[-*•]\s*/, "")))

    return subtasks
}

function assignAgents(description: string): Assignment[] {
    const lowerDesc = description.toLowerCase()
    const assignments: Assignment[] = []

    for (const agent of Object.values(BMAD_AGENTS)) {
        let matchScore = 0
        const matchedTriggers: string[] = []

        for (const trigger of agent.triggers) {
            if (lowerDesc.includes(trigger.toLowerCase())) {
                matchScore++
                matchedTriggers.push(trigger)
            }
        }

        if (matchScore > 0) {
            assignments.push({
                agentId: agent.id,
                confidence: Math.min(matchScore / agent.triggers.length, 1),
                reason: `트리거 매칭: ${matchedTriggers.join(", ")}`,
            })
        }
    }

    // 점수 순 정렬
    assignments.sort((a, b) => b.confidence - a.confidence)

    // 매칭 없으면 기본 에이전트
    if (assignments.length === 0) {
        assignments.push({
            agentId: "hephaestus",
            confidence: 0.5,
            reason: "기본 개발 에이전트",
        })
    }

    return assignments
}

function generateSisyphusPrompt(description: string): string {
    const complexity = analyzeComplexity(description)
    const assignments = assignAgents(description)
    const topAgent = BMAD_AGENTS[assignments[0]!.agentId]!

    return `
## 🎭 시지푸스 모드 활성화

**작업**: ${description}

**복잡도 분석**:
- 점수: ${complexity.score}/10
- ${complexity.reasoning}

**담당 에이전트**: ${topAgent.icon} ${topAgent.name} (${topAgent.role})
- 전문 분야: ${topAgent.whenToUse}

**작업 지침**:
1. 작업을 끝까지 완료할 때까지 멈추지 마세요
2. TODO 리스트를 만들고 하나씩 체크하며 진행하세요
3. 막히면 다른 접근 방식을 시도하세요
4. 완료 시 \`<promise>DONE</promise>\` 태그로 표시하세요

**시작하세요!**
`
}

// ============================================================================
// MCP Server
// ============================================================================

const server = new McpServer({
    name: "bmad-orchestra",
    version: "1.0.0",
})

// Tool: sisyphus_task
server.tool(
    "sisyphus_task",
    "시지푸스 모드로 작업 실행 - 작업을 끝까지 완료",
    {
        prompt: z.string().describe("수행할 작업 설명"),
    },
    async ({ prompt }) => {
        const sisyphusPrompt = generateSisyphusPrompt(prompt)

        return {
            content: [
                {
                    type: "text",
                    text: sisyphusPrompt,
                },
            ],
        }
    }
)

// Tool: analyze_complexity
server.tool(
    "analyze_complexity",
    "작업 복잡도 분석 및 추천 에이전트 수 결정",
    {
        description: z.string().describe("분석할 작업 설명"),
    },
    async ({ description }) => {
        const result = analyzeComplexity(description)
        const assignments = assignAgents(description)

        const text = `
## 📊 복잡도 분석 결과

**점수**: ${result.score}/10
**추천 에이전트**: ${result.recommendedAgents}개
**분석**: ${result.reasoning}

### 매칭된 에이전트
${assignments.map((a, i) => {
            const agent = BMAD_AGENTS[a.agentId]!
            return `${i + 1}. ${agent.icon} ${agent.name} (신뢰도: ${(a.confidence * 100).toFixed(0)}%) - ${a.reason}`
        }).join("\n")}

${result.subtasks.length > 0 ? `
### 식별된 서브태스크
${result.subtasks.map((s, i) => `${i + 1}. ${s}`).join("\n")}
` : ""}
`

        return {
            content: [{ type: "text", text }],
        }
    }
)

// Tool: list_agents
server.tool(
    "list_agents",
    "사용 가능한 BMAD 에이전트 목록 조회",
    {},
    async () => {
        const text = `
## 🎭 BMAD 에이전트 목록

${Object.values(BMAD_AGENTS).map(agent =>
            `### ${agent.icon} ${agent.name}
- **역할**: ${agent.role}
- **전문 분야**: ${agent.whenToUse}
- **트리거**: ${agent.triggers.join(", ")}
`).join("\n")}
`

        return {
            content: [{ type: "text", text }],
        }
    }
)

// Tool: call_agent
server.tool(
    "call_agent",
    "특정 BMAD 에이전트를 호출하여 작업 수행",
    {
        agent: z.enum(["atlas", "hermes", "prometheus", "hephaestus", "athena"]).describe("호출할 에이전트"),
        task: z.string().describe("수행할 작업"),
    },
    async ({ agent, task }) => {
        const selectedAgent = BMAD_AGENTS[agent]!

        const text = `
## ${selectedAgent.icon} ${selectedAgent.name} 에이전트 호출

**역할**: ${selectedAgent.role}
**전문 분야**: ${selectedAgent.whenToUse}

---

**작업**: ${task}

---

${selectedAgent.name}로서 다음 작업을 수행하세요:
- ${selectedAgent.whenToUse}에 집중하여 작업을 완료하세요
- 전문가로서 최선의 결과를 제공하세요
- 작업 완료 시 결과를 정리하여 보고하세요
`

        return {
            content: [{ type: "text", text }],
        }
    }
)

// ============================================================================
// Main
// ============================================================================

async function main() {
    const transport = new StdioServerTransport()
    await server.connect(transport)
    console.error("BMAD Orchestra MCP Server running")
}

main().catch(console.error)
