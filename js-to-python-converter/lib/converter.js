const espree = require("espree");
const estraverse = require("estraverse");

function translateJSExpressionToPython(node) {
    switch (node.type) {
        case "Literal":
            return JSON.stringify(node.value);
        case "Identifier":
            return node.name;
        case "BinaryExpression":
            return `(${translateJSExpressionToPython(node.left)} ${node.operator} ${translateJSExpressionToPython(node.right)})`;
        case "CallExpression":
            if (
                node.callee.type === "MemberExpression" &&
                node.callee.object.name === "console" &&
                node.callee.property.name === "log"
            ) {
                // Convert console.log to Python print statement
                const args = node.arguments.map((arg) => translateJSExpressionToPython(arg));
                return `print(${args.join(", ")})`;
            } else if (
                node.callee.type === "MemberExpression" &&
                node.callee.object.name === "console" &&
                node.callee.property.name === "error"
            ) {
                // Convert console.error to Python print statement to stderr
                const args = node.arguments.map((arg) => translateJSExpressionToPython(arg));
                return `print(${args.join(", ")}, file=sys.stderr)`;
            } else {
                // Handle other function calls
                const callee = translateJSExpressionToPython(node.callee);
                const args = node.arguments.map((arg) => translateJSExpressionToPython(arg));
                return `${callee}(${args.join(", ")})`;
            }
        case "MemberExpression":
            const object = translateJSExpressionToPython(node.object);
            const property = translateJSExpressionToPython(node.property);
            return `${object}.${property}`;
        case "TemplateLiteral":
            // Handle template literals by joining the cooked values
            return `"${node.quasis.map((quasi) => quasi.value.cooked).join("")}"`;
        case "AssignmentExpression":
            const left = translateJSExpressionToPython(node.left);
            const operator = node.operator;
            const right = translateJSExpressionToPython(node.right);
            return `${left} ${operator} ${right}`;
        case "ThisExpression":
            // Omit or replace this as needed
            return "";
        case "FunctionDeclaration":
        case "FunctionExpression":
            const functionName = node.id ? node.id.name : "";
            const params = node.params.map(param => param.name).join(", ");
            const functionBody = translateJSExpressionToPython(node.body);

            return `def ${functionName}(${params}):\n${functionBody}`;
        default:
            throw new Error(`Unsupported JavaScript expression: ${node.type}`);
    }
}

function translateJSToPython(jsCode) {
    const jsAST = espree.parse(jsCode, {
        ecmaVersion: 2020, // Adjust this as needed
    });

    let pythonCode = "";

    estraverse.traverse(jsAST, {
        enter(node) {
            if (node.type === "ExpressionStatement") {
                const translated = translateJSExpressionToPython(node.expression);
                pythonCode += translated + '\n'; // Append a line break
            }
        },
    });

    return pythonCode;
}

module.exports = { translateJSToPython };