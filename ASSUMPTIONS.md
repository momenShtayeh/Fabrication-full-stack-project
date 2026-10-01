# Assumptions

Decisions made where the assessment brief leaves room for interpretation.

## Data model

1. **ISO revision is text**, not a number, because drawing revisions are commonly letters (`A`, `B`) as well as numbers (`0`, `1`).
2. **An ISO is stored once, with its current revision.** The ISO number is unique; a new revision updates the existing ISO rather than creating a second one.
3. **ISO statuses** are `UNVERIFIED`, `UNDER_VERIFICATION` and `VERIFIED`. The brief does not define them, and they do not affect batching.
4. **Spool numbers are unique within their ISO**, not globally. ISO-1001 and ISO-1002 can both have a spool `SP-01`; they are different spools.
5. **Spool statuses** are `NEW` (not evaluated yet), `PENDING_MATERIAL` and `BATCHED`. The status is managed by the system, not edited by users.
6. **Quantities are whole numbers.** Materials measured by length (pipe) are counted in whole metres.
7. **A material is listed at most once per spool**, with the total quantity required.

## Batch generation

8. **Only spools of `VERIFIED` ISOs are batched.** A drawing that is unverified or still under verification may change, so its spools are not fabricated or even checked for stock; they keep their status and are reported as "ISO not verified".
9. **Each "Generate Batch" run creates at most one batch**, containing every spool that qualifies in that run. No batch is created when no spool qualifies, since a batch must contain at least one spool.
10. **Spools are evaluated oldest first.** When stock is limited, spools created earlier get the material first, and stock deducted for one spool is no longer available to the spools after it in the same run.
11. **A spool is batched all or nothing.** If any one of its materials is short, it becomes `PENDING_MATERIAL` and none of its materials are deducted.
12. **Pending spools are re-evaluated on every run**, so they are batched automatically once stock is replenished.
13. **Spools without any required materials are skipped** and stay `NEW`, as their material needs are not defined yet.
14. **Batch numbers are generated** from the creation time (`BATCH-yyyyMMdd-HHmmss-SSS`).
15. **Every batch keeps a report** of the run that created it: the spools batched, the materials they took, and every spool left out with the reason (short of material with the exact quantities, ISO not verified, or no required materials). The report is a snapshot of that moment and does not change when stock or requirements change later. A run that batches nothing creates no batch, so its result is shown on screen but not stored.

## Changes and deletion

16. **Batched spools are locked.** Their required materials cannot be changed and the spool cannot be deleted, as their stock has already been deducted.
17. **Cancelling (deleting) a batch** returns the deducted stock and sets its spools back to `NEW`. Pending spools are then re-checked against the returned stock: those whose materials are all in stock again also go back to `NEW` (they were often pending only because the cancelled batch took the stock first), the ones still short stay `PENDING_MATERIAL`.
18. **Deleting an ISO deletes its spools** and their material requirements, unless any of its spools are batched, in which case the delete is refused.
19. **A material required by any spool cannot be deleted.**
20. **Deliveries are recorded with "Receive stock"**, which adds the delivered quantity to the current stock on the server. This avoids the planner calculating a new total, and cannot overwrite stock deducted by a batch generated at the same time. Editing a material's quantity directly is meant for correcting a stock count. A history of stock movements is outside the scope.

## Dashboard

21. **"Available Materials"** is the number of materials with a quantity above zero.
22. **"Pending Spools"** counts spools with status `PENDING_MATERIAL`. Spools that are `NEW` and `BATCHED` are reported separately for the chart.
23. **The "Lowest stock materials" chart** shows the 10 materials with the least stock, as these are the most likely to hold spools back.

## Security

24. **Two hardcoded users**: `planner` (role PLANNER, full access) and `viewer` (role VIEWER, read only), as allowed by the brief.
25. **The API is stateless** with basic authentication on every request, so CSRF protection is disabled and no session is created.
26. **The frontend keeps the login for the browser tab** (session storage), because basic authentication has no server session. Closing the tab or clicking log out ends it.
27. **The frontend hides actions the user's role does not allow**, e.g. a viewer sees no create, edit or delete buttons. The backend enforces the same rules independently.

## Concurrency

28. **Simultaneous changes to the same material are detected** with optimistic locking (`@Version`). The second request fails with `409 Conflict` and can be retried, so stock is never deducted twice.

## User interface

29. **Users never type database ids.** Spools are added from their ISO's page, so the ISO is known; required materials are picked from a list searched by material code.
30. **Spool numbers are edited from the ISO page**, as a spool always belongs to the ISO it was created in. Moving a spool to another ISO is not supported.
31. **Destructive actions ask for confirmation** (deleting, generating a batch, cancelling a batch), since they change stock or remove data.
