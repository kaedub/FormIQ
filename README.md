# FormIQ

- AI guide that turns a user goal into a structured roadmap the user can edit and track.
- Flow: user states a goal → guided Q&A builds context → AI summarizes → AI drafts milestones/tasks → user edits and tracks progress.

## Workspace Map

This is an integrated Nx monorepo. Apps are entry points with no `package.json`; libraries are Yarn workspace packages with `package.json` for module resolution.

### Apps (no `package.json` -- deps live in root)

- `apps/web`: React/Vite UI for goal intake, questionnaire, and roadmap view/update.
- `apps/api`: Express API for auth/project endpoints and Temporal workflow triggers.
- `apps/worker`: Temporal worker process that runs workflows and activities across task queues.

### Libraries (Yarn workspace packages)

- `packages/shared` (`@formiq/shared`): Shared types/DTOs used across API, UI, and LLM payloads.
- `packages/platform` (`@formiq/platform`): Data/integration layer (Prisma schema/client, PG adapter, OpenAI client, env loading).
- `packages/workflows` (`@formiq/workflows`): Temporal workflow definitions (runs in sandboxed V8 isolate).
- `packages/activities` (`@formiq/activities`): Temporal activities that validate input and delegate to `@formiq/platform`.

## Setup

- Ensure Node.js 20.19+ (repo currently using v25).
- Install deps: `yarn install`

## Build

- All packages: `nx run-many --target=build`
- Single project: `nx run <project>:build` (e.g., `api`, `platform`, `shared`, `workflows`, `activities`)

## Run

- API: `nx run api:serve` (builds then runs `apps/api/dist/index.js`)
- Worker: `nx run worker:run` (runs the Temporal worker via tsx)
- Web: `nx run web:serve` (starts Vite dev server)

## Database (Prisma via platform)

- Dev migration: `yarn db:migrate <name>`
- Generate client: `yarn db:generate`
- Push schema without migration: `yarn db:push`
- Inspect data: `yarn db:studio`

## Tests

- Not configured yet. Add a test target per project and run with `nx run <project>:test` or all via `nx run-many --target=test`. The root `yarn test` is a placeholder.

## Adding Dependencies

### Root (`yarn add` / `yarn add -D` at the repo root)

Add a dependency to root when it is used by an **app** or is **shared tooling**:

- **App dependencies** -- packages imported by code in `apps/`. Apps have no `package.json` of their own, so their runtime and type dependencies go in the root. Examples: `express`, `@types/express`, `@temporalio/worker`, `dotenv`, `cors`.
- **Dev tooling** -- anything used for building, linting, testing, or formatting across the repo. Examples: `typescript`, `eslint`, `prettier`, `vite`, `vitest`, `nx`, `tsx`.

```sh
yarn add express                # runtime dep used by apps/api
yarn add -D @types/express      # type dep used by apps/api
```

### Library workspace (`yarn workspace <name> add`)

Add a dependency to a library package when it is **specific to that package's published API or implementation**. Library packages (`packages/*`) each have their own `package.json` so that Yarn creates `node_modules` symlinks for runtime resolution and the `exports` field controls what consumers can import.

- If only `@formiq/platform` uses `prisma` and `@prisma/client`, those belong in `packages/platform/package.json`.
- If only `@formiq/workflows` uses `@temporalio/workflow`, that belongs in `packages/workflows/package.json`.
- If a library depends on another library, add it as `"workspace:*"` (e.g., `"@formiq/shared": "workspace:*"` in `packages/activities/package.json`).

```sh
yarn workspace @formiq/platform add zod          # runtime dep for platform
yarn workspace @formiq/platform add -D prisma    # dev dep for platform
```

### Rule of thumb

| Question                                          | Where to add                                   |
| ------------------------------------------------- | ---------------------------------------------- |
| Used by code in `apps/`?                          | Root                                           |
| Dev tooling (lint, build, test, format)?          | Root                                           |
| Used only inside a specific `packages/*` library? | That library's workspace                       |
| A `@formiq/*` cross-reference between libraries?  | Consuming library's workspace as `workspace:*` |

TypeScript path aliases in `tsconfig.base.json` resolve `@formiq/*` imports to source for IDE and compile-time resolution. At runtime, Yarn workspace symlinks in `node_modules` handle the actual module resolution.
