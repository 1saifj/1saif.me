# Resume LinkedIn Alignment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rewrite the portfolio resume and printable CV so they align factually with the LinkedIn profile while reading like a polished professional CV.

**Architecture:** Keep the existing route and page structure, but update the resume content at its actual sources: the React resume shell, the timeline data, the resume page metadata, and the printable HTML CV. Add lightweight tests that lock the new summary, experience anchors, and selected projects so future edits do not silently drift.

**Tech Stack:** React 18, TypeScript, Vite, Vitest, React Testing Library, static HTML

---

### Task 1: Add regression coverage for resume content

**Files:**
- Create: `src/components/__tests__/Resume.test.tsx`
- Test: `src/components/__tests__/Resume.test.tsx`

- [ ] **Step 1: Write the failing test**

Create a test that renders the resume component and asserts the presence of the new summary heading, the Salasto role, the University of Kufa role, and the two LinkedIn-backed projects.

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/components/__tests__/Resume.test.tsx`
Expected: FAIL because the current resume content does not match the new LinkedIn-aligned copy.

- [ ] **Step 3: Write minimal implementation**

Update the resume sources to satisfy the new content expectations without changing unrelated route behavior.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/components/__tests__/Resume.test.tsx`
Expected: PASS

### Task 2: Rewrite the interactive resume surfaces

**Files:**
- Modify: `src/components/CareerTimeline.tsx`
- Modify: `src/components/Resume.tsx`
- Modify: `src/pages/ResumePage.tsx`
- Test: `src/components/__tests__/Resume.test.tsx`

- [ ] **Step 1: Refactor content structure**

Replace mixed-source timeline entries and summary copy with LinkedIn-backed content rewritten in concise CV style.

- [ ] **Step 2: Preserve page integration**

Keep the `/resume` route, navigation, and download behavior intact while updating SEO metadata to match the new profile framing.

- [ ] **Step 3: Re-run targeted test**

Run: `npm test -- src/components/__tests__/Resume.test.tsx`
Expected: PASS

### Task 3: Rewrite the printable CV

**Files:**
- Modify: `public/cv.html`

- [ ] **Step 1: Update printable content hierarchy**

Mirror the approved summary, skills, experience, and selected project structure in a conventional CV layout.

- [ ] **Step 2: Remove unsupported sections**

Delete or de-emphasize sections that are not backed by the provided LinkedIn content and weaken the recruiter-focused version.

### Task 4: Verify app integrity

**Files:**
- Test: `src/components/__tests__/Resume.test.tsx`
- Test: app build output

- [ ] **Step 1: Run targeted resume test**

Run: `npm test -- src/components/__tests__/Resume.test.tsx`
Expected: PASS

- [ ] **Step 2: Run production build**

Run: `npm run build`
Expected: Build completes successfully

- [ ] **Step 3: Review diff scope**

Run: `git diff -- docs/plans/2026-04-10-resume-linkedin-alignment-design.md docs/superpowers/plans/2026-04-10-resume-linkedin-alignment.md src/components/__tests__/Resume.test.tsx src/components/CareerTimeline.tsx src/components/Resume.tsx src/pages/ResumePage.tsx public/cv.html`
Expected: Only resume-planning and resume-content changes appear
