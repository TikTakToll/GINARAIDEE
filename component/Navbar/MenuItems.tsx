"use client";

import Link from "next/link";
import { motion } from "framer-motion";

type MenuItem = {
    label: string;
    href: string;
};

export default function MenuItems({
    items,
    currentPath
}: {
    items: MenuItem[];
    currentPath: string;
}) {
    return (
        <ul className="flex space-x-6 text-gray-700 font-medium ml-auto">
            {items.map((item) => {
                const isActive = currentPath === item.href;
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
    );
}
