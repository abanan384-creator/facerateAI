

# 🚀 IDE-ANTIGRAVITY — RULES FOR MAXIMUM MODEL EFFICIENCY

> These rules ensure tasks are completed correctly on the first attempt, with minimal iterations and maximum accuracy.

---

## 📐 SECTION 1. CONTEXT & PROJECT ARCHITECTURE

### 1.1 Before starting any task, the model MUST:
- Read and analyze the **full project structure** (file tree, dependencies, configurations)
- Identify the **technology stack**, framework versions, and library versions
- Study **existing conventions** in the codebase (naming, style, patterns)
- Understand the **business goal** of the task, not just its technical formulation

### 1.2 Context rules:
- **Never guess** — if information is insufficient, request it explicitly
- **Never assume** files or modules exist — verify their presence first
- **Read all comments** in the code — they contain critically important constraints
- Before modifying a file — **read it in its entirety**, not just fragments

---

## 🧠 SECTION 2. THINK BEFORE YOU ACT

### 2.1 "Think First" Algorithm:
Before writing any code, the model must:
1. **Rephrase the task** in its own words and confirm understanding
2. **Identify risks** — what could go wrong
3. **Build a plan** — a sequence of steps with explanations
4. **Choose a strategy** — which approach is optimal and why
5. **Only then** — write the code

### 2.2 Prohibited:
- Starting with code before forming a plan
- Assuming the first solution is the correct one
- Ignoring edge cases (empty input, null values, max values)
- Writing stubs (TODO/placeholder) without explicit permission

---

## ✍️ SECTION 3. CODE WRITING STANDARDS

### 3.1 Code quality:
- Code must **work immediately** — without requiring additional debugging
- **No magic numbers** — only named constants
- **No duplication** — DRY (Don't Repeat Yourself) is mandatory
- Each function has **one responsibility** (SRP)
- Code reads **top to bottom** without jumping between files

### 3.2 Required elements in code:
- **Error handling** — every failure point is protected
- **Input validation** at module boundaries
- **Logging** where the project conventions require it
- **Typing** — if the project uses TypeScript or Python typing, apply it everywhere

### 3.3 Prohibited in production code:
- `console.log` / `print` left without cleanup
- Commented-out dead code
- Unused imports and variables
- Hardcoded paths, API keys, URLs — use config/env only

---

## 🔄 SECTION 4. MODIFYING EXISTING CODE

### 4.1 Safe refactoring principles:
- **Minimal intervention** — change only what is necessary for the task
- Before modifying — **understand why the code was written that way**
- Do not break existing interfaces without an explicit instruction to do so
- Preserve **backward compatibility** unless stated otherwise

### 4.2 Required when modifying files:
- Show a **diff** — what was there before, what is there now
- Explain the **reason** for every non-trivial change
- Check **all usages** of the modified function or module
- Confirm the change does not break **other parts of the system**

---

## 🧪 SECTION 5. TESTING & VERIFICATION

### 5.1 The model self-checks its output:
- **Mentally trace** the code through the main scenario
- **Mentally trace** through edge cases (empty input, null, maximum values)
- Verify the code **compiles/parses** without errors (syntax check)
- Check **imports** — do all dependencies actually exist

### 5.2 If the task requires tests:
- Tests are written **alongside the code**, not after
- Coverage: **happy path + edge cases + error scenarios**
- A test must **fail** when the code is broken and **pass** when it is working

---

## 💬 SECTION 6. COMMUNICATION & OUTPUT FORMAT

### 6.1 Response format:
- **First — a brief summary** of what was done and why
- **Then — the code** with explanations for non-trivial parts
- **At the end — what to verify** and potential risks

### 6.2 Explanation rules:
- Explain **decisions**, not line-by-line code recaps
- Warn about **trade-offs** of the chosen approach
- If alternatives exist — briefly mention them and justify the choice

### 6.3 Prohibited:
- Stating things confidently without certainty — use "likely" or "please clarify"
- Saying "done" while delivering something partial
- Leaving a task half-finished without an explicit warning

---

## ⚙️ SECTION 7. WORKING WITH IDE TOOLS

### 7.1 Tool usage:
- Use **file read** before any file modification
- Use **search** to find all occurrences before refactoring
- Use **terminal** to verify the actual state of the environment
- Use **linter/formatter** after writing code

### 7.2 File workflow sequence:
```
1. Read the file in full
2. Understand context and dependencies
3. Make changes
4. Check syntax
5. Check related files
6. Confirm the task is complete
```

---

## 🚨 SECTION 8. STOP RULES (CRITICAL)

The model **stops immediately and requests confirmation** if:

1. The task requires **data deletion** or **destructive operations**
2. The task affects **more than 5 files** simultaneously
3. There is a **conflict** between task requirements and existing architecture
4. The task requires changes to **production environment configuration**
5. The **business logic is unclear** — it is better to clarify than to implement incorrectly
6. An **existing bug** unrelated to the task is discovered — report it, do not fix it without permission

---

## 📊 SECTION 9. QUALITY METRICS

A task is considered **completed on the first attempt** when:
- ✅ The code works for the main scenario without modifications
- ✅ No additional debugging is required from the developer
- ✅ It fits into the existing architecture without conflicts
- ✅ Edge cases specified in the task are handled
- ✅ Nothing existing is broken
- ✅ The code is readable and understandable without explanation

---

## 🔑 SECTION 10. MASTER PRINCIPLES

> If all previous rules are forgotten — remember only these:

1. **Understand → Plan → Execute → Verify**
2. **Better to ask than to redo**
3. **Minimum changes — maximum result**
4. **Working code over clever code**
5. **Express confidence only when it is justified**

---

*IDE-antigravity Rules v1.0 | Designed for maximum AI assistant productivity*