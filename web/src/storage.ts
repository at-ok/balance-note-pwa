export type LastAction = {
  kind: "subtract" | "add";
  amount: number;
  at: string;
};

export type BalanceState = {
  balance: number;
  lastAction: LastAction | null;
};

const STORAGE_KEY = "balance-note-state-v1";

export const defaultBalanceState: BalanceState = {
  balance: 0,
  lastAction: null
};

export function loadBalanceState(): BalanceState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultBalanceState;

    const parsed = JSON.parse(raw) as Partial<BalanceState>;
    const balance =
      typeof parsed.balance === "number" && Number.isFinite(parsed.balance)
        ? parsed.balance
        : 0;

    const lastAction =
      parsed.lastAction &&
      typeof parsed.lastAction.amount === "number" &&
      (parsed.lastAction.kind === "add" || parsed.lastAction.kind === "subtract") &&
      typeof parsed.lastAction.at === "string"
        ? parsed.lastAction
        : null;

    return { balance, lastAction };
  } catch {
    return defaultBalanceState;
  }
}

export function saveBalanceState(state: BalanceState) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function formatYen(value: number) {
  return new Intl.NumberFormat("ja-JP", {
    style: "currency",
    currency: "JPY",
    maximumFractionDigits: 0
  }).format(value);
}
