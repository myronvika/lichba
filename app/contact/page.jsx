'use client'

import { useState } from 'react'
import Header from '@/app/_components/Header'

export default function ContactPage() {
    const [form, setForm] = useState({ name: '', email: '', message: '' })

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        alert('Повідомлення надіслано!')
        setForm({ name: '', email: '', message: '' })
    }

    return (
        <div>
            <Header />
            <main className="max-w-screen-md mx-auto p-8">
                <h1 className="text-4xl font-bold mb-4">Зв’язок з нами</h1>
                <p className="mb-6 text-gray-700">
                    Якщо у вас є запитання або пропозиції — напишіть нам нижче.
                </p>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block mb-1 font-medium">Ім’я</label>
                        <input
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            required
                            className="w-full border rounded px-3 py-2"
                        />
                    </div>
                    <div>
                        <label className="block mb-1 font-medium">Email</label>
                        <input
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            required
                            className="w-full border rounded px-3 py-2"
                        />
                    </div>
                    <div>
                        <label className="block mb-1 font-medium">Повідомлення</label>
                        <textarea
                            name="message"
                            rows="5"
                            value={form.message}
                            onChange={handleChange}
                            required
                            className="w-full border rounded px-3 py-2"
                        />
                    </div>
                    <button
                        type="submit"
                        className="bg-primary text-white px-6 py-2 rounded hover:bg-blue-900 transition"
                    >
                        Надіслати
                    </button>
                </form>
            </main>
        </div>
    )
}
