// ExpenseListTable.jsx
import React, { useEffect, useState } from 'react';

export default function ExpenseListTable() {
    const [expenses, setExpenses] = useState([]);
    const [isLoading, setIsLoading] = useState(true);            // стан завантаження
    const [error, setError] = useState(null);                    // стан помилки

    useEffect(() => {
        async function fetchExpenses() {
            try {
                setIsLoading(true);
                const res = await fetch('/api/expenses');
                if (!res.ok) throw new Error('Не вдалося завантажити');
                const data = await res.json();
                setExpenses(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        }
        fetchExpenses();
    }, []);

    if (isLoading) {
        return <div className="spinner">Завантаження…</div>;       // спіннер
    }
    if (error) {
        return <div className="error">Помилка: {error}</div>;      // помилка
    }

    return (
        <table>
            <thead>
            <tr>
                <th>Дата</th>
                <th>Опис</th>
                <th>Сума</th>
            </tr>
            </thead>
            <tbody>
            {expenses.map(e => (
                <tr key={e.id}>
                    <td>{e.date}</td>
                    <td>{e.description}</td>
                    <td>{e.amount} грн</td>
                </tr>
            ))}
            </tbody>
        </table>
    );
}
