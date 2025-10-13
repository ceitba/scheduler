const config = {
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
    endpoints: {
      subjects: '/api/v1/subjects'
    }
  }
} as const;

export default config; 