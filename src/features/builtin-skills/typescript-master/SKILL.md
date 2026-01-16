---
name: typescript-master
description: "TypeScript/React 개발, 테스트 작성, 번들링 전문 스킬. MUST USE for TypeScript development, React components, testing. 트리거: 'typescript', 'react', 'component', 'test', '컴포넌트', '테스트', 'bun', 'node'."
agent: hephaestus
category: development
---

# ⚡ TypeScript Master Skill (Hephaestus)

TypeScript/React 개발, 테스트 작성, 런타임 최적화를 위한 전문 스킬

---

## 핵심 역량

1. **TypeScript 개발**: 타입 안전한 코드 작성
2. **React 컴포넌트**: 모던 React 패턴 적용
3. **테스트 작성**: 단위/통합/E2E 테스트
4. **Bun 런타임**: 고성능 JavaScript 런타임 활용
5. **번들링 최적화**: 빌드 성능 개선

---

## 트리거 키워드

| 카테고리 | 키워드 |
|----------|--------|
| TypeScript | typescript, ts, 타입, type, interface |
| React | react, component, 컴포넌트, hook, jsx |
| 테스트 | test, 테스트, vitest, jest, spec |
| 런타임 | bun, node, runtime |
| 빌드 | build, bundle, 빌드, esbuild, vite |

---

## TypeScript 베스트 프랙티스

### 타입 정의 원칙

```typescript
// ✅ GOOD: 명시적 타입 정의
interface User {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}

// ❌ BAD: any 사용
const user: any = { ... };

// ✅ GOOD: 유니온 타입으로 상태 표현
type LoadingState = 
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: User }
  | { status: "error"; error: Error };

// ✅ GOOD: 제네릭으로 재사용성
function createState<T>(initial: T): [T, (value: T) => void] {
  let state = initial;
  return [state, (value: T) => { state = value; }];
}
```

### 타입 가드

```typescript
// 타입 좁히기
function isUser(obj: unknown): obj is User {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "id" in obj &&
    "name" in obj
  );
}

// 사용
if (isUser(data)) {
  console.log(data.name); // 타입 안전
}
```

### 유틸리티 타입 활용

```typescript
// Partial: 모든 속성 선택적
type UpdateUser = Partial<User>;

// Pick: 특정 속성만 선택
type UserPreview = Pick<User, "id" | "name">;

// Omit: 특정 속성 제외
type UserInput = Omit<User, "id" | "createdAt">;

// Record: 키-값 매핑
type UserMap = Record<string, User>;

// ReturnType: 함수 반환 타입 추출
type FetchResult = ReturnType<typeof fetchUser>;
```

### 금지 패턴

```typescript
// ❌ NEVER: as any
const data = response as any;

// ❌ NEVER: @ts-ignore
// @ts-ignore
someBrokenCode();

// ❌ NEVER: @ts-expect-error (정당한 이유 없이)
// @ts-expect-error
anotherBrokenCode();

// ❌ NEVER: 빈 인터페이스
interface EmptyInterface {}

// ❌ NEVER: Function 타입
let callback: Function;

// ✅ INSTEAD: 구체적 함수 시그니처
let callback: (arg: string) => void;
```

---

## React 컴포넌트 패턴

### 함수형 컴포넌트

```typescript
// Props 인터페이스 정의
interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: "primary" | "secondary";
  disabled?: boolean;
  children?: React.ReactNode;
}

// 컴포넌트 정의
export function Button({
  label,
  onClick,
  variant = "primary",
  disabled = false,
  children,
}: ButtonProps) {
  return (
    <button
      className={`btn btn-${variant}`}
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
    >
      {children ?? label}
    </button>
  );
}
```

### 커스텀 훅

```typescript
// 재사용 가능한 로직 추출
function useAsync<T>(asyncFn: () => Promise<T>) {
  const [state, setState] = useState<{
    data: T | null;
    loading: boolean;
    error: Error | null;
  }>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    asyncFn()
      .then(data => setState({ data, loading: false, error: null }))
      .catch(error => setState({ data: null, loading: false, error }));
  }, [asyncFn]);

  return state;
}

// 사용
function UserProfile({ userId }: { userId: string }) {
  const { data, loading, error } = useAsync(
    useCallback(() => fetchUser(userId), [userId])
  );
  
  if (loading) return <Spinner />;
  if (error) return <Error message={error.message} />;
  return <Profile user={data!} />;
}
```

### 컴포넌트 합성

```typescript
// Compound Components 패턴
const Card = {
  Root: ({ children }: { children: React.ReactNode }) => (
    <div className="card">{children}</div>
  ),
  Header: ({ children }: { children: React.ReactNode }) => (
    <div className="card-header">{children}</div>
  ),
  Body: ({ children }: { children: React.ReactNode }) => (
    <div className="card-body">{children}</div>
  ),
  Footer: ({ children }: { children: React.ReactNode }) => (
    <div className="card-footer">{children}</div>
  ),
};

// 사용
<Card.Root>
  <Card.Header>제목</Card.Header>
  <Card.Body>내용</Card.Body>
  <Card.Footer>푸터</Card.Footer>
</Card.Root>
```

### 성능 최적화

```typescript
// React.memo: 불필요한 리렌더링 방지
const ExpensiveComponent = React.memo(({ data }: Props) => {
  // 렌더링 비용이 큰 컴포넌트
});

// useMemo: 계산 결과 캐싱
const sortedItems = useMemo(
  () => items.sort((a, b) => a.name.localeCompare(b.name)),
  [items]
);

// useCallback: 함수 참조 안정화
const handleClick = useCallback((id: string) => {
  setSelected(id);
}, []);
```

---

## 테스트 작성 가이드

### 테스트 구조

```typescript
// 테스트 파일명: *.test.ts 또는 *.spec.ts
import { describe, it, expect, beforeEach } from "vitest";
import { UserService } from "./user-service";

describe("UserService", () => {
  let service: UserService;
  
  beforeEach(() => {
    service = new UserService();
  });
  
  describe("createUser", () => {
    it("should create a user with valid data", async () => {
      const user = await service.createUser({
        name: "Test",
        email: "test@example.com",
      });
      
      expect(user.id).toBeDefined();
      expect(user.name).toBe("Test");
    });
    
    it("should throw error with invalid email", async () => {
      await expect(
        service.createUser({ name: "Test", email: "invalid" })
      ).rejects.toThrow("Invalid email");
    });
  });
});
```

### 컴포넌트 테스트

```typescript
import { render, screen, fireEvent } from "@testing-library/react";
import { Button } from "./Button";

describe("Button", () => {
  it("should render with label", () => {
    render(<Button label="Click me" onClick={() => {}} />);
    
    expect(screen.getByRole("button")).toHaveTextContent("Click me");
  });
  
  it("should call onClick when clicked", () => {
    const handleClick = vi.fn();
    render(<Button label="Click" onClick={handleClick} />);
    
    fireEvent.click(screen.getByRole("button"));
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
  
  it("should be disabled when disabled prop is true", () => {
    render(<Button label="Click" onClick={() => {}} disabled />);
    
    expect(screen.getByRole("button")).toBeDisabled();
  });
});
```

### 모킹

```typescript
// 모듈 모킹
vi.mock("./api", () => ({
  fetchUser: vi.fn(),
}));

// 함수 모킹
const mockFetch = vi.fn().mockResolvedValue({ id: "1", name: "Test" });

// 타이머 모킹
vi.useFakeTimers();
vi.advanceTimersByTime(1000);

// 모킹 해제
vi.clearAllMocks();
vi.restoreAllMocks();
```

### 테스트 커버리지 기준

```
최소 커버리지:
- 라인: 80%
- 브랜치: 70%
- 함수: 80%
- 문장: 80%

필수 테스트 대상:
- 모든 공개 API
- 에러 핸들링 경로
- 엣지 케이스
- 비즈니스 로직
```

---

## Bun 런타임

### Bun 특징

```typescript
// 빠른 패키지 설치
// bun install (npm보다 10-100x 빠름)

// 직접 TypeScript 실행
// bun run script.ts

// 내장 테스트 러너
// bun test

// SQLite 내장
import { Database } from "bun:sqlite";
const db = new Database("mydb.sqlite");
```

### Bun API

```typescript
// 파일 I/O
const file = Bun.file("path/to/file.txt");
const content = await file.text();

// HTTP 서버
Bun.serve({
  port: 3000,
  fetch(req) {
    return new Response("Hello!");
  },
});

// 해시
const hash = Bun.hash("password");

// 환경 변수
const apiKey = Bun.env.API_KEY;
```

---

## 빌드 최적화

### esbuild 설정

```typescript
import { build } from "esbuild";

await build({
  entryPoints: ["src/index.ts"],
  bundle: true,
  minify: true,
  sourcemap: true,
  target: "es2022",
  platform: "node",
  outdir: "dist",
  external: ["node:*"],
});
```

### 트리 쉐이킹

```typescript
// ✅ GOOD: named export (트리 쉐이킹 가능)
export { Button } from "./Button";
export { Input } from "./Input";

// ❌ BAD: barrel export 남용 (트리 쉐이킹 어려움)
export * from "./components";
```

### 코드 스플리팅

```typescript
// 동적 import
const Component = React.lazy(() => import("./HeavyComponent"));

// 라우트 기반 분할
const routes = [
  {
    path: "/dashboard",
    component: () => import("./pages/Dashboard"),
  },
];
```

---

## 사용 예시

### 예시 1: 컴포넌트 생성
```
요청: "사용자 프로필 카드 컴포넌트 만들어줘"

분석:
- Props: user 객체, onEdit 콜백
- 스타일: 기존 디자인 시스템 확인
- 테스트: 렌더링, 상호작용 테스트

결과:
- ProfileCard.tsx (컴포넌트)
- ProfileCard.test.tsx (테스트)
- 타입 정의, 접근성 고려
```

### 예시 2: 테스트 추가
```
요청: "UserService 테스트 작성해줘"

분석:
- 대상: createUser, getUser, updateUser
- 전략: 단위 테스트, 모킹 필요
- 커버리지: 에러 경로 포함

결과:
- 성공/실패 케이스 테스트
- 모킹된 의존성
- 80% 이상 커버리지
```
