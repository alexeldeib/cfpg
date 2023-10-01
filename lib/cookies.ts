import { NextResponse, type NextRequest } from 'next/server';
import { ResponseCookies, RequestCookies } from 'next/dist/server/web/spec-extension/cookies';


/**
 * Copy cookies from the Set-Cookie header of the response to the Cookie header of the request,
 * so that it will appear to SSR/RSC as if the user already has the new cookies.
 */
export function applyCookies(req: NextRequest, res: NextResponse) {
    // parse the outgoing Set-Cookie header
    const setCookies = new ResponseCookies(res.headers);
    // Build a new Cookie header for the request by adding the setCookies
    const newReqHeaders = new Headers(req.headers);
    const newReqCookies = new RequestCookies(newReqHeaders);
    setCookies.getAll().forEach((cookie) => newReqCookies.set(cookie));
    const out = NextResponse.next({
        request: { headers: newReqHeaders },
    })
    res.headers.forEach((value, key) => {
        if (key === 'set-cookie') {
            out.headers.set(key, value);
        }
    })
    return out
}
