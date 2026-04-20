export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const config = useRuntimeConfig()

  // PIN is read from environment variable — never exposed to the client
  const valid = body.pin === config.adminPin

  return { valid }
})
