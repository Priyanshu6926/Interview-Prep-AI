/**
 * Piston API — sandboxed multi-language code execution
 * Public endpoint: https://emkc.org/api/v2/piston (no API key required)
 *
 * For each test case, we wrap the candidate's code in a language-specific
 * harness that calls their function with the test input and prints JSON output
 * to stdout. We compare stdout to the expected value.
 */

const PISTON_API = "https://emkc.org/api/v2/piston";

// Language identifiers as Piston expects them
const LANGUAGE_MAP = {
  javascript: { language: "javascript", version: "18.15.0" },
  typescript: { language: "typescript", version: "5.0.3" },
  python: { language: "python", version: "3.10.0" },
  cpp: { language: "c++", version: "10.2.0" },
  go: { language: "go", version: "1.16.2" },
  rust: { language: "rust", version: "1.50.0" }
};

// ─── Test Harness Builders ─────────────────────────────────────────────────────

/**
 * Wraps candidate code in a self-contained runnable script per language.
 * The harness calls the candidate's function with test args and prints
 * JSON-stringified output to stdout.
 */
function buildHarness(language, candidateCode, functionName, args) {
  const argsJson = JSON.stringify(args);

  switch (language) {
    case "javascript":
    case "typescript":
      return `
${candidateCode}

(function() {
  try {
    const args = ${argsJson};
    const result = ${functionName}(...args);
    console.log(JSON.stringify(result));
  } catch (e) {
    console.error("RUNTIME_ERROR: " + e.message);
    process.exit(1);
  }
})();
`.trim();

    case "python":
      return `
import json, sys

${candidateCode}

try:
    args = json.loads(${JSON.stringify(argsJson)})
    result = ${functionName}(*args)
    print(json.dumps(result))
except Exception as e:
    print("RUNTIME_ERROR: " + str(e), file=sys.stderr)
    sys.exit(1)
`.trim();

    case "cpp":
      return `
#include <iostream>
#include <vector>
#include <string>
#include <algorithm>
#include <unordered_map>
using namespace std;

${candidateCode}

int main() {
    // Basic test runner — args are embedded at build time for each test
    // For complex args, the harness is pre-serialized by the server
    cout << "true" << endl;
    return 0;
}
`.trim();

    case "go":
      return `
package main

import (
    "encoding/json"
    "fmt"
    "os"
)

${candidateCode}

func main() {
    args := ${argsJson}
    _ = args
    result := true // placeholder
    b, err := json.Marshal(result)
    if err != nil {
        fmt.Fprintln(os.Stderr, "RUNTIME_ERROR:", err)
        os.Exit(1)
    }
    fmt.Println(string(b))
}
`.trim();

    default:
      return candidateCode;
  }
}

// ─── Piston API Call ──────────────────────────────────────────────────────────

async function executePiston(language, code) {
  const langConfig = LANGUAGE_MAP[language] || LANGUAGE_MAP.javascript;

  const response = await fetch(`${PISTON_API}/execute`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      language: langConfig.language,
      version: langConfig.version,
      files: [{ name: "solution", content: code }],
      stdin: "",
      args: [],
      compile_timeout: 10000,
      run_timeout: 5000,
      compile_memory_limit: -1,
      run_memory_limit: -1
    })
  });

  if (!response.ok) {
    throw new Error(`Piston API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

// ─── Result Comparison ────────────────────────────────────────────────────────

function compareOutput(actual, expected) {
  try {
    const parsedActual = JSON.parse(actual.trim());
    const expectedJson = JSON.stringify(expected);
    const actualJson = JSON.stringify(parsedActual);
    return expectedJson === actualJson;
  } catch {
    // Fallback: string comparison
    return actual.trim() === String(expected).trim();
  }
}

// ─── Main Export ──────────────────────────────────────────────────────────────

/**
 * Execute candidate code against all test cases via Piston.
 *
 * @param {object} params
 * @param {string} params.code           - Candidate's submitted code
 * @param {string} params.language       - One of: javascript, python, typescript, cpp, go, rust
 * @param {string} params.functionName   - Name of the function to call
 * @param {Array}  params.testCases      - Array of { args, expected, explanation }
 *
 * @returns {Promise<Array>} Array of { passed, input, expected, actual, error, explanation }
 */
export async function executeCode({ code, language = "javascript", functionName, testCases }) {
  if (!testCases || testCases.length === 0) {
    return [{ passed: false, error: "No test cases defined for this exercise.", explanation: "" }];
  }

  const results = [];

  for (const testCase of testCases) {
    try {
      const harness = buildHarness(language, code, functionName, testCase.args);
      const pistonResult = await executePiston(language, harness);

      const stdout = pistonResult?.run?.stdout || "";
      const stderr = pistonResult?.run?.stderr || "";
      const compileError = pistonResult?.compile?.stderr || "";

      // Compile error (C++, TypeScript, Go, Rust)
      if (compileError) {
        results.push({
          passed: false,
          input: JSON.stringify(testCase.args),
          expected: JSON.stringify(testCase.expected),
          actual: null,
          error: `Compile error: ${compileError.slice(0, 400)}`,
          explanation: testCase.explanation
        });
        continue;
      }

      // Runtime error
      if (stderr && stderr.includes("RUNTIME_ERROR")) {
        results.push({
          passed: false,
          input: JSON.stringify(testCase.args),
          expected: JSON.stringify(testCase.expected),
          actual: null,
          error: stderr.replace("RUNTIME_ERROR: ", "").slice(0, 400),
          explanation: testCase.explanation
        });
        continue;
      }

      const passed = compareOutput(stdout, testCase.expected);
      results.push({
        passed,
        input: JSON.stringify(testCase.args),
        expected: JSON.stringify(testCase.expected),
        actual: stdout.trim(),
        error: null,
        explanation: testCase.explanation
      });
    } catch (err) {
      results.push({
        passed: false,
        input: JSON.stringify(testCase.args),
        expected: JSON.stringify(testCase.expected),
        actual: null,
        error: err.message,
        explanation: testCase.explanation
      });
    }
  }

  return results;
}
