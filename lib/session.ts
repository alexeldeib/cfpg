import { IronSessionOptions, getIronSession, getServerActionIronSession } from 'iron-session'

import { cookies } from 'next/headers';

const sessionOptions: IronSessionOptions = {
  password: process.env.COOKIE_PASSWORD!,
  cookieName: "cfpg",
  // secure: true should be used in production (HTTPS) but can't be used in development (HTTP)
  cookieOptions: {
    secure: false,
    httpOnly: false,
  },
};

// This is where we specify the typings of req.session.*
interface IronSessionData {
  username?: string
  userId?: string
  challenge?: string
  sessionID?: string
}

async function getSession(req: Request, res: Response) {
  const session = getIronSession<IronSessionData>(req, res, sessionOptions)
  return session
}

const getServerActionSession = async () => {
  const session = getServerActionIronSession<IronSessionData>(sessionOptions, cookies())
  return session
}

export {
  getSession,
  getServerActionSession,
}
