const bible = {
  baseUrl:
    import.meta.env.NODE_ENV === 'production'
      ? 'https://tlabs.com.br/api'
      : 'http://localhost',
  port: 3000,
}

const Apis = {
  bible: bible,
}

export default Apis
