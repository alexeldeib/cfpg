import { NextResponse } from 'next/server';
import { generateRegistrationOptions, verifyRegistrationResponse } from '@simplewebauthn/server';
import type { AuthenticatorTransportFuture } from '@simplewebauthn/typescript-types';

import { db } from '@/lib/db'
import { expectedOrigin, rpID, rpName } from '@/lib/webauthn'

export async function GET(req: Request) {
    const user = await getUserFromDB('ace')

    if (!user) {
        return new NextResponse('no user found', {
            status: 400,
        })
    }

    const authenticators: { 
        credentialId: string
        publicKey: Buffer
        counter: string
        transports: string | null
    }[] = await getUserAuthenticators(user.id)
    
    const options = await generateRegistrationOptions({
        rpName,
        rpID,
        userID: user.id,
        userName: user.username,
        attestationType: 'none',
        authenticatorSelection: {
            residentKey: 'required',
            userVerification: 'preferred',
        },
    });
      
    await setUserCurrentChallenge(user.id, options.challenge)

    return NextResponse.json(options);
}

export async function POST(req: Request) {
    const body = await req.json()

    const user = await getUserFromDB('ace')
    if (!user) {
        return new NextResponse('no user found', {
            status: 400,
        })
    }

    const currentChallenge = (await getUserCurrentChallenge(user.id));
    if (!currentChallenge) {
        return new NextResponse('no challenge found', {
            status: 400,
        })
    }

    const expectedChallenge = currentChallenge.content
    
    const verification = await verifyRegistrationResponse({
        response: body,
        expectedChallenge,
        expectedOrigin: expectedOrigin,
        expectedRPID: rpID,
        requireUserVerification: true,
    });

    const { verified } = verification;

    if (verified) {
        saveNewUserAuthenticatorInDB(user.id, verification.registrationInfo?.credentialID?.toString()!, Buffer.from(verification.registrationInfo?.credentialPublicKey.buffer!), verification.registrationInfo?.counter.toString()!)
    }

    return NextResponse.json({ verified });
}


async function getUserFromDB(username: string) {
    return await db.selectFrom('User')
        .selectAll()
        .where('username', '=', username)
        .executeTakeFirst()
}

async function getUserAuthenticators(userId: string) {
    return await db
        .selectFrom('Authenticator')
        .select(['credentialId', 'counter', 'publicKey', 'transports'])
        .where('userId', '=', userId)
        .execute()
}

async function getUserCurrentChallenge(userId: string) {
    return await db
        .selectFrom('Challenge')
        .select(['content'])
        .where('userId', '=', userId)
        .executeTakeFirst()
}

async function setUserCurrentChallenge(userId: string, challenge: string) {
    return await db
        .insertInto('Challenge')
        .values({
            content: challenge,
            userId: userId,
        })
        .onConflict((oc) => oc
            .column('userId')
            .doUpdateSet({ content: challenge })
        )
        .executeTakeFirst()
}

async function saveNewUserAuthenticatorInDB(userId: string, credentialId: string, credentialPublicKey: Buffer, counter: string) {
    return await db
        .insertInto('Authenticator')
        .values({
            userId: userId,
            credentialId: credentialId,
            counter: counter,
            publicKey: credentialPublicKey,
        })
        .executeTakeFirstOrThrow()
}
