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

    const calculateProgressPerc = () => {
        const originalAmount = parseFloat(budget.amount) || 0;
        const totalSpend = budget.totalSpend || 0;

        if (originalAmount === 0) return 0;

        // Відсоток витрат від початкового бюджету
        const spentPercentage = (totalSpend / originalAmount) * 100;
        return spentPercentage > 100 ? 100 : spentPercentage.toFixed(2);
    };

    const getProgressColor = () => {
        const currentBalance = calculateCurrentBalance();
        const originalAmount = parseFloat(budget.amount) || 0;

        if (currentBalance < 0) {
            return 'bg-red-500'; // Червоний якщо перевищено бюджет
        } else if (currentBalance < originalAmount * 0.2) {
            return 'bg-orange-500'; // Помаранчевий якщо залишилось менше 20%
        } else if (currentBalance < originalAmount * 0.5) {
            return 'bg-yellow-500'; // Жовтий якщо залишилось менше 50%
        }
        return 'bg-primary'; // Стандартний колір
    };

    const currentBalance = calculateCurrentBalance();
    const originalAmount = parseFloat(budget.amount) || 0;

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
                        ${originalAmount.toFixed(2)}
                    </h2>
                </div>

                <div className='mt-5'>
                    <div className='flex items-center justify-between mb-3'>
                        <h2 className='text-xs text-slate-400'>
                            ${budget.totalSpend?.toFixed(2) || '0.00'} витрачено
                        </h2>
                        <h2 className={`text-xs font-semibold ${
                            currentBalance < 0 ? 'text-red-600' : 'text-slate-400'
                        }`}>
                            ${currentBalance.toFixed(2)} залишилось
                        </h2>
                    </div>

                    {/* Показуємо доходи якщо є */}
                    {budget.totalIncome > 0 && (
                        <div className='flex items-center justify-center mb-2'>
                            <span className='text-xs text-green-600 font-medium'>
                                +${budget.totalIncome?.toFixed(2) || '0.00'} доходи
                            </span>
                        </div>
                    )}

                    {/* Прогрес бар */}
                    <div className='w-full bg-slate-300 h-2 rounded-full'>
                        <div
                            className={`h-2 rounded-full transition-all duration-300 ${getProgressColor()}`}
                            style={{
                                width: `${calculateProgressPerc()}%`
                            }}
                        />
                    </div>
                </div>
            </div>
        </Link>
    )
}

export default BudgetItem