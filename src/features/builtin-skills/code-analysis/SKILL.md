---
name: code-analysis
description: "코드 품질 분석, 리팩토링 전략, 기술 문서화 전문 스킬. MUST USE for code review, refactoring, documentation. 트리거: 'analyze', '분석', 'refactor', '리팩토링', 'document', '문서', 'review', '리뷰', 'quality', '품질'."
agent: athena
category: analysis
---

# 🔍 Code Analysis Skill (Athena)

코드 품질 분석, 리팩토링 전략, 기술 문서화를 위한 전문 스킬

---

## 핵심 역량

1. **코드 분석**: 구조, 품질, 복잡도 평가
2. **리팩토링**: 안전한 코드 개선 전략
3. **문서화**: 기술 문서 및 API 문서 작성
4. **의존성 감사**: 보안 취약점, 업데이트 필요성 확인
5. **코드 리뷰**: 품질 기준 기반 리뷰

---

## 트리거 키워드

| 카테고리 | 키워드 |
|----------|--------|
| 분석 | analyze, 분석, review, 리뷰, inspect |
| 리팩토링 | refactor, 리팩토링, improve, 개선, cleanup |
| 문서화 | document, 문서, docs, readme, jsdoc |
| 품질 | quality, 품질, metrics, 메트릭, lint |
| 의존성 | dependency, 의존성, audit, 감사, security |

---

## 코드 분석 프레임워크

### Phase 1: 정적 분석

```
분석 항목:
□ 복잡도 (Cyclomatic Complexity)
□ 코드 중복 (Code Duplication)
□ 함수/클래스 크기
□ 의존성 수준 (Coupling)
□ 네이밍 일관성
□ 타입 안전성
```

### Phase 2: 메트릭 수집

| 메트릭 | 좋음 | 주의 | 나쁨 |
|--------|------|------|------|
| 함수 길이 | ≤25줄 | 26-50줄 | >50줄 |
| 함수 파라미터 | ≤3개 | 4-5개 | >5개 |
| 순환 복잡도 | ≤10 | 11-20 | >20 |
| 들여쓰기 깊이 | ≤3 | 4-5 | >5 |
| 파일 크기 | ≤300줄 | 301-500줄 | >500줄 |
| 클래스 메서드 수 | ≤10 | 11-20 | >20 |

### Phase 3: 문제 분류

```
심각도 레벨:
🔴 Critical: 즉시 수정 필요 (보안, 버그)
🟠 Major: 조속히 수정 (성능, 유지보수)
🟡 Minor: 개선 권장 (가독성, 스타일)
⚪ Info: 참고 사항 (최적화 가능)
```

---

## 코드 스멜 카탈로그

### 기본 스멜

| 스멜 | 증상 | 해결책 |
|------|------|--------|
| Long Function | 50줄+ 함수 | Extract Method |
| Large Class | 500줄+ 클래스 | Extract Class |
| Long Parameter List | 5개+ 파라미터 | Introduce Parameter Object |
| Duplicated Code | 반복 코드 블록 | Extract Method/Class |
| Dead Code | 사용되지 않는 코드 | Remove Dead Code |

### 객체지향 스멜

| 스멜 | 증상 | 해결책 |
|------|------|--------|
| Feature Envy | 다른 클래스 데이터 과다 접근 | Move Method |
| Data Clumps | 함께 다니는 데이터 그룹 | Extract Class |
| Primitive Obsession | 기본 타입 과다 사용 | Replace Primitive with Object |
| Refused Bequest | 상속 후 사용 안 함 | Replace Inheritance with Delegation |
| God Object | 모든 것을 아는 클래스 | Split Class |

### 변경 관련 스멜

| 스멜 | 증상 | 해결책 |
|------|------|--------|
| Divergent Change | 한 클래스가 여러 이유로 변경 | Extract Class |
| Shotgun Surgery | 한 변경이 여러 클래스 수정 요구 | Move Method/Field |
| Parallel Inheritance | 상속 시 매번 쌍으로 클래스 추가 | Collapse Hierarchy |

---

## 리팩토링 카탈로그

### 안전한 리팩토링 워크플로우

```
1. 테스트 확인 (커버리지 충분한가?)
2. 작은 단계로 분해
3. 각 단계 후 테스트 실행
4. 커밋 (실패 시 롤백 가능)
5. 반복
```

### 필수 리팩토링

#### Extract Function

```typescript
// BEFORE
function processUser(user: User) {
  // 이메일 검증
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(user.email)) {
    throw new Error("Invalid email");
  }
  
  // 이름 정규화
  const normalizedName = user.name.trim().toLowerCase();
  
  // 저장
  database.save({ ...user, name: normalizedName });
}

// AFTER
function validateEmail(email: string): void {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error("Invalid email");
  }
}

function normalizeName(name: string): string {
  return name.trim().toLowerCase();
}

function processUser(user: User) {
  validateEmail(user.email);
  const normalizedName = normalizeName(user.name);
  database.save({ ...user, name: normalizedName });
}
```

#### Replace Conditional with Polymorphism

```typescript
// BEFORE
function getPrice(item: Item): number {
  switch (item.type) {
    case "book":
      return item.basePrice * 0.9;
    case "electronics":
      return item.basePrice * 1.1;
    case "food":
      return item.basePrice;
    default:
      throw new Error("Unknown type");
  }
}

// AFTER
interface PricingStrategy {
  calculate(basePrice: number): number;
}

const pricingStrategies: Record<string, PricingStrategy> = {
  book: { calculate: (price) => price * 0.9 },
  electronics: { calculate: (price) => price * 1.1 },
  food: { calculate: (price) => price },
};

function getPrice(item: Item): number {
  const strategy = pricingStrategies[item.type];
  if (!strategy) throw new Error("Unknown type");
  return strategy.calculate(item.basePrice);
}
```

#### Introduce Parameter Object

```typescript
// BEFORE
function createOrder(
  customerId: string,
  productId: string,
  quantity: number,
  shippingAddress: string,
  billingAddress: string,
  paymentMethod: string
) { ... }

// AFTER
interface OrderRequest {
  customerId: string;
  productId: string;
  quantity: number;
  shippingAddress: string;
  billingAddress: string;
  paymentMethod: string;
}

function createOrder(request: OrderRequest) { ... }
```

---

## 문서화 가이드

### README 템플릿

```markdown
# 프로젝트 이름

간단한 설명 (1-2 문장)

## 주요 기능

- 기능 1
- 기능 2

## 시작하기

### 필수 조건

- Node.js >= 18
- Bun >= 1.0

### 설치

\`\`\`bash
bun install
\`\`\`

### 실행

\`\`\`bash
bun run dev
\`\`\`

## 프로젝트 구조

\`\`\`
src/
├── components/     # UI 컴포넌트
├── features/       # 기능별 모듈
├── hooks/          # 커스텀 훅
├── lib/            # 유틸리티
└── types/          # 타입 정의
\`\`\`

## 기여 가이드

[CONTRIBUTING.md](./CONTRIBUTING.md) 참조

## 라이선스

MIT
```

### JSDoc 패턴

```typescript
/**
 * 사용자를 생성합니다.
 *
 * @param input - 사용자 생성에 필요한 데이터
 * @param input.name - 사용자 이름
 * @param input.email - 이메일 주소 (유효성 검증됨)
 * @returns 생성된 사용자 객체
 * @throws {ValidationError} 이메일 형식이 올바르지 않은 경우
 * @throws {DuplicateError} 이미 존재하는 이메일인 경우
 *
 * @example
 * ```typescript
 * const user = await createUser({
 *   name: "홍길동",
 *   email: "hong@example.com"
 * });
 * console.log(user.id); // "user_abc123"
 * ```
 */
export async function createUser(input: CreateUserInput): Promise<User> {
  // 구현
}
```

### 변경 로그

```markdown
# Changelog

## [1.2.0] - 2026-01-16

### Added
- 사용자 프로필 사진 업로드 기능

### Changed
- 로그인 성능 50% 개선

### Fixed
- 특정 조건에서 세션이 만료되는 버그 수정

### Deprecated
- `legacyLogin()` 함수 (2.0에서 제거 예정)
```

---

## 의존성 감사

### 보안 검사

```bash
# npm audit
npm audit

# Snyk 사용
npx snyk test

# GitHub Advisory Database 확인
gh api /advisories
```

### 업데이트 전략

```
업데이트 우선순위:
1. 🔴 보안 취약점 (즉시)
2. 🟠 주요 버전 업 (계획적)
3. 🟡 마이너 버전 업 (정기적)
4. ⚪ 패치 버전 업 (자동)
```

### 의존성 매트릭스

| 의존성 | 현재 | 최신 | 위험도 | 액션 |
|--------|------|------|--------|------|
| react | 18.2 | 19.0 | 🟠 | 테스트 후 업그레이드 |
| lodash | 4.17.21 | 4.17.21 | ✅ | 유지 |
| axios | 0.27 | 1.6 | 🔴 | 즉시 업그레이드 |

---

## 코드 리뷰 체크리스트

### 기능

- [ ] 요구사항 충족
- [ ] 엣지 케이스 처리
- [ ] 에러 핸들링 적절

### 코드 품질

- [ ] 가독성 (명확한 네이밍, 적절한 주석)
- [ ] 순환 복잡도 적정
- [ ] 중복 코드 없음
- [ ] SOLID 원칙 준수

### 성능

- [ ] 불필요한 연산 없음
- [ ] 적절한 데이터 구조
- [ ] 메모리 누수 없음

### 보안

- [ ] 입력 검증
- [ ] SQL 인젝션 방지
- [ ] XSS 방지
- [ ] 민감 정보 노출 없음

### 테스트

- [ ] 단위 테스트 포함
- [ ] 엣지 케이스 테스트
- [ ] 커버리지 기준 충족

---

## 사용 예시

### 예시 1: 코드 분석
```
요청: "이 파일 분석해줘"

분석 결과:
파일: src/services/user-service.ts
크기: 450줄 🟡

문제점:
1. 🟠 함수 processUserData (85줄) - Extract Method 권장
2. 🟡 중복 코드 (라인 120-135 = 200-215)
3. 🟡 순환 복잡도 15 (함수 validateInput)

권장 조치:
1. processUserData를 3개 함수로 분할
2. 중복 코드 extractEmail() 함수로 추출
3. validateInput 조건문 단순화
```

### 예시 2: 리팩토링 수행
```
요청: "이 함수 리팩토링해줘"

계획:
1. 현재 테스트 커버리지 확인 (78%)
2. Extract Method 3회 적용
3. 각 단계 후 테스트 실행
4. 개별 커밋

결과:
- 원본: 1개 함수 85줄
- 결과: 4개 함수 (20줄, 25줄, 15줄, 10줄)
- 테스트: 모두 통과
- 가독성: 크게 개선
```
