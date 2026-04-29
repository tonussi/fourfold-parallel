const Apis = {
  bible: {
    baseUrl: import.meta.env.VITE_BIBLE_API_URL || 'http://localhost',
    port: import.meta.env.VITE_BIBLE_API_PORT || '3001',
  },
}

export default Apis
