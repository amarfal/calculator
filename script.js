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