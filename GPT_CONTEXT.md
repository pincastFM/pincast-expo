# Pincast Expo Project Context

## Project Overview
You are tasked with helping create a new project called "pincast-expo" (in its own GitHub repository) that will build a capability for the Pincast platform that allows vibe coders to publish their apps to the Pincast marketplace (pincast.fm). This project should:

1. Be built in its own repository (named "pincast-expo")
2. Integrate with the Pincast platform, specifically leveraging components from the treehopper-v3, NYID, and NuxtSitev1 repositories
3. Ensure all users are authenticated through Logto and tracked in Customer.io

## Repository Structure
The CLAUDE.md technical documentation file has been created and will live in the new pincast-expo repository. It contains comprehensive technical information about the three referenced repositories and their integration points.

## Existing Repositories Analysis

### NuxtSitev1
A minimal landing page for Pincast (pincast.fm) serving as the marketing entry point. Built with Nuxt 3 and Tailwind CSS.

### NYID
A location-based audio experience platform with:
- Nuxt 3 framework
- Logto authentication
- Customer.io analytics
- Mapbox integration
- Vercel Postgres database
- Content creation and sharing (audio treks, private pins)

### treehopper-v3
A location-based tree collection application with:
- Nuxt 3 framework
- Logto authentication
- Customer.io analytics
- Mapbox integration
- Vercel Postgres database

## Technical Stack Foundation
The existing codebase uses:
- **Framework**: Nuxt 3 (Vue 3)
- **Authentication**: Logto
- **Analytics**: Customer.io
- **Map Services**: Mapbox
- **Database**: Vercel Postgres
- **Deployment**: Vercel

## Authentication System
All applications use Logto with the following flow:
1. User clicks "Sign in with Logto" button
2. Redirected to Logto authentication service
3. After authentication, redirected back to the application
4. Auth middleware checks user status
5. User ID synchronized with Customer.io for analytics

Machine-to-Machine (M2M) Authentication is used for protected API operations.

## Important Instructions for Project Development

1. **ALWAYS REQUIRE USER APPROVAL** for:
   - Any technical stack decisions (even when using components from existing repos)
   - Architectural and structural decisions
   - Authentication integration approach
   - Database schema design
   - API endpoint design

2. **NEVER MAKE ASSUMPTIONS** about any detail of the specification. If there is ANY ambiguity:
   - Highlight the ambiguous points specifically
   - Present clear options with pros and cons
   - Ask the user to clarify before proceeding

3. **FOCUS PRIMARILY ON**:
   - Designing a system that allows vibe coders to publish apps to the Pincast marketplace
   - Ensuring all users are authenticated through Logto.io
   - Maintaining Customer.io integration for analytics
   - Creating a clean, maintainable codebase in the new pincast-expo repository

4. **AUTHENTICATION REQUIREMENTS**:
   - All users MUST be authenticated through Logto
   - User accounts MUST be tracked in Customer.io
   - Consider both end-users and developer accounts

5. **CONTENT REQUIREMENTS**:
   - The system should allow for app publication and management
   - Apps should appear in the Pincast marketplace (pincast.fm)
   - Consider approval workflows and validation

When crafting prompts for Claude Code, ensure they:
1. Are precise and specific
2. Include relevant technical context from the CLAUDE.md document
3. Break complex tasks into manageable steps
4. Ask for clarification on ambiguous points
5. Request user approval for key decisions

This context is to be used to help ChatGPT generate effective prompts for Claude Code that will help build the "pincast-expo" project successfully.