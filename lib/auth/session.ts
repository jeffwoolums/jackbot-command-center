const SESSION_COOKIE_NAME = 'command-center-session'
const SESSION_TTL_SECONDS = 60 * 60 * 24

function getConfiguredPassword(): string | undefined {
  return process.env.COMMAND_CENTER_PASSWORD || process.env.DASHBOARD_PASSWORD
}

async function sha256(input: string): Promise<string> {
  const data = new TextEncoder().encode(input)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}

export async function createSessionToken(password: string): Promise<string> {
  return sha256(`razor-command-center:${password}`)
}

export async function isValidPassword(password: string): Promise<boolean> {
  const configuredPassword = getConfiguredPassword()
  if (!configuredPassword) {
    return false
  }

  return password === configuredPassword
}

export async function isValidSessionToken(token?: string): Promise<boolean> {
  const configuredPassword = getConfiguredPassword()
  if (!configuredPassword || !token) {
    return false
  }

  const expectedToken = await createSessionToken(configuredPassword)
  return token === expectedToken
}

export { SESSION_COOKIE_NAME, SESSION_TTL_SECONDS }
