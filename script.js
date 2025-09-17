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
const keys = document.querySelector('keys');
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
        displayValue = formatNumber(result);
        updateDisplay();
    }

    operator = op;
    waitingForSecond = true;
    justEvaluated = false;
}