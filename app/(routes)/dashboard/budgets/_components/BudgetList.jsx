"use client"
import React, { useEffect, useState } from 'react'
import CreateBudget from './CreateBudget'
import { db } from '@/utils/dbConfig'
import { desc, eq, getTableColumns, sql } from 'drizzle-orm'
import { Budgets, Expenses, Income } from '@/utils/schema'
import { useUser } from '@clerk/nextjs'
import BudgetItem from './BudgetItem'

function BudgetList() {
    const [budgetList, setBudgetList] = useState([]);
    const { user } = useUser();

    useEffect(() => {
        // Отримаємо конверти після завантаження користувача
        user && getBudgetList();
    }, [user])

    //Завантажує список конвертів з підрахунком витрат та доходів
    const getBudgetList = async () => {
        try {
            // Дані конвертів зі зведеними витратами та кількістю елементів
            const budgetsWithExpenses = await db.select({
                ...getTableColumns(Budgets),
                totalSpend: sql`COALESCE(sum(${Expenses.amount}), 0)`.mapWith(Number),
                totalItem: sql`count(${Expenses.id})`.mapWith(Number)
            }).from(Budgets)
                .leftJoin(Expenses, eq(Budgets.id, Expenses.budgetId))
                .where(eq(Budgets.createdBy, user?.primaryEmailAddress?.emailAddress))
                .groupBy(Budgets.id)
                .orderBy(desc(Budgets.id));

            // Дані про доходи для кожного конверта
            const incomeData = await db.select({
                budgetId: Income.budgetId,
                totalIncome: sql`COALESCE(sum(${Income.amount}), 0)`.mapWith(Number)
            }).from(Income)
                .innerJoin(Budgets, eq(Income.budgetId, Budgets.id))
                .where(eq(Budgets.createdBy, user?.primaryEmailAddress?.emailAddress))
                .groupBy(Income.budgetId);

            // Об'єднуємо доходи з витратами в один масив
            const result = budgetsWithExpenses.map(budget => {
                const incomeForBudget = incomeData.find(income => income.budgetId === budget.id);
                return {
                    ...budget,
                    totalIncome: incomeForBudget ? incomeForBudget.totalIncome : 0
                };
            });

            console.log('Cписок конвертів з доходами:', result);
            setBudgetList(result);

        } catch (error) {
            console.error('Помилка при завантаженні конвертів:', error);
            setBudgetList([]);
        }
    }

    return (
        <div className='mt-7'>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5'>
                <CreateBudget refreshData={() => getBudgetList()} />
                {budgetList?.length > 0 ? budgetList.map((budget, index) => (
                    <BudgetItem budget={budget} key={budget.id} />
                )) : [1, 2, 3, 4, 5].map((item, index) => (
                    <div key={index} className='w-full bg-slate-200 rounded-lg h-[150px] animate-pulse'>
                    </div>
                ))
                }
            </div>
        </div>
    )
}

export default BudgetList