'use client'
import React, { useEffect } from 'react'
import Header from '@/app/_components/Header'         // глобальний Header
import SideNav from './_components/SideNav'
import { db } from '@/utils/dbConfig'
import { Budgets } from '@/utils/schema'
import { useUser } from '@clerk/nextjs'
import { eq } from 'drizzle-orm'
import { useRouter } from 'next/navigation'

export default function DashboardLayout({ children }) {
    const { user } = useUser()
    const router = useRouter()

    useEffect(() => {
        // Після того, як користувач авторизувався, перевіряємо, чи є в нього конверти
        if (user) checkUserBudgets()
    }, [user])

    // Отримуємо всі конверти, створені цим користувачем
    const checkUserBudgets = async () => {
        const result = await db
            .select()
            .from(Budgets)
            .where(eq(Budgets.createdBy, user?.primaryEmailAddress?.emailAddress))

        if (!result.length) {
            router.replace('/dashboard/budgets')
        }
    }

    return (
        <div className="flex flex-col min-h-screen">
            {/* Єдиний верхній Header */}
            <Header />

            <div className="flex flex-1">
                {/* Бокова навігація */}
                <aside className="hidden md:block md:w-64">
                    <SideNav />
                </aside>

                {/* Основний контент (без дублювання Header) */}
                <main className="flex-1 p-6 overflow-auto">
                    {children}
                </main>
            </div>
        </div>
    )
}
