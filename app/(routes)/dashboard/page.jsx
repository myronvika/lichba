// app/(routes)/dashboard/page.jsx
"use client"

import React, { useEffect, useState } from 'react'
import { UserButton, useUser } from "@clerk/nextjs"
import CardInfo from './_components/CardInfo'
import { db } from '@/utils/dbConfig'
import { desc, eq, getTableColumns, sql } from 'drizzle-orm'
import { Budgets, Expenses, Income } from '@/utils/schema'
import BarChartDashboard from './_components/BarChartDashboard'
import BudgetItem from './budgets/_components/BudgetItem'
import TransactionsList from './_components/TransactionsList'

export default function Dashboard() {
    const { user } = useUser()

    // ВСІ бюджети для фільтра у Activity
    const [budgetList, setBudgetList] = useState([])
    // Останні 4 бюджети для секції Latest Budgets
    const [latestBudgets, setLatestBudgets] = useState([])
    // ✅ ЗМІНЕНО: Останні 10 транзакцій (доходи + витрати)
    const [transactionsList, setTransactionsList] = useState([])

    useEffect(() => {
        if (user) getBudgetList()
    }, [user])

    // Завантажуємо всі бюджети + відбираємо останні 4
    const getBudgetList = async () => {
        try {
            // Отримуємо бюджети з витратами
            const budgetsWithExpenses = await db
                .select({
                    ...getTableColumns(Budgets),
                    totalSpend: sql`COALESCE(sum(${Expenses.amount}), 0)`.mapWith(Number),
                    totalItem: sql`count(${Expenses.id})`.mapWith(Number),
                })
                .from(Budgets)
                .leftJoin(Expenses, eq(Budgets.id, Expenses.budgetId))
                .where(eq(Budgets.createdBy, user.primaryEmailAddress.emailAddress))
                .groupBy(Budgets.id)
                .orderBy(desc(Budgets.id))

            // Окремо отримуємо доходи для кожного бюджету
            const incomeData = await db.select({
                budgetId: Income.budgetId,
                totalIncome: sql`COALESCE(sum(${Income.amount}), 0)`.mapWith(Number)
            }).from(Income)
                .innerJoin(Budgets, eq(Income.budgetId, Budgets.id))
                .where(eq(Budgets.createdBy, user.primaryEmailAddress.emailAddress))
                .groupBy(Income.budgetId);

            // Об'єднуємо дані
            const result = budgetsWithExpenses.map(budget => {
                const incomeForBudget = incomeData.find(income => income.budgetId === budget.id);
                return {
                    ...budget,
                    totalIncome: incomeForBudget ? incomeForBudget.totalIncome : 0
                };
            });

            setBudgetList(result)
            setLatestBudgets(result.slice(0, 4))
            getAllTransactions()
        } catch (error) {
            console.error('Error loading budgets:', error)
        }
    }

    // ✅ НОВА ФУНКЦІЯ: Завантажуємо всі типи транзакцій
    const getAllTransactions = async () => {
        try {
            // Отримуємо витрати
            const expenses = await db
                .select({
                    id: Expenses.id,
                    name: Expenses.name,
                    amount: Expenses.amount,
                    createdAt: Expenses.createdAt,
                    budgetId: Expenses.budgetId,
                    budgetName: Budgets.name,
                    budgetIcon: Budgets.icon,
                })
                .from(Expenses)
                .innerJoin(Budgets, eq(Expenses.budgetId, Budgets.id))
                .where(eq(Budgets.createdBy, user.primaryEmailAddress.emailAddress))
                .orderBy(desc(Expenses.id))

            // Отримуємо доходи
            const income = await db
                .select({
                    id: Income.id,
                    name: Income.name,
                    amount: Income.amount,
                    createdAt: Income.createdAt,
                    budgetId: Income.budgetId,
                    budgetName: Budgets.name,
                    budgetIcon: Budgets.icon,
                })
                .from(Income)
                .innerJoin(Budgets, eq(Income.budgetId, Budgets.id))
                .where(eq(Budgets.createdBy, user.primaryEmailAddress.emailAddress))
                .orderBy(desc(Income.id))

            // Додаємо тип до кожної транзакції в JavaScript
            const expensesWithType = expenses.map(expense => ({
                ...expense,
                type: 'expense'
            }));

            const incomeWithType = income.map(incomeItem => ({
                ...incomeItem,
                type: 'income'
            }));

            // Об'єднуємо всі транзакції та сортуємо за датою створення
            const allTransactions = [...expensesWithType, ...incomeWithType]
                .sort((a, b) => {
                    // Спочатку сортуємо за ID (новіші спочатку)
                    if (a.id !== b.id) {
                        return b.id - a.id;
                    }
                    // Якщо ID однакові, сортуємо за типом (доходи спочатку)
                    if (a.type === 'income' && b.type === 'expense') return -1;
                    if (a.type === 'expense' && b.type === 'income') return 1;
                    return 0;
                })
                .slice(0, 10) // Беремо останні 10 транзакцій

            console.log('All transactions:', allTransactions); // Для дебагу
            setTransactionsList(allTransactions)
        } catch (error) {
            console.error('Error loading transactions:', error)
        }
    }

    return (
        <div className="p-8">
            <h2 className="font-bold text-4xl">Hi, {user?.fullName} ✌️</h2>
            <p className="text-gray-500 mb-8">
                Ось що відбувається з вашими фінансами. Давайте керувати вашими витратами!
            </p>

            <CardInfo budgetList={budgetList} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mt-6">
                {/* Activity + Latest Transactions */}
                <div className="lg:col-span-2 space-y-6">
                    <BarChartDashboard budgetList={budgetList} />
                    <TransactionsList
                        transactionsList={transactionsList}
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