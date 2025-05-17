// app/_components/Header.jsx
'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useUser, UserButton } from '@clerk/nextjs'

export default function Header() {
    const { isSignedIn } = useUser()

    return (
        <nav className="sticky top-0 z-50 w-full bg-white border-b shadow-sm">
            <div className="max-w-screen-xl mx-auto flex items-center justify-between p-4">
                {/* Логотип */}
                <Link href="/" className="flex items-center space-x-2">
                    <Image src="/logo.svg" alt="Логотип" width={40} height={40} />
                    <span className="text-xl font-bold">Lichba Tracker</span>
                </Link>

                {/* Кнопки авторизації */}
                <div className="flex items-center space-x-3">
                    {isSignedIn ? (
                        <UserButton />
                    ) : (
                        <>
                            <Link href="/sign-in">
                                <Button variant="outline">Увійти</Button>
                            </Link>
                            <Link href="/sign-up">
                                <Button>Реєстрація</Button>
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    )
}
