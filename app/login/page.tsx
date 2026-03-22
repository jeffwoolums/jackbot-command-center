import LoginForm from '@/components/auth/LoginForm'

interface LoginPageProps {
  searchParams?: Promise<{ next?: string }>
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = searchParams ? await searchParams : undefined

  return <LoginForm nextPath={params?.next || '/'} />
}
