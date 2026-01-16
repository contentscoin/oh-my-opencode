---
name: architecture-design
description: "시스템 아키텍처 분석, 설계 패턴 적용, 의존성 관리 전문 스킬. MUST USE for system design, architecture decisions, pattern selection. 트리거: 'architecture', '아키텍처', 'design', '설계', 'structure', '구조', 'pattern', '패턴'."
agent: prometheus
category: architecture
---

# 🏛️ Architecture Design Skill (Prometheus)

시스템 아키텍처 분석, 설계 패턴, 의존성 관리를 위한 전문 스킬

---

## 핵심 역량

1. **아키텍처 분석**: 기존 시스템 구조 이해 및 평가
2. **설계 패턴**: 적절한 디자인 패턴 선택 및 적용
3. **의존성 관리**: 모듈 간 결합도 최적화
4. **확장성 설계**: 성장 가능한 시스템 구조
5. **기술 스택 선정**: 요구사항에 맞는 기술 조합

---

## 트리거 키워드

| 카테고리 | 키워드 |
|----------|--------|
| 아키텍처 | architecture, 아키텍처, system design, 시스템 설계 |
| 구조 | structure, 구조, layout, 레이아웃 |
| 패턴 | pattern, 패턴, design pattern |
| 의존성 | dependency, 의존성, coupling, decoupling |
| 확장 | scale, scalability, 확장성 |

---

## 아키텍처 분석 프레임워크

### Phase 1: 현황 파악

```
분석 체크리스트:
□ 프로젝트 구조 (폴더, 모듈)
□ 의존성 그래프 (package.json, imports)
□ 데이터 흐름 (API, 상태 관리)
□ 레이어 구분 (UI, 비즈니스, 데이터)
□ 외부 의존성 (라이브러리, 서비스)
```

### Phase 2: 평가 기준

| 기준 | 평가 항목 | 점수 (1-5) |
|------|----------|----------|
| 결합도 | 모듈 간 의존성 | _ |
| 응집도 | 모듈 내 관련성 | _ |
| 확장성 | 새 기능 추가 용이성 | _ |
| 테스트 | 테스트 가능성 | _ |
| 유지보수 | 변경 영향 범위 | _ |

### Phase 3: 문제 식별

```
일반적인 아키텍처 문제:
- 순환 의존성 (A → B → C → A)
- God Object (모든 것을 아는 클래스)
- 레이어 위반 (UI에서 직접 DB 접근)
- 과도한 결합 (변경 시 연쇄 수정)
- 일관성 없는 패턴 (파일마다 다른 구조)
```

---

## 설계 패턴 가이드

### 생성 패턴 (Creational)

| 패턴 | 사용 시점 | 예시 |
|------|----------|------|
| Factory | 객체 생성 로직 캡슐화 | `createAgent(type)` |
| Builder | 복잡한 객체 단계적 생성 | 쿼리 빌더, 설정 빌더 |
| Singleton | 전역에서 단일 인스턴스 | 설정 관리자, 로거 |
| Prototype | 기존 객체 복제 | 설정 템플릿 |

### 구조 패턴 (Structural)

| 패턴 | 사용 시점 | 예시 |
|------|----------|------|
| Adapter | 인터페이스 변환 | 레거시 API 래핑 |
| Decorator | 기능 동적 추가 | 로깅, 캐싱 래퍼 |
| Facade | 복잡한 시스템 단순화 | SDK 인터페이스 |
| Proxy | 접근 제어, 지연 로딩 | 캐시 프록시 |
| Composite | 트리 구조 표현 | 파일 시스템, UI 컴포넌트 |

### 행동 패턴 (Behavioral)

| 패턴 | 사용 시점 | 예시 |
|------|----------|------|
| Strategy | 알고리즘 교체 가능 | 인증 방식 선택 |
| Observer | 이벤트 기반 통신 | 상태 변경 알림 |
| Command | 작업 캡슐화 | Undo/Redo |
| Chain of Responsibility | 순차적 처리 | 미들웨어 체인 |
| State | 상태별 행동 변경 | 워크플로우 상태 |

---

## 아키텍처 패턴

### 레이어드 아키텍처

```
┌─────────────────────┐
│   Presentation      │  UI, 컨트롤러
├─────────────────────┤
│   Application       │  유스케이스, 서비스
├─────────────────────┤
│   Domain            │  엔티티, 비즈니스 로직
├─────────────────────┤
│   Infrastructure    │  DB, 외부 서비스
└─────────────────────┘

규칙: 위 → 아래 의존만 허용
```

### Clean Architecture

```
┌─────────────────────────────────────┐
│            Frameworks               │
│  ┌─────────────────────────────┐   │
│  │      Interface Adapters     │   │
│  │  ┌───────────────────────┐ │   │
│  │  │    Application        │ │   │
│  │  │  ┌─────────────────┐ │ │   │
│  │  │  │    Entities     │ │ │   │
│  │  │  └─────────────────┘ │ │   │
│  │  └───────────────────────┘ │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘

규칙: 안쪽은 바깥쪽을 모름
```

### 이벤트 기반 아키텍처

```
Producer ──► Event Bus ──► Consumer
                │
                ├──► Consumer 2
                │
                └──► Consumer 3

특징:
- 느슨한 결합
- 비동기 처리
- 확장 용이
```

### 마이크로서비스

```
┌─────────┐   ┌─────────┐   ┌─────────┐
│ Service │   │ Service │   │ Service │
│    A    │   │    B    │   │    C    │
└────┬────┘   └────┬────┘   └────┬────┘
     │             │             │
     └─────────────┼─────────────┘
                   │
              API Gateway
                   │
               Client

특징:
- 독립 배포
- 기술 다양성
- 장애 격리
```

---

## 의존성 관리

### 의존성 분석

```typescript
// 의존성 방향 확인
// BAD: 순환 의존성
// A.ts
import { B } from "./B";
// B.ts
import { A } from "./A";

// GOOD: 단방향 의존성
// A.ts
import { B } from "./B";
// B.ts (A를 import하지 않음)
```

### 의존성 역전

```typescript
// BAD: 구체 클래스에 직접 의존
class UserService {
  private db = new PostgresDB(); // 직접 의존
}

// GOOD: 인터페이스에 의존
interface Database {
  query(sql: string): Promise<any>;
}

class UserService {
  constructor(private db: Database) {} // 주입
}
```

### 모듈 경계

```
모듈 설계 원칙:
1. 단일 책임: 한 가지 이유로만 변경
2. 인터페이스 분리: 사용하지 않는 것에 의존하지 않음
3. 명시적 API: 공개 인터페이스 명확히 정의
4. 내부 구현 은닉: 외부에서 내부 접근 차단
```

---

## 기술 스택 선정

### 결정 프레임워크

```
평가 기준:
1. 요구사항 적합성 (필수 기능 지원)
2. 팀 역량 (학습 곡선)
3. 생태계 (커뮤니티, 라이브러리)
4. 성능 (처리량, 응답 시간)
5. 운영 (모니터링, 디버깅)
6. 비용 (라이선스, 인프라)
```

### 기술 스택 템플릿

```yaml
프론트엔드:
  framework: Next.js | React | Vue
  styling: TailwindCSS | CSS Modules
  state: Zustand | Redux | Jotai
  testing: Vitest | Jest + RTL

백엔드:
  runtime: Node.js | Bun | Deno
  framework: Express | Fastify | Hono
  orm: Prisma | Drizzle | TypeORM
  testing: Vitest | Jest

데이터베이스:
  sql: PostgreSQL | MySQL | SQLite
  nosql: MongoDB | Redis | DynamoDB
  search: Elasticsearch | Meilisearch

인프라:
  hosting: Vercel | AWS | GCP
  container: Docker | Kubernetes
  ci/cd: GitHub Actions | GitLab CI
```

---

## 아키텍처 문서화

### ADR (Architecture Decision Record)

```markdown
# ADR-001: [결정 제목]

## 상태
[제안됨 | 승인됨 | 폐기됨 | 대체됨]

## 컨텍스트
[결정이 필요한 배경]

## 결정
[무엇을 결정했는가]

## 결과
[결정의 영향, 장단점]

## 대안
[고려했던 다른 옵션들]
```

### 다이어그램

```
필수 다이어그램:
1. 시스템 컨텍스트: 외부 시스템과의 관계
2. 컨테이너: 주요 구성 요소
3. 컴포넌트: 내부 모듈 구조
4. 데이터 흐름: 정보 이동 경로
5. 배포: 인프라 구성
```

---

## 사용 예시

### 예시 1: 아키텍처 리뷰
```
요청: "현재 프로젝트 아키텍처 분석해줘"

분석:
- 구조: src/features 기반 모듈화
- 의존성: 순환 없음, 단방향
- 레이어: 명확한 분리 (hooks, components, api)

평가:
- 결합도: 3/5 (일부 직접 의존)
- 응집도: 4/5 (기능별 그룹화)
- 확장성: 4/5 (feature 추가 용이)

개선 제안:
1. 공통 인터페이스 도입
2. 의존성 주입 패턴 적용
3. 이벤트 버스로 통신 표준화
```

### 예시 2: 설계 패턴 추천
```
요청: "플러그인 시스템 설계해줘"

분석:
- 요구: 동적 로딩, 독립적 개발
- 제약: TypeScript, 안정성 중요

추천 패턴:
1. Strategy: 플러그인 인터페이스 정의
2. Factory: 플러그인 생성 표준화
3. Observer: 이벤트 기반 통신

구현 가이드 제공...
```
