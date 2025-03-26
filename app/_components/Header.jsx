import React from 'react'
import Image from 'next/image'
import {Button} from "@/components/ui/button";
function Header() {
    return (
        <div className='p-5 flex justify-between items-center border shadow-sm'>
        <Image src={'./logo.svg'}
        alt='logo'
        width={80}
        height={70}
        />
            <Button>Get started</Button>
        </div>



    )
}

export default Header