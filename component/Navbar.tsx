"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { BiLogoGoogle } from "react-icons/bi";


export default function Navbar() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const roomCode = searchParams.get("roomCode") || "default"; // fallback

    const menuItems = [
        { label: "เข้าร่วมห้อง", href: `/rooms/${roomCode}/join` },
        { label: "สร้างห้อง", href: "/rooms/create" },
        { label: "เกี่ยวกับ", href: "/rooms/about" },
    ];

    return (
        <nav className="bg-white shadow-md border-b border-gray-200 sticky top-0 z-10">
            <div className="container mx-auto px-6 py-4 flex items-center justify-between">
                {/* 🔶 โลโก้ */}
                <Link href="/" className="flex items-center space-x-2">
                    <div className="h-10 w-10 bg-orange-500 rounded-full flex items-center justify-center">
                        <BiLogoGoogle className="text-3xl text-white"/>
                    </div>
                    <span className="text-xl font-bold text-orange-500">GINARAIDEE</span>
                </Link>

                {/* 🔷 เมนูขวาทั้งหมด */}
                <ul className="flex space-x-6 text-gray-700 font-medium ml-auto">
                    {menuItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <li key={item.href} className="relative">
                                <Link href={item.href} className="px-1 py-2 hover:text-orange-500 transition">
                                    {item.label}
                                    {isActive && (
                                        <motion.div
                                            layoutId="underline"
                                            className="absolute left-0 right-0 -bottom-1 h-[3px] bg-orange-500 rounded-full"
                                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                        />
                                    )}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </nav>
    );
}



//npm install framer-motion เพิ่มเติม
//npm install react-icons



