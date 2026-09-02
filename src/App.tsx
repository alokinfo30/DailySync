import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Package,
  ShoppingBag,
  Rocket,
  ClipboardCheck,
  BookOpen,
  ShieldAlert,
  Activity,
} from 'lucide-react';
import {
  MenuItem,
  InventoryItem,
  SalesMetrics,
  UpcomingFeature,
  OperationalTask,
  CartItem,
  AgentTelemetryTrace,
} from './types.js';
import {
  AUTHORITATIVE_MENU_CATALOG,
  INITIAL_INVENTORY,
  INITIAL_SALES_METRICS,
  INITIAL_UPCOMING_FEATURES,
  INITIAL_OPERATIONAL_TASKS,
} from './lib/mockData.js';
import { Navbar } from './components/Navbar.js';
import { ChatAssistant } from './components/ChatAssistant.js';
import { SalesAnalyticsView } from './components/SalesAnalyticsView.js';
import { InventoryView } from './components/InventoryView.js';
import { CatalogAndCartView } from './components/CatalogAndCartView.js';
import { UpcomingFeaturesView } from './components/UpcomingFeaturesView.js';
import { OperationalTasksView } from './components/OperationalTasksView.js';
import { RagBrowserView } from './components/RagBrowserView.js';
import { PromptGuardCenter } from './components/PromptGuardCenter.js';
import { TelemetryInspector } from './components/TelemetryInspector.js';
import { TestSuiteModal } from './components/TestSuiteModal.js';

export default function App() {
  // Navigation state
  const [activeTab, setActiveTab] = useState<string>('sales');
  const [mobileView, setMobileView] = useState<'chat' | 'ops'>('chat');
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);

  // Business state
  const [catalog, setCatalog] = useState<MenuItem[]>(AUTHORITATIVE_MENU_CATALOG);
  const [inventory, setInventory] = useState<InventoryItem[]>(INITIAL_INVENTORY);
  const [sales, setSales] = useState<SalesMetrics>(INITIAL_SALES_METRICS);
  const [features, setFeatures] = useState<UpcomingFeature[]>(INITIAL_UPCOMING_FEATURES);
  const [tasks, setTasks] = useState<OperationalTask[]>(INITIAL_OPERATIONAL_TASKS);
  const [cart, setCart] = useState<CartItem[]>([
    { itemId: 'bev-004', quantity: 2 }, // Kyoto Cold Drip
    { itemId: 'bev-002', quantity: 1, extraShots: 1 }, // Velvet Oat Flat White
  ]);
  const [latestTrace, setLatestTrace] = useState<AgentTelemetryTrace | undefined>();

  // Fetch initial data from Express API
  const refreshAllData = async () => {
    try {
      const [catRes, invRes, salesRes, featRes, tasksRes] = await Promise.all([
        fetch('/api/catalog').catch(() => null),
        fetch('/api/inventory').catch(() => null),
        fetch('/api/sales').catch(() => null),
        fetch('/api/features').catch(() => null),
        fetch('/api/tasks').catch(() => null),
      ]);

      if (catRes && catRes.ok) {
        const d = await catRes.json();
        setCatalog(d.catalog || AUTHORITATIVE_MENU_CATALOG);
      }
      if (invRes && invRes.ok) {
        const d = await invRes.json();
        setInventory(d.inventory || INITIAL_INVENTORY);
      }
      if (salesRes && salesRes.ok) {
        const d = await salesRes.json();
        setSales(d.sales || INITIAL_SALES_METRICS);
      }
      if (featRes && featRes.ok) {
        const d = await featRes.json();
        setFeatures(d.features || INITIAL_UPCOMING_FEATURES);
      }
      if (tasksRes && tasksRes.ok) {
        const d = await tasksRes.json();
        setTasks(d.tasks || INITIAL_OPERATIONAL_TASKS);
      }
    } catch {
      // quiet fallback to initialized mock state
    }
  };

  useEffect(() => {
    refreshAllData();
  }, []);

  // Restock action handler
  const handleRestock = async (itemId: string, qty?: number) => {
    try {
      const res = await fetch('/api/inventory/restock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId, quantity: qty }),
      });
      if (res.ok) {
        const data = await res.json();
        setInventory(data.inventory);
      } else {
        setInventory((prev) =>
          prev.map((item) =>
            item.id === itemId
              ? {
                  ...item,
                  currentStock: item.maxCapacity,
                  status: 'healthy',
                }
              : item
          )
        );
      }
    } catch {
      setInventory((prev) =>
        prev.map((item) =>
          item.id === itemId
            ? {
                ...item,
                currentStock: item.maxCapacity,
                status: 'healthy',
              }
            : item
        )
      );
    }
  };

  // Feature vote handler
  const handleVoteFeature = async (featureId: string) => {
    try {
      const res = await fetch('/api/features/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ featureId }),
      });
      if (res.ok) {
        const data = await res.json();
        setFeatures(data.features);
      } else {
        setFeatures((prev) =>
          prev.map((f) => (f.id === featureId ? { ...f, votes: f.votes + 1 } : f))
        );
      }
    } catch {
      setFeatures((prev) =>
        prev.map((f) => (f.id === featureId ? { ...f, votes: f.votes + 1 } : f))
      );
    }
  };

  // Task toggle handler
  const handleToggleTask = async (taskId: string) => {
    try {
      const res = await fetch('/api/tasks/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId }),
      });
      if (res.ok) {
        const data = await res.json();
        setTasks(data.tasks);
      } else {
        setTasks((prev) =>
          prev.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t))
        );
      }
    } catch {
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t))
      );
    }
  };

  // Cart operations
  const handleAddToCart = (item: MenuItem, addons?: { extraShots?: number; syrupPumps?: number }) => {
    setCart((prev) => {
      const existingIdx = prev.findIndex((c) => c.itemId === item.id);
      if (existingIdx >= 0) {
        const updated = [...prev];
        updated[existingIdx] = {
          ...updated[existingIdx],
          quantity: updated[existingIdx].quantity + 1,
        };
        return updated;
      }
      return [
        ...prev,
        {
          itemId: item.id,
          quantity: 1,
          extraShots: addons?.extraShots,
          syrupPumps: addons?.syrupPumps,
        },
      ];
    });
    setIsCartDrawerOpen(true);
  };

  const handleUpdateCartQty = (index: number, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveCartItem(index);
      return;
    }
    setCart((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], quantity: newQty };
      return updated;
    });
  };

  const handleRemoveCartItem = (index: number) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const tabs = [
    { id: 'sales', label: 'Sales & Velocity', icon: TrendingUp },
    { id: 'inventory', label: 'Inventory & Reorder', icon: Package },
    { id: 'catalog', label: 'Menu & Cart', icon: ShoppingBag },
    { id: 'features', label: 'Product Roadmap', icon: Rocket },
    { id: 'tasks', label: 'Shift Checklists', icon: ClipboardCheck },
    { id: 'rag', label: 'RAG Knowledge', icon: BookOpen },
    { id: 'security', label: 'PromptGuard Center', icon: ShieldAlert },
    { id: 'telemetry', label: 'ADK Telemetry', icon: Activity },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col font-sans selection:bg-blue-500/30 selection:text-blue-200">
      {/* Top Application Navbar */}
      <Navbar
        onOpenTests={() => setIsTestModalOpen(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        mobileView={mobileView}
        setMobileView={setMobileView}
        cartCount={totalCartCount}
        onOpenCart={() => setIsCartDrawerOpen(true)}
      />

      {/* Main Workspace Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-5 flex flex-col lg:flex-row gap-5">
        {/* Left Column: AI Barista Sage Assistant (Always visible on desktop; toggle on mobile) */}
        <div
          className={`w-full lg:w-[430px] lg:flex-shrink-0 h-[680px] lg:h-[calc(100vh-130px)] lg:sticky lg:top-20 ${
            mobileView === 'chat' ? 'block' : 'hidden lg:block'
          }`}
        >
          <ChatAssistant
            onTelemetryUpdate={(trace) => setLatestTrace(trace)}
            onRefreshData={refreshAllData}
          />
        </div>

        {/* Right Column: Operations Workspace & Tabbed Views */}
        <div
          className={`flex-1 flex flex-col min-w-0 ${
            mobileView === 'ops' ? 'block' : 'hidden lg:flex'
          }`}
        >
          {/* Operations Navigation Tabs */}
          <div className="bg-slate-900/80 p-1.5 rounded-xl border border-slate-800 mb-4 overflow-x-auto scrollbar-none flex gap-1 shadow-sm backdrop-blur-sm">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/30 font-bold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/70'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Active Tab Content Rendered */}
          <div className="flex-1">
            {activeTab === 'sales' && <SalesAnalyticsView sales={sales} />}
            {activeTab === 'inventory' && (
              <InventoryView inventory={inventory} onRestock={handleRestock} />
            )}
            {activeTab === 'catalog' && (
              <CatalogAndCartView
                catalog={catalog}
                cart={cart}
                onAddToCart={handleAddToCart}
                onUpdateCartQty={handleUpdateCartQty}
                onRemoveCartItem={handleRemoveCartItem}
                onClearCart={handleClearCart}
                isCartDrawerOpen={isCartDrawerOpen}
                setIsCartDrawerOpen={setIsCartDrawerOpen}
              />
            )}
            {activeTab === 'features' && (
              <UpcomingFeaturesView features={features} onVote={handleVoteFeature} />
            )}
            {activeTab === 'tasks' && (
              <OperationalTasksView tasks={tasks} onToggleTask={handleToggleTask} />
            )}
            {activeTab === 'rag' && <RagBrowserView />}
            {activeTab === 'security' && <PromptGuardCenter />}
            {activeTab === 'telemetry' && <TelemetryInspector latestTrace={latestTrace} />}
          </div>
        </div>
      </main>

      {/* Sleek Interface Operational Status Footer */}
      <footer className="h-9 bg-slate-900/90 backdrop-blur-md border-t border-slate-800 flex items-center justify-between px-4 sm:px-6 text-[10px] uppercase tracking-wider text-slate-400 mt-6">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
            Cloud Run Host: Port 3000
          </span>
          <span className="hidden sm:inline text-slate-700">•</span>
          <span className="hidden sm:inline">ADK Telemetry Stream</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-emerald-400">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></span>
            Prototype Defense
          </span>
          <span className="hidden sm:flex items-center gap-1.5 text-emerald-400">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></span>
            PromptGuard Active
          </span>
        </div>
      </footer>

      {/* 14/14 Automated Test Suite Modal */}
      <TestSuiteModal
        isOpen={isTestModalOpen}
        onClose={() => setIsTestModalOpen(false)}
      />
    </div>
  );
}
