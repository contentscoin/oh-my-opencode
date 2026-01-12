/**
 * BMAD Orchestra - LLM Router
 * 
 * 에이전트별 최적 LLM 모델 선택 및 라우팅
 * 사용자 커스터마이징 설정을 우선 적용
 */

import type {
    ModelConfig,
    ModelRequirements,
    LLMRouterConfig,
    TaskType,
    OrchestraConfig,
    AgentConfig,
} from "./types"

// ============================================================================
// Default Models
// ============================================================================

/**
 * 기본 모델 설정 (사용자 설정이 없을 때 사용)
 */
export const DEFAULT_MODELS: Record<string, ModelConfig> = {
    // 고성능 작업용
    "claude-opus": { providerId: "anthropic", modelId: "claude-opus-4" },
    "claude-sonnet": { providerId: "anthropic", modelId: "claude-sonnet-4" },
    "gemini-pro": { providerId: "google", modelId: "gemini-2.5-pro" },
    "gpt-4o": { providerId: "openai", modelId: "gpt-4o" },

    // 빠른 작업용
    "claude-haiku": { providerId: "anthropic", modelId: "claude-haiku" },
    "gemini-flash": { providerId: "google", modelId: "gemini-2.0-flash" },
    "gpt-4o-mini": { providerId: "openai", modelId: "gpt-4o-mini" },
}

/**
 * 역할별 기본 모델 매핑
 */
export const DEFAULT_ROLE_MODELS: Record<string, string> = {
    orchestrator: "claude-opus",
    architect: "gemini-pro",
    integrator: "claude-sonnet",
    developer: "gpt-4o",
    analyst: "gemini-pro",
    specialist: "claude-sonnet",
}

/**
 * 태스크 유형별 추천 모델
 */
export const TASK_TYPE_MODELS: Record<TaskType, string> = {
    code: "claude-sonnet",
    analysis: "gemini-pro",
    research: "gemini-pro",
    design: "claude-opus",
    integration: "claude-sonnet",
    documentation: "gpt-4o-mini",
    review: "claude-sonnet",
    debug: "claude-opus",
}

// ============================================================================
// LLM Router
// ============================================================================

/**
 * LLM 라우터 - 에이전트와 태스크에 최적의 모델 선택
 */
export class LLMRouter {
    private config: LLMRouterConfig
    private userConfig: OrchestraConfig | null = null
    private usageTracker: Map<string, { tokens: number; requests: number }> = new Map()

    constructor(config?: Partial<LLMRouterConfig>) {
        this.config = {
            defaultModel: config?.defaultModel ?? DEFAULT_MODELS["claude-sonnet"]!,
            agentModels: config?.agentModels ?? {},
            fallbackChain: config?.fallbackChain ?? [
                DEFAULT_MODELS["claude-sonnet"]!,
                DEFAULT_MODELS["gemini-pro"]!,
                DEFAULT_MODELS["gpt-4o"]!,
            ],
        }
    }

    /**
     * 사용자 설정 로드
     */
    loadUserConfig(config: OrchestraConfig): void {
        this.userConfig = config

        // 사용자 에이전트 모델 설정 적용
        for (const [agentId, agentConfig] of Object.entries(config.agents)) {
            if (agentConfig.model) {
                const modelConfig = this.parseModelString(agentConfig.model)
                if (modelConfig) {
                    this.config.agentModels[agentId] = modelConfig
                }
            }
        }
    }

    /**
     * 에이전트에 맞는 모델 선택
     * 
     * 우선순위:
     * 1. 사용자 커스텀 설정
     * 2. 에이전트별 기본 설정
     * 3. 역할별 기본 설정
     * 4. 글로벌 기본 모델
     */
    selectModelForAgent(agentId: string, taskType?: TaskType): ModelConfig {
        // 1. 사용자 커스텀 설정 확인
        if (this.config.agentModels[agentId]) {
            return this.config.agentModels[agentId]
        }

        // 2. 사용자 설정에서 에이전트 역할 확인
        if (this.userConfig?.agents[agentId]) {
            const agentConfig = this.userConfig.agents[agentId]
            const roleModel = DEFAULT_ROLE_MODELS[agentConfig.role]
            if (roleModel && DEFAULT_MODELS[roleModel]) {
                return DEFAULT_MODELS[roleModel]
            }
        }

        // 3. 태스크 유형별 추천 모델
        if (taskType) {
            const taskModel = TASK_TYPE_MODELS[taskType]
            if (taskModel && DEFAULT_MODELS[taskModel]) {
                return DEFAULT_MODELS[taskModel]
            }
        }

        // 4. 글로벌 기본 모델
        return this.config.defaultModel
    }

    /**
     * 요구사항에 맞는 최적 모델 선택
     */
    selectOptimalModel(requirements: ModelRequirements): ModelConfig {
        // 멀티모달 필요 시
        if (requirements.multimodal) {
            return DEFAULT_MODELS["gemini-pro"]! // Gemini가 멀티모달에 강함
        }

        // 빠른 응답 필요 시
        if (requirements.fastResponse) {
            return DEFAULT_MODELS["gemini-flash"]!
        }

        // 비용 우선
        if (requirements.costSensitivity === "low") {
            return DEFAULT_MODELS["gpt-4o-mini"]!
        }

        // 품질 우선
        if (requirements.costSensitivity === "high") {
            return DEFAULT_MODELS["claude-opus"]!
        }

        // 균형잡힌 선택
        return this.config.defaultModel
    }

    /**
     * 모델 사용량 추적
     */
    trackUsage(modelId: string, tokens: number): void {
        const current = this.usageTracker.get(modelId) ?? { tokens: 0, requests: 0 }
        this.usageTracker.set(modelId, {
            tokens: current.tokens + tokens,
            requests: current.requests + 1,
        })
    }

    /**
     * 사용량 통계 조회
     */
    getUsageStats(): Map<string, { tokens: number; requests: number }> {
        return new Map(this.usageTracker)
    }

    /**
     * 폴백 체인에서 다음 모델 선택
     */
    getNextFallback(currentModel: ModelConfig): ModelConfig | null {
        const currentIndex = this.config.fallbackChain.findIndex(
            m => m.providerId === currentModel.providerId && m.modelId === currentModel.modelId
        )

        if (currentIndex === -1 || currentIndex >= this.config.fallbackChain.length - 1) {
            return null
        }

        return this.config.fallbackChain[currentIndex + 1] ?? null
    }

    /**
     * 모델 문자열 파싱 (예: "anthropic/claude-opus-4")
     */
    private parseModelString(modelStr: string): ModelConfig | null {
        // 프리셋 모델 이름 체크
        if (DEFAULT_MODELS[modelStr]) {
            return DEFAULT_MODELS[modelStr]
        }

        // provider/model 형식 파싱
        const parts = modelStr.split("/")
        if (parts.length === 2) {
            return {
                providerId: parts[0]!,
                modelId: parts[1]!,
            }
        }

        return null
    }

    /**
     * 현재 설정 조회
     */
    getConfig(): LLMRouterConfig {
        return { ...this.config }
    }
}

// ============================================================================
// Singleton Instance
// ============================================================================

let routerInstance: LLMRouter | null = null

/**
 * LLM 라우터 인스턴스 가져오기
 */
export function getLLMRouter(): LLMRouter {
    if (!routerInstance) {
        routerInstance = new LLMRouter()
    }
    return routerInstance
}

/**
 * LLM 라우터 초기화 (설정 적용)
 */
export function initLLMRouter(config?: Partial<LLMRouterConfig>): LLMRouter {
    routerInstance = new LLMRouter(config)
    return routerInstance
}
