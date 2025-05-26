"use client"
import { db } from '@/utils/dbConfig';
import { Budgets, Expenses } from '@/utils/schema';
import { desc, eq } from 'drizzle-orm';
import React, { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { ReceiptText, Calendar, DollarSign, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

function ExpensesScreen() {
    const [expensesList, setExpensesList] = useState([]);
    const [totalExpenses, setTotalExpenses] = useState(0);
    const { user } = useUser();

    useEffect(() => {
        user && getAllExpenses();
    }, [user])

    /**
     * Отримуємо всі витрати користувача
     */
    const getAllExpenses = async() => {
        const result = await db.select({
            id: Expenses.id,
            name: Expenses.name,
            amount: Expenses.amount,
            createdAt: Expenses.createdAt,
            budgetId: Expenses.budgetId,
            budgetName: Budgets.name,
            budgetIcon: Budgets.icon
        }).from(Budgets)
            .rightJoin(Expenses, eq(Budgets.id, Expenses.budgetId))
            .where(eq(Budgets.createdBy, user?.primaryEmailAddress.emailAddress))
            .orderBy(desc(Expenses.id));

        setExpensesList(result);

        // Розраховуємо загальні витрати
        const total = result.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
        setTotalExpenses(total);
    }

    /**
     * Видаляємо запис витрати та повертаємо гроші до конверта
     */
    const deleteExpense = async (expense) => {
        try {
            // Повертаємо гроші в бюджет при видаленні витрати
            const budgetCheck = await db
                .select()
                .from(Budgets)
                .where(eq(Budgets.id, expense.budgetId))
                .limit(1);

            if (budgetCheck.length > 0) {
                const currentBudget = budgetCheck[0];
                const currentAmount = parseFloat(currentBudget.amount);
                const newBudgetAmount = currentAmount + parseFloat(expense.amount);

                await db.update(Budgets)
                    .set({ amount: newBudgetAmount.toString() })
                    .where(eq(Budgets.id, expense.budgetId));
            }

            // Видаляємо запис витрати
            const result = await db.delete(Expenses)
                .where(eq(Expenses.id, expense.id))
                .returning();

            if (result) {
                toast('Витрату видалено! ₴' + parseFloat(expense.amount).toFixed(2) + ' повернено до конверта.');
                getAllExpenses(); // Оновлюємо список
            }
        } catch (error) {
            console.error('Помилка видалення витрати:', error);
            toast('Помилка видалення запису витрати', { variant: 'error' });
        }
    }

    return (
        <div className='p-10'>
            <div className='flex items-center gap-3 mb-6'>
                <div className='p-3 bg-red-100 rounded-full'>
                    <ReceiptText className='w-8 h-8 text-red-600' />
                </div>
                <div>
                    <h2 className='font-bold text-3xl text-gray-800'>Мої витрати</h2>
                    <p className='text-gray-600'>Відстежуйте всі свої витрати в різних конвертах</p>
                </div>
            </div>

            {/* Картка підсумку */}
            <div className='bg-gradient-to-r from-red-500 to-red-600 p-6 rounded-xl text-white mb-6'>
                <div className='flex items-center justify-between'>
                    <div>
                        <h3 className='text-lg opacity-90'>Загальні витрати</h3>
                        <p className='text-3xl font-bold'>₴{totalExpenses.toFixed(2)}</p>
                        <p className='text-sm opacity-90 mt-1'>{expensesList.length} записів витрат</p>
                    </div>
                    <DollarSign className='w-16 h-16 opacity-20' />
                </div>
            </div>

            {/* Список витрат */}
            <div className='bg-white rounded-lg shadow-sm border'>
                <div className='p-4 border-b bg-gray-50 rounded-t-lg'>
                    <h2 className='font-bold text-lg flex items-center gap-2'>
                        <Calendar className='w-5 h-5' />
                        Історія витрат
                    </h2>
                </div>

                {expensesList.length > 0 ? (
                    <div className='divide-y'>
                        {expensesList.map((expense, index) => (
                            <div
                                key={expense.id}
                                className='p-4 hover:bg-red-50 transition-colors'
                            >
                                {/* ✅ ФІКСОВАНА СІТКА З ВИЗНАЧЕНИМИ ШИРИНАМИ КОЛОНОК */}
                                <div className='grid grid-cols-12 gap-4 items-center'>
                                    {/* Інформація про конверт - 3 колонки */}
                                    <div className='col-span-3 flex items-center gap-2'>
                                        <span className='text-2xl'>{expense.budgetIcon}</span>
                                        <div className='min-w-0'>
                                            <p className='font-medium text-gray-800 truncate'>{expense.budgetName}</p>
                                            <p className='text-sm text-gray-500'>Конверт</p>
                                        </div>
                                    </div>

                                    {/* Деталі витрати - 4 колонки */}
                                    <div className='col-span-4 min-w-0'>
                                        <p className='font-medium text-gray-800 truncate'>{expense.name}</p>
                                        <p className='text-sm text-gray-500 flex items-center gap-1'>
                                            <Calendar className='w-3 h-3 flex-shrink-0' />
                                            <span className='truncate'>{expense.createdAt}</span>
                                        </p>
                                    </div>

                                    {/* Сума - 3 колонки */}
                                    <div className='col-span-3 text-right'>
                                        <p className='text-xl font-bold text-red-600'>
                                            -₴{parseFloat(expense.amount).toFixed(2)}
                                        </p>
                                        <span className='inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800'>
                                            Витрачено з конверта
                                        </span>
                                    </div>

                                    {/* Кнопка видалення - 2 колонки */}
                                    <div className='col-span-2 flex justify-center'>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <button className='p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors'>
                                                    <Trash2 className='w-4 h-4' />
                                                </button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Видалити запис витрати?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        Це видалить "{expense.name}" та поверне ₴{parseFloat(expense.amount).toFixed(2)} до вашого конверта "{expense.budgetName}". Цю дію не можна скасувати.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Скасувати</AlertDialogCancel>
                                                    <AlertDialogAction
                                                        onClick={() => deleteExpense(expense)}
                                                        className="bg-red-600 hover:bg-red-700"
                                                    >
                                                        Видалити
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className='p-12 text-center'>
                        <div className='w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                            <ReceiptText className='w-8 h-8 text-gray-400' />
                        </div>
                        <h3 className='text-lg font-medium text-gray-800 mb-2'>Ще немає записів витрат</h3>
                        <p className='text-gray-500 max-w-md mx-auto'>
                            Почніть витрачати з ваших конвертів, щоб побачити записи витрат тут.
                            Перейдіть до будь-якого конверта та скористайтеся функцією "Витратити з конверта".
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default ExpensesScreen