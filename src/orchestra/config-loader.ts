/**
 * BMAD Orchestra - Configuration Loader
 * 
 * 설정 파일 로드 및 검증
 */

import * as fs from "fs"
import * as path from "path"
import type { OrchestraConfig, AgentConfig, OrchestrationSettings, AccountSettings } from "./types"

// ============================================================================
// Default Configuration
// ============================================================================

export const DEFAULT_ORCHESTRA_CONFIG: OrchestraConfig = {
    version: 1,
    agents: {
        atlas: { model: "anthropic/claude-opus-4", role: "architect" },
        hermes: { model: "google/gemini-2.5-pro", role: "integrator" },
        prometheus: { model: "anthropic/claude-sonnet-4", role: "architect" },
        hephaestus: { model: "openai/gpt-4o", role: "developer" },
        athena: { model: "google/gemini-2.5-pro", role: "analyst" },
    },
    orchestration: {
        autoParallel: true,
        maxConcurrent: 5,
        timeoutMs: 300000,
    },
    accounts: {
        preferFreeAccounts: true,
        allowPaidFallback: true,
    },
}

// ============================================================================
// Configuration Paths
// ============================================================================

/**
 * 설정 파일 검색 경로 (우선순위 순)
 */
export function getConfigPaths(workspaceDir?: string): string[] {
    const paths: string[] = []

    // 1. 워크스페이스 .gemini 디렉토리
    if (workspaceDir) {
        paths.push(path.join(workspaceDir, ".gemini", "orchestra.config.json"))
    }

    // 2. 현재 디렉토리 .gemini
    paths.push(path.join(process.cwd(), ".gemini", "orchestra.config.json"))

    // 3. 홈 디렉토리 .gemini
    const homeDir = process.env.HOME || process.env.USERPROFILE
    if (homeDir) {
        paths.push(path.join(homeDir, ".gemini", "orchestra.config.json"))
    }

    return paths
}

// ============================================================================
// Configuration Loader
// ============================================================================

/**
 * 설정 파일 로드
 */
export function loadConfig(workspaceDir?: string): OrchestraConfig {
    const configPaths = getConfigPaths(workspaceDir)

    for (const configPath of configPaths) {
        try {
            if (fs.existsSync(configPath)) {
                const content = fs.readFileSync(configPath, "utf-8")
                const parsed = JSON.parse(content) as Partial<OrchestraConfig>

                // 기본 설정과 병합
                return mergeConfig(DEFAULT_ORCHESTRA_CONFIG, parsed)
            }
        } catch (error) {
            console.warn(`Failed to load config from ${configPath}:`, error)
        }
    }

    // 설정 파일이 없으면 기본 설정 반환
    return DEFAULT_ORCHESTRA_CONFIG
}

/**
 * 설정 병합
 */
function mergeConfig(base: OrchestraConfig, override: Partial<OrchestraConfig>): OrchestraConfig {
    return {
        version: override.version ?? base.version,
        agents: { ...base.agents, ...override.agents },
        orchestration: { ...base.orchestration, ...override.orchestration },
        accounts: { ...base.accounts, ...override.accounts },
    }
}

/**
 * 설정 파일 저장
 */
export function saveConfig(config: OrchestraConfig, configPath: string): void {
    const dir = path.dirname(configPath)

    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
    }

    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), "utf-8")
}

/**
 * 설정 파일 초기화 (템플릿 생성)
 */
export function initConfig(workspaceDir: string): string {
    const configPath = path.join(workspaceDir, ".gemini", "orchestra.config.json")

    if (fs.existsSync(configPath)) {
        throw new Error(`Config file already exists: ${configPath}`)
    }

    saveConfig(DEFAULT_ORCHESTRA_CONFIG, configPath)
    return configPath
}

// ============================================================================
// Configuration Validation
// ============================================================================

/**
 * 설정 유효성 검사
 */
export function validateConfig(config: Partial<OrchestraConfig>): { valid: boolean; errors: string[] } {
    const errors: string[] = []

    // 버전 체크
    if (config.version !== undefined && typeof config.version !== "number") {
        errors.push("version must be a number")
    }

    // 에이전트 설정 체크
    if (config.agents) {
        for (const [id, agent] of Object.entries(config.agents)) {
            if (agent.model && typeof agent.model !== "string") {
                errors.push(`agents.${id}.model must be a string`)
            }
            if (agent.role && !["orchestrator", "architect", "integrator", "developer", "analyst", "specialist"].includes(agent.role)) {
                errors.push(`agents.${id}.role has invalid value`)
            }
        }
    }

    // 오케스트레이션 설정 체크
    if (config.orchestration) {
        const { maxConcurrent, timeoutMs } = config.orchestration
        if (maxConcurrent !== undefined && (maxConcurrent < 1 || maxConcurrent > 10)) {
            errors.push("orchestration.maxConcurrent must be between 1 and 10")
        }
        if (timeoutMs !== undefined && timeoutMs < 1000) {
            errors.push("orchestration.timeoutMs must be at least 1000")
        }
    }

    return {
        valid: errors.length === 0,
        errors,
    }
}
