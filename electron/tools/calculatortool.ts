import { tool } from "@langchain/core/tools";
import { z } from "zod";

const SAFE_MATH_FUNCS: Record<string, (...args: number[]) => number> = {
  pow: Math.pow,
  sqrt: Math.sqrt,
  abs: Math.abs,
  sin: Math.sin,
  cos: Math.cos,
  tan: Math.tan,
  log: Math.log,
  log2: Math.log2,
  log10: Math.log10,
  exp: Math.exp,
  round: Math.round,
  floor: Math.floor,
  ceil: Math.ceil,
  min: Math.min,
  max: Math.max,
  sign: Math.sign,
  trunc: Math.trunc,
  cbrt: Math.cbrt,
  hypot: Math.hypot,
  atan2: Math.atan2,
};

const SAFE_CONSTS: Record<string, number> = {
  pi: Math.PI,
  e: Math.E,
  PI: Math.PI,
  E: Math.E,
  LN2: Math.LN2,
  LN10: Math.LN10,
  LOG2E: Math.LOG2E,
  LOG10E: Math.LOG10E,
  SQRT2: Math.SQRT2,
  SQRT1_2: Math.SQRT1_2,
};

function tokenize(expr: string): string[] {
  const tokens: string[] = [];
  let i = 0;
  while (i < expr.length) {
    if (/\s/.test(expr[i])) {
      i++;
      continue;
    }

    if (/[0-9.]/.test(expr[i])) {
      let num = "";
      while (i < expr.length && /[0-9.eE]/.test(expr[i])) {
        num += expr[i];
        i++;
      }
      tokens.push(num);
      continue;
    }

    if (/[a-zA-Z_]/.test(expr[i])) {
      let name = "";
      while (i < expr.length && /[a-zA-Z0-9_]/.test(expr[i])) {
        name += expr[i];
        i++;
      }
      tokens.push(name);
      continue;
    }

    if ("+-*/(),%^".includes(expr[i])) {
      tokens.push(expr[i]);
      i++;
      continue;
    }

    throw new Error(`Unexpected character: ${expr[i]}`);
  }
  return tokens;
}

function parseExpr(tokens: string[], pos: { i: number }): number {
  let left = parseTerm(tokens, pos);
  while (pos.i < tokens.length && (tokens[pos.i] === "+" || tokens[pos.i] === "-")) {
    const op = tokens[pos.i++];
    const right = parseTerm(tokens, pos);
    left = op === "+" ? left + right : left - right;
  }
  return left;
}

function parseTerm(tokens: string[], pos: { i: number }): number {
  let left = parsePower(tokens, pos);
  while (pos.i < tokens.length && (tokens[pos.i] === "*" || tokens[pos.i] === "/")) {
    const op = tokens[pos.i++];
    const right = parsePower(tokens, pos);
    left = op === "*" ? left * right : left / right;
  }
  return left;
}

function parsePower(tokens: string[], pos: { i: number }): number {
  let base = parseUnary(tokens, pos);
  if (pos.i < tokens.length && tokens[pos.i] === "^") {
    pos.i++;
    const exp = parseUnary(tokens, pos);
    base = Math.pow(base, exp);
  }
  return base;
}

function parseUnary(tokens: string[], pos: { i: number }): number {
  if (pos.i < tokens.length && tokens[pos.i] === "-") {
    pos.i++;
    return -parseAtom(tokens, pos);
  }
  if (pos.i < tokens.length && tokens[pos.i] === "+") {
    pos.i++;
  }
  return parseAtom(tokens, pos);
}

function parseAtom(tokens: string[], pos: { i: number }): number {
  if (pos.i >= tokens.length) throw new Error("Unexpected end of expression");

  const token = tokens[pos.i];

  if (token === "(") {
    pos.i++;
    const val = parseExpr(tokens, pos);
    if (pos.i >= tokens.length || tokens[pos.i] !== ")")
      throw new Error("Missing closing parenthesis");
    pos.i++;
    return val;
  }

  if (SAFE_CONSTS[token] !== undefined) {
    pos.i++;
    return SAFE_CONSTS[token];
  }

  if (SAFE_MATH_FUNCS[token] !== undefined) {
    pos.i++;
    if (pos.i >= tokens.length || tokens[pos.i] !== "(")
      throw new Error(`Expected ( after ${token}`);
    pos.i++;
    const args: number[] = [];
    if (pos.i < tokens.length && tokens[pos.i] !== ")") {
      args.push(parseExpr(tokens, pos));
      while (pos.i < tokens.length && tokens[pos.i] === ",") {
        pos.i++;
        args.push(parseExpr(tokens, pos));
      }
    }
    if (pos.i >= tokens.length || tokens[pos.i] !== ")")
      throw new Error("Missing closing parenthesis");
    pos.i++;
    return SAFE_MATH_FUNCS[token](...args);
  }

  const num = parseFloat(token);
  if (isNaN(num)) throw new Error(`Unknown token: ${token}`);
  pos.i++;
  return num;
}

function safeEval(expr: string): number {
  const tokens = tokenize(expr);
  const pos = { i: 0 };
  const result = parseExpr(tokens, pos);
  if (pos.i < tokens.length) throw new Error(`Unexpected token: ${tokens[pos.i]}`);
  return result;
}

export const calculatortool = tool(
  async ({ expression }) => {
    try {
      const result = safeEval(expression);
      if (typeof result !== "number" || !isFinite(result)) {
        return `Result: ${result}`;
      }
      return `Result: ${parseFloat(result.toFixed(10))}`;
    } catch (err: any) {
      return `Calculation error: ${err.message}`;
    }
  },
  {
    name: "calculate",
    description:
      "Evaluate a mathematical expression. Supports all Math methods (pow, sqrt, sin, cos, tan, log, abs, round, floor, ceil, min, max), constants (pi, e), operators (+, -, *, /, ^), and parentheses. Use Math.pow(x,y) or x^y for exponents.",
    schema: z.object({
      expression: z
        .string()
        .describe(
          "The mathematical expression to evaluate, e.g. 'Math.pow(2, 10)', 'pi * 5 + 3', 'Math.sqrt(144)'",
        ),
    }),
  },
);
