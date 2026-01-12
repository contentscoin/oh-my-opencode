/**
 * BMAD Orchestra - Main Orchestrator
 * 
 * 총괄 에이전트(Sisyphus) 중심 오케스트레이션 엔진
 * 사용자는 총괄 에이전트와만 소통, 서브 에이전트 자동 조율
 */

import type {
    OrchestraAgent,
    OrchestraTask,
    TaskResult,
    AgentAssignment,
    ComplexityAnalysis,
    OrchestraConfig,
    OrchestraEvent,
    OrchestraEventListener,
    TaskType,
    TaskStatus,
    TaskPriority,
    ParallelExecutionConfig,
    ModelConfig,
} from "./types"
import { getLLMRouter, type LLMRouter } from "./llm-router"

// ============================================================================
// Constants
// ============================================================================

const DEFAULT_TIMEOUT_MS = 5 * 60 * 1000 // 5분
const MAX_AUTO_CONCURRENT = 5

// ============================================================================
// Built-in BMAD Agents
// ============================================================================

/**
 * 기본 BMAD 에이전트 정의
 */
export const BUILTIN_BMAD_AGENTS: Record<string, Omit<OrchestraAgent, "model">> = {
    atlas: {
        id: "atlas",
        name: "Atlas",
        icon: "🧠",
        role: "architect",
        triggers: ["LLM", "프롬프트", "AI", "모델", "토큰"],
        whenToUse: "LLM 통합, 프롬프트 엔지니어링, AI 시스템 설계",
    },
    hermes: {
        id: "hermes",
        name: "Hermes",
        icon: "🔗",
        role: "integrator",
        triggers: ["연동", "플러그인", "OAuth", "MCP", "IDE"],
        whenToUse: "Cursor, Claude, Antigravity 연동, MCP 서버 개발",
    },
    prometheus: {
        id: "prometheus",
        name: "Prometheus",
        icon: "🏛️",
        role: "architect",
        triggers: ["아키텍처", "플러그인", "훅", "세션", "OpenCode"],
        whenToUse: "oh-my-opencode 아키텍처 분석, 플러그인 시스템 설계",
    },
    hephaestus: {
        id: "hephaestus",
        name: "Hephaestus",
        icon: "⚡",
        role: "developer",
        triggers: ["TypeScript", "Bun", "테스트", "LSP", "AST"],
        whenToUse: "TypeScript/Bun 개발, 테스트 작성, LSP 도구 개발",
    },
    athena: {
        id: "athena",
        name: "Athena",
        icon: "🔍",
        role: "analyst",
        triggers: ["분석", "문서화", "리팩토링", "의존성", "레거시"],
        whenToUse: "코드 분석, 의존성 매핑, 기술 문서 작성",
    },
}

// ============================================================================
// BMAD Orchestrator
// ============================================================================

/**
 * BMAD 에이전트 오케스트레이터
 * 
 * 핵심 기능:
 * - 작업 분석 및 복잡도 평가
 * - 에이전트 자동 선택 및 할당
 * - 병렬 실행 자동 결정
 * - 결과 집계 및 보고
 */
export class BmadOrchestrator {
    private agents: Map<string, OrchestraAgent> = new Map()
    private tasks: Map<string, OrchestraTask> = new Map()
    private runningAssignments: Map<string, AgentAssignment> = new Map()
    private eventListeners: OrchestraEventListener[] = []
    private config: OrchestraConfig
    private llmRouter: LLMRouter

    constructor(config?: Partial<OrchestraConfig>) {
        this.config = {
            version: 1,
            agents: config?.agents ?? {},
            orchestration: config?.orchestration ?? {
                autoParallel: true,
                maxConcurrent: MAX_AUTO_CONCURRENT,
                timeoutMs: DEFAULT_TIMEOUT_MS,
            },
            accounts: config?.accounts ?? {
                preferFreeAccounts: true,
                allowPaidFallback: true,
            },
        }

        this.llmRouter = getLLMRouter()
        this.llmRouter.loadUserConfig(this.config)
        this.initializeAgents()
    }

    /**
     * 기본 BMAD 에이전트 초기화
     */
    private initializeAgents(): void {
        for (const [id, agentDef] of Object.entries(BUILTIN_BMAD_AGENTS)) {
            const userConfig = this.config.agents[id]
            const model = this.llmRouter.selectModelForAgent(id)

            const agent: OrchestraAgent = {
                ...agentDef,
                model,
                status: "idle",
            }

            // 사용자 커스텀 설정 적용
            if (userConfig?.enabled === false) {
                continue // 비활성화된 에이전트는 추가하지 않음
            }

            this.agents.set(id, agent)
        }
    }

    // ==========================================================================
    // Task Analysis
    // ==========================================================================

    /**
     * 작업 복잡도 분석 및 에이전트 수 자동 결정
     */
    analyzeComplexity(description: string): ComplexityAnalysis {
        const words = description.split(/\s+/).length
        const triggers = this.findMatchingTriggers(description)
        const subtasks = this.identifySubtasks(description)

        // 복잡도 점수 계산 (1-10)
        let score = 1
        score += Math.min(words / 50, 3) // 길이 기반 (최대 3점)
        score += Math.min(triggers.length, 3) // 트리거 수 기반 (최대 3점)
        score += Math.min(subtasks.length, 3) // 서브태스크 수 기반 (최대 3점)
        score = Math.min(Math.round(score), 10)

        // 추천 에이전트 수 계산
        const recommendedAgents = Math.min(
            Math.max(1, Math.ceil(score / 3)),
            this.config.orchestration.maxConcurrent
        )

        return {
            score,
            recommendedAgents,
            reasoning: this.buildReasoningMessage(score, triggers, subtasks),
            subtasks,
        }
    }

    /**
     * 설명에서 매칭되는 트리거 찾기
     */
    private findMatchingTriggers(description: string): string[] {
        const matches: string[] = []
        const lowerDesc = description.toLowerCase()

        for (const agent of this.agents.values()) {
            for (const trigger of agent.triggers) {
                if (lowerDesc.includes(trigger.toLowerCase())) {
                    matches.push(`${agent.name}: ${trigger}`)
                }
            }
        }

        return matches
    }

    /**
     * 서브태스크 식별
     */
    private identifySubtasks(description: string): string[] {
        const subtasks: string[] = []

        // 숫자 목록 패턴 (1. 2. 3.)
        const numbered = description.match(/\d+\.\s*[^.]+/g)
        if (numbered) {
            subtasks.push(...numbered)
        }

        // 불릿 목록 패턴 (- * •)
        const bulleted = description.match(/[-*•]\s*[^-*•\n]+/g)
        if (bulleted) {
            subtasks.push(...bulleted.map(s => s.replace(/^[-*•]\s*/, "")))
        }

        return subtasks
    }

    /**
     * 분석 이유 메시지 생성
     */
    private buildReasoningMessage(
        score: number,
        triggers: string[],
        subtasks: string[]
    ): string {
        const parts: string[] = []
        parts.push(`복잡도 점수: ${score}/10`)

        if (triggers.length > 0) {
            parts.push(`매칭된 에이전트: ${triggers.slice(0, 3).join(", ")}`)
        }

        if (subtasks.length > 0) {
            parts.push(`식별된 서브태스크: ${subtasks.length}개`)
        }

        return parts.join(". ")
    }

    // ==========================================================================
    // Agent Assignment
    // ==========================================================================

    /**
     * 작업에 적합한 에이전트 선택 및 할당
     */
    analyzeAndRoute(description: string, taskType?: TaskType): AgentAssignment[] {
        const complexity = this.analyzeComplexity(description)
        const assignments: AgentAssignment[] = []
        const lowerDesc = description.toLowerCase()

        // 트리거 매칭으로 에이전트 선택
        const matchedAgents: Map<string, number> = new Map()

        for (const agent of this.agents.values()) {
            let matchScore = 0
            for (const trigger of agent.triggers) {
                if (lowerDesc.includes(trigger.toLowerCase())) {
                    matchScore++
                }
            }
            if (matchScore > 0) {
                matchedAgents.set(agent.id, matchScore)
            }
        }

        // 점수 순으로 정렬
        const sorted = [...matchedAgents.entries()]
            .sort((a, b) => b[1] - a[1])
            .slice(0, complexity.recommendedAgents)

        // 할당 생성
        for (let i = 0; i < sorted.length; i++) {
            const [agentId] = sorted[i]!
            const agent = this.agents.get(agentId)!

            const task = this.createTask(description, taskType)
            const model = this.llmRouter.selectModelForAgent(agentId, taskType)

            assignments.push({
                agentId,
                task,
                model,
                priority: sorted.length - i, // 높은 점수 = 높은 우선순위
            })
        }

        // 매칭된 에이전트가 없으면 기본 에이전트 할당
        if (assignments.length === 0) {
            const defaultAgent = this.agents.get("hephaestus") ?? this.agents.values().next().value
            if (defaultAgent) {
                const task = this.createTask(description, taskType)
                assignments.push({
                    agentId: defaultAgent.id,
                    task,
                    model: this.llmRouter.selectModelForAgent(defaultAgent.id, taskType),
                    priority: 1,
                })
            }
        }

        this.emit({
            type: "task:created",
            timestamp: new Date(),
            data: { assignments: assignments.length, complexity },
        })

        return assignments
    }

    /**
     * 태스크 생성
     */
    private createTask(description: string, type?: TaskType): OrchestraTask {
        const id = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

        const task: OrchestraTask = {
            id,
            description,
            type: type ?? "code",
            priority: "medium",
            status: "pending",
            createdAt: new Date(),
        }

        this.tasks.set(id, task)
        return task
    }

    // ==========================================================================
    // Parallel Execution
    // ==========================================================================

    /**
     * 병렬 에이전트 실행
     */
    async executeParallel(assignments: AgentAssignment[]): Promise<TaskResult[]> {
        const results: TaskResult[] = []
        const concurrent = this.config.orchestration.autoParallel
            ? Math.min(assignments.length, this.config.orchestration.maxConcurrent)
            : 1

        this.emit({
            type: "task:started",
            timestamp: new Date(),
            data: { totalTasks: assignments.length, concurrent },
        })

        // 배치로 나누어 실행
        for (let i = 0; i < assignments.length; i += concurrent) {
            const batch = assignments.slice(i, i + concurrent)

            const batchPromises = batch.map(async (assignment) => {
                this.runningAssignments.set(assignment.task.id, assignment)

                try {
                    const result = await this.executeAssignment(assignment)
                    return result
                } finally {
                    this.runningAssignments.delete(assignment.task.id)
                }
            })

            const batchResults = await Promise.all(batchPromises)
            results.push(...batchResults)
        }

        this.emit({
            type: "task:completed",
            timestamp: new Date(),
            data: { totalResults: results.length },
        })

        return results
    }

    /**
     * 단일 할당 실행
     */
    private async executeAssignment(assignment: AgentAssignment): Promise<TaskResult> {
        const { agentId, task, model } = assignment
        const agent = this.agents.get(agentId)

        if (!agent) {
            return {
                success: false,
                error: `Agent not found: ${agentId}`,
            }
        }

        // 에이전트 상태 업데이트
        agent.status = "running"
        task.status = "running"
        task.startedAt = new Date()

        this.emit({
            type: "agent:started",
            timestamp: new Date(),
            data: { agentId, taskId: task.id, model },
        })

        try {
            // TODO: 실제 에이전트 실행 로직 (BackgroundManager 연동)
            // 현재는 시뮬레이션
            await this.simulateExecution(agent, task)

            agent.status = "idle"
            task.status = "completed"
            task.completedAt = new Date()

            const result: TaskResult = {
                success: true,
                output: `[${agent.icon} ${agent.name}] 작업 완료: ${task.description}`,
            }

            task.result = result

            this.emit({
                type: "agent:completed",
                timestamp: new Date(),
                data: { agentId, taskId: task.id, success: true },
            })

            return result
        } catch (error) {
            agent.status = "error"
            task.status = "failed"

            const result: TaskResult = {
                success: false,
                error: error instanceof Error ? error.message : String(error),
            }

            task.result = result

            this.emit({
                type: "agent:error",
                timestamp: new Date(),
                data: { agentId, taskId: task.id, error: result.error },
            })

            return result
        }
    }

    /**
     * 실행 시뮬레이션 (개발용)
     */
    private async simulateExecution(agent: OrchestraAgent, task: OrchestraTask): Promise<void> {
        // 1-3초 랜덤 대기
        const delay = 1000 + Math.random() * 2000
        await new Promise(resolve => setTimeout(resolve, delay))
    }

    // ==========================================================================
    // Result Aggregation
    // ==========================================================================

    /**
     * 결과 집계
     */
    aggregateResults(results: TaskResult[]): {
        success: boolean
        summary: string
        details: TaskResult[]
    } {
        const successful = results.filter(r => r.success)
        const failed = results.filter(r => !r.success)

        const summary = [
            `✅ 성공: ${successful.length}개`,
            `❌ 실패: ${failed.length}개`,
        ].join(", ")

        return {
            success: failed.length === 0,
            summary,
            details: results,
        }
    }

    // ==========================================================================
    // Event System
    // ==========================================================================

    /**
     * 이벤트 리스너 등록
     */
    on(listener: OrchestraEventListener): () => void {
        this.eventListeners.push(listener)
        return () => {
            const index = this.eventListeners.indexOf(listener)
            if (index !== -1) {
                this.eventListeners.splice(index, 1)
            }
        }
    }

    /**
     * 이벤트 발생
     */
    private emit(event: OrchestraEvent): void {
        for (const listener of this.eventListeners) {
            try {
                listener(event)
            } catch (error) {
                console.error("Event listener error:", error)
            }
        }
    }

    // ==========================================================================
    // Public API
    // ==========================================================================

    /**
     * 등록된 에이전트 목록
     */
    getAgents(): OrchestraAgent[] {
        return [...this.agents.values()]
    }

    /**
     * 특정 에이전트 조회
     */
    getAgent(id: string): OrchestraAgent | undefined {
        return this.agents.get(id)
    }

    /**
     * 태스크 목록
     */
    getTasks(): OrchestraTask[] {
        return [...this.tasks.values()]
    }

    /**
     * 실행 중인 할당 수
     */
    getRunningCount(): number {
        return this.runningAssignments.size
    }

    /**
     * 설정 조회
     */
    getConfig(): OrchestraConfig {
        return { ...this.config }
    }

    /**
     * 설정 업데이트
     */
    updateConfig(config: Partial<OrchestraConfig>): void {
        this.config = { ...this.config, ...config }
        this.llmRouter.loadUserConfig(this.config)
    }
}

// ============================================================================
// Singleton Instance
// ============================================================================

let orchestratorInstance: BmadOrchestrator | null = null

/**
 * 오케스트레이터 인스턴스 가져오기
 */
export function getOrchestrator(): BmadOrchestrator {
    if (!orchestratorInstance) {
        orchestratorInstance = new BmadOrchestrator()
    }
    return orchestratorInstance
}

/**
 * 오케스트레이터 초기화 (설정 적용)
 */
export function initOrchestrator(config?: Partial<OrchestraConfig>): BmadOrchestrator {
    orchestratorInstance = new BmadOrchestrator(config)
    return orchestratorInstance
}
