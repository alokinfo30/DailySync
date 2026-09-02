import React, { useState } from 'react';
import {
  Coffee,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Plus,
  Minus,
  Trash2,
  Lock,
  Sparkles,
  Flame,
  CheckCircle2,
  X,
  RefreshCw,
} from 'lucide-react';
import { MenuItem, CartItem, CartValidationResult } from '../types.js';
import { soundSynth } from '../lib/audioSynthesizer.js';

interface CatalogAndCartViewProps {
  catalog: MenuItem[];
  cart: CartItem[];
  onAddToCart: (item: MenuItem, addons?: { extraShots?: number; syrupPumps?: number }) => void;
  onUpdateCartQty: (index: number, newQty: number) => void;
  onRemoveCartItem: (index: number) => void;
  onClearCart: () => void;
  isCartDrawerOpen: boolean;
  setIsCartDrawerOpen: (open: boolean) => void;
}

export const CatalogAndCartView: React.FC<CatalogAndCartViewProps> = ({
  catalog,
  cart,
  onAddToCart,
  onUpdateCartQty,
  onRemoveCartItem,
  onClearCart,
  isCartDrawerOpen,
  setIsCartDrawerOpen,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [filterDairyFree, setFilterDairyFree] = useState(false);
  const [filterDecafOnly, setFilterDecafOnly] = useState(false);

  // Security test states
  const [tamperTestPrice, setTamperTestPrice] = useState<string>('0.05');
  const [tamperTestApplied, setTamperTestApplied] = useState(false);
  const [validationResult, setValidationResult] = useState<CartValidationResult | null>(null);
  const [validating, setValidating] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<string | null>(null);

  // Filtering
  const filteredCatalog = catalog.filter((item) => {
    if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
    if (filterDairyFree && item.allergens.includes('dairy')) return false;
    if (filterDecafOnly && !item.isDecaf && item.caffeineMg > 5) return false;
    return true;
  });

  // Authoritative Validation Call
  const handleValidateAndCheckout = async (forceTamper: boolean = false) => {
    if (cart.length === 0) return;
    setValidating(true);
    setOrderSuccess(null);

    const payloadItems = cart.map((cItem) => ({
      itemId: cItem.itemId,
      quantity: cItem.quantity,
      customPrice: forceTamper ? parseFloat(tamperTestPrice) || 0.05 : undefined,
      extraShots: cItem.extraShots,
      syrupPumps: cItem.syrupPumps,
    }));

    try {
      const res = await fetch('/api/cart/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: payloadItems }),
      });

      const data: CartValidationResult = await res.json();
      setValidationResult(data);

      if (data.tamperDetected) {
        soundSynth.playChime('threat_block');
      } else if (data.valid) {
        soundSynth.playChime('success');
        setOrderSuccess(`Order Authoritatively Verified & Authorized! Subtotal: $${data.calculatedSubtotal.toFixed(2)}, Total: $${data.total.toFixed(2)}`);
      }
    } catch {
      soundSynth.playChime('alert');
    } finally {
      setValidating(false);
    }
  };

  const categories = [
    { id: 'all', label: 'All Drinks & Bakery' },
    { id: 'espresso', label: 'Espresso' },
    { id: 'cold', label: 'Cold & Nitro' },
    { id: 'tea', label: 'Specialty Tea' },
    { id: 'pastry', label: 'Fresh Bakery' },
    { id: 'seasonal', label: 'Seasonal Wellness' },
  ];

  return (
    <div className="space-y-6">
      {/* Category Pills & Dietary Safety Toggles */}
      <div className="space-y-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30'
                  : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Dietary Filters */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-400 text-[11px] font-mono">Dietary Filters:</span>
          <button
            onClick={() => setFilterDairyFree(!filterDairyFree)}
            className={`px-2.5 py-1 rounded-md border text-[11px] font-medium transition-all ${
              filterDairyFree
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            🌱 100% Dairy-Free
          </button>
          <button
            onClick={() => setFilterDecafOnly(!filterDecafOnly)}
            className={`px-2.5 py-1 rounded-md border text-[11px] font-medium transition-all ${
              filterDecafOnly
                ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            🌙 Decaf Certified (&le;5mg)
          </button>
        </div>
      </div>

      {/* Product Catalog Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCatalog.map((item) => {
          return (
            <div
              key={item.id}
              className="p-5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between shadow-sm group"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {item.badge && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                        {item.badge}
                      </span>
                    )}
                    {item.isDecaf && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        Decaf (&le;{item.caffeineMg}mg)
                      </span>
                    )}
                  </div>
                  <span className="text-base font-bold font-mono text-blue-400">
                    ${item.price.toFixed(2)}
                  </span>
                </div>

                <h4 className="text-sm font-semibold text-slate-100 group-hover:text-blue-400 transition-colors">
                  {item.name}
                </h4>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  {item.description}
                </p>

                {/* Allergen and Nutritional Badges */}
                <div className="flex items-center gap-1.5 flex-wrap mt-3 text-[10px]">
                  <span className="text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                    {item.calories} kcal
                  </span>
                  <span className="text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                    ⚡ {item.caffeineMg}mg caffeine
                  </span>
                  {item.allergens.map((allergen) => (
                    <span
                      key={allergen}
                      className="text-rose-400 bg-rose-950/40 px-1.5 py-0.5 rounded border border-rose-500/20 font-mono"
                    >
                      Contains {allergen}
                    </span>
                  ))}
                </div>
              </div>

              {/* Add to Cart Button */}
              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">Authoritative item</span>
                <button
                  onClick={() => {
                    onAddToCart(item);
                    soundSynth.playChime('action');
                  }}
                  className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-all flex items-center gap-1 shadow-md shadow-blue-900/30"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add to Cart
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Cart Drawer Modal / Slide-Over */}
      {isCartDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-slate-900 h-full border-l border-slate-800 flex flex-col justify-between shadow-2xl overflow-hidden animate-slideLeft">
            {/* Drawer Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold">
                  🛒
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-100">Authoritative Cart</h3>
                  <p className="text-[10px] text-slate-400 font-mono">
                    Protected by CartSecurityValidator
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCartDrawerOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {cart.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs">
                  Your cart is empty. Add drinks or fresh bakery from the catalog!
                </div>
              ) : (
                cart.map((cItem, idx) => {
                  const catalogItem = catalog.find((i) => i.id === cItem.itemId);
                  if (!catalogItem) return null;

                  return (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold text-slate-200 truncate">
                          {catalogItem.name}
                        </div>
                        <div className="text-[11px] font-mono text-blue-400">
                          ${catalogItem.price.toFixed(2)} each
                        </div>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2 bg-slate-900 px-2 py-1 rounded-lg border border-slate-800">
                        <button
                          onClick={() => onUpdateCartQty(idx, cItem.quantity - 1)}
                          className="text-slate-400 hover:text-slate-200"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="font-mono text-xs font-bold text-slate-100 min-w-[16px] text-center">
                          {cItem.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateCartQty(idx, cItem.quantity + 1)}
                          className="text-slate-400 hover:text-slate-200"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <button
                        onClick={() => onRemoveCartItem(idx)}
                        className="text-slate-400 hover:text-rose-400 p-1 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })
              )}

              {/* Anti-Tampering Security Test Harness Banner */}
              {cart.length > 0 && (
                <div className="mt-4 p-3.5 rounded-xl bg-slate-950 border border-blue-500/30 text-xs space-y-2">
                  <div className="flex items-center justify-between text-blue-400 font-bold">
                    <span className="flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-blue-400" />
                      Price Tampering Penetration Probe
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Test CartSecurityValidator by sending an illegal manipulated unit price ($0.05) to simulate a malicious client tampering attack.
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => handleValidateAndCheckout(true)}
                      disabled={validating}
                      className="w-full py-2 px-2.5 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-300 hover:bg-blue-500/20 text-[11px] font-semibold transition-all"
                    >
                      ⚡ Fire Tampered Price Probe ($0.05/ea)
                    </button>
                  </div>
                </div>
              )}

              {/* Validation Result Box */}
              {validationResult && (
                <div
                  className={`p-3.5 rounded-xl border text-xs font-mono space-y-1.5 ${
                    validationResult.tamperDetected
                      ? 'bg-amber-950/30 border-amber-500/40 text-amber-200'
                      : 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold">
                    {validationResult.tamperDetected ? (
                      <>
                        <ShieldAlert className="w-4 h-4 text-amber-400" />
                        <span>Tampering Defeated! Authoritative Price Enforced.</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        <span>Authoritative Verification Passed</span>
                      </>
                    )}
                  </div>
                  {validationResult.tamperDetails && (
                    <ul className="text-[10px] list-disc pl-4 text-amber-300">
                      {validationResult.tamperDetails.map((det, i) => (
                        <li key={i}>{det}</li>
                      ))}
                    </ul>
                  )}
                  <div className="text-[11px] pt-1 text-slate-300 flex justify-between">
                    <span>Verified Subtotal:</span>
                    <span>${validationResult.calculatedSubtotal.toFixed(2)}</span>
                  </div>
                  <div className="text-[11px] text-slate-300 flex justify-between">
                    <span>Municipal Tax (8.25%):</span>
                    <span>${validationResult.tax.toFixed(2)}</span>
                  </div>
                  <div className="text-xs font-bold text-emerald-400 flex justify-between pt-1 border-t border-slate-800">
                    <span>Authoritative Total:</span>
                    <span>${validationResult.total.toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Drawer Footer & Authoritative Checkout */}
            <div className="p-4 border-t border-slate-800 bg-slate-950/90 space-y-3">
              <button
                onClick={() => handleValidateAndCheckout(false)}
                disabled={cart.length === 0 || validating}
                className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-900/30 disabled:opacity-40"
              >
                {validating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Validating Against Authoritative Server...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    Authoritative Server Verification & Checkout
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
