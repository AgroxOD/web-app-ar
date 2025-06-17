// Простейший Cloudflare Worker, отдаёт список моделей
import { Router } from 'itty-router'

const router = Router()

router.get('/api/models', async () => {
  // TODO: Fetch models from MongoDB or another data source
  return new Response(JSON.stringify([]), {
    headers: { 'Content-Type': 'application/json' },
  })
})

router.all('*', () => new Response('Not Found', { status: 404 }))

// Обработчик Cloudflare Worker
export default {
  async fetch(request: Request, env: unknown, ctx: ExecutionContext) {
    return router.handle(request, env, ctx)
  },
}
