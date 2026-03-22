import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const servers = [
  { hostname: 'Mac VM', ip: '100.83.144.110', status: 'online', cpu: 23, ram: 61, disk: 38 },
  { hostname: 'Orange Pi', ip: '100.114.87.93', status: 'online', cpu: 8, ram: 34, disk: 22 },
  { hostname: 'RaceStream', ip: '100.93.38.46', status: 'online', cpu: 45, ram: 78, disk: 49 },
] as const

export async function GET() {
  return NextResponse.json({ servers })
}
