# API Layer Architecture

Wrapper functions over `inaturalistjs`, with React Query on top. Rules version:
`.claude/rules/api.md`. This doc is the *why* plus the numbers.

## Why every call goes through a wrapper

A wrapper does three things a direct `inatjs` call does not:

1. Catches and routes the failure through `handleError`, which attaches
   `context.functionName` and ships it to the log endpoint (surfaced in Grafana).
   A direct call fails invisibly.
2. Normalizes the response toward the local schema — the first of two stages.
   The wrapper handles common field renames (`license_code` → `licenseCode`);
   the Realm model mapper (`Taxon.mapApiToRealm()`) then applies domain logic.
   Skipping stage one hands the mapper a shape it does not expect.
3. Fixes the `( params = {}, opts = {} )` signature, so `api_token` always
   travels in `opts` and never leaks into a query string.

## React Query hooks

`useAuthenticatedQuery`, `useAuthenticatedMutation` and
`useAuthenticatedInfiniteQuery` wait for auth state before firing, inject the JWT
via `getJWT( allowAnonymousJWT )`, and append auth state to the query key
(`[...queryKey, allowAnonymousJWT, userLoggedIn]`) so a logged-in and a
logged-out cache never collide. `useNonAuthenticatedQuery` is for genuinely
public endpoints.

Query keys are `[domain, ...identifiers]` — `["fetchTaxon", taxonId]`,
`["useInfiniteExploreScroll", { ...filterParams }]`. Do not add auth state
yourself; the hook does it.

**Retry behavior differs between queries and mutations.** The exponential
backoff below applies to the query path only. `useAuthenticatedMutation` logs a
429 and stops — there is no automatic retry, so a rate-limited mutation needs
its own handling in `onError`.

## Retry strategy

Implemented in `src/sharedHelpers/logging.js`.

| Status | Behavior |
|--------|----------|
| 429 rate limit | Exponential backoff plus jitter, retry 3× |
| 401 / 403 auth | Token refresh attempt, retry 2× |
| 404 not found | No retry |
| 408 / network error | Retry 3× |
| Anything else | Retry 2× |

Delay is `1000 × 2^failureCount + random( 0–100 )ms` for 429, and
`min( 1000 × 2^failureCount, 30000 )ms` otherwise.

Error classes live in `src/api/error.ts`: `INatApiError` carries `json`,
`status` and `context`, with `INatApiUnauthorizedError` and
`INatApiTooManyRequestsError` for 401 and 429.

## Field filtering is not optional

Every call passes an explicit `FIELDS` object naming exactly what it needs,
nested where the response is nested (`default_photo: { url: true }`). Our users
are frequently on slow or metered connections, so an unfiltered response is a
user-visible cost, not a tidiness question.
