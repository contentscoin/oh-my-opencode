# 🎭 BMAD Orchestra

> **BMAD 에이전트 오케스트라** - Antigravity IDE를 위한 병렬 AI 에이전트 오케스트레이션 시스템

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)

## 📋 개요

BMAD Orchestra는 여러 AI 에이전트를 병렬로 조율하여 복잡한 개발 작업을 효율적으로 처리하는 시스템입니다.

### 핵심 기능

- 🤖 **총괄 에이전트 중심 아키텍처** - 사용자는 총괄 에이전트(Sisyphus)와만 소통
- ⚡ **자동 병렬 실행** - 작업 복잡도 분석 후 최적의 에이전트 수 자동 결정
- 🧠 **LLM 모델 라우팅** - 에이전트별 최적 모델 자동 선택
- 💰 **무료 계정 우선 정책** - 무료 계정 우선 사용, 유료는 옵션
- ⚙️ **사용자 커스터마이징** - 설정 파일로 모델, 에이전트 구성 변경

---

## 🚀 빠른 시작

### 설치

```bash
# npm
npm install bmad-orchestra

# 또는 직접 복사
git clone https://github.com/your-repo/bmad-orchestra.git
cp -r bmad-orchestra/src/orchestra ./your-project/src/
```

### 초기화

```bash
npx bmad init
```

### 코드에서 사용

```typescript
import { getOrchestrator } from "bmad-orchestra"

const orchestrator = getOrchestrator()

// 작업 분석 및 에이전트 자동 할당
const assignments = orchestrator.analyzeAndRoute(
  "TypeScript로 OAuth 클라이언트 개발하고 테스트 작성"
)

// 병렬 실행
const results = await orchestrator.executeParallel(assignments)
console.log(orchestrator.aggregateResults(results))
```

---

## 🎭 에이전트

| 아이콘 | 이름 | ID | 역할 | 트리거 키워드 |
|-------|------|-----|------|-------------|
| 🧠 | Atlas | `atlas` | AI/LLM 아키텍트 | LLM, 프롬프트, AI, 모델 |
| 🔗 | Hermes | `hermes` | 에이전트 연동 전문가 | 연동, MCP, OAuth, IDE |
| 🏛️ | Prometheus | `prometheus` | OpenCode 아키텍트 | 아키텍처, 훅, 플러그인 |
| ⚡ | Hephaestus | `hephaestus` | TypeScript 개발자 | TypeScript, Bun, 테스트 |
| 🔍 | Athena | `athena` | 코드베이스 분석가 | 분석, 문서화, 리팩토링 |

---

## ⚙️ 설정

`.gemini/orchestra.config.json`:

```json
{
  "version": 1,
  "agents": {
    "atlas": { 
      "model": "anthropic/claude-opus-4", 
      "role": "architect",
      "enabled": true 
    },
    "hephaestus": { 
      "model": "openai/gpt-4o", 
      "role": "developer" 
    }
  },
  "orchestration": {
    "autoParallel": true,
    "maxConcurrent": 5,
    "timeoutMs": 300000
  },
  "accounts": {
    "preferFreeAccounts": true,
    "allowPaidFallback": true
  }
}
```

### 설정 옵션

| 옵션 | 설명 | 기본값 |
|------|------|--------|
| `agents.*.model` | 에이전트에 할당할 LLM 모델 | 역할별 기본값 |
| `agents.*.enabled` | 에이전트 활성화 여부 | `true` |
| `orchestration.autoParallel` | 자동 병렬 실행 | `true` |
| `orchestration.maxConcurrent` | 최대 동시 에이전트 수 | `5` |
| `accounts.preferFreeAccounts` | 무료 계정 우선 | `true` |
| `accounts.allowPaidFallback` | 유료 계정 폴백 허용 | `true` |

---

## 🛠️ CLI 명령어

```bash
bmad init          # 프로젝트에 BMAD Orchestra 초기화
bmad agents        # 에이전트 목록 보기
bmad status        # 현재 설정 상태 확인
bmad help          # 도움말
```

---

## 📁 프로젝트 구조

```
src/orchestra/
├── types.ts              # 핵심 타입 정의
├── llm-router.ts         # LLM 모델 라우터
├── bmad-orchestrator.ts  # 메인 오케스트레이터
├── config-loader.ts      # 설정 로더
├── cli.ts                # CLI 도구
├── index.ts              # 모듈 진입점
├── orchestra.config.json # 기본 설정
└── orchestra.schema.json # 설정 스키마

.bmad-core/agents/
├── atlas.md              # AI/LLM 아키텍트
├── hermes.md             # 에이전트 연동 전문가
├── prometheus.md         # OpenCode 아키텍트
├── hephaestus.md         # TypeScript 개발자
└── athena.md             # 코드베이스 분석가

src/auth/antigravity/
└── accounts.ts           # 계정 관리 (무료 우선 정책)
```

---

## 🔧 API

### `getOrchestrator()`

오케스트레이터 인스턴스를 가져옵니다.

```typescript
const orchestrator = getOrchestrator()
```

### `orchestrator.analyzeAndRoute(description)`

작업 설명을 분석하고 적합한 에이전트를 할당합니다.

```typescript
const assignments = orchestrator.analyzeAndRoute("API 개발")
// [{ agentId: "hephaestus", task: {...}, model: {...} }]
```

### `orchestrator.analyzeComplexity(description)`

작업 복잡도를 분석합니다.

```typescript
const complexity = orchestrator.analyzeComplexity("복잡한 작업...")
// { score: 7, recommendedAgents: 3, reasoning: "..." }
```

### `orchestrator.executeParallel(assignments)`

에이전트들을 병렬로 실행합니다.

```typescript
const results = await orchestrator.executeParallel(assignments)
```

### `orchestrator.on(listener)`

이벤트 리스너를 등록합니다.

```typescript
orchestrator.on((event) => {
  console.log(event.type, event.data)
})
```

---

## 📜 라이선스

MIT License

---

## 🤝 기여

기여를 환영합니다! Issue와 Pull Request를 자유롭게 제출해주세요.
