import React, { useEffect } from 'react'
import Image from "next/image";
import {LayoutGrid,PiggyBank,ReceiptText, ClipboardList, Mail, TrendingUp} from 'lucide-react'
import { UserButton } from '@clerk/nextjs';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

function SideNav() {
    const menuList=[
        {
            id:1,
            name:'Інформаційна панель',
            icon:LayoutGrid,
            path:'/dashboard'
        },
        {
            id:2,
            name:'Конверти',
            icon:PiggyBank,
            path:'/dashboard/budgets'
        },
        {
            id:3,
            name:'Витрати',
            icon:ReceiptText,
            path:'/dashboard/expenses'
        },
        {
            id:4,
            name:'Доходи',
            icon:TrendingUp,
            path:'/dashboard/income'
        },
    ]
    const path=usePathname();

    useEffect(()=>{
        console.log(path)
    },[path])

    return (
        <div className='h-screen p-5 border shadow-sm'>
            <div className='mt-5'>
                {menuList.map((menu,index)=>(
                    <Link href={menu.path} key={index}>
                        <h2 className={`flex gap-2 items-center
                    text-gray-500 font-medium
                    mb-2
                    p-5 cursor-pointer rounded-md
                    hover:text-primary hover:bg-blue-100
                    ${path==menu.path&&'text-primary bg-blue-100'}
                    `}>
                            <menu.icon/>
                            {menu.name}
                        </h2>
                    </Link>
                ))}
            </div>
            <div className='fixed bottom-10 p-5 flex gap-2 items-center'>
                <UserButton/>
                Profile
            </div>
        </div>
    )
}

export default SideNav