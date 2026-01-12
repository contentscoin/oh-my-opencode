/**
 * BMAD Orchestra - Hook Integration
 * 
 * OpenCode 훅 시스템과 BMAD 오케스트레이터 통합
 */

import type { OrchestraEvent } from "../orchestra/types"
import { getOrchestrator } from "../orchestra/bmad-orchestrator"

// ============================================================================
// Hook Context Types
// ============================================================================

export interface HookContext {
    sessionId: string
    messageId: string
    content: string
    toolName?: string
    toolInput?: Record<string, unknown>
    toolOutput?: string
}

export interface HookResult {
    handled: boolean
    modified?: boolean
    content?: string
    skipTool?: boolean
}

// ============================================================================
// Pre-Tool Use Hook
// ============================================================================

/**
 * PreToolUse 훅: 도구 실행 전 에이전트 라우팅 결정
 */
export function preToolUseHook(context: HookContext): HookResult {
    const orchestrator = getOrchestrator()

    // sisyphus_task 도구 호출 감지
    if (context.toolName === "sisyphus_task") {
        const input = context.toolInput as { prompt?: string; agent?: string; category?: string }

        if (input?.prompt) {
            // 자동 에이전트 라우팅
            const assignments = orchestrator.analyzeAndRoute(input.prompt)

            if (assignments.length > 0) {
                const assignment = assignments[0]!

                // 기존 agent 파라미터가 없으면 자동 할당
                if (!input.agent) {
                    const agent = orchestrator.getAgent(assignment.agentId)
                    if (agent) {
                        return {
                            handled: true,
                            modified: true,
                            content: JSON.stringify({
                                ...input,
                                agent: agent.id,
                                _bmad_assignment: {
                                    agentId: agent.id,
                                    agentName: agent.name,
                                    model: assignment.model,
                                },
                            }),
                        }
                    }
                }
            }
        }
    }

    return { handled: false }
}

// ============================================================================
// Post-Tool Use Hook
// ============================================================================

/**
 * PostToolUse 훅: 도구 실행 후 결과 집계 및 다음 에이전트 호출
 */
export function postToolUseHook(context: HookContext): HookResult {
    const orchestrator = getOrchestrator()

    // background_output 도구 결과 처리
    if (context.toolName === "background_output" && context.toolOutput) {
        // 결과를 오케스트레이터에 전달하여 집계
        // TODO: 실제 결과 집계 로직 구현
    }

    return { handled: false }
}

// ============================================================================
// User Prompt Submit Hook
// ============================================================================

/**
 * UserPromptSubmit 훅: 사용자 입력 분석 및 오케스트레이터 개입
 */
export function userPromptSubmitHook(context: HookContext): HookResult {
    const orchestrator = getOrchestrator()

    // 특정 키워드 감지 시 자동 분석
    const keywords = ["병렬로", "동시에", "팀으로", "에이전트들"]
    const hasParallelKeyword = keywords.some(k => context.content.includes(k))

    if (hasParallelKeyword) {
        const complexity = orchestrator.analyzeComplexity(context.content)

        // 복잡도가 높으면 자동 병렬 실행 제안
        if (complexity.score >= 5) {
            const assignments = orchestrator.analyzeAndRoute(context.content)

            // 시스템 메시지로 분석 결과 주입
            const analysisMessage = `
[BMAD Orchestra 분석]
${complexity.reasoning}
추천 에이전트: ${assignments.map(a => {
                const agent = orchestrator.getAgent(a.agentId)
                return agent ? `${agent.icon} ${agent.name}` : a.agentId
            }).join(", ")}
`
            return {
                handled: true,
                modified: true,
                content: context.content + "\n\n" + analysisMessage,
            }
        }
    }

    return { handled: false }
}

// ============================================================================
// Event Logger
// ============================================================================

/**
 * 오케스트레이터 이벤트 로거 초기화
 */
export function initEventLogger(): () => void {
    const orchestrator = getOrchestrator()

    return orchestrator.on((event: OrchestraEvent) => {
        const timestamp = event.timestamp.toISOString()

        switch (event.type) {
            case "task:created":
                console.log(`[${timestamp}] 📋 태스크 생성: ${JSON.stringify(event.data)}`)
                break
            case "task:started":
                console.log(`[${timestamp}] 🚀 태스크 시작: ${JSON.stringify(event.data)}`)
                break
            case "task:completed":
                console.log(`[${timestamp}] ✅ 태스크 완료: ${JSON.stringify(event.data)}`)
                break
            case "agent:started":
                console.log(`[${timestamp}] 🤖 에이전트 시작: ${JSON.stringify(event.data)}`)
                break
            case "agent:completed":
                console.log(`[${timestamp}] ✔️ 에이전트 완료: ${JSON.stringify(event.data)}`)
                break
            case "agent:error":
                console.error(`[${timestamp}] ❌ 에이전트 에러: ${JSON.stringify(event.data)}`)
                break
            case "account:switched":
                console.log(`[${timestamp}] 🔄 계정 전환: ${JSON.stringify(event.data)}`)
                break
            case "account:rate_limited":
                console.warn(`[${timestamp}] ⚠️ Rate Limit: ${JSON.stringify(event.data)}`)
                break
        }
    })
}
