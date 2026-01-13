# BMAD Orchestra MCP Server

🎭 **Antigravity IDE에서 시지푸스 기능을 사용할 수 있게 해주는 MCP 서버**

## 설치

```bash
cd src/mcp-server
npm install
```

## Antigravity 연동

프로젝트 루트에 `.mcp.json` 파일 생성:

```json
{
  "mcpServers": {
    "bmad-orchestra": {
      "command": "npx",
      "args": ["tsx", "/path/to/src/mcp-server/index.ts"]
    }
  }
}
```

## 제공 도구

### 1. `sisyphus_task`
시지푸스 모드로 작업 실행 - 작업을 끝까지 완료

```
sisyphus_task({ prompt: "TypeScript API 개발" })
```

### 2. `analyze_complexity`
작업 복잡도 분석 및 추천 에이전트 수 결정

```
analyze_complexity({ description: "프로젝트 전체 리팩토링" })
```

### 3. `list_agents`
사용 가능한 BMAD 에이전트 목록 조회

```
list_agents({})
```

### 4. `call_agent`
특정 BMAD 에이전트를 호출하여 작업 수행

```
call_agent({ agent: "atlas", task: "프롬프트 최적화" })
```

## 에이전트

| 아이콘 | 이름 | 역할 |
|-------|------|------|
| 🧠 | Atlas | AI/LLM 아키텍트 |
| 🔗 | Hermes | 연동 전문가 |
| 🏛️ | Prometheus | 아키텍트 |
| ⚡ | Hephaestus | TypeScript 개발자 |
| 🔍 | Athena | 분석가 |
