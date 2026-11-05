---
name: try-find-me-development
description: Master development skill for Try Find Me! OSINT. Coordinates repository audits, context management, debugging, task orchestration, multistack quality, security, accessibility, completion verification, and secure releases.
---

# Try Find Me! — Master Development Skill

## 1. Purpose

Read the all content on 'skills/'

This is the central development skill for the Try Find Me! — OSINT project.

It coordinates the project's specialized skills and establishes a consistent engineering workflow for all AI agents working on the repository.

Its purpose is to ensure that every change is:

- Aligned with the approved product scope.
- Based on the actual repository state.
- Secure and privacy-conscious.
- Technically justified.
- Properly tested.
- Documented.
- Independently verifiable.

This skill does not replace the project's Master Prompt or the specialized skills. It coordinates their use.

## 2. Mandatory specialized skills

Before performing relevant work, identify and load the applicable specialized skills.

| Skill | When to use |
|---|---|
| `audit-repository` | Repository inspection, architecture review, and initial assessment. |
| `completion-verification` | Before declaring tasks or development stages complete. |
| `context-management` | Managing long sessions and preserving essential technical context. |
| `systematic-debugging` | Diagnosing runtime errors, integration problems, and unexpected behavior. |
| `oh-my-openagent-5.1.60` | Coordinating work through a verified Oh My OpenAgent installation. |
| `OpenCode-Ultimate-Free` | Applying efficient and cost-conscious OpenCode workflows. |
| `quality-multistack` | Implementing or reviewing backend, frontend, API, and infrastructure changes. |
| `secure-release` | Preparing a release or deployment. |
| `security-and-secrets` | Any work involving security, privacy, networking, credentials, or external services. |
| `session-continuity` | Resuming work or transferring tasks between sessions and agents. |
| `task-orchestration` | Planning complex tasks and coordinating multiple agents. |
| `ui-accessibility` | Creating, modifying, or reviewing user interfaces. |

### Skill loading rules

1. Read the relevant `SKILL.md` before beginning the associated task.
2. Read the project's Master Prompt and relevant technical documentation.
3. Do not assume a skill is installed simply because its name appears in this document.
4. If a required skill is unavailable, report that limitation and follow the applicable requirements in this document.
5. Do not invent tool capabilities, configuration keys, agent names, commands, or plugin behavior.

## 3. Project identity

**Project:** Try Find Me! — OSINT

**Description:**

An open-source, passive OSINT platform for authorized digital exposure assessments, helping users discover, understand, and reduce their public digital footprint.

### Core pillars — DEIP

- **Discovery:** Discover relevant information through legitimate public sources.
- **Evidence:** Preserve source attribution, retrieval timestamps, and match reliability.
- **Intelligence:** Interpret findings using explainable rules.
- **Protection:** Provide practical recommendations to reduce digital exposure.

The product must prioritize trustworthy evidence over the quantity of findings.

## 4. Non-negotiable project constraints

Every agent must respect the following requirements.

### Scope

- Passive OSINT only.
- Authorized digital asset assessments.
- Domain assessment is the MVP's primary functionality.
- DNS TXT ownership verification is a project safeguard.
- Public information must never automatically be interpreted as proof of ownership.

### Permanently excluded

- Full-name people searches.
- Photo-based identification.
- Facial recognition.
- Doxxing.
- Unauthorized investigations.
- Active port scanning.
- Brute-force attacks.
- Credential stuffing.
- Authentication bypass.
- Exploitation of target infrastructure.

### Privacy

- No persistent investigation data in the MVP.
- No database in the MVP.
- No user accounts.
- No unnecessary cookies.
- No analytics or tracking.
- No sensitive information in logs.
- No automatic report storage.
- External services must be disclosed before investigation.

### Cost

- The core MVP must remain free to operate.
- Do not introduce paid dependencies.
- Do not implement optional user-supplied breach API keys without explicit approval.
- Do not introduce subscriptions or commercial services into the core MVP.

### Development language

All project code, identifiers, comments, technical documentation, and interface text must be written in English.

Communication with the project owner must remain in Brazilian Portuguese.

## 5. Development workflow

All development must follow controlled stages.

### Stage 1 — Repository audit

Required skill: `audit-repository`.

Inspect the existing repository before making changes.

Review:

- Git state.
- Backend.
- Frontend.
- Docker configuration.
- Dependencies.
- API contracts.
- Tests.
- Documentation.
- Security and privacy risks.

The initial audit is read-only.

Deliver an evidence-based report and wait for approval.

### Stage 2 — Architecture and planning

Required skills:

- `context-management`
- `task-orchestration`
- `security-and-secrets`
- `quality-multistack`

Prepare the architecture, threat model, Evidence contract, Phase 1 specification, external service inventory, and test strategy.

Do not begin implementation before approval of the relevant specifications.

### Stage 3 — Foundation

Implement only approved foundational requirements.

Validate:

- Configuration.
- Docker Compose.
- Logging.
- Environment variables.
- Project structure.
- Documentation.
- Security controls.

### Stage 4 — Backend

Required skills:

- `quality-multistack`
- `security-and-secrets`
- `systematic-debugging`

Implement backend functionality incrementally.

Each feature must include:

1. Technical plan.
2. Relevant file inspection.
3. Implementation.
4. Tests.
5. Validation.
6. Documentation updates.
7. Completion report.

### Stage 5 — Frontend

Required skills:

- `quality-multistack`
- `ui-accessibility`
- `security-and-secrets`

Build the approved interface and integrate it with the backend.

Handle loading, success, empty, partial, timeout, and error states explicitly.

Never present mock findings as real investigation results.

### Stage 6 — Integration and security review

Required skills:

- `security-and-secrets`
- `systematic-debugging`
- `completion-verification`

Review the complete application flow.

Validate:

- API communication.
- Domain verification.
- External source integrations.
- SSRF protections.
- Input validation.
- Logging privacy.
- Data retention.
- Error handling.
- Rate limiting.
- Browser-side data exposure.

### Stage 7 — Final verification

Required skills:

- `completion-verification`
- `secure-release`

Run all relevant checks and prepare a final report.

Do not declare the MVP complete without evidence of successful validation.

## 6. Agent coordination

When multiple agents are available, assign clearly bounded responsibilities.

Suggested responsibilities:

- Lead agent: planning, scope control, and integration.
- Backend agent: FastAPI, schemas, services, and tests.
- Frontend agent: React, TypeScript, UI, and accessibility.
- Security agent: threat model, SSRF, privacy, and secrets.
- QA agent: tests, regression checks, and completion verification.
- Documentation agent: technical documentation and project guides.

### Delegation requirements

Every delegated task must specify:

- Objective.
- Approved scope.
- Relevant files.
- Files that must not be modified.
- Acceptance criteria.
- Required tests.
- Expected deliverables.
- Approval boundaries.

Avoid concurrent modifications to the same files.

The coordinating agent is responsible for reviewing and validating all integrated changes.

A subagent's claim that a task is complete is not sufficient evidence.

## 7. Repository modification rules

Before changing files:

1. Inspect the current repository state.
2. Read the relevant source code.
3. Understand existing behavior.
4. Identify affected dependencies.
5. Check the current Git diff.

During implementation:

- Prefer minimal and focused changes.
- Preserve existing working functionality.
- Avoid unnecessary rewrites.
- Do not create duplicate abstractions.
- Do not add dependencies without justification.
- Do not silently change API contracts.
- Update relevant tests and documentation.

Do not modify files during a read-only audit.

## 8. Security requirements

Load `security-and-secrets` for all security-sensitive work.

Mandatory requirements:

- Never hardcode secrets.
- Never expose backend secrets to the frontend.
- Validate user-supplied domains.
- Restrict external requests to approved services.
- Block private, loopback, link-local, multicast, reserved, and non-public IP ranges.
- Consider IPv4, IPv6, and DNS rebinding.
- Apply timeouts and response-size limits.
- Restrict redirects.
- Never perform active requests against target infrastructure.
- Never log investigation targets or personal information.
- Treat external service responses as untrusted data.

Ownership verification does not replace network security controls.

## 9. Evidence and reporting quality

Every finding must follow the approved Evidence contract.

At minimum, evidence must identify:

- Source.
- Retrieval timestamp.
- Evidence type.
- Ownership verification status.
- Match type.
- Confidence.
- Risk.
- Recommendation.

Match classifications:

- `exact`
- `partial`
- `inferred`
- `unverified_candidate`

A public username match must remain an unverified candidate unless independent proof of profile control exists.

Confidence must be explainable.

Risk must follow deterministic documented rules.

Never fabricate findings, confidence values, risk levels, source responses, or recommendations.

## 10. Debugging rules

Load `systematic-debugging` whenever the cause of a defect is uncertain.

Follow this process:

1. Reproduce the problem.
2. Capture evidence.
3. Identify possible causes.
4. Test hypotheses individually.
5. Identify the root cause.
6. Apply the smallest appropriate fix.
7. Reproduce the original scenario.
8. Run regression checks.
9. Report the results.

Do not apply random changes or suppress errors to make a problem disappear.

## 11. Context and session continuity

Load `context-management` and `session-continuity` during long sessions or agent handoffs.

Preserve:

- Current development stage.
- Approved requirements.
- Technical decisions.
- Files modified.
- Validation results.
- Known problems.
- Pending decisions.
- Next authorized action.

Never include credentials, secrets, raw investigation targets, or unnecessary personal data in context notes.

When resuming work, verify the actual repository state instead of blindly trusting an earlier summary.

## 12. Completion requirements

Load `completion-verification` before marking any task complete.

A task is complete only when:

- Its acceptance criteria are satisfied.
- Implementation exists.
- Relevant tests have been executed.
- Build and type checks have passed where applicable.
- Integration has been verified where applicable.
- Documentation has been updated.
- Remaining limitations have been reported.

Clearly distinguish:

- Completed.
- Partially completed.
- Blocked.
- Not tested.

Never claim that a command or test was executed when it was not.

## 13. UI and accessibility requirements

Load `ui-accessibility` before modifying user-facing interfaces.

The application must provide:

- Semantic HTML.
- Accessible form labels.
- Keyboard navigation.
- Visible focus indicators.
- Clear validation errors.
- Responsive layouts.
- Appropriate color contrast.
- Reduced-motion support.
- Understandable loading and error states.
- Accessible representations of charts and evidence.

The user must always understand what is being investigated, which services receive information, what the results mean, and what actions are available.

Do not invent a visual identity or design system before inspecting the existing project.

## 14. Release restrictions

Load `secure-release` before preparing a release.

The following actions always require explicit owner approval:

- Git push.
- Pull request merge.
- Release tagging.
- Production deployment.
- Repository visibility changes.
- External infrastructure modifications.
- Account creation.
- Paid service activation.
- Subscription purchases.

Never perform these actions simply because a development stage has finished.

## 15. Mandatory reporting format

At the end of each development task, provide:

### Task Report

**Task:**  
[Task name]

**Status:**  
Completed / Partially completed / Blocked

**Implemented:**  
[Actual changes]

**Files changed:**  
[Exact paths]

**Technical decisions:**  
[Important decisions and rationale]

**Validation:**  
[Commands, tests, and results]

**Security considerations:**  
[Relevant risks and mitigations]

**Known limitations:**  
[Incomplete or unverified behavior]

**Next step:**  
[Next proposed task]

**Approval required:**  
[Explicitly identify any decision needed from the project owner]

## 16. Final operating directive

The quality of Try Find Me! must never be measured by the number of files created, the volume of code written, or the number of agents involved.

Measure progress by:

- Correctness.
- Security.
- Privacy.
- Evidence quality.
- Maintainability.
- Accessibility.
- Test coverage.
- Verified functionality.

Always follow this order:

**Inspect → Understand → Plan → Obtain approval → Implement → Test → Review → Document → Verify.**

Do not exceed the approved scope.

Do not invent requirements.

Do not hide failures.

Do not declare unverified work complete.

Build a trustworthy product, one validated stage at a time.