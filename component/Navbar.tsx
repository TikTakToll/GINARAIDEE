"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { BiLogoGoogle } from "react-icons/bi";
import { useState, useEffect } from "react";
import ThemeToggle from "@/component/theme/ThemeToggle";

export default function Navbar() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const roomCode = searchParams.get("roomCode") || "default"; // fallback

    // เพิ่ม state สำหรับการจัดการการแสดง/ซ่อน Navbar
    const [visible, setVisible] = useState(true);
    const [prevScrollPos, setPrevScrollPos] = useState(0);

    // ฟังก์ชันจัดการการซ่อน/แสดง Navbar ตามการเลื่อนหน้าจอ
    const handleScroll = () => {
        const currentScrollPos = window.scrollY;

        // แสดง Navbar เมื่อเลื่อนขึ้น หรือ อยู่บนสุดของหน้า, ซ่อนเมื่อเลื่อนลง
        setVisible(prevScrollPos > currentScrollPos || currentScrollPos < 10);

        setPrevScrollPos(currentScrollPos);
    };

    useEffect(() => {
        window.addEventListener('scroll', handleScroll);

        // cleanup เมื่อ component unmount
        return () => window.removeEventListener('scroll', handleScroll);
    }, [prevScrollPos]);

    const menuItems = [
        { label: "สร้างห้อง", href: "/rooms/create" },
        { label: "เข้าร่วมห้อง", href: `/rooms/${roomCode}/join` },
        { label: "เกี่ยวกับ", href: "/rooms/about" },
    ];

    return (
        <nav className={`bg-white dark:bg-gray-900 shadow-xl border-b border-gray-200 dark:border-gray-700 fixed top-0 left-0 right-0 z-10 transition-colors transition-transform duration-300 ${
            visible ? 'translate-y-0' : '-translate-y-full'
        }`}>
            <div className="container mx-auto px-6 py-4 flex items-center justify-between">
                <Link href="/" className="flex items-center space-x-2">
                    <div className="h-10 w-10 bg-orange-400 rounded-full flex items-center justify-center">
                        <BiLogoGoogle className="text-3xl text-white" />
                    </div>
                    <span className="text-xl font-bold text-orange-400">GINARAIDEE</span>
                </Link>

                <div className="flex items-center">
                    <ul className="flex space-x-6 text-gray-700 dark:text-gray-300 font-medium">
                        {menuItems.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <li key={item.href} className="relative">
                                    <Link
                                        href={item.href}
                                        className="px-1 py-2 hover:text-orange-500 transition-colors duration-200"
                                    >
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
                    <div className="ml-6 flex items-center">
                        <ThemeToggle />
                    </div>
                </div>
            </div>
        </nav>

    );
}

//npm install framer-motion เพิ่มเติม
//npm install react-icons