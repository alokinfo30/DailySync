import { CartItem, CartValidationResult, MenuItem } from '../types.js';
import { AUTHORITATIVE_MENU_CATALOG } from './mockData.js';

export const TAX_RATE = 0.0825; // 8.25% municipal & state tax

export interface CartValidationOptions {
  catalog?: MenuItem[];
  allowDiscounts?: boolean;
}

export function validateCartAuthoritative(
  rawItems: unknown[],
  claimedDiscount: number = 0,
  options?: CartValidationOptions
): CartValidationResult {
  const catalog = options?.catalog || AUTHORITATIVE_MENU_CATALOG;
  const catalogMap = new Map<string, MenuItem>(catalog.map((item) => [item.id, item]));

  const tamperDetails: string[] = [];
  let tamperDetected = false;

  if (!Array.isArray(rawItems)) {
    return {
      valid: false,
      tamperDetected: true,
      tamperDetails: ['Invalid payload: cart items must be an array.'],
      calculatedSubtotal: 0,
      tax: 0,
      discount: 0,
      total: 0,
      verifiedItems: [],
      timestamp: new Date().toISOString(),
    };
  }

  // Check discount tampering
  let authoritativeDiscount = 0;
  if (typeof claimedDiscount === 'number' && !Number.isNaN(claimedDiscount)) {
    if (claimedDiscount < 0) {
      tamperDetected = true;
      tamperDetails.push('Negative discount injection detected and blocked.');
      authoritativeDiscount = 0;
    } else if (claimedDiscount > 50) {
      tamperDetected = true;
      tamperDetails.push(`Excessive discount claimed ($${claimedDiscount.toFixed(2)}). Capped to maximum allowable promotion.`);
      authoritativeDiscount = 0;
    } else {
      authoritativeDiscount = claimedDiscount;
    }
  } else if (claimedDiscount !== undefined && claimedDiscount !== null) {
    tamperDetected = true;
    tamperDetails.push('Non-numeric discount parameter supplied.');
    authoritativeDiscount = 0;
  }

  const verifiedItems: {
    id: string;
    name: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
  }[] = [];

  let subtotal = 0;

  for (let idx = 0; idx < rawItems.length; idx++) {
    const raw = rawItems[idx] as Partial<CartItem>;

    if (!raw || typeof raw !== 'object') {
      tamperDetected = true;
      tamperDetails.push(`Item #${idx + 1}: Malformed item object.`);
      continue;
    }

    const itemId = String(raw.itemId || '');
    const catalogItem = catalogMap.get(itemId);

    if (!catalogItem) {
      tamperDetected = true;
      tamperDetails.push(`Item #${idx + 1}: Unknown or unlisted item ID "${itemId}".`);
      continue;
    }

    // Check quantity validity
    const qty = Number(raw.quantity);
    if (Number.isNaN(qty) || !Number.isInteger(qty) || qty <= 0) {
      tamperDetected = true;
      tamperDetails.push(`Item #${idx + 1} (${catalogItem.name}): Invalid quantity "${raw.quantity}". Must be a positive integer.`);
      continue;
    }

    if (qty > 100) {
      tamperDetected = true;
      tamperDetails.push(`Item #${idx + 1} (${catalogItem.name}): Bulk order quantity ${qty} exceeds single-order threshold.`);
      continue;
    }

    // Check price tampering
    const claimedPrice = raw.customPrice !== undefined ? Number(raw.customPrice) : undefined;
    if (claimedPrice !== undefined) {
      if (Number.isNaN(claimedPrice) || Math.abs(claimedPrice - catalogItem.price) > 0.001) {
        tamperDetected = true;
        tamperDetails.push(
          `Price tampering intercepted for "${catalogItem.name}": Client sent $${claimedPrice}, authoritative price is $${catalogItem.price.toFixed(2)}.`
        );
      }
    }

    // Addons calculation (authoritative)
    let unitPrice = catalogItem.price;
    if (raw.extraShots && typeof raw.extraShots === 'number' && raw.extraShots > 0) {
      unitPrice += raw.extraShots * 1.25; // $1.25 per extra shot
    }
    if (raw.syrupPumps && typeof raw.syrupPumps === 'number' && raw.syrupPumps > 0) {
      unitPrice += raw.syrupPumps * 0.75; // $0.75 per syrup pump
    }

    const lineTotal = Number((unitPrice * qty).toFixed(2));
    subtotal += lineTotal;

    verifiedItems.push({
      id: catalogItem.id,
      name: catalogItem.name,
      quantity: qty,
      unitPrice,
      lineTotal,
    });
  }

  const finalSubtotal = Number(subtotal.toFixed(2));
  const effectiveDiscount = Math.min(authoritativeDiscount, finalSubtotal);
  const taxableAmount = Math.max(0, finalSubtotal - effectiveDiscount);
  const tax = Number((taxableAmount * TAX_RATE).toFixed(2));
  const total = Number((taxableAmount + tax).toFixed(2));

  const valid = verifiedItems.length > 0;

  return {
    valid,
    tamperDetected,
    tamperDetails: tamperDetails.length > 0 ? tamperDetails : undefined,
    calculatedSubtotal: finalSubtotal,
    tax,
    discount: effectiveDiscount,
    total,
    verifiedItems,
    timestamp: new Date().toISOString(),
  };
}
