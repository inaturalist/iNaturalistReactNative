---
paths:
  - "**/src/api/**"
  - "**/src/sharedHooks/**"
  - "**/src/uploaders/**"
---

# API layer

Patterns, retry table and field-filtering detail: `agent-docs/architecture/api-layer.md`.
Upload pipeline: `agent-docs/architecture/upload-system.md`.

## Every call goes through a wrapper

- Never call `inaturalistjs` from a component or a hook. Add or reuse a wrapper function in
  `src/api/`; calling `inatjs` directly skips error logging and response transformation.
- A wrapper wraps the call in try/catch and returns `handleError( e, { context: {
  functionName: "..." } } )`. Signature is `( params = {}, opts = {} )` — `params` is
  query/body data, `opts` carries `api_token`.
- Transform the response into the Realm-compatible shape inside the wrapper, before returning.
- Pass an explicit `fields` object. An unfiltered response is many times larger, which matters
  on the slow connections most of our users have.

## React Query hooks

- Read with `useAuthenticatedQuery`, write with `useAuthenticatedMutation`, paginate with
  `useAuthenticatedInfiniteQuery`, and use `useNonAuthenticatedQuery` only when the endpoint
  genuinely needs no token. These wait for auth state before firing; plain `useQuery` does not.
- Query keys are `[domain, ...identifiers]` — `["fetchTaxon", taxonId]`. Auth state is appended
  by the hook, so do not add it yourself.
- Handle mutation failures in `onError`; a rejected mutation otherwise fails silently.

## Uploads

- The upload queue lives in Zustand (`createUploadObservationsSlice`), not in Realm. The Realm
  `QueueItem` model is an unrelated settings-sync queue used by `useWorkQueue`.
- There is no background upload task. An upload may continue briefly if the app is
  backgrounded mid-flight, but do not design a flow that assumes it completes.
