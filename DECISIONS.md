# Product Decisions

## Decision: Job relevance is displayed as a percentage

Job relevance is calculated internally using the existing 25-point deterministic scoring model. The raw score remains an internal/backend representation. CareerOS displays the result to users as a percentage (0–100%) to make the metric immediately understandable.

This means the frontend must convert the raw score using the presentation rule:

```
const percentage = (score / 25) * 100;
```

The user-facing metric is therefore shown as a percent match, such as `78% match`, while the underlying backend score remains the existing 25-point value.
