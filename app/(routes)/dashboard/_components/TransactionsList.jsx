// app/(routes)/dashboard/_components/TransactionsList.jsx
import { db } from '@/utils/dbConfig'
import { Expenses, Income } from '@/utils/schema'
import { eq } from 'drizzle-orm'
import { Trash, TrendingUp, TrendingDown, ArrowUp, ArrowDown } from 'lucide-react'
import React from 'react'
import { toast } from 'sonner'

function TransactionsList({ transactionsList, refreshData }) {

    // Видалення транзакції в залежності від типу
    const deleteTransaction = async (transaction) => {
        try {
            console.log('Deleting transaction:', transaction); // Для дебагу

            let result;

            if (transaction.type === 'expense') {
                // Видаляємо витрату
                result = await db.delete(Expenses)
                    .where(eq(Expenses.id, transaction.id))
                    .returning()

                console.log('Expense delete result:', result); // Для дебагу

                if (result && result.length > 0) {
                    toast.success('Витрату видалено!')
                    refreshData() // Оновлюємо дані
                }
            } else if (transaction.type === 'income') {
                // Видаляємо дохід
                result = await db.delete(Income)
                    .where(eq(Income.id, transaction.id))
                    .returning()

                console.log('Income delete result:', result); // Для дебагу

                if (result && result.length > 0) {
                    toast.success('Дохід видалено!')
                    refreshData() // Оновлюємо дані
                }
            } else {
                console.error('Unknown transaction type:', transaction.type);
                toast.error('Невідомий тип транзакції')
            }

        } catch (error) {
            console.error('Error deleting transaction:', error)
            toast.error('Помилка при видаленні транзакції')
        }
    }

    // Отримання іконки транзакції
    const getTransactionIcon = (transaction) => {
        return transaction.type === 'income' ?
            <ArrowUp className="w-4 h-4 text-green-600" /> :
            <ArrowDown className="w-4 h-4 text-red-600" />
    }

    // Стилі для суми
    const getAmountStyle = (transaction) => {
        return transaction.type === 'income' ?
            'text-green-600 font-semibold' :
            'text-red-600 font-semibold'
    }

    // Форматування суми
    const formatAmount = (transaction) => {
        const amount = parseFloat(transaction.amount)
        return transaction.type === 'income' ?
            `+₴${amount.toFixed(2)}` :
            `-₴${amount.toFixed(2)}`
    }

    // Отримання типу транзакції для відображення
    const getTransactionTypeLabel = (transaction) => {
        return transaction.type === 'income' ? 'Дохід' : 'Витрата'
    }

    return (
        <div className='mt-3'>
            <h2 className='font-bold text-lg'>Останні транзакції</h2>

            {transactionsList.length > 0 ? (
                <>
                    <div className='grid grid-cols-6 bg-slate-200 p-2 mt-3 rounded-t-lg text-sm font-medium'>
                        <h2>Тип</h2>
                        <h2>Конверт</h2>
                        <h2>Назва</h2>
                        <h2>Сума</h2>
                        <h2>Дата</h2>
                        <h2>Дія</h2>
                    </div>

                    <div className='max-h-80 overflow-y-auto'>
                        {transactionsList.map((transaction) => (
                            <div
                                key={`${transaction.type}-${transaction.id}`}
                                className={`grid grid-cols-6 p-3 border-b hover:bg-gray-50 transition-colors ${
                                    transaction.type === 'income'
                                        ? 'border-l-4 border-l-green-400'
                                        : 'border-l-4 border-l-red-400'
                                }`}
                            >
                                {/* Тип транзакції */}
                                <div className='flex items-center gap-2'>
                                    {getTransactionIcon(transaction)}
                                    <span className={`text-sm font-medium ${
                                        transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                                    }`}>
                                        {getTransactionTypeLabel(transaction)}
                                    </span>
                                </div>

                                {/* Конверт */}
                                <div className='flex items-center gap-2'>
                                    <span className='text-lg'>{transaction.budgetIcon}</span>
                                    <span className='text-sm text-gray-600 truncate'>
                                        {transaction.budgetName}
                                    </span>
                                </div>

                                {/* Назва транзакції */}
                                <div className='flex items-center'>
                                    <span className='font-medium truncate'>{transaction.name}</span>
                                </div>

                                {/* Сума */}
                                <div className='flex items-center'>
                                    <span className={getAmountStyle(transaction)}>
                                        {formatAmount(transaction)}
                                    </span>
                                </div>

                                {/* Дата */}
                                <div className='flex items-center'>
                                    <span className='text-sm text-gray-500'>{transaction.createdAt}</span>
                                </div>

                                {/* Дія */}
                                <div className='flex items-center'>
                                    <button
                                        onClick={() => deleteTransaction(transaction)}
                                        className='p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors'
                                        title='Видалити транзакцію'
                                    >
                                        <Trash className='w-4 h-4' />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            ) : (
                <div className='text-center py-12 text-gray-500 bg-gray-50 rounded-lg mt-3'>
                    <div className='w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4'>
                        <TrendingUp className='w-8 h-8 text-gray-400' />
                    </div>
                    <h3 className='text-lg font-medium text-gray-700 mb-2'>Ще немає транзакцій</h3>
                    <p className='text-sm max-w-md mx-auto'>
                        Почніть додавати доходи або витрати до ваших конвертів, щоб побачити їх тут.
                    </p>
                </div>
            )}
        </div>
    )
}

export default TransactionsList