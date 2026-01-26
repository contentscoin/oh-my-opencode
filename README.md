# oh-my-anticode 🎭

> **B:Essential Multi-Agent Orchestration for OpenCode**
>
> OpenCode 환경에서 여러 AI 에이전트를 병렬로 조율하여 복잡한 개발 작업을 효율적으로 처리하는 시스템입니다.

[![npm version](https://badge.fury.io/js/oh-my-anticode.svg)](https://www.npmjs.com/package/oh-my-anticode)

## � 설치

```bash
npm install oh-my-anticode
# 또는
bun add oh-my-anticode
```

---

## 🚀 주요 기능

- **BMAD Orchestra**: Atlas, Hermes, Hephaestus, Athena 전문가 에이전트 통합
- **B:Essential 팀**: 마케팅(MIR) 및 개발(ROY) 전문 에이전트 팀 구성
- **Categories & Skills**: 작업 유형별 최적화된 모델 및 프롬프트 자동 선택
- **Ultrawork Mode**: 끊임없이 작업을 완료할 때까지 실행하는 시지푸스 모드

---

## 👥 에이전트 팀

### BMAD Orchestra (핵심 참모진)

| 에이전트 | 역할 | 전문 분야 |
|---------|------|----------|
| **Sisyphus** | Orchestrator | 작업 계획, 위임, 검증, 끊임없는 실행 |
| **Atlas** | Architect | 구조 설계, 기술 스택 결정 |
| **Hermes** | Integrator | 외부 연동, MCP 서버 개발 |
| **Hephaestus** | Developer | TypeScript 개발, 테스트 작성 |
| **Athena** | Analyst | 코드 분석, 문서화 |

### B:Essential 팀 (확장)

| 에이전트 | 역할 | 전문 분야 |
|---------|------|----------|
| **MIR** | Marketing Master | 콘텐츠 전략, OSMU, 시장 분석 |
| **ROY** | Developer Master | 풀스택 개발, 아키텍처, 디버깅 |

---

## � 카테고리 시스템

작업 유형에 따라 최적의 모델과 설정을 자동 적용합니다.

| 카테고리 | 모델 | 용도 |
|---------|------|------|
| `visual-engineering` | Gemini 3 Pro | UI/UX, 프론트엔드 |
| `ultrabrain` | GPT-5.2 | 복잡한 아키텍처 |
| `quick` | Claude Haiku | 빠른 수정 |
| `writing` | Gemini Flash | 문서화 |

---

## 🛠️ 사용법

### TypeScript에서 에이전트 사용

```typescript
import { mirAgent, royAgent, atlasAgent } from "oh-my-anticode";

// 에이전트 설정 확인
console.log(mirAgent.description);
```

### 필수 요구사항

- Node.js 18+
- OpenCode 또는 호환 환경

---

## 🔗 관련 링크

- [npm](https://www.npmjs.com/package/oh-my-anticode)
- [GitHub](https://github.com/contentscoin/oh-my-opencode)
- [oh-my-opencode (original)](https://github.com/code-yeongyu/oh-my-opencode)

---

## 📄 라이선스

MIT
