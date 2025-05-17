// app/plans/page.jsx
import Header from '@/app/_components/Header'

export const metadata = {
    title: 'Плани | Lichba Tracker',
    description: 'Плани на майбутнє в Lichba Tracker',
}

export default function PlansPage() {
    return (
        <div>
            <Header />
            <main className="max-w-screen-lg mx-auto p-8">
                <h1 className="text-4xl font-bold mb-4">Плани на майбутнє</h1>
                <p className="mb-6 text-lg text-gray-700">
                    Тут ви можете додати свої цілі, розподілити бюджети на майбутні проєкти та відстежувати прогрес.
                </p>
                {/* Наприклад, табличка чи форма додавання плану */}
                <div className="border rounded-lg p-6 bg-white shadow">
                    <h2 className="text-2xl font-semibold mb-2">Ваші поточні плани</h2>
                    <ul className="list-disc list-inside text-gray-600">
                        <li>Ремонт квартири — бюджет 50 000₴</li>
                        <li>Відпустка влітку — бюджет 30 000₴</li>
                        <li>Навчання онлайн — бюджет 10 000₴</li>
                    </ul>
                </div>
            </main>
        </div>
    )
}
