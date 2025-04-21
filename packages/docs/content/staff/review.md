---
title: Staff Review Process
description: Learn about the submission lifecycle and review process for Pincast Expo applications
---

# Staff Review Process

This guide explains the Pincast Expo submission lifecycle, review criteria, and how to effectively manage applications through the review dashboard.

## Submission Lifecycle

<div class="my-8">
  <img src="/staff-review-flow.svg" alt="App Review Flow" class="w-full rounded-lg border border-gray-200 dark:border-gray-700" />
</div>

Applications in Pincast Expo follow a specific lifecycle:

1. **Pending** - Initial state after a developer submits an application
2. **Approved** - App passes review and is published to the catalog
3. **Rejected** - App fails review and is returned to the developer with feedback
4. **Hidden** - Previously approved app temporarily hidden from the catalog
5. **Archived** - App permanently removed from the catalog

## Review Dashboard

The review dashboard is available at [https://expo.pincast.fm/review](https://expo.pincast.fm/review) for staff members with the appropriate permissions.

### Dashboard Features

- **Pending Queue** - List of applications waiting for review
- **Approved Apps** - List of published applications
- **Rejected Apps** - List of applications that failed review
- **Search & Filter** - Find applications by name, developer, status, or date
- **Batch Actions** - Perform actions on multiple applications
- **Review History** - See past decisions and feedback

## Review Criteria

When reviewing applications, staff should evaluate them based on the following criteria:

### Content Guidelines

✅ **Acceptable Content**:
- Educational experiences
- Tour guides and historical walks
- Fitness and sports activities
- Scavenger hunts and treasure trails
- Art and culture explorations
- Nature and wildlife guides

❌ **Prohibited Content**:
- Illegal activities or promotion of criminal behavior
- Hate speech or discriminatory content
- Content that endangers users (directing to unsafe areas)
- Excessive violence or explicit sexual content
- Infringement of intellectual property rights
- Misleading or fraudulent information

### Technical Requirements

1. **Performance**:
   - App loads within 5 seconds on standard connections
   - Maintains responsive UI during location updates
   - Handles offline scenarios gracefully

2. **Battery Usage**:
   - Reasonable battery consumption
   - Proper implementation of location tracking (not continuous when unnecessary)

3. **Data Usage**:
   - Efficient data transfer
   - Proper caching of assets

4. **Location Accuracy**:
   - Appropriate radius settings for checkpoints
   - Clear guidance for users to reach points of interest

5. **Authentication**:
   - Proper implementation of Pincast authentication
   - No unnecessary permission requests

### User Experience Guidelines

1. **Onboarding**:
   - Clear instructions for new users
   - Permissions requested with appropriate context

2. **Interface**:
   - Intuitive navigation
   - Responsive design (mobile and desktop)
   - Accessible (follows WCAG 2.1 AA standards)

3. **Maps & Location**:
   - Clear map markers and directions
   - Appropriate zoom levels
   - Location accuracy indicators

4. **Feedback**:
   - Clear feedback when actions are completed
   - Error states handled gracefully

## Review Process

### Step 1: Reviewing Pending Applications

1. Log in to the review dashboard
2. Navigate to the "Pending" tab
3. Select an application to review
4. View application details:
   - Title, description, and screenshots
   - Developer information
   - Geo coordinates and radius
   - Build date and SDK version

### Step 2: Testing the Application

1. Click "Launch Preview" to open the application in a testing environment
2. Test the application thoroughly:
   - Check all features and functionality
   - Test with different simulated locations
   - Verify authentication flow
   - Check for performance issues

### Step 3: Making a Decision

Based on your review, make one of the following decisions:

1. **Approve** - The application meets all requirements and guidelines
2. **Reject** - The application fails to meet one or more requirements
3. **Request Changes** - The application has minor issues that need to be fixed

When rejecting or requesting changes, you must provide detailed feedback to help the developer understand what needs to be improved.

### Step 4: Providing Feedback

When writing feedback, follow these guidelines:

- Be specific about which issues need to be addressed
- Reference specific guidelines when applicable
- Provide actionable suggestions for improvement
- Maintain a constructive and professional tone

Example of good feedback:
> "The app has an engaging concept, but there are several technical issues that need to be addressed before approval:
> 1. Location tracking continues running in the background, which drains battery unnecessarily. Please implement proper lifecycle management.
> 2. Some checkpoints are placed in inaccessible locations (middle of private property). Please adjust these locations.
> 3. The error messages when offline are unclear. Please improve error handling to guide users better."

### Step 5: Post-Review Actions

After approving or rejecting an application:

1. **Approved Apps**:
   - Monitor analytics for unusual activity
   - Conduct periodic re-reviews to ensure continued compliance

2. **Rejected Apps**:
   - Track re-submissions to verify issues have been addressed
   - Provide additional guidance if the developer has questions

## State Transitions

Applications can move between different states in the system:

| From State | To State | Action | Notes |
|------------|----------|--------|-------|
| Pending | Approved | Approve | Publishes app to catalog |
| Pending | Rejected | Reject | Returns app to developer with feedback |
| Rejected | Pending | Resubmit | Developer fixes issues and resubmits |
| Approved | Hidden | Hide | Temporarily removes from catalog |
| Hidden | Approved | Unhide | Restores to catalog |
| Any | Archived | Archive | Permanently removes app (irreversible) |

## Handling Edge Cases

### Version Updates

When a developer submits an update to an existing application:

1. The new version enters the "Pending" state
2. The existing version remains in the catalog until a decision is made
3. If approved, the new version replaces the old one
4. If rejected, the old version remains in the catalog

### Emergency Takedowns

For urgent issues requiring immediate action:

1. Access the "Approved" tab in the dashboard
2. Find the application in question
3. Click "Emergency Hide"
4. Document the reason for the emergency action
5. Contact the developer through the dashboard messaging system

### Appeals Process

Developers can appeal rejection decisions:

1. Developer submits an appeal through the dashboard
2. Senior staff reviews the appeal
3. If warranted, the application is reconsidered with a new reviewer
4. Final decision is communicated to the developer

## Analytics & Reporting

The dashboard provides analytics for approved applications:

- **User Engagement** - Sessions, users, and retention metrics
- **Geographic Data** - Popular locations and coverage areas
- **Review Metrics** - Approval rates and common rejection reasons

Use these metrics to:
- Identify trends in successful applications
- Refine guidelines and documentation
- Improve the review process

## Best Practices

1. **Be consistent** - Apply the same standards to all applications
2. **Be thorough** - Test all aspects of the application
3. **Be timely** - Try to complete reviews within 3 business days
4. **Be helpful** - Provide constructive feedback even for approved apps
5. **Be security-minded** - Pay special attention to authentication and data handling

## Staff Training

New staff members should:

1. Review this documentation thoroughly
2. Observe experienced reviewers
3. Conduct practice reviews with supervision
4. Participate in regular calibration sessions
5. Stay updated on guideline changes

## Conclusion

The review process is crucial to maintaining the quality and integrity of the Pincast Expo platform. By following these guidelines, you'll help ensure that only high-quality, safe, and valuable location-based experiences are published to our users.