import { createApp, eventHandler, toNodeListener } from 'h3';
import { IncomingMessage, ServerResponse } from 'http';

// In-memory data store
export const dataStore: Record<string, Record<string, any>[]> = {
  todos: [
    { id: '1', text: 'Learn Pincast SDK', completed: false },
    { id: '2', text: 'Build an app', completed: false },
    { id: '3', text: 'Deploy to Expo', completed: false }
  ],
  notes: [
    { id: '1', title: 'First Note', content: 'This is a sample note' },
    { id: '2', title: 'Second Note', content: 'Another sample note' }
  ],
  locations: [
    { 
      id: '1', 
      name: 'Golden Gate Park',
      location: { 
        type: 'Point', 
        coordinates: [-122.4869, 37.7694] 
      } 
    },
    { 
      id: '2', 
      name: 'Ferry Building',
      location: { 
        type: 'Point', 
        coordinates: [-122.3935, 37.7955] 
      } 
    }
  ]
};

// Apps store for CI endpoints
export const appsStore: any[] = [
  {
    id: 'sample-app-1',
    title: 'Sample App',
    slug: 'sample-app',
    status: 'approved',
    buildUrl: 'https://sample-build-url.vercel.app',
    deployedUrl: 'https://sample-app.pincast.fm',
    dashboardUrl: 'https://dashboard.pincast.fm/apps/sample-app-1'
  }
];

/**
 * Create a proxy server using h3
 */
export function createProxyServer(port: number) {
  const app = createApp();
  
  // Log all requests
  app.use(eventHandler(async (event) => {
    console.log(`${event.method} ${event.path}`);
    await new Promise(resolve => setTimeout(resolve, 100)); // Small delay to simulate network
  }));
  
  // Handle /data/* endpoints
  app.use('/data/:collection', eventHandler(async (event) => {
    const method = event.method;
    const collection = event.context.params?.collection;
    
    if (!collection || !(collection in dataStore)) {
      return { status: 404, body: { error: 'Collection not found' } };
    }
    
    if (method === 'GET') {
      return dataStore[collection];
    }
  }));
  
  // Handle /data/:collection/:id endpoints
  app.use('/data/:collection/:id', eventHandler(async (event) => {
    const method = event.method;
    const collection = event.context.params?.collection;
    const id = event.context.params?.id;
    
    if (!collection || !id || !(collection in dataStore)) {
      return { status: 404, body: { error: 'Resource not found' } };
    }
    
    if (method === 'GET') {
      const item = dataStore[collection].find(item => item.id === id);
      if (!item) {
        return { status: 404, body: { error: 'Item not found' } };
      }
      return item;
    }
  }));
  
  // Handle /ci/apps endpoint
  app.use('/ci/apps', eventHandler(async (event) => {
    const method = event.method;
    
    if (method === 'GET') {
      return appsStore;
    } else if (method === 'POST') {
      const body = await readBody(event);
      
      const newApp = {
        id: `app-${Date.now()}`,
        title: body.title || 'Unnamed App',
        slug: body.slug || `app-${Date.now()}`,
        status: 'pending',
        buildUrl: body.buildUrl || 'https://example.com',
        dashboardUrl: `https://dashboard.pincast.fm/apps/app-${Date.now()}`
      };
      
      appsStore.push(newApp);
      
      return {
        status: 201,
        body: newApp
      };
    }
  }));
  
  // Handle /ci/apps/:id endpoint
  app.use('/ci/apps/:id', eventHandler(async (event) => {
    const method = event.method;
    const id = event.context.params?.id;
    
    if (!id) {
      return { status: 404, body: { error: 'App not found' } };
    }
    
    if (method === 'GET') {
      const app = appsStore.find(app => app.id === id);
      if (!app) {
        return { status: 404, body: { error: 'App not found' } };
      }
      return app;
    }
  }));
  
  // For testing purposes, allow skipping the server start
  if (process.env.NODE_ENV === 'test') {
    return {
      app,
      close: () => {
        // No-op for testing
      }
    };
  }
  
  // Start the server using Node's http module
  const { createServer } = require('http');
  const httpHandler = toNodeListener(app);
  const httpServer = createServer(httpHandler);
  
  httpServer.listen(port, () => {
    console.log(`Proxy server running at http://localhost:${port}`);
  });
  
  return {
    app,
    close: () => {
      httpServer.close();
    }
  };
}

/**
 * Read request body
 */
async function readBody(event: any): Promise<any> {
  return new Promise<any>((resolve) => {
    let body = '';
    
    event.node.req.on('data', (chunk: Buffer) => {
      body += chunk.toString();
    });
    
    event.node.req.on('end', () => {
      try {
        resolve(JSON.parse(body));
      } catch (error) {
        resolve({});
      }
    });
  });
}