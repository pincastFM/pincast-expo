# Technical Integration Documentation for pincast-expo

This document provides a comprehensive technical overview of the treehopper-v3, NYID, and NuxtSitev1 repositories to support the development of the new pincast-expo project.

## Repository Structure

This CLAUDE.md file lives in the newly created **pincast-expo** repository, which will house our marketplace integration project. It references components and architecture from three existing repositories:

1. **treehopper-v3**: Location-based tree collection app
2. **NYID**: Location-based audio experience platform
3. **NuxtSitev1**: Main marketing site (pincast.fm)

## Overview of Referenced Repositories

### NuxtSitev1
A minimal landing page for Pincast (pincast.fm) that serves as the main marketing entry point. Built with Nuxt 3 and Tailwind CSS, it primarily provides brand information and collects beta signups.

### NYID
A location-based audio experience platform built with Nuxt 3. It allows users to create and interact with geo-located audio content, audio treks, private pins, and prompts.

### treehopper-v3
A location-based tree collection app built with Nuxt 3, featuring user tracking, authentication, and location-based functionality.

## Technical Stack Analysis

### Common Technical Foundation
All three repositories share the following technical components:
- **Framework**: Nuxt 3 (Vue 3)
- **Styling**: Tailwind CSS
- **Development Environment**: Typescript
- **Deployment**: Vercel

### Authentication System
All production applications use **Logto** as the authentication provider:

```typescript
// Logto Configuration (from NYID)
logto: {      
  endpoint: process.env.NUXT_LOGTO_ENDPOINT,
  appId: process.env.NUXT_LOGTO_APP_ID,
  appSecret: process.env.NUXT_LOGTO_APP_SECRET,
  cookieEncryptionKey: process.env.NUXT_LOGTO_COOKIE_ENCRYPTION_KEY,
  customRedirectBaseUrl: getDynamicRedirectBaseUrl(),
  pathnames: {
    signIn: '/sign-in',
    signOut: '/sign-out',
    callback: '/callback'
  },
  scopes: [UserScope.Email, UserScope.Roles, 'custom_data'],
  postCallbackRedirectUri: '/router',
}
```

**Authentication Flow**:
1. User clicks "Sign in with Logto" button (LogtoSignIn.vue component)
2. Redirected to Logto authentication service
3. After authentication, redirected back to the application
4. Auth middleware checks user status
5. User ID synchronized with Customer.io for analytics

**Machine-to-Machine (M2M) Authentication**:
Both NYID and treehopper-v3 use client credentials flow for protected API operations:

```typescript
// M2M Auth Configuration (from NYID)
logtoM2M: {
  endpoint: process.env.NUXT_LOGTO_ENDPOINT,
  appId: process.env.M2M_LOGTO_APP_ID || 'jph5no4v0s95gexyjq2cx',
  appSecret: process.env.M2M_LOGTO_APP_SECRET || 'BV6lE3o7KAhkC9sRGcHmU0DNe7z1TSPG',
  organizationId: 'uyq9kt983q9u',
  apiResource: 'https://i28lkh.logto.app/api',
}
```

### Database Architecture
- **Database**: Vercel Postgres (SQL)
- **Connection Method**: @vercel/postgres via server-side createPool()
- **Spatial Extensions**: NYID utilizes PostGIS for geospatial queries

### User Tracking & Analytics
Both NYID and treehopper-v3 use **Customer.io** for user tracking and engagement:

```typescript
// Customer.io tracking (from treehopper-v3)
export async function identifyUser(userId: string, attributes: Record<string, any>) {
  const client = getCustomerIoClient();
  if (!client) {
    console.log('Customer.io client not available, skipping user identification');
    return false;
  }
  
  try {
    await client.identify(userId, attributes);
    return true;
  } catch (error) {
    console.error('Error identifying user in Customer.io:', error);
    return false;
  }
}
```

NYID additionally uses PostHog for client-side tracking in newer components.

## Key Integration Points for pincast-expo

### Authentication Integration
The most critical integration point is the authentication system. The pincast-expo marketplace integration must:

1. **Leverage Logto**: Use the existing Logto integration for user authentication
2. **Handle Role-Based Access**: Respect the role-based permissions system
3. **User ID Synchronization**: Maintain consistent user identification across platforms

```typescript
// Auth Middleware (from NYID)
export default defineNuxtRouteMiddleware((to) => {
  const user = useLogtoUser();

  if (process.client) {
    if (!user?.value) {
      window.location.href = '/sign-in';
      return;
    }

    if (to.meta.requiresAdmin && !user.value?.roles?.includes('admin')) {
      window.location.href = '/';
      return;
    }
  }
});
```

### Content Management

NYID provides several key content management components that would be relevant for pincast-expo:

1. **Private Pins System**: Creating and sharing location-based content
2. **Audio Treks**: Sequential audio experiences tied to locations
3. **Audio Recording & Playback**: Media capabilities for user-generated content

```
// Content Creation Endpoints (NYID)
/api/private-pins/create.post.ts
/api/audio-treks/create.post.js
/api/upload-audio.post.js
```

### User Analytics Flow

The existing analytics flow provides a foundation for pincast-expo:

1. **User Identification**: Anonymous users receive UUID, authenticated users use Logto ID
2. **Event Tracking**: Customer.io tracks user interactions
3. **Profile Updates**: User profiles updated with activity data

```typescript
// Example of track-event.ts (NYID)
export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { event_name, properties } = body;
  
  const userId = event.context.userId || 'anonymous';
  
  // Track event in Customer.io
  await trackEvent(userId, event_name, properties);
  
  return { success: true };
});
```

### Location-Based Functionality

Both NYID and treehopper-v3 utilize Mapbox for location services:

```typescript
// Mapbox Configuration (from NYID)
mapbox: {
  accessToken: process.env.MAPBOX_ACCESS_TOKEN
}
```

NYID additionally implements:
- Geofencing capabilities
- Proximity detection
- Location-based content delivery

## Marketplace Integration Strategy for pincast-expo

Based on the technical analysis, the recommended approach for the pincast-expo project would be:

1. **Authentication Extension**:
   - Extend existing Logto integration to support marketplace user accounts
   - Implement automatic account creation for marketplace users

2. **API Gateway**:
   - Create an API gateway to unify access to NYID and treehopper-v3 features
   - Implement consistent permissions model across applications

3. **Content Publication System**:
   - Leverage NYID's private pins and audio trek systems
   - Create publication workflow for marketplace submission

4. **User Profile Synchronization**:
   - Ensure user profiles are synchronized between Logto and marketplace
   - Extend Customer.io tracking to include marketplace interactions

5. **Marketplace Frontend**:
   - Build upon NuxtSitev1's minimal structure for marketplace UI
   - Implement browsing, purchasing, and user dashboard interfaces

## Critical Components for pincast-expo Implementation

### Authentication Components
- `LogtoSignIn.vue`: User authentication component
- `middleware/auth.ts`: Authentication flow management
- `server/api/admin/fetch-logto-user.ts`: User data retrieval

### Content Management
- `AudioTrekBuilder.vue`: Interface for creating sequential audio content
- `CreatePrivatePin.vue`: Interface for creating private location-based content
- `ProximityMap.vue`: Map interface for location-based content discovery

### APIs and Endpoints
- `/api/private-pins/create.post.ts`: Creating private location content
- `/api/audio-treks/create.post.js`: Creating audio trek experiences
- `/api/track-event.ts`: Analytics tracking
- `/api/update-user-identifier.ts`: User profile synchronization

## Technology Constraints and Considerations

1. **Logto Dependency**:
   - All user authentication must flow through Logto
   - Role-based permissions are managed by Logto

2. **Customer.io Integration**:
   - User tracking and analytics are tied to Customer.io
   - New tracking events will need to be defined for marketplace interactions

3. **Location Services**:
   - Mapbox is the primary location provider
   - Location-based features require precise geospatial data

4. **Database Architecture**:
   - Vercel Postgres with potential spatial extensions
   - Schema design must account for marketplace entities

## Conclusion

The pincast-expo project aims to build a marketplace platform for the Pincast ecosystem, integrating with the existing technical stack centered around Nuxt 3, Logto authentication, and Customer.io analytics. The most promising integration path leverages NYID's content creation and sharing capabilities, extends the authentication system to support marketplace users, and builds upon the existing analytics infrastructure to track marketplace interactions.

Key technical challenges will include maintaining consistent user identification across systems, implementing a marketplace publication workflow, and designing a payment processing system that integrates with the existing user accounts.