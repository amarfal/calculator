// math helpers
function add(a, b)      { return a + b; }
function subtract(a, b) { return a - b; }
function multiply(a, b) { return a * b; }
function divide(a, b)   { return b === 0 ? 'DIV0' : a / b; }

function operate(op, a, b) {
    switch (op) {
        case '+': return add(a, b);
        case '-':
        case '-': return subtract(a, b);
        case '×':
        case '*': return multiply(a, b);
        case '÷':
        case '/': return divide (a, b);
        default:  return b;
    }
}

// make sure results are readable
function formatNumber(n) {
    if (typeof n !== 'number' || !isFinite(n)) return String(n);
    const rounded = Math.round(n * 1e12) / 1e12;
    return rounded.toString().replace(/(\.\d*?)0+$/,'$1').replace(/\.$/,'');
}

const displayEl = document.getElementById('display');
const keys = document.querySelector('.keys');
const dotBtn = document.getElementById('dotBtn');

let first = null;
let operator = null;
let waitingForSecond = false;
let justEvaluated = false;

let displayValue = '0';

function updateDisplay(text = displayValue) {
    displayEl.textContent = text;
    const canDot = !String(displayValue).includes('.');
    dotBtn.disabled = !canDot;
    dotBtn.style.opacity = canDot ? '1' : '.6';
}

function clearAll() {
    first = null;
    operator = null;
    waitingForSecond = false;
    justEvaluated = false;
    displayValue = '0';
    updateDisplay();
}

function inputDigit(d) {
    if (justEvaluated) {
        first = null; operator = null; justEvaluated = false;
        displayValue = '0';
    }
    if (waitingForSecond) {
        displayValue = '0';
        waitingForSecond = false;
    }
    if (displayValue === '0') displayValue = '';
    if (displayValue.length >= 16) return;
    displayValue += d;
    updateDisplay();
}

function inputDot() {
    if (waitingForSecond) {
        displayValue = '0';
        waitingForSecond = false;
    }
    if (!displayValue.includes('.')) {
        displayValue += (displayValue === '' ? '0.' : '.');
        updateDisplay();
    }
}

function setOperator(op) {
    if (operator && waitingForSecond) {
        operator = op;
        return;
    }

    const current = Number(displayValue);

    if (first === null) {
        first = current;
    } else if (!waitingForSecond) {
        const result = operate(operator, first, current);
        if (result === 'DIV0') {
            displayValue = 'Nice try :)'
            updateDisplay();

            first = null; operator = null; waitingForSecond = false; justEvaluated = true;
            return;
        }
        first = result;
        const formattedResult = formatNumber(result);
        if (formattedResult.length > 15) {
            displayValue = "I can't do that :(";
            first = null; operator = null; waitingForSecond = false; justEvaluated = true;
        } else {
            displayValue = formattedResult;
        }
        updateDisplay();
    }

    operator = op;
    waitingForSecond = true;
    justEvaluated = false;
}

function equals() {
    if (operator === null || waitingForSecond) return;

    const second = Number(displayValue);
    const expr = `${formatNumber(first)} ${operator} ${formatNumber(second)}`;

    const result = operate(operator, first, second);

    if (result === 'DIV0') {
        displayValue = 'Nice try :)';
    } else {
        const formattedResult = formatNumber(result);
        if (formattedResult.length > 15) {
            displayValue = "I can't do that :(";
            first = null;
        } else {
            displayValue = formattedResult;
            first = result;
        }
    }

    operator = null;
    waitingForSecond = false;
    justEvaluated = true;
    updateDisplay();

    if (window.addToHistory && result !== 'DIV0') {
        window.addToHistory(expr, displayValue);
    }
} 

function backspace() {
    if (justEvaluated || waitingForSecond) return;
    if (displayValue.length <= 1) displayValue = '0';
    else displayValue = displayValue.slice(0, -1);
    updateDisplay();
}

// buttons
keys.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;

    const d = btn.dataset.digit;
    const op = btn.dataset.op;

    if (d !== undefined) inputDigit(d);
    else if (op)            setOperator(op);
    else if (btn.dataset.dot !== undefined) inputDot();
    else if (btn.dataset.action === 'equals') equals();
    else if (btn.dataset.action === 'clear') clearAll();
    else if (btn.dataset.action === 'back') backspace();
});

// keyboard support
document.addEventListener('keydown', (e) => {
    const { key } = e;

    if (/\d/.test(key)) { inputDigit(key); return; }
    if (key === '.')    { inputDot(); return; }

    if ( key === '+' || key === '-' || key === '*' || key === '/' ) {
        setOperator({'+':'+', '-':'-', '*':'×', '/':'÷'}[key]);
        e.preventDefault();
        return;
    }
    if (key === 'Enter' || key === '=') { equals(); e.preventDefault(); return; }
    if (key === 'Backspace')            { backspace(); return; }
    if (key === 'Escape')               { clearAll(); return; }
});

updateDisplay();

// history module
(() => {
    const display     = document.querySelector("#display");
    const logBtn      = document.querySelector('[data-action="log"]');
    const dlg         = document.querySelector("#historyDlg");
    const list        = document.querySelector("#historyList");
    const clearBtn    = document.querySelector("#clearHistory");

    const MAX = 50;
    let history = load();

    render();

    if (logBtn) logBtn.addEventListener("click", () => dlg.showModal());
    clearBtn.addEventListener("click", () => {
        history = [];
        save(history);
        render();
    });

    list.addEventListener("click", (e) => {
        const li = e.target.closest("li[data-result]");
        if (!li) return;
        display.textContent = li.dataset.result;
        dlg.close();
    });

    window.addToHistory = function (expr, result) {
        if (expr == null || result == null) return;
        history.unshift({ expr: String(expr), result: String(result), t: Date.now() });
        history = history.slice(0, MAX);
        save(history);
        render();
    };

    function render() {
        if (!history.length) {
            list.innerHTML = `<li class="history__empty">No history yet…</li>`;
            return;
        }
        list.innerHTML = history
            .map(item => `
                <li data-result="${escapeAttr(item.result)}" title="Click to use result">
                    <span class="history__expr">${escapeHtml(item.expr)} =</span>
                    <span class="history__res">${escapeHtml(item.result)}</span>
                </li>
            `)
            .join("");
    }

    function load() {
        try { return JSON.parse(localStorage.getItem("calc_history") || "[]"); }
        catch { return []; }
    }
    function save(h) {
        localStorage.setItem("calc_history", JSON.stringify(h));
    }

    function escapeHtml(s) {
        return String(s).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
    }
    function escapeAttr(s) {
        return String(s).replace(/"/g, "$quot;");
    }
})();