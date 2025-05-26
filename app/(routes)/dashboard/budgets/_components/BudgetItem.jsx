import Link from 'next/link'
import React from 'react'

function BudgetItem({ budget }) {

    // Розраховуємо поточний залишок
    const calculateCurrentBalance = () => {
        const originalAmount = parseFloat(budget.amount) || 0;
        const totalSpend = budget.totalSpend || 0;
        const totalIncome = budget.totalIncome || 0;

        // Залишок = Budget Amount + Total Income - Total Expenses
        return originalAmount + totalIncome - totalSpend;
    };

    // Розраховуємо відсоток залишку (а не витрат)
    const calculateBalancePercentage = () => {
        const currentBalance = calculateCurrentBalance();
        const originalAmount = parseFloat(budget.amount) || 0;
        const totalIncome = budget.totalIncome || 0;

        // Загальна доступна сума = початковий бюджет + доходи
        const totalAvailable = originalAmount + totalIncome;

        if (totalAvailable === 0) return 0;

        // Відсоток залишку від загальної доступної суми
        const balancePercentage = (currentBalance / totalAvailable) * 100;

        // Обмежуємо від 0% до 100%
        return Math.max(0, Math.min(100, balancePercentage));
    };

    // Колір залежно від залишку
    const getProgressColor = () => {
        const balancePercentage = calculateBalancePercentage();

        if (balancePercentage <= 0) {
            return 'bg-red-500'; // Червоний якщо коштів немає
        } else if (balancePercentage <= 20) {
            return 'bg-orange-500'; // Помаранчевий якщо залишилось менше 20%
        } else if (balancePercentage <= 50) {
            return 'bg-yellow-500'; // Жовтий якщо залишилось менше 50%
        }
        return 'bg-primary'; // Стандартний колір (синій/зелений)
    };

    const currentBalance = calculateCurrentBalance();
    const originalAmount = parseFloat(budget.amount) || 0;
    const balancePercentage = calculateBalancePercentage();

    return (
        <Link href={'/dashboard/expenses/' + budget?.id}>
            <div className='p-5 border rounded-lg hover:shadow-md cursor-pointer h-[170px]'>
                <div className='flex gap-2 items-center justify-between'>
                    <div className='flex gap-2 items-center'>
                        <h2 className='text-2xl p-3 px-4 bg-slate-100 rounded-full'>
                            {budget?.icon}
                        </h2>
                        <div>
                            <h2 className='font-bold'>{budget.name}</h2>
                            <h2 className='text-sm text-gray-500'>{budget.totalItem || 0} Items</h2>
                        </div>
                    </div>
                    {/* Початковий бюджет (незмінний) */}
                    <h2 className='font-bold text-primary text-lg'>
                        {originalAmount.toFixed()}₴
                    </h2>
                </div>

                <div className='mt-5'>
                    <div className='flex items-center justify-between mb-3'>
                        {/*/!* ✅ ДОДАНО: Показуємо витрачену суму *!/*/}
                        {/*<h2 className='text-xs text-slate-400'>*/}
                        {/*    {budget.totalSpend?.toFixed(2) || '0.00'}₴ витрачено*/}
                        {/*</h2>*/}
                        <h2 className={`text-xs font-semibold ${
                            currentBalance < 0 ? 'text-red-600' : 'text-slate-400'
                        }`}>
                            {currentBalance.toFixed(2)}₴ залишилось
                        </h2>
                    </div>

                    {/*/!* ✅ ДОДАНО: Показуємо доходи якщо вони є *!/*/}
                    {/*{budget.totalIncome > 0 && (*/}
                    {/*    <div className='flex items-center justify-center mb-2'>*/}
                    {/*        <span className='text-xs text-green-600 font-medium'>*/}
                    {/*            +{budget.totalIncome?.toFixed(2) || '0.00'}₴ доходи*/}
                    {/*        </span>*/}
                    {/*    </div>*/}
                    {/*)}*/}

                    {/* ✅ ВИПРАВЛЕНО: Прогрес бар показує залишок коштів */}
                    <div className='w-full bg-slate-300 h-2 rounded-full relative'>
                        <div
                            className={`h-2 rounded-full transition-all duration-300 ${getProgressColor()}`}
                            style={{
                                width: `${balancePercentage}%`
                            }}
                        />
                        {/* ✅ ДОДАНО: Показуємо відсоток для кращого розуміння */}
                        {/*<div className='text-center mt-1'>*/}
                        {/*    <span className='text-xs text-gray-500'>*/}
                        {/*        {balancePercentage.toFixed(0)}% залишилось*/}
                        {/*    </span>*/}
                        {/*</div>*/}
                    </div>
                </div>
            </div>
        </Link>
    )
}

export default BudgetItem