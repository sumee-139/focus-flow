---
description: "New feature design mode - 新機能設計モード"
---

# New Feature Design Mode

Start working in a context specialized for new feature planning, requirements definition, and design phase.

**Note**: This command is available in both English and Japanese contexts. Use natural language appropriate to your environment.

## Execution Steps

1. **Understand Overall Project**
   - Check project purpose, target, and success criteria in `@.claude/core/overview.md`
   - Grasp existing core features, tech stack, and constraints

2. **Planning**
   - Check priority matrix and future goals in `@.claude/core/next.md`
   - Evaluate positioning and priority of new feature

3. **Use Feature Design Template**
   - Organize feature using the following format from `@.claude/core/templates.md`:
     ```
     Feature Name: [Feature name] #feature #new
     Purpose: [Problem to solve] #purpose
     User Story: [As a... I want... So that...] #story
     Acceptance Criteria: [Definition of done] #acceptance
     ```

4. **Technical Review (Only When Needed)**
   - Check `@.claude/context/tech.md` only when technical constraints are important
   - Verify consistency with existing architecture

5. **Implementation Plan**
   - Break down feature into small tasks
   - Organize dependencies, order, and estimates
   - Separate MVP (Minimum Viable Product) from additional features

6. **Record Plan**
   - Add new feature tasks to appropriate priority in `next.md`
   - Record design decisions in `history.md`

## Tags to Use
`#feature #new #planning #design #requirements #story #acceptance`

Limit loaded files to overview.md + next.md + design sections of templates for efficient feature design.