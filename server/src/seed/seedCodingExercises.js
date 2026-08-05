import CodingExercise from "../models/CodingExercise.js";

const exercises = [
  // ─── Existing: JavaScript-only ────────────────────────────────────────────
  {
    title: "Debounced Search Suggestions",
    role: "Frontend Developer",
    difficulty: "medium",
    functionName: "debounce",
    language: "javascript",
    prompt:
      "Implement a debounce helper that delays execution until the user stops typing. The debounced function should wait the specified delay in milliseconds after the last call before invoking the original function. Return a wrapped function and preserve the latest arguments.",
    starterCode: "function debounce(fn, delay) {\n  // write your solution here\n}\n",
    hints: [
      "You will need a closure to retain the timeout id between calls.",
      "Clear the previous timeout before scheduling the next call.",
      "Use setTimeout and clearTimeout — the wrapper function should return nothing, just schedule the delayed call."
    ],
    topics: ["javascript", "frontend", "closures", "performance"],
    testCases: [
      {
        args: [null, 200],
        expected: "function",
        explanation: "debounce should return a callable wrapper function."
      }
    ]
  },

  // ─── Existing: JavaScript-only ────────────────────────────────────────────
  {
    title: "Rate Limiter Log Aggregation",
    role: "Backend Developer",
    difficulty: "medium",
    functionName: "topUsersByRequestCount",
    language: "javascript",
    prompt:
      "Build a function that groups API request logs by user id and returns the top 3 users by request count. Each log is an object with a userId field. Return an array of objects with userId and count, sorted descending by count.",
    starterCode:
      "function topUsersByRequestCount(logs) {\n  // logs: [{ userId: 'u1', path: '/api' }]\n  // return [{ userId, count }] sorted desc\n}\n",
    hints: [
      "Use a Map or plain object to accumulate counts per userId.",
      "Convert the map to an array of [userId, count] pairs, then sort descending.",
      "Use Object.entries() to convert the accumulator, then .sort((a, b) => b[1] - a[1]).slice(0, 3)."
    ],
    topics: ["node", "algorithms", "data-processing"],
    testCases: [
      {
        args: [[{ userId: "u1" }, { userId: "u2" }, { userId: "u1" }]],
        expected: [{ userId: "u1", count: 2 }, { userId: "u2", count: 1 }],
        explanation: "Repeated ids should accumulate correctly and be sorted by count."
      }
    ]
  },

  // ─── Existing: JavaScript-only ────────────────────────────────────────────
  {
    title: "Merge Busy Meeting Slots",
    role: "Full Stack Developer",
    difficulty: "hard",
    functionName: "mergeIntervals",
    language: "javascript",
    prompt:
      "Given an array of time intervals, merge overlapping intervals and return the normalized schedule in ascending order. Two intervals overlap if one starts before the other ends.",
    starterCode:
      "function mergeIntervals(intervals) {\n  // intervals: [[1,3],[2,5],[8,10]]\n  // return [[1,5],[8,10]]\n}\n",
    hints: [
      "Sort the intervals by their start value before processing.",
      "Iterate through sorted intervals and compare each to the last merged interval in your result array.",
      "If the current interval starts before or at the end of the last merged interval, extend the end. Otherwise push it as a new interval."
    ],
    topics: ["algorithms", "scheduling", "arrays"],
    testCases: [
      {
        args: [[[1, 3], [2, 5], [8, 10]]],
        expected: [[1, 5], [8, 10]],
        explanation: "The first two intervals overlap and should collapse into one."
      },
      {
        args: [[[1, 4], [4, 5]]],
        expected: [[1, 5]],
        explanation: "Touching intervals (end = start) should be merged."
      }
    ]
  },

  // ─── New: Two Sum (multi-language) ────────────────────────────────────────
  {
    title: "Two Sum",
    role: "Full Stack Developer",
    difficulty: "easy",
    functionName: "twoSum",
    language: "javascript",
    prompt:
      "Given an array of integers nums and an integer target, return the indices of the two numbers that add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice. Return the answer in any order.",
    starterCode:
      "function twoSum(nums, target) {\n  // Return [index1, index2]\n}\n",
    hints: [
      "A brute force approach with two nested loops works but is O(n²) — can you do better?",
      "A hash map lets you look up the complement (target - current number) in O(1) time as you iterate.",
      "For each number, check if (target - num) is already in the map. If yes, return [map[complement], currentIndex]. If not, add num → index to the map."
    ],
    topics: ["arrays", "hash-map", "algorithms"],
    testCases: [
      {
        args: [[2, 7, 11, 15], 9],
        expected: [0, 1],
        explanation: "nums[0] + nums[1] = 2 + 7 = 9"
      },
      {
        args: [[3, 2, 4], 6],
        expected: [1, 2],
        explanation: "nums[1] + nums[2] = 2 + 4 = 6"
      },
      {
        args: [[3, 3], 6],
        expected: [0, 1],
        explanation: "Same value at different indices is valid."
      }
    ]
  },

  // ─── New: Valid Parentheses ───────────────────────────────────────────────
  {
    title: "Valid Parentheses",
    role: "Full Stack Developer",
    difficulty: "easy",
    functionName: "isValid",
    language: "javascript",
    prompt:
      "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid. An input string is valid if: open brackets must be closed by the same type of brackets, and open brackets must be closed in the correct order.",
    starterCode:
      "function isValid(s) {\n  // Return true or false\n}\n",
    hints: [
      "A stack is the natural data structure for this problem — last opened must be first closed.",
      "Push opening brackets onto the stack. When you encounter a closing bracket, check if it matches the top of the stack.",
      "At the end, the stack should be empty. Use a map like { ')': '(', '}': '{', ']': '[' } for O(1) lookup of the matching opener."
    ],
    topics: ["stack", "strings", "algorithms"],
    testCases: [
      {
        args: ["()"],
        expected: true,
        explanation: "Simple valid pair."
      },
      {
        args: ["()[]{}"],
        expected: true,
        explanation: "Multiple valid pairs in sequence."
      },
      {
        args: ["(]"],
        expected: false,
        explanation: "Mismatched bracket types."
      },
      {
        args: ["([)]"],
        expected: false,
        explanation: "Incorrectly interleaved brackets."
      },
      {
        args: ["{[]}"],
        expected: true,
        explanation: "Properly nested brackets."
      }
    ]
  },

  // ─── New: Longest Substring Without Repeating Characters ─────────────────
  {
    title: "Longest Substring Without Repeating Characters",
    role: "Full Stack Developer",
    difficulty: "medium",
    functionName: "lengthOfLongestSubstring",
    language: "javascript",
    prompt:
      "Given a string s, find the length of the longest substring without repeating characters. A substring is a contiguous sequence of characters within the string.",
    starterCode:
      "function lengthOfLongestSubstring(s) {\n  // Return the length as an integer\n}\n",
    hints: [
      "Use a sliding window approach — maintain a left and right pointer bounding your current window.",
      "Use a Set or Map to track which characters are currently in the window. When a duplicate is found, shrink the window from the left.",
      "Move the right pointer one step at a time. When s[right] is already in the window, move the left pointer past the previous occurrence. Track the max window size seen."
    ],
    topics: ["sliding-window", "strings", "hash-map"],
    testCases: [
      {
        args: ["abcabcbb"],
        expected: 3,
        explanation: "The answer is 'abc' with length 3."
      },
      {
        args: ["bbbbb"],
        expected: 1,
        explanation: "The answer is 'b' with length 1."
      },
      {
        args: ["pwwkew"],
        expected: 3,
        explanation: "The answer is 'wke' with length 3."
      },
      {
        args: [""],
        expected: 0,
        explanation: "Empty string has length 0."
      }
    ]
  },

  // ─── New: Flatten Nested Array ────────────────────────────────────────────
  {
    title: "Flatten Nested Array",
    role: "Frontend Developer",
    difficulty: "medium",
    functionName: "flattenArray",
    language: "javascript",
    prompt:
      "Implement a function that takes a deeply nested array and returns a flat single-level array with all the values. Do not use Array.prototype.flat(). The nesting can be arbitrarily deep.",
    starterCode:
      "function flattenArray(arr) {\n  // Return a flat array without using .flat()\n}\n",
    hints: [
      "This is a natural fit for recursion — if an element is an array, recurse into it; otherwise, collect the value.",
      "Use Array.isArray() to detect nested arrays. Accumulate results into an output array as you recurse.",
      "A reduce-based approach: arr.reduce((acc, val) => Array.isArray(val) ? acc.concat(flattenArray(val)) : [...acc, val], [])"
    ],
    topics: ["recursion", "arrays", "javascript"],
    testCases: [
      {
        args: [[1, [2, 3], [4, [5, 6]]]],
        expected: [1, 2, 3, 4, 5, 6],
        explanation: "All nested values should be flattened to a single level."
      },
      {
        args: [[[1], [2], [3]]],
        expected: [1, 2, 3],
        explanation: "One level of nesting."
      },
      {
        args: [[1, [2, [3, [4]]]]],
        expected: [1, 2, 3, 4],
        explanation: "Deeply nested — 4 levels."
      }
    ]
  }
];

export default async function seedCodingExercises() {
  const count = await CodingExercise.countDocuments();

  if (count > 0) {
    // If we have fewer exercises than the current set, add missing ones
    if (count < exercises.length) {
      const existing = await CodingExercise.find({}, "title");
      const existingTitles = new Set(existing.map((e) => e.title));
      const missing = exercises.filter((e) => !existingTitles.has(e.title));
      if (missing.length > 0) {
        await CodingExercise.insertMany(missing);
      }
    }
    return;
  }

  await CodingExercise.insertMany(exercises);
}
