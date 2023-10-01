'use server'

import { getServerActionSession } from '@/lib/session';

export async function logout(formData: FormData) {
    try {
        console.log(`destroying user session if active...`)
        const session = await getServerActionSession();
        console.log(`destroying session with properties\n${JSON.stringify(session)}`)
        session.destroy()
    } catch (e) {
        console.log(`failed to destroy session: ${JSON.stringify(e)}`)
    }
}
