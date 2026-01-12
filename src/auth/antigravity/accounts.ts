import { saveAccounts } from "./storage"
import { parseStoredToken, formatTokenForStorage } from "./token"
import {
  MODEL_FAMILIES,
  type AccountStorage,
  type AccountMetadata,
  type AccountTier,
  type AntigravityRefreshParts,
  type ModelFamily,
  type RateLimitState,
} from "./types"

export interface ManagedAccount {
  index: number
  parts: AntigravityRefreshParts
  access?: string
  expires?: number
  rateLimits: RateLimitState
  lastUsed: number
  email?: string
  tier?: AccountTier
}

interface AuthDetails {
  refresh: string
  access: string
  expires: number
}

interface OAuthAuthDetails {
  type: "oauth"
  refresh: string
  access: string
  expires: number
}

function isRateLimitedForFamily(account: ManagedAccount, family: ModelFamily): boolean {
  const resetTime = account.rateLimits[family]
  return resetTime !== undefined && Date.now() < resetTime
}

/**
 * 계정 관리자 설정
 */
export interface AccountManagerConfig {
  /** 무료 계정 우선 사용 (기본: true) */
  preferFreeAccounts: boolean
  /** 유료 계정 폴백 허용 (기본: true) */
  allowPaidFallback: boolean
}

const DEFAULT_CONFIG: AccountManagerConfig = {
  preferFreeAccounts: true,
  allowPaidFallback: true,
}

export class AccountManager {
  private accounts: ManagedAccount[] = []
  private currentIndex = 0
  private activeIndex = 0
  private config: AccountManagerConfig = DEFAULT_CONFIG

  constructor(auth: AuthDetails, storedAccounts?: AccountStorage | null) {
    if (storedAccounts && storedAccounts.accounts.length > 0) {
      const validActiveIndex =
        typeof storedAccounts.activeIndex === "number" &&
          storedAccounts.activeIndex >= 0 &&
          storedAccounts.activeIndex < storedAccounts.accounts.length
          ? storedAccounts.activeIndex
          : 0

      this.activeIndex = validActiveIndex
      this.currentIndex = validActiveIndex

      this.accounts = storedAccounts.accounts.map((acc, index) => ({
        index,
        parts: {
          refreshToken: acc.refreshToken,
          projectId: acc.projectId,
          managedProjectId: acc.managedProjectId,
        },
        access: index === validActiveIndex ? auth.access : acc.accessToken,
        expires: index === validActiveIndex ? auth.expires : acc.expiresAt,
        rateLimits: acc.rateLimits ?? {},
        lastUsed: 0,
        email: acc.email,
        tier: acc.tier,
      }))
    } else {
      this.activeIndex = 0
      this.currentIndex = 0

      const parts = parseStoredToken(auth.refresh)
      this.accounts.push({
        index: 0,
        parts,
        access: auth.access,
        expires: auth.expires,
        rateLimits: {},
        lastUsed: 0,
      })
    }
  }

  getAccountCount(): number {
    return this.accounts.length
  }

  getCurrentAccount(): ManagedAccount | null {
    if (this.activeIndex >= 0 && this.activeIndex < this.accounts.length) {
      return this.accounts[this.activeIndex] ?? null
    }
    return null
  }

  getAccounts(): ManagedAccount[] {
    return [...this.accounts]
  }

  /**
   * 오케스트라 설정 적용
   */
  setConfig(config: Partial<AccountManagerConfig>): void {
    this.config = { ...this.config, ...config }
  }

  /**
   * 현재 설정 조회
   */
  getConfig(): AccountManagerConfig {
    return { ...this.config }
  }

  /**
   * 모델 패밀리에 맞는 계정 선택
   * 무료 계정 우선 정책 적용
   */
  getCurrentOrNextForFamily(family: ModelFamily): ManagedAccount | null {
    for (const account of this.accounts) {
      this.clearExpiredRateLimits(account)
    }

    const current = this.getCurrentAccount()
    if (current && !isRateLimitedForFamily(current, family)) {
      // 무료 계정 우선 정책: 현재 계정이 유료인데 무료 계정이 사용 가능하면 전환
      if (this.config.preferFreeAccounts && current.tier === "paid") {
        const freeAvailable = this.accounts.find(
          (a) => a.tier === "free" && !isRateLimitedForFamily(a, family)
        )
        if (freeAvailable) {
          freeAvailable.lastUsed = Date.now()
          this.activeIndex = freeAvailable.index
          return freeAvailable
        }
      }
      current.lastUsed = Date.now()
      return current
    }

    const next = this.getNextForFamily(family)
    if (next) {
      this.activeIndex = next.index
    }
    return next
  }

  /**
   * 다음 사용 가능한 계정 선택 (무료 계정 우선)
   */
  getNextForFamily(family: ModelFamily): ManagedAccount | null {
    const available = this.accounts.filter((a) => !isRateLimitedForFamily(a, family))

    if (available.length === 0) {
      return null
    }

    // 무료 계정 우선 정책
    if (this.config.preferFreeAccounts) {
      const freeAvailable = available.filter((a) => a.tier === "free")

      if (freeAvailable.length > 0) {
        const account = freeAvailable[this.currentIndex % freeAvailable.length]
        if (account) {
          this.currentIndex++
          account.lastUsed = Date.now()
          return account
        }
      }

      // 무료 계정 없으면 유료 계정 폴백 (옵션)
      if (!this.config.allowPaidFallback) {
        return null
      }
    }

    // 기본 로직: 모든 사용 가능한 계정 중 선택
    const account = available[this.currentIndex % available.length]
    if (!account) {
      return null
    }

    this.currentIndex++
    account.lastUsed = Date.now()
    return account
  }

  /**
   * 계정 사용 통계 조회
   */
  getUsageStats(): { total: number; free: number; paid: number; rateLimited: number } {
    let free = 0
    let paid = 0
    let rateLimited = 0

    for (const account of this.accounts) {
      if (account.tier === "paid") {
        paid++
      } else {
        free++
      }

      // Rate limited 여부 체크 (모든 패밀리)
      const isLimited = MODEL_FAMILIES.some(family => isRateLimitedForFamily(account, family))
      if (isLimited) {
        rateLimited++
      }
    }

    return { total: this.accounts.length, free, paid, rateLimited }
  }

  /**
   * 계정 요약 정보
   */
  getSummary(): string {
    const stats = this.getUsageStats()
    return `계정: ${stats.total}개 (무료: ${stats.free}, 유료: ${stats.paid}, Rate Limited: ${stats.rateLimited})`
  }

  markRateLimited(account: ManagedAccount, retryAfterMs: number, family: ModelFamily): void {
    account.rateLimits[family] = Date.now() + retryAfterMs
  }

  clearExpiredRateLimits(account: ManagedAccount): void {
    const now = Date.now()
    for (const family of MODEL_FAMILIES) {
      if (account.rateLimits[family] !== undefined && now >= account.rateLimits[family]!) {
        delete account.rateLimits[family]
      }
    }
  }

  addAccount(
    parts: AntigravityRefreshParts,
    access?: string,
    expires?: number,
    email?: string,
    tier?: AccountTier
  ): void {
    this.accounts.push({
      index: this.accounts.length,
      parts,
      access,
      expires,
      rateLimits: {},
      lastUsed: 0,
      email,
      tier,
    })
  }

  removeAccount(index: number): boolean {
    if (index < 0 || index >= this.accounts.length) {
      return false
    }

    this.accounts.splice(index, 1)

    if (index < this.activeIndex) {
      this.activeIndex--
    } else if (index === this.activeIndex) {
      this.activeIndex = Math.min(this.activeIndex, Math.max(0, this.accounts.length - 1))
    }

    if (index < this.currentIndex) {
      this.currentIndex--
    } else if (index === this.currentIndex) {
      this.currentIndex = Math.min(this.currentIndex, Math.max(0, this.accounts.length - 1))
    }

    for (let i = 0; i < this.accounts.length; i++) {
      this.accounts[i]!.index = i
    }

    return true
  }

  async save(path?: string): Promise<void> {
    const storage: AccountStorage = {
      version: 1,
      accounts: this.accounts.map((acc) => ({
        email: acc.email ?? "",
        tier: acc.tier ?? "free",
        refreshToken: acc.parts.refreshToken,
        projectId: acc.parts.projectId ?? "",
        managedProjectId: acc.parts.managedProjectId,
        accessToken: acc.access ?? "",
        expiresAt: acc.expires ?? 0,
        rateLimits: acc.rateLimits,
      })),
      activeIndex: Math.max(0, this.activeIndex),
    }

    await saveAccounts(storage, path)
  }

  toAuthDetails(): OAuthAuthDetails {
    const current = this.getCurrentAccount() ?? this.accounts[0]
    if (!current) {
      throw new Error("No accounts available")
    }

    const allRefreshTokens = this.accounts
      .map((acc) => formatTokenForStorage(acc.parts.refreshToken, acc.parts.projectId ?? "", acc.parts.managedProjectId))
      .join("|||")

    return {
      type: "oauth",
      refresh: allRefreshTokens,
      access: current.access ?? "",
      expires: current.expires ?? 0,
    }
  }
}
