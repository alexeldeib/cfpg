import { IronSessionOptions, getIronSession, IronSessionData } from 'iron-session'

import { cookies } from 'next/headers';

const sessionOptions: IronSessionOptions = {
  password: process.env.COOKIE_PASSWORD!,
  cookieName: "cfpg",
  // secure: true should be used in production (HTTPS) but can't be used in development (HTTP)
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
  },
};

// This is where we specify the typings of req.session.*
declare module 'iron-session' {
  interface IronSessionData {
    username?: string
    userId?: string
    challenge?: string
  }
}

async function getSession(req: Request, res: Response) {
  const session = getIronSession<IronSessionData>(req, res, sessionOptions)
  return session
}

export {
  getSession,
}
