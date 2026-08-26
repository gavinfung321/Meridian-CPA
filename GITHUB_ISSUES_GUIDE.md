# GitHub Issues Guide — Meridian CPA

> **Feed this file at the start of every new chat.**
> This guide ensures every AI dev agent maintains consistent, disciplined issue tracking across the project lifecycle.

---

## 🔗 Project Reference

| Field | Value |
|---|---|
| **Repository** | `gavinfung321/Meridian-CPA` |
| **GitHub URL** | https://github.com/gavinfung321/Meridian-CPA |
| **MCP Server** | `github-mcp-server` |

---

## 🧠 Core Philosophy

Every piece of work — no matter how small — must be traceable via a GitHub Issue.

- **Before** you write code → find or create a relevant issue.
- **While** you work → keep the issue status current.
- **After** you finish → close the issue with a summary comment.

Never silently complete work. Always leave a paper trail.

---

## 📋 Issue Lifecycle

```
OPEN  ──►  IN PROGRESS  ──►  DONE (Closed)
           (add comment)      (close + comment)
```

| Stage | Agent Action |
|---|---|
| **Starting work** | Add a comment: `"Starting work on this: [brief description of approach]"` |
| **Blocked / paused** | Add a comment explaining what is blocking progress |
| **Done** | Close the issue with a final comment summarising what was done |

---

## 🏷️ Labels to Use

Always apply at least one label when creating an issue. Use the following standard labels:

| Label | When to Use |
|---|---|
| `feature` | New functionality being added |
| `bug` | Something broken that needs fixing |
| `enhancement` | Improvement to existing functionality |
| `design` | UI/UX or visual changes |
| `refactor` | Code restructuring without behaviour change |
| `documentation` | Docs, comments, or guide updates |
| `chore` | Dependency updates, config, tooling |
| `question` | Needs clarification before work can begin |

> If a label does not exist yet on the repo, create it before applying it.

---

## 🎯 Milestones

Milestones represent major phases or releases of the project. Every issue **must** be assigned to a milestone.

### Rules:
1. **Check existing milestones first** before creating a new one.
2. If the work fits a current milestone, assign it — do not create a new one.
3. Only create a new milestone if the work represents a clearly new project phase.
4. Update the milestone due date if scope changes.

### Milestone naming convention:
```
v1.0 — [Short Phase Name]       e.g. v1.0 — Foundation & Setup
v1.1 — [Short Phase Name]       e.g. v1.1 — Core Pages
v2.0 — [Short Phase Name]       e.g. v2.0 — Launch Ready
```

---

## 📝 Issue Format

### Title
Use the format:
`[Type]: Short, clear description`

Examples:
- `Feature: Add contact form to homepage`
- `Bug: Navigation menu not closing on mobile`
- `Design: Update hero section to match Figma v3`
- `Refactor: Extract reusable Button component`

### Body Template
Every new issue must follow this structure:

```markdown
## Summary
One or two sentences describing what this issue is about.

## Context
Why this is needed. Link to Figma frames, prior issues, or decisions if relevant.

## Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

## Notes
Any technical constraints, risks, or considerations.
```

---

## 🤖 Agent Instructions — Step by Step

Follow this checklist at the **start of every chat session**:

### 1. Understand the Task
Read the user's request and identify:
- What is being built or changed?
- Is this a new feature, a bug fix, or an improvement?

### 2. Check Existing Issues
Before creating anything, search GitHub Issues:
- Use `list_issues` or `search_issues` via the MCP tool.
- If a matching open issue exists → use it. Do not duplicate.
- If a related issue exists but is closed → reference it in a new one.

### 3. Create or Update the Issue
**If creating new:**
- Apply the body template above.
- Assign the correct label(s).
- Assign to the correct milestone.
- Post a starting comment.

**If updating existing:**
- Post a comment with your intended approach.
- Update labels or milestone if the scope has changed.

### 4. Do the Work
Execute the task normally. Reference the issue number in any meaningful decisions.

### 5. Close the Issue
When the task is fully complete:
- Post a closing comment with a brief summary of what was done.
- List any follow-up issues that were created as a result.
- Close the issue via the MCP tool.

---

## 🔄 Updating Milestones Mid-Sprint

If scope changes during a session:
1. Note the change in a comment on the affected issue.
2. Create new issues for the expanded scope.
3. Reassign to an appropriate milestone.
4. Never silently expand scope without updating tracking.

---

## 🚫 What Agents Must Never Do

- ❌ Complete work without creating or referencing an issue.
- ❌ Close an issue without a summary comment.
- ❌ Create duplicate issues — always search first.
- ❌ Leave issues in "open" state when work is done.
- ❌ Create issues without a milestone or labels.
- ❌ Create a new milestone when an existing one fits.

---

## ✅ Quick Reference Checklist

```
Before starting:
  [ ] Searched for existing issues
  [ ] Created or identified the relevant issue
  [ ] Issue has: title, body, label, milestone
  [ ] Posted "starting work" comment

During work:
  [ ] Added comments for blockers or pivots

After completing:
  [ ] Posted closing summary comment
  [ ] Issue is closed
  [ ] New follow-up issues created if needed
```

---

*This guide is a living document. Update it when conventions change.*
