const config = {
  api: {
    baseUrl: process.env.CEITBA_API_URL || "http://localhost",
    endpoints: {
      subjects: "/api/v1/subjects",
    },
  },
} as const;

export default config;
