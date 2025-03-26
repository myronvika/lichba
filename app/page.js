import Image from "next/image";
import {Button} from "@/components/ui/button";
import {Headers} from "next/dist/compiled/@edge-runtime/primitives";
import Header from "@/app/_components/Header";
import Hero from "@/app/_components/Hero";

export default function Home() {
    return (
        <div>
            <Header/>
            <Hero/>
        </div>
    );
}
