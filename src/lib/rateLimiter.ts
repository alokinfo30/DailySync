export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

export interface ClientRateLimitState {
  timestamps: number[];
}

export class SlidingWindowRateLimiter {
  private standardLimit: RateLimitConfig;
  private aiEndpointLimit: RateLimitConfig;
  private clients: Map<string, { standard: number[]; ai: number[] }> = new Map();

  constructor(
    standardLimit: RateLimitConfig = { windowMs: 15 * 60 * 1000, maxRequests: 100 }, // 100 req / 15 min
    aiEndpointLimit: RateLimitConfig = { windowMs: 60 * 1000, maxRequests: 30 } // 30 req / min
  ) {
    this.standardLimit = standardLimit;
    this.aiEndpointLimit = aiEndpointLimit;

    // Periodic cleanup of stale entries every 5 minutes
    if (typeof setInterval !== 'undefined') {
      setInterval(() => this.cleanup(), 5 * 60 * 1000);
    }
  }

  public checkLimit(
    clientId: string,
    isAiEndpoint: boolean = false,
    customNow?: number
  ): {
    allowed: boolean;
    currentCount: number;
    maxRequests: number;
    remaining: number;
    resetInSeconds: number;
  } {
    const now = customNow || Date.now();
    const config = isAiEndpoint ? this.aiEndpointLimit : this.standardLimit;

    let clientRecord = this.clients.get(clientId);
    if (!clientRecord) {
      clientRecord = { standard: [], ai: [] };
      this.clients.set(clientId, clientRecord);
    }

    const windowStart = now - config.windowMs;
    const timestamps = isAiEndpoint ? clientRecord.ai : clientRecord.standard;

    // Filter out timestamps outside current sliding window
    const activeTimestamps = timestamps.filter((t) => t > windowStart);

    if (isAiEndpoint) {
      clientRecord.ai = activeTimestamps;
    } else {
      clientRecord.standard = activeTimestamps;
    }

    if (activeTimestamps.length >= config.maxRequests) {
      const oldestActive = activeTimestamps[0];
      const resetInSeconds = Math.max(1, Math.ceil((oldestActive + config.windowMs - now) / 1000));
      return {
        allowed: false,
        currentCount: activeTimestamps.length,
        maxRequests: config.maxRequests,
        remaining: 0,
        resetInSeconds,
      };
    }

    // Record request
    activeTimestamps.push(now);
    const oldest = activeTimestamps[0] || now;
    const resetInSeconds = Math.max(1, Math.ceil((oldest + config.windowMs - now) / 1000));

    return {
      allowed: true,
      currentCount: activeTimestamps.length,
      maxRequests: config.maxRequests,
      remaining: Math.max(0, config.maxRequests - activeTimestamps.length),
      resetInSeconds,
    };
  }

  public getStats(clientId: string) {
    const now = Date.now();
    const clientRecord = this.clients.get(clientId) || { standard: [], ai: [] };

    const standardActive = clientRecord.standard.filter((t) => t > now - this.standardLimit.windowMs);
    const aiActive = clientRecord.ai.filter((t) => t > now - this.aiEndpointLimit.windowMs);

    return {
      standard: {
        current: standardActive.length,
        limit: this.standardLimit.maxRequests,
        remaining: Math.max(0, this.standardLimit.maxRequests - standardActive.length),
      },
      ai: {
        current: aiActive.length,
        limit: this.aiEndpointLimit.maxRequests,
        remaining: Math.max(0, this.aiEndpointLimit.maxRequests - aiActive.length),
      },
    };
  }

  public reset(clientId?: string) {
    if (clientId) {
      this.clients.delete(clientId);
    } else {
      this.clients.clear();
    }
  }

  private cleanup() {
    const now = Date.now();
    for (const [clientId, record] of this.clients.entries()) {
      record.standard = record.standard.filter((t) => t > now - this.standardLimit.windowMs);
      record.ai = record.ai.filter((t) => t > now - this.aiEndpointLimit.windowMs);
      if (record.standard.length === 0 && record.ai.length === 0) {
        this.clients.delete(clientId);
      }
    }
  }
}

export const globalRateLimiter = new SlidingWindowRateLimiter();
