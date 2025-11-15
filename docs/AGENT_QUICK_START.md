# Agent Quick Start

Purpose: quick steps for non-admin users to request the agent to implement validation logic.

1. Create or commit your Spec file into `docs/` (e.g., `docs/onboarding-validation.md`).
2. Open `.github/agents/templates/request-template.md` and fill placeholders:
   - feature-name, spec-file-name, form path, api handler path, DB path, priority, deadline.
3. Copy the filled template and paste into the Copilot/Agent input UI.
4. Run the agent.
5. Review draft PR created by agent:
   - Run commands listed in PR to verify locally (yarn install; yarn test; yarn lint).
   - Answer Questions in PR if any.
6. Approve/merge after review and successful CI.

Notes:
- If your repo uses a different DB layer, mention that in the request.
- If the agent lacks push rights it will return a patch or instructions instead of creating a PR.
