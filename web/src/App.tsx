import { useEffect, useMemo, useState } from "react";
import { defaultBalanceState, formatYen, loadBalanceState, saveBalanceState, type BalanceState } from "./storage";

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

  useEffect(() => {
    setState(loadBalanceState());
    setIsStandalone(window.matchMedia("(display-mode: standalone)").matches);
  }, []);

  useEffect(() => {
    saveBalanceState(state);
  }, [state]);

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
    setState((current) => ({
      balance: current.balance - parsedAmount,
      lastAction: {
        kind: "subtract",
        amount: parsedAmount,
        at: new Date().toISOString()
      }
    }));
    clearInput();
  };

  const applyAdd = () => {
    if (!canCommit) return;
    setState((current) => ({
      balance: current.balance + parsedAmount,
      lastAction: {
        kind: "add",
        amount: parsedAmount,
        at: new Date().toISOString()
      }
    }));
    clearInput();
  };

  const undoLastAction = () => {
    setState((current) => {
      if (!current.lastAction) return current;

      const nextBalance =
        current.lastAction.kind === "subtract"
          ? current.balance + current.lastAction.amount
          : current.balance - current.lastAction.amount;

      return {
        balance: nextBalance,
        lastAction: null
      };
    });
  };

  const resetBalance = () => {
    const accepted = window.confirm("残高と直前操作をリセットします。");
    if (!accepted) return;
    setState(defaultBalanceState);
    clearInput();
  };

  return (
    <main className="app-shell">
      <div className="ambient ambient-left" />
      <div className="ambient ambient-right" />

      <section className="device-frame">
        <header className="topbar">
          <div>
            <p className="eyebrow">Balance Note</p>
            <h1>残高メモ</h1>
          </div>
          <button className="ghost-button" onClick={resetBalance} type="button">
            リセット
          </button>
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
    </main>
  );
}

export default App;
