import { z } from 'zod';
import { verifyLogtoToken, extractBearerToken, hasScope } from '../../utils/logto';
import { assertString, assertDefined } from '../../utils/runtime';
import {
  createApp,
  getAppBySlug,
  createVersion,
  getVersionsByAppId,
  getUserByLogtoId
} from '../../db/queries';

// Define the request schema using Zod
const appCreateSchema = z.object({
  title: z.string().min(1).max(100),
  slug: z.string().min(1).max(50).regex(/^[a-z0-9-]+$/),
  geo: z.object({
    center: z.tuple([z.number(), z.number()]),
    radiusMeters: z.number().min(10).max(10000)
  }),
  heroUrl: z.string().url().optional(),
  buildUrl: z.string().url(),
  sdkVersion: z.string().optional()
});

export default defineEventHandler(async (event) => {
  try {
    // 1. Verify the authentication token
    const authHeader = getRequestHeader(event, 'authorization');
    const token = extractBearerToken(authHeader);
    
    if (!token) {
      throw createError({
        statusCode: 401,
        message: 'Authentication required'
      });
    }
    
    // Verify the token is a valid Logto token with developer scope
    const { payload } = await verifyLogtoToken(token);
    
    if (!hasScope(payload, 'developer:api')) {
      throw createError({
        statusCode: 403,
        message: 'Developer scope required'
      });
    }
    
    // Get the developer's Logto ID from the token
    const logtoId = assertString(payload.sub, 'Invalid token: missing subject ID');
    
    // Get the developer from the database
    const developer = await getUserByLogtoId(logtoId);
    
    if (!developer) {
      throw createError({
        statusCode: 403,
        message: 'Developer account not found'
      });
    }
    
    // 2. Parse and validate the request body
    const body = await readBody(event);
    const validatedData = appCreateSchema.parse(body);
    
    // 3. Process the request
    // Check if app with this slug already exists
    const existingApp = await getAppBySlug(validatedData.slug);
    
    let app;
    // If app exists and belongs to the same developer, update it
    if (existingApp && existingApp.ownerId === developer.id) {
      // We'll need to update the app
      app = existingApp;
    } else if (existingApp) {
      // App exists but belongs to someone else
      throw createError({
        statusCode: 409,
        message: `App with slug '${validatedData.slug}' already exists`
      });
    } else {
      // Create a new app
      const [longitude, latitude] = validatedData.geo.center;
      
      app = await createApp({
        ownerId: developer.id,
        title: validatedData.title,
        slug: validatedData.slug,
        heroUrl: validatedData.heroUrl || null,
        longitude,
        latitude,
        state: 'pending',
        // Always set these default values to ensure consistent behavior
        priceCents: 0,
        isPaid: false,
        // Set radiusMeters from the geo data
        geoRadius: validatedData.geo.radiusMeters
      });
    }
    
    // 4. Create a new version
    // Get all existing versions to determine next semver
    const versions = await getVersionsByAppId(app.id);
    
    // Determine semver: if provided, use it, otherwise auto-increment
    let semver = validatedData.sdkVersion || '0.1.0';
    
    if (versions.length > 0 && !validatedData.sdkVersion) {
      // Auto-increment the version if not provided
      const latestVersion = assertDefined(versions[0], 'Expected at least one version but none found');
      const semverString = assertString(latestVersion.semver, 'Missing semver string');
      const parts = semverString.split('.');
      
      if (parts.length === 3) {
        // Ensure part[2] is defined
        const patchStr = assertString(parts[2], 'Invalid semver format');
        // Increment patch version
        const patch = parseInt(patchStr) + 1;
        const majorStr = assertString(parts[0], 'Invalid semver format');
        const minorStr = assertString(parts[1], 'Invalid semver format');
        semver = `${majorStr}.${minorStr}.${patch}`;
      }
    }
    
    // Create the version
    const version = await createVersion({
      appId: app.id,
      semver,
      deployUrl: validatedData.buildUrl
    });
    
    // 5. Return the response
    return {
      appId: app.id,
      versionId: version.id,
      dashboard: `https://expo.pincast.fm/dashboard/apps/${app.id}`,
      status: app.state
    };
  } catch (error: any) {
    // Handle validation errors
    if (error.name === 'ZodError') {
      return createError({
        statusCode: 400,
        message: 'Invalid request data',
        data: error.errors
      });
    }
    
    // Pass through HTTP errors
    if (error.statusCode) {
      throw error;
    }
    
    // Log unexpected errors
    console.error('Error processing app submission:', error);
    
    throw createError({
      statusCode: 500,
      message: 'Internal server error'
    });
  }
});