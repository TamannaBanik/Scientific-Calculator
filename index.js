// UI
const display = document.getElementById("display");
const buttons = document.querySelectorAll("button");
const modeBtn = document.getElementById("mode");
modeBtn.addEventListener("click", () => {
    degreeMode = !degreeMode;
    modeBtn.innerText = degreeMode ? "DEG" : "RAD";
});
let degreeMode = true;
buttons.forEach(button => {
    button.addEventListener("click", () => {
        const value = button.innerText;
        if (value === "=") {
            calculate();
        }
        else if (value === "C") {
            clearDisplay();
        }
        else if (value === "⌫") {
            deleteLast();
        }
        else {
            if (value === "DEG" || value === "RAD") {
                return;
            }
            appendToDisplay(value);
        }
    });
});
function appendToDisplay(input) {
    if (input === "x²") {
        display.value += "^2";
    }
    else {
        display.value += input;
    }
}
function clearDisplay() {
    display.value = "";
}
function deleteLast() {
    display.value = display.value.slice(0, -1);
}
function calculate() {
    if (display.value === "Error") {
        return;
    }
    try {

        let tokens = tokenize(display.value);
        console.log("TOKEN:", tokens);
        let postfix = infixTopostfix(tokens);
        console.log("POSTFIX:", postfix);

        let result = postfixEval(postfix);
        console.log("RESULT:", result);
        result = Number(result.toFixed(10));
        display.value = result;
    }
    catch (err) {
        console.error(err);
        display.value = "Error";
    }
}

// Parser
function tokenize(input) {
    let tokens = [];
    let cinput = "";
    for (let i = 0; i < input.length; i++) {
        if (constants[input[i]]) {
            tokens.push(constants[input[i]].toString());
        }
        else if (/[a-zA-Z]/.test(input[i])) {
            let word = "";
            while (i < input.length && /[a-zA-Z]/.test(input[i])) {
                word += input[i];
                i++;
            }
            tokens.push(word);
            i--;
        }
        else if (!isNaN(input[i]) || input[i] === ".") {
            cinput += input[i];
        }
        else if (input[i] === "-" && (tokens.length === 0 || tokens[tokens.length - 1] === "(" || operations[tokens[tokens.length - 1]])) {
            tokens.push("NEG");
        }
        else {
            if (cinput !== "") {
                tokens.push(cinput);
            }
            tokens.push(input[i]);
            cinput = "";
        }
    }
    if (cinput !== "") {
        tokens.push(cinput);
    }
    return tokens;
}
function infixTopostfix(tokens) {
    let output = [];
    let op = [];
    for (let token of tokens) {
        if (!isNaN(token)) {
            output.push(token);
        }
        else if (token === "(") {
            op.push(token);
        }
        else if (token === ")") {
            while (op.length > 0 && op[op.length - 1] !== "(") {
                output.push(op.pop());
            }
            op.pop();
            if (op.length > 0 && functions[op[op.length - 1]]) {
                output.push(op.pop());
            }
        }
        else if (functions[token]) {
            op.push(token);
        }
        else {
            while (op.length > 0 && op[op.length - 1] !== "(" && precedence[token] <= precedence[op[op.length - 1]]) {
                output.push(op.pop());
            }
            op.push(token);
        }
    }
    while (op.length > 0) {
        output.push(op.pop());
    }
    return output;
}

// Evaluator
function postfixEval(postfix) {
    let stack = [];
    for (let token of postfix) {
        if (!isNaN(token)) {
            stack.push(Number(token));
        }
        else if (functions[token]) {
            if (stack.length < 1) {
                throw new Error("Invalid function");
            }
            let a = stack.pop();
            let result = functions[token](a);
            stack.push(result);
        }
        else if (token === "NEG") {
            if (stack.length < 1) {
                throw new Error("Invalid function");
            }
            let value = stack.pop();
            stack.push(-value);
        }
        else {
            if (stack.length < 2) {
                throw new Error("Invalid expression");
            }
            let b = stack.pop();
            let a = stack.pop();
            let result = operations[token](a, b);
            stack.push(result);
        }
    }
    return stack[0];
}

// Helper
const operations = {
    "+": (a, b) => a + b,
    "-": (a, b) => a - b,
    "*": (a, b) => a * b,
    "/": (a, b) => a / b,
    "^": (a, b) => Math.pow(a, b)
};
const functions = {
    "√": x => Math.sqrt(x),
    "sin": x =>
        degreeMode
            ? Math.sin(x * Math.PI / 180)
            : Math.sin(x),
    "cos": x => degreeMode
        ? Math.cos(x * Math.PI / 180)
        : Math.cos(x),
    "tan": x => degreeMode
        ? Math.tan(x * Math.PI / 180)
        : Math.tan(x),
    "log": x => Math.log10(x),
    "ln": x => Math.log(x)
};
const precedence = {
    "+": 1,
    "-": 1,
    "*": 2,
    "/": 2,
    "^": 3,
    "NEG": 4
};
const constants = {
    "π": Math.PI,
    "e": Math.E
};
