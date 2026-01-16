---
name: integration-master
description: "MCP 서버 개발, OAuth 통합, API 연동 전문 스킬. MUST USE for external system integration, authentication flows, plugin development. 트리거: 'mcp', 'oauth', 'api', 'integration', '연동', '통합', 'plugin', '플러그인'."
agent: hermes
category: integration
---

# 🔗 Integration Master Skill (Hermes)

외부 시스템 연동, OAuth 인증, MCP 서버 개발을 위한 전문 스킬

---

## 핵심 역량

1. **MCP 서버 개발**: Model Context Protocol 서버 구축
2. **OAuth 통합**: 인증 흐름 구현 및 관리
3. **API 연동**: 외부 서비스 연결 및 데이터 교환
4. **IDE 플러그인**: 에디터 확장 개발
5. **에이전트 통신**: 에이전트 간 메시지 표준화

---

## 트리거 키워드

| 카테고리 | 키워드 |
|----------|--------|
| MCP | mcp, MCP 서버, mcp server, tool, resource |
| OAuth | oauth, 인증, authentication, token, 토큰 교환 |
| API | api, 연동, integration, 연결, webhook |
| 플러그인 | plugin, 플러그인, extension, 확장 |

---

## MCP 서버 개발 가이드

### Phase 1: 설계

```yaml
MCP 서버 스펙:
  name: "서버 이름"
  description: "설명"
  tools:
    - name: "tool_name"
      description: "도구 설명"
      parameters:
        - name: "param1"
          type: "string"
          required: true
  resources:
    - uri_template: "resource://type/{id}"
      description: "리소스 설명"
```

### Phase 2: 구현

**표준 MCP 서버 템플릿**:
```typescript
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

const server = new Server(
  {
    name: "my-mcp-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
      resources: {},
    },
  }
);

// Tool 핸들러
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "my_tool",
      description: "Tool description",
      inputSchema: {
        type: "object",
        properties: {
          param1: { type: "string", description: "Parameter 1" },
        },
        required: ["param1"],
      },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  switch (request.params.name) {
    case "my_tool":
      // 구현
      return { content: [{ type: "text", text: "Result" }] };
    default:
      throw new Error("Unknown tool");
  }
});

// 서버 시작
const transport = new StdioServerTransport();
await server.connect(transport);
```

### Phase 3: 테스트

```bash
# 로컬 테스트
npx @anthropic-ai/mcp-inspector

# Claude Desktop 설정
# claude_desktop_config.json에 추가
{
  "mcpServers": {
    "my-server": {
      "command": "node",
      "args": ["path/to/server.js"]
    }
  }
}
```

---

## OAuth 통합 가이드

### OAuth 2.0 플로우 유형

| 플로우 | 사용 시점 | 보안 수준 |
|--------|----------|----------|
| Authorization Code | 서버 앱, SPA | 높음 |
| PKCE | 모바일, SPA | 높음 |
| Client Credentials | 서버 to 서버 | 중간 |
| Device Code | CLI, 스마트 기기 | 중간 |

### Authorization Code + PKCE 구현

```typescript
// 1. Code Verifier/Challenge 생성
function generateCodeVerifier(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return base64url(array);
}

async function generateCodeChallenge(verifier: string): Promise<string> {
  const hash = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(verifier)
  );
  return base64url(new Uint8Array(hash));
}

// 2. 인증 URL 생성
const authUrl = new URL("https://provider.com/oauth/authorize");
authUrl.searchParams.set("client_id", CLIENT_ID);
authUrl.searchParams.set("redirect_uri", REDIRECT_URI);
authUrl.searchParams.set("response_type", "code");
authUrl.searchParams.set("scope", "read write");
authUrl.searchParams.set("code_challenge", challenge);
authUrl.searchParams.set("code_challenge_method", "S256");
authUrl.searchParams.set("state", generateState());

// 3. 토큰 교환
async function exchangeToken(code: string, verifier: string) {
  const response = await fetch("https://provider.com/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      client_id: CLIENT_ID,
      code,
      redirect_uri: REDIRECT_URI,
      code_verifier: verifier,
    }),
  });
  return response.json();
}

// 4. 토큰 갱신
async function refreshToken(refreshToken: string) {
  const response = await fetch("https://provider.com/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      client_id: CLIENT_ID,
      refresh_token: refreshToken,
    }),
  });
  return response.json();
}
```

### 보안 체크리스트

- [ ] HTTPS 사용
- [ ] State 파라미터로 CSRF 방지
- [ ] PKCE 사용 (공개 클라이언트)
- [ ] 토큰 안전하게 저장
- [ ] 토큰 만료 처리
- [ ] Refresh Token 로테이션

---

## API 연동 패턴

### RESTful API 클라이언트

```typescript
class APIClient {
  private baseUrl: string;
  private token?: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  setToken(token: string) {
    this.token = token;
  }

  private async request<T>(
    method: string,
    path: string,
    body?: unknown
  ): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
      },
      ...(body && { body: JSON.stringify(body) }),
    });

    if (!response.ok) {
      throw new APIError(response.status, await response.text());
    }

    return response.json();
  }

  get<T>(path: string) { return this.request<T>("GET", path); }
  post<T>(path: string, body: unknown) { return this.request<T>("POST", path, body); }
  put<T>(path: string, body: unknown) { return this.request<T>("PUT", path, body); }
  delete<T>(path: string) { return this.request<T>("DELETE", path); }
}
```

### 에러 핸들링

```typescript
class APIError extends Error {
  constructor(
    public status: number,
    public body: string
  ) {
    super(`API Error ${status}: ${body}`);
  }
}

// 재시도 로직
async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  delay = 1000
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      if (error instanceof APIError && error.status >= 500) {
        await sleep(delay * Math.pow(2, i));
        continue;
      }
      throw error;
    }
  }
  throw new Error("Unreachable");
}
```

### Rate Limiting

```typescript
class RateLimiter {
  private queue: (() => void)[] = [];
  private running = 0;

  constructor(
    private maxConcurrent: number,
    private minDelay: number
  ) {}

  async acquire(): Promise<void> {
    if (this.running >= this.maxConcurrent) {
      await new Promise<void>(resolve => this.queue.push(resolve));
    }
    this.running++;
  }

  release(): void {
    this.running--;
    setTimeout(() => {
      const next = this.queue.shift();
      if (next) next();
    }, this.minDelay);
  }
}
```

---

## 에이전트 간 통신 표준

### 메시지 형식

```typescript
interface AgentMessage {
  id: string;
  from: string;  // 발신 에이전트
  to: string;    // 수신 에이전트
  type: "request" | "response" | "notification";
  payload: {
    action: string;
    data: unknown;
  };
  metadata: {
    timestamp: number;
    correlationId?: string;  // 요청-응답 매칭용
    priority?: "low" | "normal" | "high";
  };
}
```

### 통신 채널

```typescript
// 동기 호출 (결과 대기)
const result = await callAgent({
  to: "hephaestus",
  action: "implement",
  data: { task: "Create component" }
});

// 비동기 호출 (백그라운드)
const taskId = await dispatchAgent({
  to: "explore",
  action: "search",
  data: { query: "authentication" }
});

// 결과 수집
const searchResult = await collectResult(taskId);
```

---

## 사용 예시

### 예시 1: MCP 서버 생성
```
요청: "GitHub API를 위한 MCP 서버 만들어줘"

계획:
1. 필요 도구 정의: list_repos, create_issue, get_pr
2. OAuth 설정: GitHub OAuth App
3. 리소스 정의: github://repo/{owner}/{name}

결과: 완전한 MCP 서버 + 설치 가이드
```

### 예시 2: OAuth 통합
```
요청: "Google OAuth 로그인 구현해줘"

분석:
- 플로우: Authorization Code + PKCE
- 스코프: openid, email, profile
- 콜백: /auth/callback

결과: 인증 흐름 코드 + 설정 가이드
```
