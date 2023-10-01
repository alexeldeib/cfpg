// Next.js Edge API Route Handlers: https://nextjs.org/docs/app/building-your-application/routing/router-handlers#edge-and-nodejs-runtimes

import { NextRequest, NextResponse } from 'next/server'
import { parse } from 'cookie'

import { getSession } from '@/lib/session'

export const runtime = 'edge'

export async function GET(req: NextRequest) {
    const res = new Response()

    console.log(`checking da cookies`)

    // const reqCookie = getRequestCookie(req, 'cfpg')
    const cookie = req.headers.get('cookie')
    if (cookie) {
        console.log(`cookie in GET /me: ${JSON.stringify(cookie)}`)
    }
    const session = await getSession(req, res)

    console.log(`session in GET /me: ${JSON.stringify(session)}`)

    if (!session.userId) {
        return new NextResponse(null, { status: 403 })
    }
    
    return NextResponse.json(session)
}

function getRequestCookie(res: NextRequest, cookieName: string): string | undefined {
    const cookie = res.headers.get('cookie')
    if (cookie) {
        return (
            parse(cookie)[cookieName]
        )
    }
    return undefined
}
