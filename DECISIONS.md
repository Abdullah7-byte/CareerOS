# Product Decisions

## Decision: Job relevance is displayed as a percentage

Job relevance is displayed only after a grounded 25-point rubric finishes. The raw score remains an internal/backend representation; the employer can inspect the persisted category evidence, rubric version, and model version. The frontend displays the result as a percentage (0–100%) for readability. Sparse job descriptions show “insufficient job detail” rather than a percentage.

This means the frontend must convert the raw score using the presentation rule:

```
const percentage = (score / 25) * 100;
```

The user-facing metric is therefore shown as a percent match, such as `78% match`, while the underlying backend score remains the existing 25-point value.

## Decision: employer access and phone disclosure

Employer signup is self-service; CareerOS does not currently vet employers. An employer may view a candidate phone number only on the detail page for an application to that employer's own job. Candidate-list queries intentionally exclude phone numbers. If employer vetting or candidate-controlled contact disclosure becomes a requirement, this policy must change alongside the RLS and action tests.
