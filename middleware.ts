import { NextResponse } from "next/server";
import type { NextRequest } from 'next/server'

import { getSession } from "@/lib/session";
import { applyCookies } from "@/lib/cookies";

export const middleware = async (req: NextRequest) => {
    let res = NextResponse.next()

    const session = await getSession(req, res)

    if (session.sessionID) {
        return res
    }

    const newSessionId = crypto.randomUUID().toString()
    console.log(`generated uuid: ${newSessionId}`)
    session.sessionID = newSessionId
    await session.save()

    res = applyCookies(req, res)

    return res
}
