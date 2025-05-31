
// BarChartDashboard.jsx
import React, { useState, useMemo, useRef, useEffect } from 'react'
import {
    ResponsiveContainer,
    BarChart,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    Bar,
} from 'recharts'

export default function BarChartDashboard({ budgetList }) {
    const [selectedIds, setSelectedIds] = useState([])

    useEffect(() => {
        setSelectedIds(budgetList.map(b => b.id))
    }, [budgetList])

    const [open, setOpen] = useState(false)
    const ref = useRef(null)
    useEffect(() => {
        const onClickOutside = e => {
            if (ref.current && !ref.current.contains(e.target)) {
                setOpen(false)
            }
        }
        document.addEventListener('mousedown', onClickOutside)
        return () => document.removeEventListener('mousedown', onClickOutside)
    }, [])

    const toggle = id =>
        setSelectedIds(ids =>
            ids.includes(id) ? ids.filter(x => x !== id) : [...ids, id]
        )

    const data = useMemo(
        () =>
            budgetList
                .filter(item => selectedIds.includes(item.id))
                .map(item => {
                    const originalAmount = parseFloat(item.amount) || 0;
                    const totalSpend = item.totalSpend || 0;
                    const totalIncome = item.totalIncome || 0;

                    // Поточний залишок = початковий бюджет + доходи - витрати
                    const currentBalance = originalAmount + totalIncome - totalSpend;

                    return {
                        name: item.name,
                        'Сума конверта': originalAmount, // Більший стовпчик (тільки початкова сума)
                        'Залишок': Math.max(0, currentBalance), // Менший стовпчик (те що залишилось)
                    };
                }),
        [budgetList, selectedIds]
    )

    return (
        <div className="border rounded-lg p-5">
            <h2 className="font-bold text-lg mb-3">Активність</h2>

            <div ref={ref} className="relative inline-block mb-4">
                <button
                    onClick={() => setOpen(o => !o)}
                    className="px-4 py-2 bg-blue-600 text-white rounded"
                >
                    Вибрати бюджети…
                </button>
                {open && (
                    <div className="absolute right-0 mt-2 w-48 max-h-60 overflow-auto bg-white border rounded shadow-lg z-10">
                        {budgetList.map(b => (
                            <label
                                key={b.id}
                                className="flex items-center px-3 py-2 hover:bg-gray-100 cursor-pointer"
                            >
                                <input
                                    type="checkbox"
                                    checked={selectedIds.includes(b.id)}
                                    onChange={() => toggle(b.id)}
                                    className="mr-2"
                                />
                                {b.name}
                            </label>
                        ))}
                    </div>
                )}
            </div>

            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data} margin={{ top: 7 }}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip
                        formatter={(value, name) => [
                            `${parseFloat(value).toFixed(2)}₴`,
                            name
                        ]}
                    />
                    <Legend />
                    <Bar
                        dataKey="Сума конверта"
                        fill="#C3C2FF"
                        name="Сума конверта"
                    />
                    <Bar
                        dataKey="Залишок"
                        fill="#4845d2"
                        name="Залишок в конверті"
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    )
}