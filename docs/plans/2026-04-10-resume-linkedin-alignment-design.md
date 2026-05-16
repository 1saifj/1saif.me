# Resume LinkedIn Alignment Design

## Goal

Align the portfolio resume and printable CV with the user's current LinkedIn profile while upgrading the writing quality and information hierarchy so the result reads like a professional human-written CV rather than a copied profile export.

## Scope

This design covers the following resume surfaces:

- `src/components/Resume.tsx`
- `src/components/CareerTimeline.tsx`
- `src/pages/ResumePage.tsx`
- `public/cv.html`

## Source of Truth

LinkedIn is the factual source of truth for:

- role titles
- employers
- dates
- work modes
- locations
- named projects and visible skills

The implementation may tighten wording and improve structure, but it must not invent new roles, dates, outcomes, or unsupported claims.

## Content Rules

### Keep

- Current headline direction centered on `Lead Software Engineer`
- Experience chronology from Salasto, University of Kufa, Al Qaseh, Morabaa Software Solutions, and Al-Aaml
- University of Kufa projects explicitly named in the profile:
  - Kufa Grad Tracking Platform
  - Information Bank Smart App
- Skills directly visible in the provided LinkedIn content

### Remove or De-emphasize

- mixed-source sections not supported by the provided LinkedIn profile
- overly academic or ancillary sections that weaken recruiter focus
- AI-sounding filler, generic motivational phrasing, and inflated claims

## Information Architecture

### Resume page

The interactive resume should present:

1. A concise professional summary
2. A focused contact panel
3. Grouped core skills
4. A rewritten experience timeline
5. A selected projects section based on LinkedIn-backed contributions

### Printable CV

The printable HTML CV should mirror the same professional narrative and major facts, with a conventional single-column CV structure:

1. Header
2. Summary
3. Core skills
4. Professional experience
5. Selected projects

## Tone and Style

- Use direct, restrained language
- Prefer specific scope and ownership over buzzwords
- Keep bullets compact and readable
- Avoid decorative phrasing that feels generated
- Maintain consistency between web and print versions

## Constraints

- The repo is currently dirty, so resume changes must stay isolated to resume-related files and new docs only.
- Existing route structure should remain intact.
- Download behavior should keep pointing at `public/cv.html` unless there is a clear reason to change it.

## Verification Plan

Verification should include:

- targeted tests for updated resume content
- build verification for the React app
- manual diff review to confirm only resume-related files changed for this task
