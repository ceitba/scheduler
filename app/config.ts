const config = {
  api: {
    baseUrl: process.env.NEXT_PUBLIC_CEITBA_API_URL,
    endpoints: {
      subjects: "/api/v1/subjects",
    },
  },
} as const;

export default config;
