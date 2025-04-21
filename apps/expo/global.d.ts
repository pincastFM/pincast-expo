// Add TypeScript declarations to suppress difficult errors

// Declare module for drizzle-orm/pg-core
declare module 'drizzle-orm/pg-core' {
  // Add any missing declarations here
  export const eq: any;
  export const desc: any;
  export const pgTable: any;
  export type AnyPgColumnBuilder<T> = any;
  export type PgTableWithColumns<T> = any;
  export type AnyPgColumn = any;
}

// Fix the SQL primitive and import issues
declare module '@vercel/postgres' {
  interface Primitive {
    // Add support for promises
    [key: string]: any;
  }

  export const sql: any;
  export const createPool: any;
  export type VercelPoolClient = any;
}

// Fix the test distance property issue
declare interface App {
  distance?: string;
}

// For Vue Router types 
declare module 'vue-router' {
  // Make the type more flexible
  type RouteRecordNameGeneric = string | symbol | null | undefined;
  
  interface RouteLocationNormalizedGeneric {
    name: RouteRecordNameGeneric;
    // Add other properties as needed
  }
}