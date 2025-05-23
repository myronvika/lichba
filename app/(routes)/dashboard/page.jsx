// app/(routes)/dashboard/page.jsx
"use client"

import React, { useEffect, useState } from 'react'
import { UserButton, useUser } from "@clerk/nextjs"
import CardInfo from './_components/CardInfo'
import { db } from '@/utils/dbConfig'
import { desc, eq, getTableColumns, sql } from 'drizzle-orm'
import { Budgets, Expenses } from '@/utils/schema'
import BarChartDashboard from './_components/BarChartDashboard'
import BudgetItem from './budgets/_components/BudgetItem'
import ExpenseListTable from './expenses/_components/ExpenseListTable'

export default function Dashboard() {
    const { user } = useUser()

    // ВСІ бюджети для фільтра у Activity
    const [budgetList, setBudgetList] = useState([])
    // Останні 4 бюджети для секції Latest Budgets
    const [latestBudgets, setLatestBudgets] = useState([])
    // Останні 5 витрат
    const [expensesList, setExpensesList] = useState([])

    useEffect(() => {
        if (user) getBudgetList()
    }, [user])

    // Завантажуємо всі бюджети + відбираємо останні 4
    const getBudgetList = async () => {
        const all = await db
            .select({
                ...getTableColumns(Budgets),
                totalSpend: sql`sum(${Expenses.amount})`.mapWith(Number),
                totalItem:  sql`count(${Expenses.id})`.mapWith(Number),
            })
            .from(Budgets)
            .leftJoin(Expenses, eq(Budgets.id, Expenses.budgetId))
            .where(eq(Budgets.createdBy, user.primaryEmailAddress.emailAddress))
            .groupBy(Budgets.id)
            .orderBy(desc(Budgets.id))  // без .limit — отримаємо всі
        setBudgetList(all)
        setLatestBudgets(all.slice(0, 4))  // тільки 4 перші
        getAllExpenses()
    }

    // Завантажуємо 5 останніх витрат
    const getAllExpenses = async () => {
        const recent = await db
            .select({
                id:        Expenses.id,
                name:      Expenses.name,
                amount:    Expenses.amount,
                createdAt: Expenses.createdAt,
            })
            .from(Expenses)
            .innerJoin(Budgets, eq(Expenses.budgetId, Budgets.id))
            .where(eq(Budgets.createdBy, user.primaryEmailAddress.emailAddress))
            .orderBy(desc(Expenses.id))
            .limit(5)
        setExpensesList(recent)
    }

    return (
        <div className="p-8">
            <h2 className="font-bold text-4xl">Hi, {user?.fullName} ✌️</h2>
            <p className="text-gray-500 mb-8">
                Ось що відбувається з вашими фінансами. Давайте керувати вашими витратами!
            </p>

            <CardInfo budgetList={budgetList} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mt-6">
                {/* Activity + Latest Expenses */}
                <div className="lg:col-span-2 space-y-6">
                    <BarChartDashboard budgetList={budgetList} />
                    <ExpenseListTable
                        expensesList={expensesList}
                        refreshData={getBudgetList}
                    />
                </div>

                {/* Latest Budgets (тільки 4) */}
                <div className="space-y-4">
                    <h2 className="font-bold text-lg">Latest Budgets</h2>
                    {latestBudgets.length > 0 ? (
                        latestBudgets.map(b => (
                            <BudgetItem key={b.id} budget={b} />
                        ))
                    ) : (
                        [1,2,3,4].map((_, i) => (
                            <div
                                key={i}
                                className="h-[180px] w-full bg-slate-200 rounded-lg animate-pulse"
                            />
                        ))
                    )}
                </div>
            </div>
        </div>
    )
}
