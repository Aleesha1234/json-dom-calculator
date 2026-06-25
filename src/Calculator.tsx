import { useState, useCallback, useEffect } from "react";

const BUTTONS: { label: string; value: string; type: string }[] = [
  { label: "AC", value: "clear", type: "action" },
  { label: "+/-", value: "negate", type: "action" },
  { label: "%", value: "%", type: "action" },
  { label: "÷", value: "/", type: "operator" },
  { label: "7", value: "7", type: "digit" },
  { label: "8", value: "8", type: "digit" },
  { label: "9", value: "9", type: "digit" },
  { label: "×", value: "*", type: "operator" },
  { label: "4", value: "4", type: "digit" },
  { label: "5", value: "5", type: "digit" },
  { label: "6", value: "6", type: "digit" },
  { label: "−", value: "-", type: "operator" },
  { label: "1", value: "1", type: "digit" },
  { label: "2", value: "2", type: "digit" },
  { label: "3", value: "3", type: "digit" },
  { label: "+", value: "+", type: "operator" },
  { label: "0", value: "0", type: "digit zero" },
  { label: ".", value: ".", type: "digit" },
  { label: "=", value: "=", type: "equals" },
];

interface CalcState {
  display: string;
  previous: string | null;
  operator: string | null;
  waitingForOperand: boolean;
  expression: string;
}

const initialState: CalcState = {
  display: "0",
  previous: null,
  operator: null,
  waitingForOperand: false,
  expression: "",
};

function calculate(a: number, op: string, b: number): number {
  switch (op) {
    case "+": return a + b;
    case "-": return a - b;
    case "*": return a * b;
    case "/": return b === 0 ? NaN : a / b;
    default: return b;
  }
}

function formatNumber(num: string): string {
  if (num.length > 12) {
    const n = parseFloat(num);
    return parseFloat(n.toPrecision(9)).toString();
  }
  return num;
}

export default function Calculator() {
  const [state, setState] = useState<CalcState>(initialState);

  const handleInput = useCallback((value: string) => {
    setState((prev) => {
      let next = { ...prev };

      if (value === "clear") return { ...initialState };

      if (value === "negate") {
        next.display = formatNumber(String(-parseFloat(next.display)));
        return next;
      }

      if (value === "%") {
        next.display = formatNumber(String(parseFloat(next.display) / 100));
        return next;
      }

      if (["+", "-", "*", "/"].includes(value)) {
        if (next.operator && !next.waitingForOperand) {
          const result = calculate(parseFloat(next.previous!), next.operator, parseFloat(next.display));
          next.display = formatNumber(String(result));
          next.previous = next.display;
        } else {
          next.previous = next.display;
        }
        next.operator = value;
        next.waitingForOperand = true;
        next.expression = `${next.previous} ${value === "/" ? "÷" : value === "*" ? "×" : value === "-" ? "−" : value}`;
        return next;
      }

      if (value === "=") {
        if (!next.operator || next.previous === null) return next;
        const result = calculate(parseFloat(next.previous), next.operator, parseFloat(next.display));
        next.display = formatNumber(String(result));
        next.operator = null;
        next.previous = null;
        next.waitingForOperand = false;
        next.expression = "";
        return next;
      }

      if (value === ".") {
        if (next.waitingForOperand) {
          next.display = "0.";
          next.waitingForOperand = false;
          return next;
        }
        if (!next.display.includes(".")) next.display += ".";
        return next;
      }

      if (next.waitingForOperand) {
        next.display = value;
        next.waitingForOperand = false;
        return next;
      }

      next.display = next.display === "0" ? value : formatNumber(next.display + value);
      return next;
    });
  }, []);

  useEffect(() => {
    const keyMap: Record<string, string> = {
      "0": "0", "1": "1", "2": "2", "3": "3", "4": "4",
      "5": "5", "6": "6", "7": "7", "8": "8", "9": "9",
      ".": ".", "+": "+", "-": "-", "*": "*", "/": "/",
      "Enter": "=", "=": "=", "Backspace": "clear", "Escape": "clear", "%": "%",
    };
    const onKey = (e: KeyboardEvent) => {
      const mapped = keyMap[e.key];
      if (mapped) { e.preventDefault(); handleInput(mapped); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleInput]);

  const displayValue = state.display.length > 9
    ? parseFloat(state.display).toExponential(4)
    : state.display;

  return (
    <div className="calc-wrapper">
      <div className="calc-body">
        <div className="calc-screen">
          <div className="calc-expression">{state.expression}</div>
          <div className="calc-display">{displayValue}</div>
        </div>
        <div className="calc-grid">
          {BUTTONS.map((btn) => (
            <button
              key={btn.value + btn.label}
              className={`calc-btn calc-btn--${btn.type.split(" ")[0]}${btn.value === "0" ? " calc-btn--zero" : ""}`}
              onClick={() => handleInput(btn.value)}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
