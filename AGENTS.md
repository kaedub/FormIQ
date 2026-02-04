<!-- nx configuration start-->
<!-- Leave the start & end comments to automatically receive updates. -->

# General Guidelines for working with Nx

- When running tasks (for example build, lint, test, e2e, etc.), always prefer running the task through `nx` (i.e. `nx run`, `nx run-many`, `nx affected`) instead of using the underlying tooling directly
- You have access to the Nx MCP server and its tools, use them to help the user
- When answering questions about the repository, use the `nx_workspace` tool first to gain an understanding of the workspace architecture where applicable.
- When working in individual projects, use the `nx_project_details` mcp tool to analyze and understand the specific project structure and dependencies
- For questions around nx configuration, best practices or if you're unsure, use the `nx_docs` tool to get relevant, up-to-date docs. Always use this instead of assuming things about nx configuration
- If the user needs help with an Nx configuration or project graph error, use the `nx_workspace` tool to get any errors

<!-- nx configuration end-->

# Additional Agent Rules

- Follow strict TypeScript practices; for Temporal, keep workflows deterministic and avoid importing activities directly.
- Never use any and resort to good typing
- Never use "magic strings" to handle undefined or null values.
- Always outline a plan before proposing changes and review it against the request and app context; do not edit code or run mutating commands without user approval.
- Do not assume external versions or defaults; keep responses concise and relevant.
- Provide commands (lint/build/test/install/docker/etc.) instead of running them; only run basic read-only commands for context.
- Avoid obscure workarounds or creating extra artifacts (tmp folders, new tools) without explaining and getting approval; consult docs before introducing new tools.
