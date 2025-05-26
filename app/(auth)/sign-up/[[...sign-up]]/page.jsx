// app/(auth)/sign-up/[[...sign-up]]/page.jsx
'use client'

import { SignUp } from '@clerk/nextjs'

export default function Page() {
    return (
        <section className="bg-white">
            <div className="lg:grid lg:min-h-screen lg:grid-cols-12">
                <section className="relative flex h-32 items-end bg-gray-900 lg:col-span-5 lg:h-full xl:col-span-6">
                    <img
                        alt="Фон для реєстрації"
                        src="/auth-signin.jpg"
                        className="absolute inset-0 h-full w-full object-cover opacity-80"
                    />

                    <div className="hidden lg:relative lg:block lg:p-12">
                        <a className="block text-white" href="/">
                            <span className="sr-only">Головна</span>
                        </a>
                        <h2 className="mt-6 text-2xl font-bold text-white sm:text-3xl md:text-4xl">
                            Ласкаво просимо до My Envelopes!
                        </h2>
                        <p className="mt-4 leading-relaxed text-white/90">
                            Створіть акаунт та керуйте своїми витратами
                        </p>
                    </div>
                </section>

                <main className="flex items-center justify-center px-8 py-8 sm:px-12 lg:col-span-7 lg:px-16 lg:py-12 xl:col-span-6">
                    <SignUp routing="path" path="/sign-up" signInUrl="/sign-in" />
                </main>
            </div>
        </section>
    )
}
