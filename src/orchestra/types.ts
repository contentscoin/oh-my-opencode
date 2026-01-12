/**
 * BMAD Orchestra - Core Types
 * 
 * 에이전트 오케스트레이션 시스템의 핵심 타입 정의
 */

// ============================================================================
// Agent Types
// ============================================================================

/**
 * 에이전트 역할 분류
 */
export type AgentRole = 
  | "orchestrator"   // 총괄 에이전트 (Sisyphus)
  | "architect"      // 설계/분석 (Atlas, Prometheus)
  | "integrator"     // 연동 전문가 (Hermes)
  | "developer"      // 개발자 (Hephaestus)
  | "analyst"        // 분석가 (Athena)
  | "specialist"     // 기타 전문가

/**
 * 에이전트 상태
 */
export type AgentStatus = "idle" | "running" | "waiting" | "error" | "completed"

/**
 * 오케스트라 에이전트 정의
 */
export interface OrchestraAgent {
  /** 고유 식별자 */
  id: string
  /** 표시 이름 */
  name: string
  /** 아이콘 (이모지) */
  icon: string
  /** 역할 분류 */
  role: AgentRole
  /** 사용할 LLM 모델 */
  model: ModelConfig
  /** 이 에이전트를 호출할 트리거 패턴 */
  triggers: string[]
  /** 사용 시점 설명 */
  whenToUse: string
  /** 회피 조건 */
  avoidWhen?: string[]
  /** 현재 상태 */
  status?: AgentStatus
}

// ============================================================================
// Model Types
// ============================================================================

/**
 * LLM 모델 설정
 */
export interface ModelConfig {
  /** 프로바이더 ID (anthropic, google, openai 등) */
  providerId: string
  /** 모델 ID */
  modelId: string
}

/**
 * 모델 요구사항
 */
export interface ModelRequirements {
  /** 필요한 컨텍스트 윈도우 크기 */
  minContextWindow?: number
  /** 멀티모달 필요 여부 */
  multimodal?: boolean
  /** 빠른 응답 필요 여부 */
  fastResponse?: boolean
  /** 비용 민감도 (low: 비용 우선, high: 품질 우선) */
  costSensitivity?: "low" | "medium" | "high"
}

/**
 * LLM 라우터 설정
 */
export interface LLMRouterConfig {
  /** 기본 모델 */
  defaultModel: ModelConfig
  /** 에이전트별 모델 오버라이드 */
  agentModels: Record<string, ModelConfig>
  /** 폴백 모델 체인 */
  fallbackChain: ModelConfig[]
}

// ============================================================================
// Task Types
// ============================================================================

/**
 * 태스크 유형
 */
export type TaskType = 
  | "code"           // 코드 작성/수정
  | "analysis"       // 분석
  | "research"       // 리서치
  | "design"         // 설계
  | "integration"    // 연동
  | "documentation"  // 문서화
  | "review"         // 리뷰
  | "debug"          // 디버깅

/**
 * 태스크 우선순위
 */
export type TaskPriority = "low" | "medium" | "high" | "critical"

/**
 * 태스크 상태
 */
export type TaskStatus = "pending" | "running" | "completed" | "failed" | "cancelled"

/**
 * 오케스트라 태스크
 */
export interface OrchestraTask {
  /** 태스크 ID */
  id: string
  /** 설명 */
  description: string
  /** 태스크 유형 */
  type: TaskType
  /** 우선순위 */
  priority: TaskPriority
  /** 상태 */
  status: TaskStatus
  /** 할당된 에이전트 ID */
  assignedAgent?: string
  /** 생성 시간 */
  createdAt: Date
  /** 시작 시간 */
  startedAt?: Date
  /** 완료 시간 */
  completedAt?: Date
  /** 결과 */
  result?: TaskResult
  /** 부모 태스크 ID (서브태스크인 경우) */
  parentTaskId?: string
  /** 서브태스크 IDs */
  subtaskIds?: string[]
}

/**
 * 태스크 결과
 */
export interface TaskResult {
  /** 성공 여부 */
  success: boolean
  /** 출력 내용 */
  output?: string
  /** 에러 메시지 */
  error?: string
  /** 변경된 파일 목록 */
  changedFiles?: string[]
}

// ============================================================================
// Orchestration Types
// ============================================================================

/**
 * 에이전트 할당
 */
export interface AgentAssignment {
  /** 에이전트 ID */
  agentId: string
  /** 할당된 태스크 */
  task: OrchestraTask
  /** 사용할 모델 */
  model: ModelConfig
  /** 우선순위 */
  priority: number
}

/**
 * 병렬 실행 설정
 */
export interface ParallelExecutionConfig {
  /** 최대 동시 실행 수 (자동 결정 시 -1) */
  maxConcurrent: number
  /** 태스크 타임아웃 (ms) */
  timeoutMs: number
  /** 재시도 정책 */
  retryPolicy: RetryPolicy
}

/**
 * 재시도 정책
 */
export interface RetryPolicy {
  /** 최대 재시도 횟수 */
  maxRetries: number
  /** 초기 딜레이 (ms) */
  initialDelayMs: number
  /** 지수 백오프 사용 여부 */
  exponentialBackoff: boolean
}

/**
 * 복잡도 분석 결과
 */
export interface ComplexityAnalysis {
  /** 복잡도 점수 (1-10) */
  score: number
  /** 추천 병렬 에이전트 수 */
  recommendedAgents: number
  /** 분석 이유 */
  reasoning: string
  /** 식별된 서브태스크들 */
  subtasks: string[]
}

// ============================================================================
// Configuration Types
// ============================================================================

/**
 * 오케스트라 설정
 */
export interface OrchestraConfig {
  /** 설정 버전 */
  version: number
  /** 에이전트 설정 */
  agents: Record<string, AgentConfig>
  /** 오케스트레이션 설정 */
  orchestration: OrchestrationSettings
  /** 계정 설정 */
  accounts: AccountSettings
}

/**
 * 에이전트 설정 (사용자 커스터마이징용)
 */
export interface AgentConfig {
  /** 사용할 모델 */
  model: string
  /** 역할 */
  role: AgentRole
  /** 활성화 여부 */
  enabled?: boolean
  /** 커스텀 시스템 프롬프트 */
  customPrompt?: string
}

/**
 * 오케스트레이션 설정
 */
export interface OrchestrationSettings {
  /** 자동 병렬 판단 활성화 */
  autoParallel: boolean
  /** 최대 동시 에이전트 (자동 판단 시 상한선) */
  maxConcurrent: number
  /** 태스크 타임아웃 (ms) */
  timeoutMs: number
}

/**
 * 계정 설정
 */
export interface AccountSettings {
  /** 무료 계정 우선 사용 */
  preferFreeAccounts: boolean
  /** 유료 계정 폴백 허용 */
  allowPaidFallback: boolean
}

// ============================================================================
// Event Types
// ============================================================================

/**
 * 오케스트라 이벤트 유형
 */
export type OrchestraEventType =
  | "task:created"
  | "task:started"
  | "task:completed"
  | "task:failed"
  | "agent:assigned"
  | "agent:started"
  | "agent:completed"
  | "agent:error"
  | "account:switched"
  | "account:rate_limited"

/**
 * 오케스트라 이벤트
 */
export interface OrchestraEvent {
  type: OrchestraEventType
  timestamp: Date
  data: Record<string, unknown>
}

/**
 * 이벤트 리스너
 */
export type OrchestraEventListener = (event: OrchestraEvent) => void
