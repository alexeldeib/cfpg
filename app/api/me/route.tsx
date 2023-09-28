// Next.js Edge API Route Handlers: https://nextjs.org/docs/app/building-your-application/routing/router-handlers#edge-and-nodejs-runtimes

import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'

export const runtime = 'edge'

export async function GET(req: NextRequest) {
    const res = new Response()
    const session = await getSession(req, res)
    if (!session.userId) {
        return new NextResponse(null, { status: 403 })
    }
    return NextResponse.json({
        username: session.username,
        userId: session.userId,
    })
}
