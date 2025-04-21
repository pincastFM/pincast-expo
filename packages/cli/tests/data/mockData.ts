// Mock data for tests

export const dataStore = {
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

export const appsStore = [
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