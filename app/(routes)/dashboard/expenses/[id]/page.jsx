"use client"
import { db } from '@/utils/dbConfig';
import { Budgets, Expenses, Income } from '@/utils/schema';
import { useUser } from '@clerk/nextjs';
import { desc, eq, getTableColumns, sql } from 'drizzle-orm';
import React, { useEffect, useState, use } from 'react';
import BudgetItem from '../../budgets/_components/BudgetItem';
import AddExpense from '../_components/AddExpense';
import IncomeExpenseList from '../_components/IncomeExpenseList';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Trash } from 'lucide-react';
import {AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,} from "@/components/ui/alert-dialog";
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import EditBudget from '../_components/EditBudget';

function ExpensesScreen({ params }) {
    const { id } = use(params);
    const { user } = useUser();
    const [budgetInfo, setBudgetInfo] = useState();
    const [expensesList, setExpensesList] = useState([]);
    const [incomeList, setIncomeList] = useState([]);
    const route = useRouter();

    useEffect(() => {
        user && getBudgetInfo();
    }, [user]);

    // Завантажуємо інформацію про конверт: загальні витрати, доходи і кількість
    const getBudgetInfo = async () => {
        try {
            // Отримуємо конверт з агрегацією витрат
            const result = await db.select({
                ...getTableColumns(Budgets),
                totalSpend: sql`COALESCE(sum(${Expenses.amount}), 0)`.mapWith(Number),
                totalItem: sql`count(${Expenses.id})`.mapWith(Number)
            }).from(Budgets)
                .leftJoin(Expenses, eq(Budgets.id, Expenses.budgetId))
                .where(eq(Budgets.createdBy, user?.primaryEmailAddress?.emailAddress))
                .where(eq(Budgets.id, parseInt(id)))
                .groupBy(Budgets.id);

            if (result.length === 0) {
                toast.error('Бюджет не знайдено');
                route.back();
                return;
            }

            // Отримуємо сумарний дохід окремо
            const incomeData = await db.select({
                totalIncome: sql`COALESCE(sum(${Income.amount}), 0)`.mapWith(Number)
            }).from(Income)
                .where(eq(Income.budgetId, parseInt(id)));

            // Об'єднуємо дані з доходами
            const budgetWithIncome = {
                ...result[0],
                totalIncome: incomeData.length > 0 ? incomeData[0].totalIncome : 0
            };

            setBudgetInfo(budgetWithIncome);
            getExpensesList();
            getIncomeList();

        } catch (error) {
            console.error('Помилка завантаження бюджету:', error);
            toast.error('Помилка завантаження бюджету');
        }
    }

    // Завантажуємо список витрат для конверта
    const getExpensesList = async () => {
        try {
            const result = await db.select().from(Expenses)
                .where(eq(Expenses.budgetId, parseInt(id)))
                .orderBy(desc(Expenses.id));
            setExpensesList(result);
        } catch (error) {
            console.error('Помилка завантаження витрат:', error);
        }
    }

    // Завантажуємо список доходів для конверта
    const getIncomeList = async () => {
        try {
            const result = await db.select().from(Income)
                .where(eq(Income.budgetId, parseInt(id)))
                .orderBy(desc(Income.id));
            setIncomeList(result);
        } catch (error) {
            console.error('Помилка завантаження доходів:', error);
        }
    }

    // Видалення конверта разом з усіма доходами і витратами
    const deleteBudget = async () => {
        try {
            // Видаляємо всі доходи
            await db.delete(Income)
                .where(eq(Income.budgetId, parseInt(id)));

            // Видаляємо всі витрати
            await db.delete(Expenses)
                .where(eq(Expenses.budgetId, parseInt(id)));

            // Видаляємо бюджет
            await db.delete(Budgets)
                .where(eq(Budgets.id, parseInt(id)));

            toast.success('Конверт видалено!');
            route.replace('/dashboard/budgets');
        } catch (error) {
            console.error('Помилка видалення:', error);
            toast.error('Помилка видалення конверта');
        }
    }

    return (
        <div className='p-10'>
            <h2 className='text-2xl font-bold gap-2 flex justify-between items-center'>
                <span className='flex gap-2 items-center'>
                    <ArrowLeft onClick={() => route.back()} className='cursor-pointer' />
                    Деталі конверта
                </span>
                <div className='flex gap-2 items-center'>
                    <EditBudget budgetInfo={budgetInfo} refreshData={() => getBudgetInfo()} />
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button className="flex gap-2" variant="destructive">
                                <Trash /> Видалити
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Ви абсолютно впевнені?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Цю дію неможливо скасувати. Це назавжди видалить ваш конверт разом з усіма записами про доходи та витрати.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Скасувати</AlertDialogCancel>
                                <AlertDialogAction onClick={() => deleteBudget()}>Продовжити</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </h2>

            <div className='grid grid-cols-1 md:grid-cols-2 mt-6 gap-5'>
                {budgetInfo ? (
                    <BudgetItem budget={budgetInfo} />
                ) : (
                    <div className='h-[200px] w-full bg-slate-200 rounded-lg animate-pulse'></div>
                )}
                <AddExpense budgetId={id} user={user} refreshData={() => getBudgetInfo()} />
            </div>

            {/* ✅ ТАБЛИЦЯ ОСТАННІХ ТРАНЗАКЦІЙ */}
            <div className='mt-4'>
                <IncomeExpenseList
                    budgetId={id}
                    incomeList={incomeList}
                    expensesList={expensesList}
                    refreshData={() => getBudgetInfo()}
                />
            </div>
        </div>
    );
}

export default ExpensesScreen;