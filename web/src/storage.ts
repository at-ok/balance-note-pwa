export type HistoryItem = {
  id: string;
  kind: "subtract" | "add";
  amount: number;
  at: string;
  balanceAfter: number;
};

export type BalanceState = {
  balance: number;
  lastAction: HistoryItem | null;
  history: HistoryItem[];
};

const STORAGE_KEY = "balance-note-state-v1";
const MAX_HISTORY_ITEMS = 400;

export const defaultBalanceState: BalanceState = {
  balance: 0,
  lastAction: null,
  history: []
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

    const history = Array.isArray(parsed.history)
      ? parsed.history.filter(isHistoryItem).slice(0, MAX_HISTORY_ITEMS)
      : [];

    const lastAction =
      parsed.lastAction &&
      isHistoryItem(parsed.lastAction)
        ? parsed.lastAction
        : null;

    return { balance, lastAction, history };
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

export function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("ja-JP", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

export function createHistoryItem(
  kind: HistoryItem["kind"],
  amount: number,
  balanceAfter: number
): HistoryItem {
  return {
    id:
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    kind,
    amount,
    at: new Date().toISOString(),
    balanceAfter
  };
}

export function pushHistory(history: HistoryItem[], item: HistoryItem) {
  return [item, ...history].slice(0, MAX_HISTORY_ITEMS);
}

function isHistoryItem(value: unknown): value is HistoryItem {
  if (!value || typeof value !== "object") return false;

  const candidate = value as Partial<HistoryItem>;

  return (
    typeof candidate.id === "string" &&
    typeof candidate.amount === "number" &&
    Number.isFinite(candidate.amount) &&
    (candidate.kind === "add" || candidate.kind === "subtract") &&
    typeof candidate.at === "string" &&
    typeof candidate.balanceAfter === "number" &&
    Number.isFinite(candidate.balanceAfter)
  );
}
