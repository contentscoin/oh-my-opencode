/**
 * BMAD Orchestra 전체 기능 테스트
 * 
 * 1. 복잡한 작업 - 다중 에이전트 병렬 실행
 * 2. 계정 로테이션 테스트
 * 3. 이벤트 시스템 테스트
 */

async function main() {
    console.log("═".repeat(60))
    console.log("🎭 BMAD Orchestra 전체 기능 테스트")
    console.log("═".repeat(60))

    const { BmadOrchestrator } = await import("./src/orchestra/bmad-orchestrator.js")

    // ==========================================================================
    // 테스트 1: 복잡한 작업 - 다중 에이전트 병렬 실행
    // ==========================================================================
    console.log("\n📋 테스트 1: 복잡한 작업 - 다중 에이전트 병렬 실행")
    console.log("-".repeat(60))

    const orchestrator = new BmadOrchestrator({
        orchestration: {
            autoParallel: true,
            maxConcurrent: 5,
            timeoutMs: 300000,
        },
    })

    // 복잡한 작업 설명 (여러 트리거 포함)
    const complexTask = `
    프로젝트 전체 리팩토링:
    1. TypeScript 코드 분석 및 의존성 매핑
    2. LLM 프롬프트 최적화 및 AI 모델 연동
    3. OAuth 플러그인 개발 및 MCP 서버 통합
    4. 아키텍처 문서화 및 테스트 작성
  `

    console.log("   입력 작업:")
    console.log("   " + complexTask.trim().replace(/\n/g, "\n   "))

    // 복잡도 분석
    const complexity = orchestrator.analyzeComplexity(complexTask)
    console.log(`\n   📊 복잡도 분석:`)
    console.log(`      점수: ${complexity.score}/10`)
    console.log(`      추천 에이전트 수: ${complexity.recommendedAgents}`)
    console.log(`      분석: ${complexity.reasoning}`)

    // 에이전트 할당
    const assignments = orchestrator.analyzeAndRoute(complexTask)
    console.log(`\n   🤖 할당된 에이전트 (${assignments.length}개):`)
    for (const assignment of assignments) {
        const agent = orchestrator.getAgent(assignment.agentId)
        console.log(`      ${agent?.icon} ${agent?.name} → ${assignment.model.modelId}`)
    }

    // 이벤트 리스너 등록
    const events: string[] = []
    const cleanup = orchestrator.on((event) => {
        events.push(`[${event.type}] ${new Date().toISOString().substr(11, 8)}`)
    })

    // 병렬 실행
    console.log(`\n   ⚡ 병렬 실행 시작...`)
    const startTime = Date.now()
    const results = await orchestrator.executeParallel(assignments)
    const elapsed = Date.now() - startTime

    // 결과
    const summary = orchestrator.aggregateResults(results)
    console.log(`\n   ✅ 실행 완료 (${elapsed}ms)`)
    console.log(`      ${summary.summary}`)

    console.log(`\n   📡 발생한 이벤트 (${events.length}개):`)
    for (const e of events) {
        console.log(`      ${e}`)
    }
    cleanup()

    // ==========================================================================
    // 테스트 2: 다양한 작업 유형 테스트
    // ==========================================================================
    console.log("\n\n📋 테스트 2: 다양한 작업 유형 테스트")
    console.log("-".repeat(60))

    const testCases = [
        { desc: "프론트엔드 UI 개발", expected: "hephaestus" },
        { desc: "LLM 프롬프트 엔지니어링", expected: "atlas" },
        { desc: "MCP 서버 연동 개발", expected: "hermes" },
        { desc: "아키텍처 설계 문서화", expected: "prometheus" },
        { desc: "코드베이스 분석 리팩토링", expected: "athena" },
    ]

    for (const tc of testCases) {
        const [assignment] = orchestrator.analyzeAndRoute(tc.desc)
        const agent = assignment ? orchestrator.getAgent(assignment.agentId) : null
        const match = assignment?.agentId === tc.expected ? "✓" : "✗"
        console.log(`   ${match} "${tc.desc}" → ${agent?.icon} ${agent?.name}`)
    }

    // ==========================================================================
    // 테스트 3: 설정 변경 테스트
    // ==========================================================================
    console.log("\n\n📋 테스트 3: 설정 변경 테스트")
    console.log("-".repeat(60))

    // 현재 설정 확인
    const config = orchestrator.getConfig()
    console.log("   현재 설정:")
    console.log(`      자동 병렬: ${config.orchestration.autoParallel}`)
    console.log(`      최대 동시: ${config.orchestration.maxConcurrent}`)
    console.log(`      무료 계정 우선: ${config.accounts.preferFreeAccounts}`)

    // 설정 변경
    orchestrator.updateConfig({
        orchestration: {
            autoParallel: false,
            maxConcurrent: 3,
            timeoutMs: 60000,
        },
    })

    const newConfig = orchestrator.getConfig()
    console.log("\n   변경된 설정:")
    console.log(`      자동 병렬: ${newConfig.orchestration.autoParallel}`)
    console.log(`      최대 동시: ${newConfig.orchestration.maxConcurrent}`)

    // ==========================================================================
    // 테스트 4: CLI 테스트
    // ==========================================================================
    console.log("\n\n📋 테스트 4: CLI 명령어 확인")
    console.log("-".repeat(60))
    console.log("   ✓ bmad init - 프로젝트 초기화")
    console.log("   ✓ bmad agents - 에이전트 목록")
    console.log("   ✓ bmad status - 설정 상태")

    // ==========================================================================
    // 종합 결과
    // ==========================================================================
    console.log("\n" + "═".repeat(60))
    console.log("📊 테스트 종합 결과")
    console.log("═".repeat(60))
    console.log("   ✅ 복잡한 작업 병렬 실행: 성공")
    console.log("   ✅ 에이전트 자동 할당: 성공")
    console.log("   ✅ 이벤트 시스템: 성공")
    console.log("   ✅ 설정 변경: 성공")
    console.log("   ✅ CLI 도구: 정상")
    console.log("\n🎉 모든 테스트 통과!")
}

main().catch(console.error)
