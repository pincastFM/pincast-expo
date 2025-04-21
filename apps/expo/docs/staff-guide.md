# Pincast Expo Staff Review Guide

This guide explains the review process for Pincast Expo apps submitted by developers. As a staff reviewer, you'll be responsible for approving, rejecting, or hiding apps based on their quality, content, and technical standards.

## Accessing the Review Dashboard

1. Go to https://expo.pincast.fm/review
2. Log in with your staff credentials
3. You'll be redirected to the review dashboard

## Review Process Overview

### 1. Reviewing Pending Apps

The main review queue displays apps in a "pending" state which require staff review. For each app, you can:

- Click "Details" to view the full app information and preview
- Approve the app directly from the list
- Reject the app directly from the list

### 2. App Detail Review

When reviewing an app's details:

1. **Check the app metadata**:
   - Title and description appropriateness
   - Category accuracy
   - Geolocation settings
   - Pricing (if applicable)

2. **Preview the app**:
   - Test the app functionality in the embedded iframe
   - Ensure it loads and functions as expected
   - Check for any content violations

3. **Version history**:
   - Review previous versions if available
   - Check the changelog for updates

### 3. Decision Actions

Based on your review, take one of the following actions:

- **Approve**: Makes the app publicly available in the marketplace
- **Reject**: Returns the app to the developer with feedback
- **Hide**: Temporarily removes a published app from public view
- **Rollback**: Reverts to a previous version (useful for regression issues)

## State Transition Rules

Apps follow these state transition rules:

1. **Pending → Published**: When an app passes review
2. **Pending → Rejected**: When an app fails review
3. **Published → Hidden**: When a published app needs to be temporarily removed
4. **Hidden → Published**: When a hidden app is ready to be shown again

## Guidelines for Approval

Approve apps that meet these criteria:

- Functional with no major bugs or crashes
- Follows Pincast design guidelines
- Contains appropriate content (no offensive material)
- Includes accurate metadata and descriptions
- Complies with privacy and data collection policies
- Offers meaningful value to users

## Guidelines for Rejection

Reject apps if they:

- Contain major bugs, crashes, or technical issues
- Have inappropriate or offensive content
- Misrepresent features or capabilities
- Violate intellectual property rights
- Lack proper user consent for data collection
- Do not provide meaningful value to users

## Hidden Apps Management

The "Hidden" tab displays apps that have been temporarily removed from public view. You can:

- Review hidden apps to check if issues have been resolved
- Republish them if they're ready to be public again
- View their version history

## Rollback Process

If a problematic update is published, you can rollback to a previous version:

1. Go to the app details page
2. Open the version history section
3. Find a stable previous version
4. Click "Rollback" next to that version
5. Confirm the rollback

## Analytics and Logging

All review actions are logged with:

- Timestamp of action
- Staff member who performed the action
- Transition details (from state → to state)
- Reason for the action (if provided)

This creates an audit trail for future reference.

## Best Practices

1. **Be thorough but efficient**: Most apps should be reviewed within 1-2 business days
2. **Provide clear reasons**: When rejecting apps, give specific feedback so developers can address issues
3. **Check geolocation**: Verify that location settings make sense for the app's purpose
4. **Test on a real device**: For critical apps, test on a physical device outside the iframe
5. **Consider user impact**: Balance strict standards with providing a good variety of apps

## Getting Help

If you need assistance with the review process:

- Contact the platform admin team at admin@pincast.fm
- Join the #staff-review Slack channel for discussion
- Refer to the technical documentation for implementation details

## Regular Review Meetings

The review team holds weekly meetings to discuss:

- Review metrics (acceptance rate, turnaround time)
- Challenging cases
- Updates to review guidelines
- Feedback from developers

Join these meetings to stay aligned with current review standards.