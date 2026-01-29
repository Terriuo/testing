## **Project: Official Contributor Coding Guidelines**
Nasa's 10 Rules for Reliable Software; Adapted for Web3/Blockchain Development

### **Introduction**

Welcome to the team! To ensure our Web3/blockchain project is scalable, maintainable, and robust, we adhere to a set of core coding principles. These guidelines are inspired by NASA/JPL's rules for safety-critical software, adapted for modern blockchain development using Solidity and JavaScript (Node.js).

The goal is not to be overly restrictive but to promote clarity, predictability, and verifiability in our code. Following these rules helps prevent common bugs, simplify debugging, and make the codebase easier for everyone to understand and contribute to.


### **The Ten Rules for Reliable Web3/Blockchain Development**

Here are the ten core rules for contributing to this project. Each rule includes its original inspiration, the rationale for blockchain/Web3, and practical code examples in Solidity and JavaScript.

---


#### **1. Rule: Enforce Simple, Predictable Control Flow.**

*   **NASA's Original Intent:** Avoid `goto`, `setjmp`, and unbounded recursion to create a simple, analyzable control flow and prevent stack overflows.
*   **Rationale for Blockchain/Web3:** Solidity does not support recursion, and control flow should be simple to avoid gas inefficiency and security risks. In JavaScript, avoid callback hell and unbounded recursion.
*   **Code Example (Solidity & JavaScript):**

  **Bad: Complex Control Flow (Solidity)**
  ```solidity
  // Unnecessary nested loops and unclear logic
  function process(address[] memory users) public {
    for (uint i = 0; i < users.length; i++) {
      for (uint j = 0; j < users.length; j++) {
        // ...complex logic...
      }
    }
  }
  ```

  **Good: Simple, Linear Control Flow (Solidity)**
  ```solidity
  function process(address[] memory users) public {
    for (uint i = 0; i < users.length; i++) {
      // ...simple logic...
    }
  }
  ```

  **Bad: Unbounded Recursion (JavaScript)**
  ```js
  function deepSearch(obj, key) {
    // No depth limit
    if (typeof obj !== 'object' || obj === null) return null;
    for (let k in obj) {
      if (k === key) return obj[k];
      let found = deepSearch(obj[k], key);
      if (found) return found;
    }
  }
  ```

  **Good: Bounded Recursion (JavaScript)**
  ```js
  function deepSearch(obj, key, maxDepth = 5, depth = 0) {
    if (depth > maxDepth || typeof obj !== 'object' || obj === null) return null;
    for (let k in obj) {
      if (k === key) return obj[k];
      let found = deepSearch(obj[k], key, maxDepth, depth + 1);
      if (found) return found;
    }
  }
  ```

---


#### **2. Rule: All Loops Must Have a Fixed Upper Bound.**

*   **NASA's Original Intent:** Statically prove that loops cannot run indefinitely to prevent "runaway code."
*   **Rationale for Blockchain/Web3:** In Solidity, unbounded loops can cause out-of-gas errors and make contracts unusable. In JavaScript, infinite loops can freeze the app or node process.
*   **Code Example (Solidity & JavaScript):**

  **Bad: Unbounded Loop (Solidity)**
  ```solidity
  function sum(uint[] memory arr) public pure returns (uint) {
    uint total = 0;
    uint i = 0;
    while (i < arr.length) {
      total += arr[i];
      i++;
    }
    // If arr.length is huge, this can run out of gas
    return total;
  }
  ```

  **Good: Bounded Loop (Solidity)**
  ```solidity
  function sum(uint[] memory arr) public pure returns (uint) {
    require(arr.length <= 100, "Array too large");
    uint total = 0;
    for (uint i = 0; i < arr.length; i++) {
      total += arr[i];
    }
    return total;
  }
  ```

  **Bad: Loop with No Safeguard (JavaScript)**
  ```js
  let i = 0;
  while (someCondition()) {
    // ...
    i++;
  }
  ```

  **Good: Loop with Safeguard (JavaScript)**
  ```js
  let i = 0;
  const MAX_ITER = 1000;
  while (someCondition() && i < MAX_ITER) {
    // ...
    i++;
  }
  ```

---


#### **3. Rule: No Manual Memory Management; Use Proper Cleanup.**

*   **NASA's Original Intent:** Avoid dynamic memory allocation (`malloc`, `free`) after initialization to prevent memory leaks, fragmentation, and unpredictable behavior.
*   **Rationale for Blockchain/Web3:** Solidity manages memory automatically, but in JavaScript, memory leaks can occur from uncleared intervals, listeners, or subscriptions. Always clean up resources.
*   **Code Example (JavaScript):**

  **Bad: Event Listener Without Cleanup**
  ```js
  // Node.js example
  const EventEmitter = require('events');
  const emitter = new EventEmitter();

  function start() {
    emitter.on('data', handler);
    // Never removes listener
  }
  ```

  **Good: Cleanup on Stop**
  ```js
  const EventEmitter = require('events');
  const emitter = new EventEmitter();

  function start() {
    emitter.on('data', handler);
  }
  function stop() {
    emitter.removeListener('data', handler);
  }
  ```

---


#### **4. Rule: Keep Functions Small and Focused.**

*   **NASA's Original Intent:** Functions should be no longer than a single printed page (~60 lines) to ensure they represent a single, verifiable logical unit.
*   **Rationale for Blockchain/Web3:** Large Solidity functions are hard to audit and expensive to run. Small, focused functions are easier to test and secure. In JavaScript, keep functions focused on one task.
*   **Code Example (Solidity & JavaScript):**

  **Bad: Large Solidity Function**
  ```solidity
  function process(address[] memory users, uint[] memory values) public {
    // Does too much: validation, calculation, state update
    // ...
  }
  ```

  **Good: Split into Small Functions**
  ```solidity
  function validate(address[] memory users) internal pure returns (bool) {
    // ...
  }
  function calculate(uint[] memory values) internal pure returns (uint) {
    // ...
  }
  function process(address[] memory users, uint[] memory values) public {
    require(validate(users), "Invalid users");
    uint result = calculate(values);
    // ...
  }
  ```

---


#### **5. Rule: Use Runtime Validation for External Data.**

*   **NASA's Original Intent:** Use at least two assertions per function to check for anomalous conditions and verify pre/post-conditions.
*   **Rationale for Blockchain/Web3:** Smart contracts must validate all input to prevent exploits. In JavaScript, always validate external data before using it.
*   **Code Example (Solidity & JavaScript):**

  **Bad: No Input Validation (Solidity)**
  ```solidity
  function setValue(uint value) public {
    // No validation
    storedValue = value;
  }
  ```

  **Good: Input Validation (Solidity)**
  ```solidity
  function setValue(uint value) public {
    require(value > 0 && value < 1000, "Value out of range");
    storedValue = value;
  }
  ```

  **Bad: Trusting API Data (JavaScript)**
  ```js
  function processUser(data) {
    // Assumes data is always correct
    return data.name;
  }
  ```

  **Good: Validate API Data (JavaScript)**
  ```js
  function processUser(data) {
    if (!data || typeof data.name !== 'string' || data.name.length === 0) {
      throw new Error('Invalid user data');
    }
    return data.name;
  }
  ```

---


#### **6. Rule: Declare Data at the Smallest Possible Scope.**

*   **NASA's Original Intent:** Restrict the scope of data to hide it and make it easier to diagnose issues, as fewer statements can modify it.
*   **Rationale for Blockchain/Web3:** In Solidity, declare variables inside functions or blocks when possible. In JavaScript, use `let`/`const` in the tightest scope.
*   **Code Example (Solidity & JavaScript):**

  **Bad: Broad Scope (Solidity)**
  ```solidity
  uint result;
  function calculate(uint a, uint b) public {
    result = a + b; // result is global
  }
  ```

  **Good: Local Scope (Solidity)**
  ```solidity
  function calculate(uint a, uint b) public pure returns (uint) {
    uint result = a + b;
    return result;
  }
  ```

---


#### **7. Rule: Handle All Asynchronous Operation Failures.**

*   **NASA's Original Intent:** The return value of every non-void function must be checked by the caller to handle potential errors.
*   **Rationale for Blockchain/Web3:** In Solidity, always check return values from external calls. In JavaScript, always handle promise rejections and errors.
*   **Code Example (Solidity & JavaScript):**

    **Bad: Ignoring External Call Result (Solidity)**
    ```solidity
    (bool success, ) = addr.call(abi.encodeWithSignature("doSomething()"));
    // No check for success
    ```

    **Good: Check External Call Result (Solidity)**
    ```solidity
    (bool success, ) = addr.call(abi.encodeWithSignature("doSomething()"));
    require(success, "External call failed");
    ```

    **Bad: Ignoring Promise Rejection (JavaScript)**
    ```js
    fetch('/api/data').then(res => res.json()); // No .catch()
    ```

    **Good: Handle Promise Rejection (JavaScript)**
    ```js
    fetch('/api/data')
      .then(res => res.json())
      .catch(err => console.error('Fetch failed:', err));
    ```

---


#### **8. Rule: Avoid "Magic"; Prefer Explicit Configurations.**

*   **NASA's Original Intent:** Limit the preprocessor to simple includes and macros. Avoid complex conditional compilation that creates multiple, untested versions of the code.
*   **Rationale for Blockchain/Web3:** Avoid hardcoded addresses, magic numbers, or environment checks scattered throughout the code. Use configuration files or contract constants.
*   **Code Example (Solidity & JavaScript):**

  **Bad: Hardcoded Address (Solidity)**
  ```solidity
  address constant admin = 0x123...;
  // Address is hardcoded everywhere
  ```

  **Good: Use Configurable Address (Solidity)**
  ```solidity
  address public admin;
  constructor(address _admin) {
    admin = _admin;
  }
  ```

  **Bad: Inline Environment Checks (JavaScript)**
  ```js
  function getRpcUrl() {
    if (process.env.NODE_ENV === 'production') {
      return 'https://mainnet.infura.io';
    } else {
      return 'http://localhost:8545';
    }
  }
  ```

  **Good: Centralized Configuration (JavaScript)**
  ```js
  // config.js
  module.exports = {
    rpcUrl: process.env.RPC_URL || 'http://localhost:8545',
  };
  // usage: const { rpcUrl } = require('./config');
  ```

---


#### **9. Rule: Enforce Immutability for State and Data.**

*   **NASA's Original Intent:** Restrict the use of pointers to prevent hard-to-analyze data flow and side effects. Function pointers were disallowed to ensure a clear, static call graph.
*   **Rationale for Blockchain/Web3:** In Solidity, avoid modifying storage directly unless necessary. In JavaScript, avoid mutating objects/arrays directly; use copies for updates.
*   **Code Example (Solidity & JavaScript):**

  **Bad: Direct Storage Mutation (Solidity)**
  ```solidity
  uint[] public values;
  function addValue(uint v) public {
    values.push(v); // Direct mutation
  }
  ```

  **Good: Controlled Update (Solidity)**
  ```solidity
  uint[] public values;
  function addValue(uint v) public {
    uint[] memory temp = values;
    // ...logic to update temp...
    values = temp;
  }
  ```

  **Bad: Mutating Array (JavaScript)**
  ```js
  let arr = [1,2,3];
  arr.push(4); // Direct mutation
  ```

  **Good: Immutable Update (JavaScript)**
  ```js
  let arr = [1,2,3];
  let newArr = [...arr, 4]; // Create new array
  ```

---


#### **10. Rule: Enforce Zero Linter/Compiler Warnings.**

*   **NASA's Original Intent:** Compile with all warnings enabled at the most pedantic setting from day one. All code must compile without warnings. Any warning, even if believed to be erroneous, must be addressed by rewriting the code to be clearer.
*   **Rationale for Blockchain/Web3:** Use strict compiler and linter settings for Solidity and JavaScript. CI/CD must fail on any warning or error.
*   **Code Example (Configuration Files):**

    **Solidity Compiler Settings (remix/hardhat config)**
    ```js
    // hardhat.config.js
    module.exports = {
      solidity: {
        version: "0.8.21",
        settings: {
          optimizer: { enabled: true, runs: 200 },
          evmVersion: "istanbul",
        },
      },
    };
    ```

    **ESLint (JavaScript) Key Settings**
    ```js
    module.exports = {
      extends: ["eslint:recommended"],
      rules: {
        "no-unused-vars": "error",
        "no-undef": "error",
        "no-console": "warn"
      }
    };
    ```


    //testing for notifications