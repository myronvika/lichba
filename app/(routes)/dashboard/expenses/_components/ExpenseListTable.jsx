import { db } from '@/utils/dbConfig'
import { Expenses } from '@/utils/schema'
import { eq } from 'drizzle-orm'
import { Trash } from 'lucide-react'
import React from 'react'
import { toast } from 'sonner'

function ExpenseListTable({ expensesList, refreshData }) {
    const deleteExpense = async (expense) => {
        const result = await db.delete(Expenses)
            .where(eq(Expenses.id, expense.id))
            .returning()

        if (result) {
            toast('Витрату видалено!')
            refreshData()
        }
    }

    return (
        <div className='mt-3'>
            <h2 className='font-bold text-lg'>Останні витрати</h2>
            <div className='grid grid-cols-4 bg-slate-200 p-2 mt-3'>
                <h2 className='font-bold'>Назва</h2>
                <h2 className='font-bold'>Сума</h2>
                <h2 className='font-bold'>Дата</h2>
                <h2 className='font-bold'>Дія</h2>
            </div>

            {expensesList.map((expenses) => (
                <div
                    key={expenses.id} // ✅ Додано key
                    className='grid grid-cols-4 bg-slate-50 p-2'
                >
                    <h2>{expenses.name}</h2>
                    <h2>{expenses.amount}</h2>
                    <h2>{expenses.createdAt}</h2>
                    <h2>
                        <Trash
                            className='text-red-600 cursor-pointer'
                            onClick={() => deleteExpense(expenses)}
                        />
                    </h2>
                </div>
            ))}
        </div>
    )
}

export default ExpenseListTable
