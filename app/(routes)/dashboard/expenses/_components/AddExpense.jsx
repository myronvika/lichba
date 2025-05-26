import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { db } from '@/utils/dbConfig';
import { Budgets, Expenses, Income } from '@/utils/schema';
import { Loader, ArrowUp, ArrowDown } from 'lucide-react';
import moment from 'moment';
import React, { useState } from 'react';
import { toast } from 'sonner';
import { eq, sum } from 'drizzle-orm';

function AddExpense({ budgetId, user, refreshData }) {
    const [name, setName] = useState('');
    const [amount, setAmount] = useState('');
    const [addAmount, setAddAmount] = useState('');
    const [incomeName, setIncomeName] = useState('');
    const [loading, setLoading] = useState(false);
    const [incomeAnimation, setIncomeAnimation] = useState(false);
    const [expenseAnimation, setExpenseAnimation] = useState(false);

    /**
     * Розрахунок поточного балансу конверта
     */
    const getCurrentBalance = async (budgetId) => {
        try {
            // Отримуємо початковий бюджет
            const budgetResult = await db
                .select()
                .from(Budgets)
                .where(eq(Budgets.id, budgetId))
                .limit(1);

            if (budgetResult.length === 0) return 0;

            const initialAmount = parseFloat(budgetResult[0].amount) || 0;

            // Отримуємо сумарні доходи
            const incomeResult = await db
                .select({ total: sum(Income.amount) })
                .from(Income)
                .where(eq(Income.budgetId, budgetId));

            const totalIncome = parseFloat(incomeResult[0]?.total) || 0;

            // Отримуємо сумарні витрати
            const expenseResult = await db
                .select({ total: sum(Expenses.amount) })
                .from(Expenses)
                .where(eq(Expenses.budgetId, budgetId));

            const totalExpenses = parseFloat(expenseResult[0]?.total) || 0;

            // Поточний баланс = початковий бюджет + доходи - витрати
            return initialAmount + totalIncome - totalExpenses;

        } catch (error) {
            console.error('Error calculating current balance:', error);
            return 0;
        }
    };

    /**
     * Used to Add Money to Envelope
     */
    const addMoneyToEnvelope = async () => {
        setLoading(true);
        setIncomeAnimation(true);

        const parsedAmount = parseFloat(addAmount);
        if (isNaN(parsedAmount) || parsedAmount <= 0) {
            toast('Invalid amount format: enter a positive number', { variant: 'error' });
            setLoading(false);
            setIncomeAnimation(false);
            return;
        }

        try {
            const budgetCheck = await db
                .select()
                .from(Budgets)
                .where(eq(Budgets.id, budgetId))
                .limit(1);

            if (budgetCheck.length === 0) {
                toast('Budget not found', { variant: 'error' });
                setLoading(false);
                setIncomeAnimation(false);
                return;
            }

            // Додаємо запис доходу (БЕЗ оновлення Budgets.amount)
            await db.insert(Income).values({
                name: incomeName || 'Income',
                amount: parsedAmount,
                budgetId,
                createdAt: moment().format('DD/MM/YYYY')
            });

            // Розраховуємо новий баланс для показу
            const newBalance = await getCurrentBalance(budgetId);

            setAddAmount('');
            setIncomeName('');
            refreshData();
            toast(`$${parsedAmount} added to envelope! New balance: $${newBalance.toFixed(2)}`);

        } catch (error) {
            console.error('Error adding money:', error);
            toast('Error adding money to envelope', { variant: 'error' });
        }

        setTimeout(() => {
            setIncomeAnimation(false);
        }, 1000);
        setLoading(false);
    };

    /**
     * Used to Add New Expense
     */
    const addNewExpense = async () => {
        setLoading(true);
        setExpenseAnimation(true);

        const parsedAmount = parseFloat(amount);
        if (isNaN(parsedAmount) || parsedAmount <= 0) {
            toast('Invalid amount format: enter a positive number', { variant: 'error' });
            setLoading(false);
            setExpenseAnimation(false);
            return;
        }

        try {
            // Перевіряємо чи існує бюджет
            const budgetCheck = await db
                .select()
                .from(Budgets)
                .where(eq(Budgets.id, budgetId))
                .limit(1);

            if (budgetCheck.length === 0) {
                toast('Budget not found', { variant: 'error' });
                setLoading(false);
                setExpenseAnimation(false);
                return;
            }

            // Перевіряємо поточний баланс конверта
            const currentBalance = await getCurrentBalance(budgetId);

            if (currentBalance < parsedAmount) {
                toast(`Not enough funds in envelope! Current balance: $${currentBalance.toFixed(2)}`, { variant: 'error' });
                setLoading(false);
                setExpenseAnimation(false);
                return;
            }

            // Додаємо витрату (БЕЗ зміни Budgets.amount)
            const result = await db.insert(Expenses).values({
                name,
                amount: parsedAmount,
                budgetId,
                createdAt: moment().format('DD/MM/YYYY')
            }).returning({ insertedId: Expenses.id });

            if (result && result.length > 0) {
                const newBalance = await getCurrentBalance(budgetId);

                setAmount('');
                setName('');
                refreshData();
                toast(`Expense added! $${parsedAmount} withdrawn from envelope. Remaining: $${newBalance.toFixed(2)}`);
            }
        } catch (error) {
            console.error('Error adding expense:', error);
            toast('Error adding expense', { variant: 'error' });
        }

        setTimeout(() => {
            setExpenseAnimation(false);
        }, 1000);
        setLoading(false);
    };

    return (
        <div className='border p-5 rounded-lg'>
            <h2 className='font-bold text-lg'>Envelope Management</h2>

            {/* Add Money Section */}
            <div className='mb-6 p-4 bg-green-50 rounded-lg border border-green-200 relative'>
                <h3 className='font-medium text-green-800 mb-2 flex items-center gap-2'>
                    Add Money to Envelope
                    <ArrowUp className={`w-4 h-4 transition-all duration-500 ${
                        incomeAnimation ? 'animate-bounce text-green-600' : 'text-green-400'
                    }`} />
                </h3>
                <div className='space-y-2'>
                    <Input
                        placeholder="Income description (optional)"
                        value={incomeName}
                        onChange={(e) => setIncomeName(e.target.value)}
                        className="w-full"
                    />
                    <div className='flex gap-2'>
                        <Input
                            placeholder="e.g. 500"
                            type="number"
                            value={addAmount}
                            onChange={(e) => setAddAmount(e.target.value)}
                            className="flex-1"
                        />
                        <Button
                            disabled={!addAmount || loading}
                            onClick={() => addMoneyToEnvelope()}
                            className="bg-green-600 hover:bg-green-700"
                        >
                            {loading ? <Loader className="animate-spin" /> : "Add Money"}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Spend Money Section */}
            <div className='p-4 bg-red-50 rounded-lg border border-red-200 relative'>
                <h3 className='font-medium text-red-800 mb-2 flex items-center gap-2'>
                    Spend from Envelope
                    <ArrowDown className={`w-4 h-4 transition-all duration-500 ${
                        expenseAnimation ? 'animate-bounce text-red-600' : 'text-red-400'
                    }`} />
                </h3>
                <div className='mt-2'>
                    <h2 className='text-black font-medium my-1'>Expense Name</h2>
                    <Input placeholder="e.g. Bedroom Decor"
                           value={name}
                           onChange={(e) => setName(e.target.value)} />
                </div>
                <div className='mt-2'>
                    <h2 className='text-black font-medium my-1'>Expense Amount</h2>
                    <Input placeholder="e.g. 1000"
                           type="number"
                           value={amount}
                           onChange={(e) => setAmount(e.target.value)} />
                </div>
                <Button disabled={!(name && amount) || loading}
                        onClick={() => addNewExpense()}
                        className="mt-3 w-full bg-red-600 hover:bg-red-700">
                    {loading ?
                        <Loader className="animate-spin" /> : "Spend from Envelope"
                    }
                </Button>
            </div>
        </div>
    );
}

export default AddExpense;