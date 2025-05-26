// app/layout.js
import './globals.css'
import {ClerkProvider} from '@clerk/nextjs'
import {Inter} from 'next/font/google'
import {Toaster as SonnerToaster} from 'sonner'

const inter = Inter({subsets: ['latin']})

export const metadata = {
    title: 'MyEnvelopes',
    description: 'Особистий трекер витрат',
}

export default function RootLayout({children}) {
    return (
        <ClerkProvider
            signInFallbackRedirectUrl="/dashboard"
            signUpFallbackRedirectUrl="/dashboard"
        >
            <html lang="uk">
            <body className={inter.className}>{children}
            {/* монтаж Sonner-тостеру, щоб toast.success()/toast.error() щось показували */}
            <SonnerToaster position="top-right" richColors/></body>

            </html>
        </ClerkProvider>
    )
}
