import { Router } from 'itty-router'

const router = Router()

router.get('/api/models', async () => {
  // TODO: Fetch models from MongoDB or another data source
  return new Response(JSON.stringify([]), {
    headers: { 'Content-Type': 'application/json' },
  })
})

router.all('*', () => new Response('Not Found', { status: 404 }))

export default { fetch: router.handle }
