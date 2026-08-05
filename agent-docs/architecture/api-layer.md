# API Layer Architecture

## Overview

Wrapper-based API abstraction built on `inaturalistjs`, combined with React Query for state management. All API responses are transformed to match Realm schemas before storage. Custom error handling with retry strategies and Grafana logging.

## Key Files

| File | Purpose |
|------|---------|
| `src/api/observations.js` | Observation CRUD, search, faves, subscriptions (see its `export` block for the full list) |
| `src/api/taxa.js` | Taxon fetch and search with field optimization |
| `src/api/users.js` | User profiles, blocking/muting |
| `src/api/projects.js` | Project search, membership |
| `src/api/search.ts` | Cross-resource search |
| `src/api/error.ts` | Custom error classes (INatApiError, 401, 429) and handleError |
| `src/api/types.d.ts` | TypeScript interfaces for API responses |
| `src/api/log/index.ts` | `iNatLogstashTransport` — posts logs to the iNaturalist API log endpoint (surfaced downstream in Grafana) |
| `src/sharedHooks/useAuthenticatedQuery.ts` | React Query wrapper with JWT injection |
| `src/sharedHooks/useAuthenticatedMutation.ts` | Mutation wrapper with JWT + 401/429 handling |
| `src/sharedHooks/useAuthenticatedInfiniteQuery.ts` | Infinite query wrapper for pagination |
| `src/sharedHooks/useQuery.ts` | Non-authenticated query wrapper |
| `src/sharedHelpers/logging.js` | Retry logic and delay strategies |

## Standard API Wrapper Pattern

Every API module follows this pattern:

```javascript
import inatjs from "inaturalistjs";
import handleError from "./error";

const searchObservations = async ( params = {}, opts = {} ) => {
  try {
    const response = await inatjs.observations.search( params, opts );
    response.results = response.results.map( mapToLocalSchema );
    return response;
  } catch ( e ) {
    return handleError( e, { context: { functionName: "searchObservations" } } );
  }
};
```

Rules:
- ALL calls go through wrapper functions (never call inaturalistjs directly from components)
- Every call wrapped in try-catch with `handleError`
- Responses transformed to Realm-compatible schema before returning
- `params` = query/body data, `opts` = options including `api_token`

## React Query Hooks

### useAuthenticatedQuery
```typescript
const { data, error, isLoading, refetch } = useAuthenticatedQuery(
  ["fetchTaxon", taxonId],
  optsWithAuth => fetchTaxon( taxonId, params, optsWithAuth ),
  { enabled },
);
```
- Waits for auth state before executing
- Injects JWT via `getJWT(allowAnonymousJWT)`
- Includes auth state in query key for cache separation
- Custom retry logic per status code

### useAuthenticatedMutation
```typescript
const { mutate } = useAuthenticatedMutation(
  ( faveParams, optsWithAuth ) => faveObservation( faveParams, optsWithAuth ),
  { onSuccess: () => { /* ... */ }, onError: ( error ) => { /* ... */ } },
);
mutate( { uuid } );
```
- Auto-injects JWT
- Smart 401 handling: logs context, attempts token refresh
- Smart 429 handling: logs the error (no automatic retry/backoff on mutations — exponential backoff applies to the query path only; see `logging.js`)

### useAuthenticatedInfiniteQuery
```typescript
const { data, fetchNextPage, isFetchingNextPage } = useAuthenticatedInfiniteQuery(
  queryKey,
  async ( params, optsWithAuth ) => searchObservations( { ...baseParams, ...params }, optsWithAuth ),
  { getNextPageParam, enabled },
);
const observations = flatten( data?.pages?.map( r => r.results ) ) || [];
```

### useNonAuthenticatedQuery (useQuery.ts)
For public endpoints that don't need JWT.

## Query Key Conventions

Format: `[domain, ...identifiers]`

```javascript
["fetchTaxon", taxonId]
["fetchQualityMetrics", observationUUID]
["useInfiniteExploreScroll", { ...filterParams }]
["fetchSearchResults", locationName]
```

Auth state appended automatically by hooks: `[...queryKey, allowAnonymousJWT, userLoggedIn]`

## Response Transformation

Two-stage process:
1. **API wrapper** normalizes common fields (e.g., `license_code` → `licenseCode`)
2. **Realm model mapper** applies domain logic (e.g., `Taxon.mapApiToRealm()`)

## Error Handling

### Error Classes (`src/api/error.ts`)
- `INatApiError` — Base class with json, status, context
- `INatApiUnauthorizedError` — 401 errors
- `INatApiTooManyRequestsError` — 429 errors

### Retry Strategy (`src/sharedHelpers/logging.js`)

| Status | Behavior |
|--------|----------|
| 429 (Rate limit) | Exponential backoff + jitter, retry 3x |
| 401/403 (Auth) | Token refresh attempt, retry 2x |
| 404 (Not found) | No retry |
| 408 / Network error | Retry 3x |
| Others | Retry 2x |

### Retry Delay
- 429: `1000 * 2^failureCount + random(0-100)ms`
- Others: `min(1000 * 2^failureCount, 30000ms)`

## Field Filtering

API calls specify exact fields to reduce payload:
```javascript
const FIELDS = {
  ancestor_ids: true,
  default_photo: { url: true },
  name: true,
  preferred_common_name: true,
  rank: true,
  rank_level: true,
};
```

## Common Operations

### Adding a new API endpoint
1. Create wrapper function in appropriate `src/api/*.js` file following the standard pattern
2. Create React Query hook using `useAuthenticatedQuery` or `useAuthenticatedMutation`
3. Transform response to match Realm schema if persisting locally
4. Add TypeScript types to `src/api/types.d.ts` if needed

### Adding a new React Query hook
1. Choose the right base hook: `useAuthenticatedQuery` (read), `useAuthenticatedMutation` (write), `useAuthenticatedInfiniteQuery` (paginated list)
2. Define a descriptive query key including relevant identifiers
3. Pass the API wrapper function with auth options
4. Handle errors in `onError` callback for mutations
