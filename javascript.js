
///takes an infix expression and converts it to a postfix expression then returns it.
///returns null to signal an error in the conversion, for example an unexpected symbol.


function add(a, b) {
    return a + b;
}

function subtract(a, b) {
    return a - b;
}

function multiply(a, b) {
    return a * b;
}

function divide(a, b) {
    return a / b;
}

function exponentiate(a, b) {
    return a ** b;
}

function logarithmFactory(base) {
    return function(x) {
        return Math.log(x) / Math.log(base);
    }
}

function sin(x) {
    return Math.sin(x);
}
function cos(x) {
    return Math.cos(x);
}
const operators = {
    '+': { "precedence": 1, "arity": 2, "function": add },
    '-': { "precedence": 1, "arity": 2, "function": subtract },
    '*': { "precedence": 2, "arity": 2, "function": multiply },
    '/': { "precedence": 2, "arity": 2, "function": divide },
    '^': { "precedence": 3, "arity": 2, "function": exponentiate },
    'log': { "precedence": 10, "arity": 1, "function": logarithmFactory(2) },
    'sin': { "precedence": 10, "arity": 1, "function": sin },
    'cos' : { "precedence" : 10, "arity" : 1 , "function": cos}
}

function getOperatorFunction(operator) {
    return operators[operator].function;
}

function isOperator(operator) {
    return operator in operators;
}

function isParanthesis(char) {
    return char === '(' || char === ')'
}
function isOperand(operand) {
    if (typeof operand !== "number" && typeof operand !== "string") return false;

    return !isNaN(operand) && !isNaN(parseFloat(operand));
}
function getPrecedence(operator) {
    return operators[operator].precedence;
}
function getArity(operator) {
    return operators[operator].arity;
}


function sanitize(str) {
    let operandTotal = "";
    let operatorTotal = "";
    let result = [];
    let seenOperand = false;

    for (let i of str) {
        if (isOperand(i) || i === ".") {
            operandTotal += i;
        } else {
            if (operandTotal) {
                if (isNaN(parseFloat(operandTotal))) return null;
                if (parseFloat(operandTotal).toString() !== operandTotal) return null;
                result.push(parseFloat(operandTotal));
                operandTotal = "";
                seenOperand = true;
            }

            operatorTotal += i;

            if (isOperator(operatorTotal) || isParanthesis(operatorTotal)) {
                if (seenOperand === false && operatorTotal === '-') {
                    operandTotal += '-';
                    operatorTotal = "";
                } else {
                    result.push(operatorTotal);
                    operatorTotal = "";
                }
            }
        }
    }

    if (operandTotal) {

        if (isNaN(parseFloat(operandTotal))) return null;
        if (parseFloat(operandTotal).toString() !== operandTotal) return null;
        
        result.push(parseFloat(operandTotal));
    }

    return result;
}



function infixToPostfix(expression) {
    let sanitizedExpression = sanitize(expression.split("").filter((char) => char != ' ').join("").toLowerCase());
    if (sanitizedExpression === null) return null;

    let postfixExpression = [];
    let stack = [];

    function addToPostfixAndPop() {
        if (stack[stack.length - 1] !== '(' && stack[stack.length - 1] !== ')') {
            postfixExpression.push(stack[stack.length - 1]);
        }
        stack.pop();
    }
    for (let i of sanitizedExpression) {
        if (isOperand(i)) {
            postfixExpression.push(i);
        } else if (isOperator(i)) {
            while (stack.length > 0 && isOperator(stack[stack.length - 1]) && getPrecedence(i) <= getPrecedence(stack[stack.length - 1])) {
                addToPostfixAndPop();
            }
            stack.push(i);
        } else if (isParanthesis(i)) {
            if (i === '(') {
                stack.push(i);
            } else {
                while (stack.length > 0 && stack[stack.length - 1] !== '(') {
                    addToPostfixAndPop();
                }

                if (stack.length === 0) {
                    return null; /// this closed paranthesis couldn't find a pair, meaning expresion was invalid
                }

                ///pops the open paranthesis corresponding to this closed one
                addToPostfixAndPop();
            }
        } else {
            return null;
        }
    }

    while (stack.length > 0) {
        if (!isOperator(stack[stack.length - 1])) {
            return null;
        }
        addToPostfixAndPop();
    }
    return postfixExpression;
}

///this function should only recieve input from infixToPostfix(),
///expression must be an array of numbers for the operands and strings for the operators, and must be a 
///valid postfixexpression.
function evaluatePostfixExpression(expression) {


    let stack = [];

    for (let i of expression) {
        if (isOperand(i)) {
            stack.push(i);
        } else if (isOperator(i)) {
            let arity = getArity(i);
            let arguments = [];
            for (let j = 0; j < arity; j++) {
                if (stack.length === 0) return null;
                if (typeof stack[stack.length - 1] != "number") return null;
                arguments.push(stack.pop());
            }
            arguments.reverse();
            stack.push(getOperatorFunction(i)(...arguments));
        } else {
            return null;
        }
    }

    if (stack.length !== 1) {
        return null;
    }

    return stack[0];
}

function evaluateExpression(expression) {
    const postfixExpression = infixToPostfix(expression);
    if (postfixExpression === null) return null;
    const result = evaluatePostfixExpression(postfixExpression);
    if (result === null) return null;
    return result;
}