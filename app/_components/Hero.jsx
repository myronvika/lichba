// app/_components/Hero.jsx
'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'

export default function Hero() {
    return (
        <section className="bg-gray-50 flex flex-col items-center text-center">
            <div className="w-full max-w-screen-xl px-4 py-32">
                <h1 className="text-3xl font-extrabold sm:text-5xl">
                    Керуйте своїми витратами
                    <span className="block text-primary mt-2">
            Контролюйте свій бюджет!
          </span>
                </h1>
                <p className="mt-4 text-gray-600 sm:text-xl sm:leading-relaxed">
                    Почніть створювати бюджет та економити гроші
                </p>
                <div className="mt-8">
                    <Link
                        href="/sign-in"
                        className="inline-block rounded-md bg-primary px-8 py-3 text-lg font-medium text-white hover:bg-primary/90 transition"
                    >
                        Почати
                    </Link>
                </div>
            </div>
            <div className="w-full overflow-hidden">
                <Image
                    src="/dashboard.png"
                    alt="Попередній перегляд дашборда"
                    width={1200}
                    height={700}
                    className="mx-auto rounded-xl shadow-lg"
                />
            </div>
        </section>
    )
}
