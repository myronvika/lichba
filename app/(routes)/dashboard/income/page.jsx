"use client"
import { db } from '@/utils/dbConfig';
import { Budgets, Income } from '@/utils/schema';
import { desc, eq } from 'drizzle-orm';
import React, { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { TrendingUp, Calendar, DollarSign, Trash2 } from 'lucide-react';
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

function IncomeScreen() {
    const [incomeList, setIncomeList] = useState([]);
    const [totalIncome, setTotalIncome] = useState(0);
    const { user } = useUser();

    // Після автентифікації викликаємо завантаження всіх доходів
    useEffect(() => {
        user && getAllIncome();
    }, [user])

    //Отримуємо всі записи доходів користувача
    const getAllIncome = async() => {
        const result = await db.select({
            id: Income.id,
            name: Income.name,
            amount: Income.amount,
            createdAt: Income.createdAt,
            budgetId: Income.budgetId,
            budgetName: Budgets.name,
            budgetIcon: Budgets.icon
        }).from(Budgets)
            .rightJoin(Income, eq(Budgets.id, Income.budgetId))
            .where(eq(Budgets.createdBy, user?.primaryEmailAddress.emailAddress))
            .orderBy(desc(Income.id));

        setIncomeList(result);

        // Розраховуємо загальний дохід
        const total = result.reduce((sum, income) => sum + parseFloat(income.amount), 0);
        setTotalIncome(total);
    }

    //Видаляємо запис доходу та знімаємо гроші з конверта
    const deleteIncome = async (income) => {
        try {
            // Знімаємо гроші з бюджету при видаленні доходу
            const budgetCheck = await db
                .select()
                .from(Budgets)
                .where(eq(Budgets.id, income.budgetId))
                .limit(1);

            if (budgetCheck.length > 0) {
                const currentBudget = budgetCheck[0];
                const currentAmount = parseFloat(currentBudget.amount);
                const newBudgetAmount = Math.max(0, currentAmount - parseFloat(income.amount));

                await db.update(Budgets)
                    .set({ amount: newBudgetAmount.toString() })
                    .where(eq(Budgets.id, income.budgetId));
            }

            // Видаляємо запис доходу
            const result = await db.delete(Income)
                .where(eq(Income.id, income.id))
                .returning();

            if (result) {
                toast('Запис доходу видалено! ₴' + parseFloat(income.amount).toFixed(2) + ' знято з конверта.');
                getAllIncome(); // Оновлюємо список
            }
        } catch (error) {
            console.error('Помилка видалення доходу:', error);
            toast('Помилка видалення запису доходу', { variant: 'error' });
        }
    }

    return (
        <div className='p-10'>
            <div className='flex items-center gap-3 mb-6'>
                <div className='p-3 bg-green-100 rounded-full'>
                    <TrendingUp className='w-8 h-8 text-green-600' />
                </div>
                <div>
                    <h2 className='font-bold text-3xl text-gray-800'>Мої доходи</h2>
                    <p className='text-gray-600'>Відстежуйте всі ваші доходи по конвертах</p>
                </div>
            </div>

            {/* Картка підсумку */}
            <div className='bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-xl text-white mb-6'>
                <div className='flex items-center justify-between'>
                    <div>
                        <h3 className='text-lg opacity-90'>Загальний дохід</h3>
                        <p className='text-3xl font-bold'>₴{totalIncome.toFixed(2)}</p>
                        <p className='text-sm opacity-90 mt-1'>{incomeList.length} записів доходів</p>
                    </div>
                    <DollarSign className='w-16 h-16 opacity-20' />
                </div>
            </div>

            {/* Список доходів */}
            <div className='bg-white rounded-lg shadow-sm border'>
                <div className='p-4 border-b bg-gray-50 rounded-t-lg'>
                    <h2 className='font-bold text-lg flex items-center gap-2'>
                        <Calendar className='w-5 h-5' />
                        Історія доходів
                    </h2>
                </div>

                {incomeList.length > 0 ? (
                    <div className='divide-y'>
                        {incomeList.map((income, index) => (
                            <div
                                key={income.id}
                                className='p-4 hover:bg-green-50 transition-colors'
                            >
                                <div className='grid grid-cols-12 gap-4 items-center'>
                                    {/* Інформація про конверт - 3 колонки */}
                                    <div className='col-span-3 flex items-center gap-2'>
                                        <span className='text-2xl'>{income.budgetIcon}</span>
                                        <div className='min-w-0'>
                                            <p className='font-medium text-gray-800 truncate'>{income.budgetName}</p>
                                            <p className='text-sm text-gray-500'>Конверт</p>
                                        </div>
                                    </div>

                                    {/* Деталі доходу - 4 колонки */}
                                    <div className='col-span-4 min-w-0'>
                                        <p className='font-medium text-gray-800 truncate'>{income.name}</p>
                                        <p className='text-sm text-gray-500 flex items-center gap-1'>
                                            <Calendar className='w-3 h-3 flex-shrink-0' />
                                            <span className='truncate'>{income.createdAt}</span>
                                        </p>
                                    </div>

                                    {/* Сума - 3 колонки */}
                                    <div className='col-span-3 text-right'>
                                        <p className='text-xl font-bold text-green-600'>
                                            +₴{parseFloat(income.amount).toFixed(2)}
                                        </p>
                                        <span className='inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800'>
                                            Додано до конверта
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
                                                    <AlertDialogTitle>Видалити запис доходу?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        Це видалить "{income.name}" та зніме ₴{parseFloat(income.amount).toFixed(2)} з вашого конверта "{income.budgetName}". Цю дію не можна скасувати.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Скасувати</AlertDialogCancel>
                                                    <AlertDialogAction
                                                        onClick={() => deleteIncome(income)}
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
                            <TrendingUp className='w-8 h-8 text-gray-400' />
                        </div>
                        <h3 className='text-lg font-medium text-gray-800 mb-2'>Ще немає записів доходів</h3>
                        <p className='text-gray-500 max-w-md mx-auto'>
                            Почніть додавати гроші до ваших конвертів, щоб побачити записи доходів тут.
                            Перейдіть до будь-якого конверта та скористайтеся функцією "Додати гроші".
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default IncomeScreen