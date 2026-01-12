# 변경 이력

## [1.0.0] - 2026-01-13

### 추가됨
- 🎭 BMAD 에이전트 오케스트라 코어 시스템
  - `types.ts` - 오케스트라 핵심 타입 (에이전트, 태스크, 설정)
  - `llm-router.ts` - LLM 모델 라우터 (사용자 커스터마이징 지원)
  - `bmad-orchestrator.ts` - 메인 오케스트레이터
  - `config-loader.ts` - 설정 파일 로더

- 🤖 5개 BMAD 에이전트
  - Atlas (AI/LLM 아키텍트)
  - Hermes (에이전트 연동 전문가)
  - Prometheus (OpenCode 아키텍트)
  - Hephaestus (TypeScript 개발자)
  - Athena (코드베이스 분석가)

- 🛠️ CLI 도구
  - `bmad init` - 프로젝트 초기화
  - `bmad agents` - 에이전트 목록
  - `bmad status` - 설정 상태

- 🔗 훅 통합
  - PreToolUse 훅 (에이전트 라우팅)
  - PostToolUse 훅 (결과 집계)
  - UserPromptSubmit 훅 (자동 분석)

### 수정됨
- `accounts.ts` - 무료 계정 우선 정책 적용
  - `setConfig()` 메서드 추가
  - `getUsageStats()` 메서드 추가
  - `getSummary()` 메서드 추가
  - `preferFreeAccounts` 옵션 기본 true

### 설정
- `orchestra.config.json` - 기본 설정 파일
- `orchestra.schema.json` - JSON 스키마
