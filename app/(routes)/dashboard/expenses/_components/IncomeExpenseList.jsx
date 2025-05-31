// app/(routes)/dashboard/expenses/_components/IncomeExpenseList.jsx
import { db } from '@/utils/dbConfig'
import { Expenses, Income, Budgets } from '@/utils/schema'
import { eq } from 'drizzle-orm'
import { Trash, ArrowUp, ArrowDown } from 'lucide-react'
import React from 'react'
import { toast } from 'sonner'

function IncomeExpenseList({ budgetId, incomeList, expensesList, refreshData }) {

    const deleteExpense = async (expense) => {
        // Видалити запис витрати
        const result = await db.delete(Expenses)
            .where(eq(Expenses.id, expense.id))
            .returning()

        if (result) {
            toast('Витрату видалено!')
            refreshData() // Це автоматично пересчитає totalSpend
        }
    }

    const deleteIncome = async (income) => {
        // Видалити запис доходу
        const result = await db.delete(Income)
            .where(eq(Income.id, income.id))
            .returning()

        if (result) {
            toast('Запис про дохід видалено!')
            refreshData() // Це автоматично пересчитає totalSpend
        }
    }

    // Об'єднати списки доходів і витрат та відсортувати за датою (новіші зверху)
    const allTransactions = [
        ...incomeList.map(item => ({ ...item, type: 'income' })),
        ...expensesList.map(item => ({ ...item, type: 'expense' }))
    ].sort((a, b) => {
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
    });

    return (
        <div className='mt-3'>
            <h2 className='font-bold text-lg'>Останні транзакції</h2>
            <div className='grid grid-cols-5 bg-slate-200 p-2 mt-3 rounded-t-lg'>
                <h2 className='font-bold'>Тип</h2>
                <h2 className='font-bold'>Назва</h2>
                <h2 className='font-bold'>Сума</h2>
                <h2 className='font-bold'>Дата</h2>
                <h2 className='font-bold'>Дія</h2>
            </div>

            {allTransactions.length > 0 ? (
                <div className='max-h-60 overflow-y-auto'>
                    {allTransactions.map((transaction, index) => (
                        <div
                            key={`${transaction.type}-${transaction.id}`}
                            className={`grid grid-cols-5 p-2 border-b ${
                                transaction.type === 'income'
                                    ? 'bg-green-50 hover:bg-green-100'
                                    : 'bg-red-50 hover:bg-red-100'
                            }`}
                        >
                            <div className='flex items-center gap-2'>
                                {transaction.type === 'income' ? (
                                    <>
                                        <ArrowUp className='w-4 h-4 text-green-600' />
                                        <span className='text-green-600 font-medium'>Дохід</span>
                                    </>
                                ) : (
                                    <>
                                        <ArrowDown className='w-4 h-4 text-red-600' />
                                        <span className='text-red-600 font-medium'>Витрати</span>
                                    </>
                                )}
                            </div>
                            <h2 className='truncate'>{transaction.name}</h2>
                            <h2 className={`font-medium ${
                                transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                            }`}>
                                {transaction.type === 'income' ? '+' : '-'}₴{parseFloat(transaction.amount).toFixed(2)}
                            </h2>
                            <h2 className='text-sm text-gray-600'>{transaction.createdAt}</h2>
                            <h2>
                                <Trash
                                    className='text-red-600 cursor-pointer hover:text-red-800 transition-colors'
                                    size={16}
                                    onClick={() =>
                                        transaction.type === 'income'
                                            ? deleteIncome(transaction)
                                            : deleteExpense(transaction)
                                    }
                                />
                            </h2>
                        </div>
                    ))}
                </div>
            ) : (
                <div className='p-4 text-center text-gray-500 bg-gray-50 rounded-b-lg'>
                    Ще немає транзакцій
                </div>
            )}
        </div>
    )
}

export default IncomeExpenseList