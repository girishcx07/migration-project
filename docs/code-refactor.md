# Apply Visa Module Refactor Plan

## Summary

Refactor packages/portal/src/modules/apply-visa/apply-visa-client.tsx from a 2500+ line page component into a
module-based architecture. The final apply-visa-client.tsx should become a thin orchestration component, ideally
under 300 lines, while preserving the existing UI, behavior, API contracts, upload flow, visa offer flow, document
handling, dialogs, and country selection behavior.

No changes should be made to packages/ui. This refactor is limited to packages/portal.

## Target Architecture

Create a dedicated module structure under packages/portal/src/modules/apply-visa:

apply-visa/
apply-visa-client.tsx
apply-visa-flow.tsx
apply-visa-skeleton.tsx
country-combobox.tsx
index.ts

    components/
      apply-visa-dialogs.tsx
      doc-section.tsx
      documents-empty-state.tsx
      documents-panel.tsx
      field-shell.tsx
      max-width-container.tsx
      raff-application-panel.tsx
      uploaded-file-card.tsx
      visa-column-card.tsx
      visa-offer-card.tsx

    providers/
      apply-visa-provider.tsx

    hooks/
      use-apply-visa-context.ts
      use-apply-visa-initial-state.ts
      use-apply-visa-queries.ts
      use-visa-offers.ts
      use-visa-documents.ts
      use-document-upload.ts
      use-raff-application.ts
      use-apply-visa-submit.ts
      use-apply-visa-notices.ts

    types/
      apply-visa.types.ts

    constants/
      apply-visa.constants.ts
      document-upload.constants.ts

    utils/
      date.utils.ts
      document.utils.ts
      file-validation.utils.ts
      payload.utils.ts
      currency.utils.ts
      cookie.utils.ts
      notice.utils.ts
      request-key.utils.ts

Keep existing exports stable through index.ts and avoid breaking imports during the refactor.

## Key Changes

- Reduce apply-visa-client.tsx to orchestration only:
  - render provider
  - compose main sections
  - pass minimal props
  - avoid inline business logic, large JSX blocks, and complex derived state
- Move shared state into ApplyVisaProvider:
  - selected nationality
  - travelling-to country
  - travel dates
  - selected visa offer
  - selected applicant
  - uploaded documents
  - document requirements state
  - dialog state
  - loading and pending state
  - column/navigation state where currently shared
- Move logic into hooks:
  - React Query/query-related logic into use-apply-visa-queries.ts
  - visa offer selection and derived offer state into use-visa-offers.ts
  - required/uploaded document state into use-visa-documents.ts
  - upload validation/drop handling into use-document-upload.ts
  - RAFF applicant behavior into use-raff-application.ts
  - payload preparation and submit callbacks into use-apply-visa-submit.ts
  - notice, destination, and price-change dialog logic into use-apply-visa-notices.ts
- Move all module types into types/apply-visa.types.ts:
  - VisaDocument
  - notice/result types
  - latest action/task types
  - document section types
  - selected offer/applicant state types
  - upload-related types
- Move pure logic into utils:
  - date defaults and ISO formatting
  - request key generation
  - payload builders
  - document grouping and filtering
  - file validation
  - currency resolution
  - cookie read/write helpers
  - notice content helpers
- Move UI blocks into components:
  - keep component files directly under components/ rather than grouping by functionality subfolders
  - VisaColumnCard
  - FieldShell
  - MaxWidthContainer
  - VisaOfferCard
  - OfferDetailsDialog
  - DestinationNoticeDialog
  - VisaNoticeDialog
  - PriceChangeAlertDialog
  - DocumentsPanel
  - DocSection
  - UploadedFileCard
  - DocumentsEmptyState
  - RaffApplicationPanel

## Implementation Steps

1. Establish baseline:
   - run portal typecheck/lint before refactor
   - identify current behavior for offer selection, document upload, applicant search, dialogs, and submit flow
2. Extract constants, types, and pure utils first:
   - no JSX movement yet
   - no behavior changes
   - update imports only
3. Extract presentational components:
   - move large JSX blocks without changing state ownership
   - keep props explicit at first
   - verify UI after each extraction
4. Add ApplyVisaProvider:
   - move only shared cross-section state into context
   - keep local UI-only state local when it does not need to be shared
   - expose a useApplyVisaContext hook
5. Move business logic into hooks:
   - extract one workflow at a time
   - start with document upload and document requirements
   - then offer selection
   - then applicant/RAFF logic
   - then payload submit and notices
6. Final cleanup:
   - reduce apply-visa-client.tsx to the composition layer
   - remove verified dead code
   - keep index.ts exports compatible
   - avoid changing API payload shape or server contracts

## Test Plan

- Run:
  - relevant repo-level typecheck if needed
- Manual smoke test:
  - upload card keeps scroll isolated to the top section
  - dragger and action area stay fixed at the bottom
  - “View Uploaded Documents” appears only after at least one upload
  - invalid file type/size handling still works
  - applicant search/wrap section still works when rendered
  - submit payload remains unchanged

## Assumptions

- The refactor should preserve current behavior exactly unless a bug is explicitly identified.
- No new state management library will be introduced.
- Existing portal styling and shadcn conventions should be preserved.
- packages/ui must not be changed.
- The refactor should be done in small commits or reviewable steps, not as one large rewrite.
