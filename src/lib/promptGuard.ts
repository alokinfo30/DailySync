import { PromptGuardResult } from '../types.js';

// Suspicious injection patterns
const INJECTION_PATTERNS: { regex: RegExp; threat: 'medium' | 'high' | 'critical'; name: string }[] = [
  {
    regex: /ignore\s+(all\s+)?(previous|prior|above)\s+(instructions|prompts|rules|commands)/i,
    threat: 'critical',
    name: 'Instruction Override Attempt',
  },
  {
    regex: /disregard\s+(all\s+)?(system|previous|existing)\s+(prompts|guidelines|restrictions)/i,
    threat: 'critical',
    name: 'Disregard Rules Exploit',
  },
  {
    regex: /\b(DAN\s+mode|jailbreak|unfiltered\s+mode|developer\s+mode\s+enabled|always\s+comply)\b/i,
    threat: 'critical',
    name: 'DAN / Jailbreak Persona Switch',
  },
  {
    regex: /you\s+are\s+now\s+(an\s+unrestricted|a\s+rogue|a\s+hacker|freed\s+from\s+rules)/i,
    threat: 'high',
    name: 'Persona Hijack / Role Reversal',
  },
  {
    regex: /(reveal|print|show|leak|output)\s+(your\s+)?(system\s+prompt|hidden\s+instructions|api\s*key|secret|env)/i,
    threat: 'critical',
    name: 'System Prompt / Secret Extraction',
  },
  {
    regex: /<script[\s\S]*?>[\s\S]*?<\/script>/i,
    threat: 'high',
    name: 'XSS Script Injection',
  },
  {
    regex: /(base64|rot13|hex)[\s:]+[a-zA-Z0-9+/=]{20,}/i,
    threat: 'medium',
    name: 'Encoded Payload Obfuscation',
  },
  {
    regex: /<!--[\s\S]*?-->|<\?[\s\S]*?\?>/i,
    threat: 'medium',
    name: 'XML/HTML Comment Exploit',
  },
  {
    regex: /bypass\s+(all\s+)?(guardrails|safety\s+filters|price\s+checks|validator)/i,
    threat: 'critical',
    name: 'Safety Bypass Probe',
  },
];

// Sensitive token & API key redaction patterns
const SENSITIVE_PATTERNS = [
  /AIza[0-9A-Za-z-_]{35}/g,
  /sk-[a-zA-Z0-9]{20,48}/g,
  /ghp_[a-zA-Z0-9]{36}/g,
  /Bearer\s+[a-zA-Z0-9_\-\.]{20,}/gi,
  /GEMINI_API_KEY\s*=\s*['"][^'"]+['"]/gi,
  /password\s*[:=]\s*['"][^'"]+['"]/gi,
];

export function scanPrompt(query: string): PromptGuardResult {
  if (!query || typeof query !== 'string') {
    return {
      isClean: true,
      threatLevel: 'none',
      triggers: [],
      sanitizedQuery: '',
      isolationApplied: false,
    };
  }

  const triggers: string[] = [];
  let maxThreat: 'none' | 'low' | 'medium' | 'high' | 'critical' = 'none';

  const severityOrder: Record<'none' | 'low' | 'medium' | 'high' | 'critical', number> = {
    none: 0,
    low: 1,
    medium: 2,
    high: 3,
    critical: 4,
  };

  for (const item of INJECTION_PATTERNS) {
    if (item.regex.test(query)) {
      triggers.push(item.name);
      if (severityOrder[item.threat] > severityOrder[maxThreat]) {
        maxThreat = item.threat;
      }
    }
  }

  // XML escaping for boundary isolation
  const sanitizedQuery = query
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

  const isClean = triggers.length === 0;

  return {
    isClean,
    threatLevel: isClean ? 'none' : maxThreat,
    triggers,
    sanitizedQuery,
    isolationApplied: true,
    details: isClean
      ? 'No adversarial patterns detected. Isolated in XML boundary.'
      : `PromptGuard detected ${triggers.length} security triggers: ${triggers.join(', ')}`,
  };
}

/**
 * Wraps user input in structured XML boundaries to prevent instruction hijacking
 */
export function isolateInXmlBoundary(sanitizedQuery: string): string {
  return `<user_query>\n${sanitizedQuery}\n</user_query>`;
}

/**
 * Scans outgoing model text and redacts any leaked API keys, tokens, or credentials
 */
export function redactOutputSecrets(text: string): { text: string; redactedCount: number } {
  if (!text || typeof text !== 'string') {
    return { text: '', redactedCount: 0 };
  }

  let redacted = text;
  let count = 0;

  for (const pattern of SENSITIVE_PATTERNS) {
    redacted = redacted.replace(pattern, (match) => {
      count++;
      return `[REDACTED_SECRET_${match.slice(0, 4)}...]`;
    });
  }

  return { text: redacted, redactedCount: count };
}
