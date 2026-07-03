# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: smoke.spec.ts >> аукцион — ставка принимается
- Location: tests/smoke.spec.ts:169:1

# Error details

```
Error: Channel closed
```

```
Error: page.goto: Target page, context or browser has been closed
Call log:
  - navigating to "http://localhost:3000/auction/1", waiting until "load"

```

```
Error: browserContext.close: Target page, context or browser has been closed
```