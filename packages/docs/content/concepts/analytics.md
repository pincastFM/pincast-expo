---
title: Analytics & Popularity Metrics
description: Understanding how Pincast tracks app usage metrics and calculates popularity for the catalog
---

# Analytics & Popularity Metrics

Pincast provides built-in analytics capabilities that help developers understand how users interact with their applications. This data is used both for developer insights and to power the popularity-based sorting in the app catalog.

## Analytics Events

The SDK automatically captures core events and allows developers to track custom events:

### Core Events

| Event | Description | When Triggered |
|-------|-------------|----------------|
| `session_start` | Marks the beginning of a user session | Automatically on app mount |
| `page_view` | Records a page/screen view | When `pageView()` is called |
| `error` | Records an error occurrence | Automatically for uncaught errors |

### Custom Events

Developers can track custom events using the `track` method:

```typescript
import { usePincastAnalytics } from '@pincast/sdk';

const analytics = usePincastAnalytics();

// Track a simple event
analytics.track('quest_completed');

// Track an event with properties
analytics.track('checkpoint_found', {
  checkpoint_id: 'checkpoint-123',
  time_taken_seconds: 45,
  attempts: 2
});
```

## Event Naming Conventions

To maintain consistency across the platform, follow these conventions when naming custom events:

- Use snake_case for event names and property keys
- Use nouns for objects and verbs for actions (e.g., `button_clicked`, `quest_completed`)
- Structure complex events as `object_action` (e.g., `checkpoint_discovered`)
- Avoid PII (Personally Identifiable Information) in event names and properties

## Event Batching

The SDK automatically batches events to minimize network requests:

- Events are queued and sent in batches (up to 20 events per batch)
- Batches are sent every 5 seconds or when the queue reaches its maximum size
- Events are automatically flushed when the user leaves the app
- You can manually flush events with `analytics.flush()`

## Popularity Metrics

Pincast uses analytics data to calculate popularity metrics that are displayed in the catalog and used for sorting:

### Sessions Per Week

The primary popularity metric is the number of unique sessions started in the past 7 days. This is displayed as "X plays this week" in the catalog UI.

### Popularity Calculation

1. Each time a user opens your app, a `session_start` event is recorded
2. A materialized view aggregates these events with a 7-day rolling window
3. The catalog API includes this count as `sessions7d` in its response
4. When users sort by "Most Popular", apps are ranked by this value

## Analytics Dashboard

For detailed analytics about your apps, visit the Analytics Dashboard in the Pincast Developer Portal:

1. Log in to [developer.pincast.fm](https://developer.pincast.fm)
2. Navigate to your app
3. Select the "Analytics" tab

The dashboard provides:
- User engagement metrics
- Session duration and frequency
- Geographic distribution of users
- Custom event funnels
- Retention analysis

## Quota & Rate Limits

To ensure platform stability, the following limits apply:

| Resource | Limit |
|----------|-------|
| Events per user per minute | 100 |
| Events per app per day | 1,000,000 |
| Batch size | 20 events |
| Event property size | 64KB |
| Event name length | 255 characters |

## Privacy & Data Retention

Pincast is committed to user privacy:

- No Personally Identifiable Information (PII) should be included in event properties
- User IDs are automatically anonymized in analytics reports
- Raw event data is retained for 90 days
- Aggregated metrics are retained indefinitely

## Best Practices

### Do's

- Track meaningful user interactions that provide actionable insights
- Keep event names and properties consistent
- Document your event taxonomy for future reference
- Review analytics regularly to improve your app

### Don'ts

- Don't track PII or sensitive user data
- Don't create unique event names for each user/instance
- Don't track high-frequency events (e.g., mouse movements)
- Don't rely on real-time analytics for critical app functionality

## Example: Quest Completion Funnel

Here's an example of tracking a quest completion funnel:

```typescript
import { usePincastAnalytics } from '@pincast/sdk';

const analytics = usePincastAnalytics();

// When quest starts
function startQuest(questId: string) {
  analytics.track('quest_started', {
    quest_id: questId
  });
}

// When user finds a checkpoint
function findCheckpoint(questId: string, checkpointId: string, order: number) {
  analytics.track('checkpoint_found', {
    quest_id: questId,
    checkpoint_id: checkpointId,
    checkpoint_order: order,
    time_elapsed: getTimeElapsed() // your function to calculate time
  });
}

// When quest is completed
function completeQuest(questId: string, checkpointsFound: number, totalTime: number) {
  analytics.track('quest_completed', {
    quest_id: questId,
    checkpoints_found: checkpointsFound,
    total_time_seconds: totalTime,
    completion_date: new Date().toISOString()
  });
}
```

This approach allows you to analyze:
- How many users start quests vs. complete them
- Which checkpoints cause users to drop off
- How long it takes users to complete quests
- Completion rates over time