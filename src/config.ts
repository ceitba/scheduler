const config = {
  api: {
    baseUrl: import.meta.env.VITE_CEITBA_API_URL as string,
    endpoints: {
      subjects: '/api/v1/subjects',
    },
  },
} as const

export default config
