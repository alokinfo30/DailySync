export interface MenuItem {
  id: string;
  name: string;
  category: 'espresso' | 'brewed' | 'tea' | 'cold' | 'pastry' | 'seasonal';
  price: number;
  description: string;
  caffeineMg: number;
  isDecaf: boolean;
  allergens: ('dairy' | 'nuts' | 'gluten' | 'soy' | 'egg')[];
  inStock: boolean;
  calories: number;
  temperature: 'hot' | 'iced' | 'both';
  badge?: string;
  image?: string;
}

export interface CartItem {
  itemId: string;
  quantity: number;
  customPrice?: number; // Might be tampered by client to test validator
  temperature?: 'hot' | 'iced';
  milkChoice?: 'whole' | 'oat' | 'almond' | 'skim';
  extraShots?: number;
  syrupPumps?: number;
}

export interface CartValidationResult {
  valid: boolean;
  tamperDetected: boolean;
  tamperDetails?: string[];
  calculatedSubtotal: number;
  tax: number;
  discount: number;
  total: number;
  verifiedItems: {
    id: string;
    name: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
  }[];
  timestamp: string;
}

export interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  category: 'coffee_beans' | 'dairy_alt' | 'syrups' | 'packaging' | 'tea_leaves';
  currentStock: number;
  unit: string;
  minThreshold: number;
  maxCapacity: number;
  unitCost: number;
  supplier: string;
  leadTimeDays: number;
  lastRestocked: string;
  status: 'healthy' | 'low' | 'critical';
}

export interface SalesMetrics {
  totalRevenue: number;
  orderCount: number;
  averageOrderValue: number;
  targetDailyRevenue: number;
  peakHour: string;
  hourlySales: { hour: string; revenue: number; orders: number }[];
  categoryBreakdown: { category: string; revenue: number; percentage: number }[];
  topSellingItems: { name: string; quantitySold: number; revenue: number }[];
}

export interface UpcomingFeature {
  id: string;
  title: string;
  category: 'automation' | 'customer_experience' | 'inventory_ai' | 'loyalty';
  status: 'in_design' | 'in_progress' | 'beta_ready' | 'launched';
  description: string;
  priority: 'high' | 'medium' | 'low';
  targetRelease: string;
  votes: number;
  tags: string[];
}

export interface OperationalTask {
  id: string;
  title: string;
  shift: 'opening' | 'midday' | 'closing';
  assignedRole: 'barista' | 'shift_lead' | 'manager';
  completed: boolean;
  automatedByAgent: boolean;
  category: 'safety' | 'inventory' | 'equipment' | 'compliance';
  notes?: string;
}

export interface RagKnowledgeChunk {
  id: string;
  title: string;
  category: 'allergens' | 'recipes' | 'equipment' | 'policies' | 'decaf_thresholds' | 'supplier_specs';
  content: string;
  tags: string[];
  vector?: number[];
}

export interface RagSearchResult {
  chunk: RagKnowledgeChunk;
  similarityScore: number;
  matchedTerms: string[];
}

export interface PromptGuardResult {
  isClean: boolean;
  threatLevel: 'none' | 'low' | 'medium' | 'high' | 'critical';
  triggers: string[];
  sanitizedQuery: string;
  redactedOutput?: string;
  isolationApplied: boolean;
  details?: string;
}

export interface AgentTelemetryTrace {
  traceId: string;
  timestamp: string;
  promptGuard: PromptGuardResult;
  ragContextChunks: { id: string; title: string; score: number }[];
  toolsExecuted: {
    name: string;
    args: Record<string, unknown>;
    result: Record<string, unknown>;
    durationMs: number;
  }[];
  latencyMs: number;
  tokenCount: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  authoritativePriceVerified: boolean;
  status: 'success' | 'blocked' | 'error';
  agentPersona: 'Sage' | 'Auditor' | 'InventoryBot';
}

export interface TestResultItem {
  id: number;
  name: string;
  category: 'unit' | 'security' | 'e2e';
  passed: boolean;
  durationMs: number;
  details: string;
  error?: string;
}

export interface FullTestSuiteSummary {
  totalTests: number;
  passedCount: number;
  failedCount: number;
  allPassed: boolean;
  executionTimestamp: string;
  results: TestResultItem[];
}
