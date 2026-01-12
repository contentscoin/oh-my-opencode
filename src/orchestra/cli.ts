#!/usr/bin/env node
/**
 * BMAD Orchestra CLI
 * 
 * 프로젝트에 BMAD Orchestra 초기화 및 관리
 */

import * as fs from "fs"
import * as path from "path"

// ============================================================================
// CLI Colors
// ============================================================================

const colors = {
    reset: "\x1b[0m",
    bold: "\x1b[1m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    blue: "\x1b[34m",
    red: "\x1b[31m",
    cyan: "\x1b[36m",
}

const log = {
    info: (msg: string) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
    success: (msg: string) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
    warn: (msg: string) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
    error: (msg: string) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
    title: (msg: string) => console.log(`\n${colors.bold}${colors.cyan}${msg}${colors.reset}\n`),
}

// ============================================================================
// Default Configuration
// ============================================================================

const DEFAULT_CONFIG = {
    version: 1,
    agents: {
        atlas: { model: "anthropic/claude-opus-4", role: "architect", enabled: true },
        hermes: { model: "google/gemini-2.5-pro", role: "integrator", enabled: true },
        prometheus: { model: "anthropic/claude-sonnet-4", role: "architect", enabled: true },
        hephaestus: { model: "openai/gpt-4o", role: "developer", enabled: true },
        athena: { model: "google/gemini-2.5-pro", role: "analyst", enabled: true },
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
// Commands
// ============================================================================

async function init(targetDir: string) {
    log.title("🎭 BMAD Orchestra 초기화")

    const geminiDir = path.join(targetDir, ".gemini")
    const configPath = path.join(geminiDir, "orchestra.config.json")

    // .gemini 디렉토리 생성
    if (!fs.existsSync(geminiDir)) {
        fs.mkdirSync(geminiDir, { recursive: true })
        log.success(`.gemini/ 디렉토리 생성`)
    }

    // 설정 파일 확인
    if (fs.existsSync(configPath)) {
        log.warn(`설정 파일이 이미 존재합니다: ${configPath}`)
        log.info(`덮어쓰려면 --force 옵션을 사용하세요`)
        return
    }

    // 설정 파일 생성
    fs.writeFileSync(configPath, JSON.stringify(DEFAULT_CONFIG, null, 2), "utf-8")
    log.success(`설정 파일 생성: ${configPath}`)

    // 완료 메시지
    console.log(`
${colors.green}BMAD Orchestra 초기화 완료!${colors.reset}

다음 단계:
  1. ${colors.cyan}.gemini/orchestra.config.json${colors.reset} 에서 에이전트 모델 설정
  2. 코드에서 사용:
     ${colors.yellow}import { getOrchestrator } from "bmad-orchestra"${colors.reset}
`)
}

async function listAgents() {
    log.title("🎭 BMAD 에이전트 목록")

    const agents = [
        { icon: "🧠", name: "Atlas", role: "AI/LLM 아키텍트", triggers: "LLM, 프롬프트, AI" },
        { icon: "🔗", name: "Hermes", role: "에이전트 연동 전문가", triggers: "연동, MCP, OAuth" },
        { icon: "🏛️", name: "Prometheus", role: "OpenCode 아키텍트", triggers: "아키텍처, 훅, 플러그인" },
        { icon: "⚡", name: "Hephaestus", role: "TypeScript 개발자", triggers: "TypeScript, Bun, 테스트" },
        { icon: "🔍", name: "Athena", role: "코드베이스 분석가", triggers: "분석, 문서화, 리팩토링" },
    ]

    console.log("┌─────┬─────────────┬─────────────────────────┬──────────────────────┐")
    console.log("│ 아이콘│ 이름        │ 역할                    │ 트리거 키워드        │")
    console.log("├─────┼─────────────┼─────────────────────────┼──────────────────────┤")

    for (const agent of agents) {
        console.log(`│ ${agent.icon}  │ ${agent.name.padEnd(11)}│ ${agent.role.padEnd(23)}│ ${agent.triggers.padEnd(20)}│`)
    }

    console.log("└─────┴─────────────┴─────────────────────────┴──────────────────────┘")
}

async function status(targetDir: string) {
    log.title("📊 BMAD Orchestra 상태")

    const configPath = path.join(targetDir, ".gemini", "orchestra.config.json")

    if (!fs.existsSync(configPath)) {
        log.error("설정 파일을 찾을 수 없습니다")
        log.info(`${colors.cyan}bmad init${colors.reset} 으로 초기화하세요`)
        return
    }

    const config = JSON.parse(fs.readFileSync(configPath, "utf-8"))

    console.log(`설정 파일: ${colors.cyan}${configPath}${colors.reset}`)
    console.log(``)
    console.log(`에이전트 설정:`)

    for (const [id, agent] of Object.entries(config.agents || {})) {
        const a = agent as { model: string; enabled?: boolean }
        const status = a.enabled !== false ? "✓" : "✗"
        console.log(`  ${status} ${id}: ${a.model}`)
    }

    console.log(``)
    console.log(`오케스트레이션:`)
    console.log(`  자동 병렬: ${config.orchestration?.autoParallel ? "✓" : "✗"}`)
    console.log(`  최대 동시 에이전트: ${config.orchestration?.maxConcurrent || 5}`)

    console.log(``)
    console.log(`계정 정책:`)
    console.log(`  무료 계정 우선: ${config.accounts?.preferFreeAccounts ? "✓" : "✗"}`)
    console.log(`  유료 폴백 허용: ${config.accounts?.allowPaidFallback ? "✓" : "✗"}`)
}

function showHelp() {
    console.log(`
${colors.bold}${colors.cyan}🎭 BMAD Orchestra CLI${colors.reset}

${colors.bold}사용법:${colors.reset}
  bmad <command> [options]

${colors.bold}명령어:${colors.reset}
  init          프로젝트에 BMAD Orchestra 초기화
  agents        에이전트 목록 보기
  status        현재 설정 상태 확인
  help          도움말 표시

${colors.bold}예시:${colors.reset}
  ${colors.cyan}bmad init${colors.reset}            현재 디렉토리에 초기화
  ${colors.cyan}bmad init ./my-app${colors.reset}   지정 디렉토리에 초기화
  ${colors.cyan}bmad agents${colors.reset}          에이전트 목록 확인
  ${colors.cyan}bmad status${colors.reset}          설정 상태 확인
`)
}

// ============================================================================
// Main
// ============================================================================

async function main() {
    const args = process.argv.slice(2)
    const command = args[0]
    const targetDir = args[1] || process.cwd()

    switch (command) {
        case "init":
            await init(targetDir)
            break
        case "agents":
        case "list":
            await listAgents()
            break
        case "status":
            await status(targetDir)
            break
        case "help":
        case "--help":
        case "-h":
        default:
            showHelp()
            break
    }
}

main().catch(console.error)
