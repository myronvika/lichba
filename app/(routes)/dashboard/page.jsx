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

// Мінімальний переклад імен
function translateName(user) {
    if (!user) return 'Користувач';

    const names = {
        'victoria': 'Вікторія', 'victor': 'Віктор', 'john': 'Іван', 'mary': 'Марія',
        'mike': 'Михайло', 'alex': 'Олекс', 'anna': 'Анна', 'kate': 'Катя'
    };

    const name = user.firstName || user.fullName || 'Користувач';
    const lowerName = name.toLowerCase();

    for (const [eng, ukr] of Object.entries(names)) {
        if (lowerName.includes(eng)) return ukr;
    }

    return name;
}

export default function Dashboard() {
    const { user } = useUser()
    const translatedName = translateName(user)

    const [budgetList, setBudgetList] = useState([])
    const [latestBudgets, setLatestBudgets] = useState([])
    const [transactionsList, setTransactionsList] = useState([])

    useEffect(() => {
        if (user) getBudgetList()
    }, [user])

    const getBudgetList = async () => {
        try {
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

            const incomeData = await db.select({
                budgetId: Income.budgetId,
                totalIncome: sql`COALESCE(sum(${Income.amount}), 0)`.mapWith(Number)
            }).from(Income)
                .innerJoin(Budgets, eq(Income.budgetId, Budgets.id))
                .where(eq(Budgets.createdBy, user.primaryEmailAddress.emailAddress))
                .groupBy(Income.budgetId);

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
            console.error('Помилка завантаження бюджетів:', error)
        }
    }

    const getAllTransactions = async () => {
        try {
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

            const expensesWithType = expenses.map(expense => ({
                ...expense,
                type: 'expense'
            }));

            const incomeWithType = income.map(incomeItem => ({
                ...incomeItem,
                type: 'income'
            }));

            const allTransactions = [...expensesWithType, ...incomeWithType]
                .sort((a, b) => {
                    const parseDate = (dateStr) => {
                        const [day, month, year] = dateStr.split('/');
                        return new Date(year, month - 1, day);
                    };

                    const dateA = parseDate(a.createdAt);
                    const dateB = parseDate(b.createdAt);

                    if (dateA.getTime() !== dateB.getTime()) {
                        return dateB.getTime() - dateA.getTime();
                    }

                    return b.id - a.id;
                })
                .slice(0, 10)

            setTransactionsList(allTransactions)
        } catch (error) {
            console.error('Помилка завантаження транзакцій:', error)
        }
    }

    return (
        <div className="p-8">
            <h2 className="font-bold text-4xl">Привіт, {translatedName} ✌️</h2>
            <p className="text-gray-500 mb-8">
                Ось що відбувається з вашими фінансами. Давайте керувати вашими витратами!
            </p>

            <CardInfo budgetList={budgetList} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mt-6">
                <div className="lg:col-span-2 space-y-6">
                    <BarChartDashboard budgetList={budgetList} />
                    <TransactionsList
                        transactionsList={transactionsList}
                        refreshData={getBudgetList}
                    />
                </div>

                <div className="space-y-4">
                    <h2 className="font-bold text-lg">Останні конверти</h2>
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