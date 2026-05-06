# Visa form RSC optimized migration

This package keeps the existing client interactions but removes client-side visa-form fetching and moves runtime generation to the server.

## Runtime flow

```txt
Suspense boundary
  -> async RSC data fetch
    -> server runtime generation
      -> serializable client form props
        -> rendered interactive form
```

## Files

- `visa-form.tsx` - default export shim for the existing component import path.
- `visa-form.boundary.tsx` - Suspense boundary and fallback.
- `visa-form.rsc.tsx` - async Server Component fetch layer.
- `visa-form.generator.ts` - default-value, schema, resolver, wildcard, and progress runtime generator.
- `visa-form.client.tsx` - optimized client boundary with RHF state, dynamic fields, Arabic keyboard, dialogs, and status sync.
- `visa-form.skeleton.tsx` - server-safe fallback skeleton.

## What changed

- Removed client `useSuspenseQuery` from the form.
- Removed field-level `rules` from RHF fields.
- Centralized validation through a generated resolver.
- Generated defaults and initial progress on the server.
- Replaced client `JSON.stringify(formData)` reset key with a stable server hash.
- Preserved falsy values with `??` instead of `||`.
- Removed debug logs and redundant render wrappers.
- Added wildcard validation support for field arrays and dynamic dependents.
- Fixed progress sync to validate against actual RHF errors instead of UI error visibility.
