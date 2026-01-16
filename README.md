# oh-my-opencode with B:Essential Integration

> 🎭 **B:Essential Multi-Agent Orchestration for OpenCode**
>
> OpenCode 환경에서 여러 AI 에이전트를 병렬로 조율하여 복잡한 개발 작업을 효율적으로 처리하는 시스템입니다.

## 🚀 주요 기능

- **B:Essential 팀 통합**: 마케팅(MIR) 및 개발(ROY) 전문 에이전트 팀 구성
- **Hybrid Orchestration**: TypeScript 기반의 하이브리드 오케스트레이션 (Sisyphus + Gemini CLI)
- **tmux 브릿지**: 로컬 환경(WSL/macOS)에서 Gemini CLI 에이전트와 완벽한 연동
- **Gemini CLI 직접 연동**: Google Gemini 모델을 터미널에서 직접 활용

---

## 👥 B:Essential 에이전트 팀

| ID | 에이전트 | 역할 | 전문 분야 |
|----|---------|------|-----------|
| **00** | **JIAN** | Orchestrator | 전체 작업 조율 및 관리 |
| **10** | **MIR** | Marketing Master | 콘텐츠 전략, OSMU, 시장 분석, SEO |
| **20** | **ROY** | Developer Master | 풀스택 개발, 아키텍처, 디버깅 |

---

## 🛠️ 설치 및 설정

### 1. 필수 요구사항

- Node.js 18+
- [Gemini CLI](https://github.com/google/gemini-cli) 설치 (`npm install -g @google/gemini-cli`)
- Google 계정 인증 (`gemini login`)
- (선택) tmux (WSL 또는 macOS 사용 시)

### 2. 설치

```bash
git clone https://github.com/contentscoin/oh-my-opencode.git
cd oh-my-opencode
npm install
```

---

## 💻 사용법

### 1. TypeScript 에이전트 활용

`src/agents` 모듈을 통해 사전 정의된 전문가 에이전트를 바로 사용할 수 있습니다.

```typescript
import { mirAgent, royAgent } from "./src/agents";

// MIR 에이전트 설정 확인
console.log(mirAgent.description);
```

### 2. Gemini CLI 연동 (추천)

Gemini CLI를 통해 강력한 Google Gemini 모델을 직접 호출합니다.

```typescript
import { executeGeminiPrompt, geminiMirPrompt, geminiRoyPrompt } from "./src/agents";

// 기본 프롬프트 실행
const result = await executeGeminiPrompt("Hello, Gemini!");

// MIR에게 마케팅 작업 요청
const mirResult = await geminiMirPrompt("블로그 콘텐츠 전략 수립해줘");

// ROY에게 개발 작업 요청
const royResult = await geminiRoyPrompt("React 컴포넌트 만들어줘");
```

### 3. tmux 브릿지 (고급 사용자)

WSL이나 macOS 환경에서 tmux 세션을 통해 에이전트를 영구적으로 실행하고 관리합니다.

```typescript
import { delegateToMir, delegateToRoy, startBessentialAgents } from "./src/agents";

// 에이전트 세션 시작
await startBessentialAgents();

// 작업 위임
await delegateToMir("OSMU 콘텐츠 생성해줘");
await delegateToRoy("대시보드 만들어줘");
```

---

## 📂 프로젝트 구조

```
src/
├── agents/
│   ├── mir.ts          # MIR 마케팅 마스터 에이전트 정의
│   ├── roy.ts          # ROY 개발 마스터 에이전트 정의
│   ├── teams.ts        # 팀 구조 및 ID 레지스트리
│   ├── tmux-bridge.ts  # tmux 세션 관리 및 브릿지
│   ├── gemini-cli.ts   # Gemini CLI 연동 모듈
│   └── index.ts        # 에이전트 모듈 엔트리 포인트
├── orchestra/          # BMAD Orchestra 코어
└── ...
```

---

## 🔗 관련 링크

- [oh-my-opencode Repository](https://github.com/contentscoin/oh-my-opencode)
- [B:Essential Multi-Agent Orchestration](https://github.com/Roykoo83/bessential-Multi-agent-orchestration)
- [Google Gemini CLI](https://github.com/google/gemini-cli)
