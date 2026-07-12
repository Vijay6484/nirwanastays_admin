export interface BookingTariffInput {
  total_amount: string | number | null | undefined;
  Discount?: string | number | null | undefined;
  advance_amount: string | number | null | undefined;
}

export interface BookingTariffResult {
  grossAmount: number;
  discountAmount: number;
  netPayable: number;
  advanceAmount: number;
  remainingAmount: number;
}

export function computeBookingTariff(row: BookingTariffInput): BookingTariffResult {
  const grossAmount = parseFloat(String(row.total_amount ?? 0)) || 0;
  const discountAmount = parseFloat(String(row.Discount ?? 0)) || 0;
  const advanceAmount = parseFloat(String(row.advance_amount ?? 0)) || 0;
  const netPayable = Math.max(0, grossAmount - discountAmount);
  const remainingAmount = Math.max(0, netPayable - advanceAmount);

  return {
    grossAmount,
    discountAmount,
    netPayable,
    advanceAmount,
    remainingAmount,
  };
}

export function formatInr(amount: number): string {
  return `₹${Math.round(amount).toLocaleString("en-IN")}`;
}

export function derivePaymentStatus(
  dbStatus: string,
  advanceAmount: number,
  netPayable: number,
): "Paid" | "Partial" | "Unpaid" | "Pending" {
  const remaining = netPayable - advanceAmount;

  if (dbStatus === "failed") {
    return "Unpaid";
  }

  if (!dbStatus || dbStatus === "pending" || dbStatus === "expired") {
    return "Pending";
  }

  if (dbStatus === "partial" || (advanceAmount > 0 && remaining > 1)) {
    return "Partial";
  }

  if (dbStatus === "success" && remaining <= 1) {
    return "Paid";
  }

  if (advanceAmount > 0) {
    return "Partial";
  }

  return "Pending";
}
