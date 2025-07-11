---
description: "Code review mode - コードレビューモード"
---

# Code Review Mode

Start working in a context specialized for code review, quality checking, and refactoring.

**Note**: This command is available in both English and Japanese contexts. Use natural language appropriate to your environment.

## Execution Steps

1. **Review Past Insights**
   - Check past decisions, resolved problems, and learnings from `@.claude/context/history.md`
   - Understand history of similar problems and improvements

2. **Use Review Template**
   - Apply code review checklist from `@.claude/core/templates.md`:
     ```
     Review Target: [File/Function] #review #code
     Check Items: [Points to verify] #checklist
     Improvement Suggestions: [Suggestions] #improvement
     ```

3. **Quality Check Items**
   - **Functionality**: Does the feature work correctly? #functionality #testing
   - **Error Handling**: Is exception handling appropriate? #error #exception
   - **Performance**: Are there performance issues? #performance #optimization
   - **Security**: Are there vulnerabilities? #security #vulnerability
   - **Testing**: Is test coverage sufficient? #testing #coverage

4. **Code Style Check**
   - Consistency with existing coding conventions
   - Readability and maintainability perspective
   - Appropriateness of documentation and comments

5. **Improvement Suggestions**
   - Present specific and actionable improvement suggestions
   - Assign priority (Critical/High/Medium/Low)
   - Evaluate impact scope of refactoring

6. **Record Review**
   - Record review results in `current.md`
   - Record important improvements in `history.md`
   - Add learned patterns to `templates.md`

## Tags to Use
`#review #code #quality #refactor #improvement #checklist #standards`

Limit loaded files to history.md + review sections of templates for efficient code review.