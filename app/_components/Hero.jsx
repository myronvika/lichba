import React from 'react';
import Image from "next/image";

function Hero() {
    return (
        <section className="bg-gray-50 flex items-center flex-col">
            <div className="mx-auto max-w-screen-xl px-4 py-32 lg:flex ">
                <div className="mx-auto max-w-xl text-center">
                    <h1 className="text-3xl font-extrabold sm:text-5xl">
                        Manager Your Expense
                        <strong className="font-extrabold text-primary sm:block"> Control your Money </strong>
                    </h1>

                    <p className="mt-4 sm:text-xl/relaxed">
                        Start Creating your budget and save ton of money
                    </p>

                    <div className="mt-8 flex flex-wrap justify-center gap-4">
                        <a
                            className="block w-full rounded-sm bg-primary px-12 py-3 text-sm font-medium text-white shadow-sm hover:bg-blue-900 focus:ring-3 focus:outline-hidden sm:w-auto"
                            href="#"
                        >
                            Get Started
                        </a>


                    </div>
                </div>
            </div>
            <Image src='/dashboard.png' alt='dashboard'
                   width={1000}
                   height={700}
                   className='-mt-9 rounded-xl border-2'
            />
        </section>
    )
}

export default Hero