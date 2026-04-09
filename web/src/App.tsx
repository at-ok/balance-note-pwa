import { useEffect, useMemo, useState } from "react";
import {
  createHistoryItem,
  defaultBalanceState,
  formatDateTime,
  formatYen,
  loadBalanceState,
  pushHistory,
  saveBalanceState,
  type BalanceState
} from "./storage";

const keypadRows = [
  ["1", "2", "3"],
  ["4", "5", "6"],
  ["7", "8", "9"],
  ["C", "0", "⌫"]
];

function App() {
  const [state, setState] = useState<BalanceState>(defaultBalanceState);
  const [input, setInput] = useState("");
  const [isStandalone, setIsStandalone] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);

  useEffect(() => {
    setState(loadBalanceState());
    setIsStandalone(window.matchMedia("(display-mode: standalone)").matches);
  }, []);

  useEffect(() => {
    saveBalanceState(state);
  }, [state]);

  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;

    if (!historyOpen) {
      html.classList.remove("sheet-open");
      body.classList.remove("sheet-open");
      return;
    }

    html.classList.add("sheet-open");
    body.classList.add("sheet-open");

    return () => {
      html.classList.remove("sheet-open");
      body.classList.remove("sheet-open");
    };
  }, [historyOpen]);

  const parsedAmount = useMemo(() => {
    const amount = Number.parseInt(input || "0", 10);
    return Number.isFinite(amount) ? amount : 0;
  }, [input]);

  const inputLabel = parsedAmount > 0 ? formatYen(parsedAmount) : "¥0";
  const canCommit = parsedAmount > 0;
  const canUndo = state.lastAction !== null;

  const appendDigit = (digit: string) => {
    setInput((current) => {
      if (digit === "0" && current === "") return "0";
      if (current === "0") return digit;
      if (current.length >= 9) return current;
      return `${current}${digit}`;
    });
  };

  const clearInput = () => setInput("");

  const backspace = () => {
    setInput((current) => current.slice(0, -1));
  };

  const applySubtract = () => {
    if (!canCommit) return;
    setState((current) => {
      const nextBalance = current.balance - parsedAmount;
      const item = createHistoryItem("subtract", parsedAmount, nextBalance);

      return {
        balance: nextBalance,
        lastAction: item,
        history: pushHistory(current.history, item)
      };
    });
    clearInput();
  };

  const applyAdd = () => {
    if (!canCommit) return;
    setState((current) => {
      const nextBalance = current.balance + parsedAmount;
      const item = createHistoryItem("add", parsedAmount, nextBalance);

      return {
        balance: nextBalance,
        lastAction: item,
        history: pushHistory(current.history, item)
      };
    });
    clearInput();
  };

  const undoLastAction = () => {
    setState((current) => {
      if (!current.lastAction) return current;

      const nextBalance =
        current.lastAction.kind === "subtract"
          ? current.balance + current.lastAction.amount
          : current.balance - current.lastAction.amount;

      const nextHistory =
        current.history[0]?.id === current.lastAction.id
          ? current.history.slice(1)
          : current.history;

      return {
        balance: nextBalance,
        lastAction: null,
        history: nextHistory
      };
    });
  };

  const resetBalance = () => {
    const accepted = window.confirm("残高と直前操作をリセットします。");
    if (!accepted) return;
    setState(defaultBalanceState);
    clearInput();
  };

  const deleteHistoryItem = (id: string) => {
    const accepted = window.confirm("この履歴を削除します。残高は変更しません。");
    if (!accepted) return;

    setState((current) => ({
      ...current,
      lastAction: current.lastAction?.id === id ? null : current.lastAction,
      history: current.history.filter((item) => item.id !== id)
    }));
  };

  return (
    <main className={`app-shell${historyOpen ? " history-mode" : ""}`}>
      <div className="ambient ambient-left" />
      <div className="ambient ambient-right" />

      {historyOpen ? (
        <button
          aria-label="履歴を閉じる"
          className="sheet-backdrop"
          onClick={() => setHistoryOpen(false)}
          type="button"
        />
      ) : null}

      <section className="device-frame">
        <header className="topbar">
          <div>
            <p className="eyebrow">Balance Note</p>
            <h1>残高メモ</h1>
          </div>
          <div className="topbar-actions">
            <button className="ghost-button" onClick={() => setHistoryOpen(true)} type="button">
              履歴
            </button>
            <button className="ghost-button" onClick={resetBalance} type="button">
              リセット
            </button>
          </div>
        </header>

        {!isStandalone ? (
          <section className="install-card" aria-label="install hint">
            <div>
              <p className="install-title">ホーム画面に追加すると使いやすいです</p>
              <p className="install-copy">Safari の共有メニューから「ホーム画面に追加」を選ぶと、アプリのように開けます。</p>
            </div>
          </section>
        ) : null}

        <section className="balance-card">
          <p className="section-label">現在の残高</p>
          <p className="balance-value">{formatYen(state.balance)}</p>
          <p className="balance-meta">
            {state.lastAction
              ? `直前: ${state.lastAction.kind === "subtract" ? "支出" : "加算"} ${formatYen(state.lastAction.amount)}`
              : "直前操作なし"}
          </p>
        </section>

        <section className="entry-card">
          <div className="entry-header">
            <div>
              <p className="section-label">入力金額</p>
              <p className="entry-value">{inputLabel}</p>
            </div>
            <div className="micro-actions">
              <button className="subtle-button" onClick={undoLastAction} type="button" disabled={!canUndo}>
                1回戻す
              </button>
              <button className="subtle-button" onClick={applyAdd} type="button" disabled={!canCommit}>
                加算
              </button>
            </div>
          </div>

          <button className="primary-action" onClick={applySubtract} type="button" disabled={!canCommit}>
            支出として記録
          </button>
        </section>

        <section className="keypad" aria-label="number keypad">
          {keypadRows.flat().map((key) => {
            const isSecondary = key === "C" || key === "⌫";
            const className = isSecondary ? "key secondary" : "key";

            const handlePress = () => {
              if (key === "C") {
                clearInput();
                return;
              }

              if (key === "⌫") {
                backspace();
                return;
              }

              appendDigit(key);
            };

            return (
              <button key={key} className={className} onClick={handlePress} type="button">
                {key}
              </button>
            );
          })}
        </section>
      </section>

      <section
        aria-hidden={!historyOpen}
        aria-label="操作履歴"
        className={`history-sheet${historyOpen ? " is-open" : ""}`}
      >
        <div className="history-sheet-header">
          <div>
            <p className="section-label">操作履歴</p>
            <h2 className="history-title">最近の記録</h2>
          </div>
          <button className="ghost-button" onClick={() => setHistoryOpen(false)} type="button">
            閉じる
          </button>
        </div>

        <div className="history-sheet-toolbar">
          <p className="history-summary">
            {state.history.length > 0 ? `${state.history.length}件保存中` : "履歴はまだありません"}
          </p>
          <button
            className="subtle-button"
            disabled={state.history.length === 0}
            onClick={() => {
              const accepted = window.confirm("履歴をすべて削除します。残高は維持されます。");
              if (!accepted) return;
              setState((current) => ({
                ...current,
                lastAction: null,
                history: []
              }));
            }}
            type="button"
          >
            履歴を全消去
          </button>
        </div>

        <div className="history-list">
          {state.history.length === 0 ? (
            <div className="history-empty">
              <p className="history-empty-title">まだ履歴がありません</p>
              <p className="history-empty-copy">加算や支出を記録すると、ここに時系列で残ります。</p>
            </div>
          ) : (
            state.history.map((item) => (
              <button
                className="history-item"
                key={item.id}
                onClick={() => deleteHistoryItem(item.id)}
                type="button"
              >
                <div className="history-item-row">
                  <span className={`history-badge ${item.kind === "subtract" ? "is-spend" : "is-add"}`}>
                    {item.kind === "subtract" ? "支出" : "加算"}
                  </span>
                  <time className="history-time" dateTime={item.at}>
                    {formatDateTime(item.at)}
                  </time>
                </div>

                <div className="history-item-row history-main-row">
                  <strong className="history-amount">{formatYen(item.amount)}</strong>
                  <div className="history-item-meta">
                    <span className="history-balance">残高 {formatYen(item.balanceAfter)}</span>
                    <span className="history-delete-hint">タップで削除</span>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </section>
    </main>
  );
}

export default App;
