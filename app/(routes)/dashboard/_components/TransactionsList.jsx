import { db } from '@/utils/dbConfig'
import { Expenses } from '@/utils/schema'
import { eq } from 'drizzle-orm'
import { Trash, TrendingUp, TrendingDown } from 'lucide-react'
import React from 'react'
import { toast } from 'sonner'

function TransactionsList({ transactionsList, refreshData }) {
    const deleteTransaction = async (transaction) => {
        const result = await db.delete(Expenses)
            .where(eq(Expenses.id, transaction.id))
            .returning()

        if (result) {
            toast('Транзакцію видалено!')
            refreshData()
        }
    }

    const getTransactionType = (transaction) => {
        // Визначаємо тип транзакції по знаку amount
        const isIncome = transaction.amount < 0; // Від'ємні - це доходи

        return isIncome ? 'income' : 'expense';
    }

    const getTransactionIcon = (transaction) => {
        const type = getTransactionType(transaction);
        return type === 'income' ?
            <TrendingUp className="w-4 h-4 text-green-600" /> :
            <TrendingDown className="w-4 h-4 text-red-600" />;
    }

    const getAmountStyle = (transaction) => {
        const type = getTransactionType(transaction);
        return type === 'income' ?
            'text-green-600 font-semibold' :
            'text-red-600 font-semibold';
    }

    const formatAmount = (transaction) => {
        const type = getTransactionType(transaction);
        const amount = Math.abs(transaction.amount);
        return type === 'income' ? `+$${amount}` : `-$${amount}`;
    }

    return (
        <div className='mt-3'>
            <h2 className='font-bold text-lg'>Latest Transactions</h2>
            <div className='grid grid-cols-5 bg-slate-200 p-2 mt-3 rounded-t-lg'>
                <h2 className='font-bold'>Тип</h2>
                <h2 className='font-bold'>Назва</h2>
                <h2 className='font-bold'>Сума</h2>
                <h2 className='font-bold'>Дата</h2>
                <h2 className='font-bold'>Дія</h2>
            </div>

            {transactionsList.map((transaction) => (
                <div
                    key={transaction.id}
                    className='grid grid-cols-5 bg-slate-50 p-2 border-b hover:bg-slate-100 transition-colors'
                >
                    <div className='flex items-center'>
                        {getTransactionIcon(transaction)}
                    </div>
                    <h2 className='font-medium'>{transaction.name}</h2>
                    <h2 className={getAmountStyle(transaction)}>
                        {formatAmount(transaction)}
                    </h2>
                    <h2 className='text-gray-600'>{transaction.createdAt}</h2>
                    <h2>
                        <Trash
                            className='text-red-600 cursor-pointer hover:text-red-800 transition-colors'
                            onClick={() => deleteTransaction(transaction)}
                        />
                    </h2>
                </div>
            ))}

            {transactionsList.length === 0 && (
                <div className='text-center py-8 text-gray-500'>
                    <p>No transactions yet</p>
                </div>
            )}
        </div>
    )
}

export default TransactionsList