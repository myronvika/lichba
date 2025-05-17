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
    // 1) Инициализируем пустой массив, затем заполняем всеми id после загрузки budgetList
    const [selectedIds, setSelectedIds] = useState([])

    // 2) Когда budgetList обновится, по-умолчанию отмечаем все бюджеты
    useEffect(() => {
        setSelectedIds(budgetList.map(b => b.id))
    }, [budgetList])

    // 3) Состояние открытия/закрытия дропдауна
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

    // 4) Переключаем выбранный id
    const toggle = id =>
        setSelectedIds(ids =>
            ids.includes(id) ? ids.filter(x => x !== id) : [...ids, id]
        )

    // 5) Генерируем данные только для выбранных бюджетов
    const data = useMemo(
        () =>
            budgetList
                .filter(item => selectedIds.includes(item.id))
                .map(item => ({
                    name:       item.name,
                    totalSpend: item.totalSpend,
                    amount:     item.amount,
                })),
        [budgetList, selectedIds]
    )

    return (
        <div className="border rounded-lg p-5">
            <h2 className="font-bold text-lg mb-3">Activity</h2>

            {/* 6) Дропдаун с мультивыбором */}
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

            {/* 7) Диаграмма по выбранным бюджетам */}
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data} margin={{ top: 7 }}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="totalSpend" stackId="a" fill="#4845d2" />
                    <Bar dataKey="amount"     stackId="a" fill="#C3C2FF" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    )
}
