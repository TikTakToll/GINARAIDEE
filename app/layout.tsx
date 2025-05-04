//แก้ไข React Hydration Mismatch คิอการที่ HTML ที่ฝั่ง Server Rendered (SSR) กับ HTML ที่ Client สร้างขึ้นไม่ตรงกันระหว่างโหลดครั้งแรก
// app/layout.tsx
'use client';

import React, { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Navbar from "@/component/Navbar/Navbar";
import './globals.css';
import Providers from './Providers';

export default function RootLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isHomePage = pathname === '/';

    useEffect(() => {
        if (isHomePage) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }

        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [isHomePage]);

    return (
        <html lang="en" suppressHydrationWarning>
        <body style={{
            overscrollBehaviorX: "contain",
            overscrollBehaviorY: "contain",
            display: "flex",
            flexDirection: "column",
            minHeight: "100vh",
            overflow: isHomePage ? 'hidden' : 'auto' // ป้องกันการ scroll เฉพาะหน้าหลัก
        }}>
        <Providers>
            <Navbar />
            <div className={`pt-16 flex-grow flex flex-col ${isHomePage ? 'overflow-hidden' : ''}`}>
                <main className={`flex-grow flex flex-col ${isHomePage ? 'overflow-hidden' : ''}`}>
                    {children}
                </main>
            </div>
        </Providers>
        </body>
        </html>
    );
}


