"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { BiLogoGoogle } from "react-icons/bi";
import { useState, useEffect } from "react";
import MenuItems from "./MenuItems";
import Logo from "./Logo";
import { DarkMode } from "./DarkMode";

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
    }, []);

    const menuItems = [
        { label: "สร้างห้อง", href: "/rooms/create" },
        { label: "เข้าร่วมห้อง", href: `/rooms/${roomCode}/join` },
        { label: "เกี่ยวกับ", href: "/rooms/about" },
    ];

    return (
        <nav className={`bg-white shadow-xl border-b border-gray-200 fixed top-0 left-0 right-0 z-10 transition-transform duration-300 ${
            visible ? 'translate-y-0' : '-translate-y-full'
        }`}>
            <div className="container mx-auto px-6 py-4 flex items-center justify-between">
                <Logo />
                <div className="flex items-center gap-4 ml-auto">
                <MenuItems items={menuItems} currentPath={pathname} />
                <DarkMode />
                </div>
            </div>
        </nav>
    );
}
//npm install framer-motion เพิ่มเติม
//npm install react-icons