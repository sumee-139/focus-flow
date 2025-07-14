---
description: "Debug-focused mode - デバッグ特化モード"
---

# Debug-Focused Mode

Start working in a context specialized for bug investigation, error analysis, and problem solving.

## Execution Steps

1. **Understand Current Situation**
   - Check ongoing issues and Git status from `@.claude/core/current.md`
   - Grasp the status of blockers, errors, and problems

2. **Check Technical Details**
   - Confirm relevant tech stack, settings, and known issues from `@.claude/context/tech.md`
   - Check error handling, logs, and debug settings

3. **Use Problem Analysis Template**
   - Apply problem-solving template from `@.claude/core/templates.md`
   - Organize problems in the following format:
     ```
     Problem: [What is happening] #bug #error
     Reproduction steps: [Steps] #reproduce
     Expected: [Expected behavior] #expected
     Actual: [Actual behavior] #actual
     Environment: [OS/Version] #environment
     ```

4. **Debug Actions**
   - Check logs and analyze error messages
   - Review and fix related code
   - Create and execute test cases

5. **Record Resolution**
   - Record problems and solutions in `current.md`
   - Record prevention measures in `history.md`
   - Add learnings to learning log in `templates.md`

## Tags to Use
`#bug #error #debug #issue #reproduce #fix #testing`

Limit loaded files to current.md + tech.md + problem-solving sections of templates for efficient debugging.