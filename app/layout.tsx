// app/layout.tsx
'use client';


import { ThemeProvider as CustomThemeProvider } from '@/component/theme/ThemeContext';
import { ThemeProvider as NextThemeProvider } from 'next-themes';
import { usePathname } from 'next/navigation';
import Navbar from "@/component/Navbar/Navbar";
import './globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isHomePage = pathname === '/';

    return (
        <html lang="th" suppressHydrationWarning>
        <body
            className={`flex flex-col min-h-screen overscroll-contain text-[rgb(var(--foreground-rgb))] transition-colors duration-300 ease-in-out ${isHomePage ? 'overflow-hidden' : 'overflow-auto'}`}
        >
        <NextThemeProvider attribute="class" defaultTheme="light" enableSystem>
            <CustomThemeProvider>
                <Navbar />
                <div className={`pt-16 flex-grow flex flex-col ${isHomePage ? 'overflow-hidden' : ''}`}>
                    <main className={`flex-grow flex flex-col ${isHomePage ? 'overflow-hidden' : ''}`}>
                        {children}
                    </main>
                </div>
            </CustomThemeProvider>
        </NextThemeProvider>
        </body>
        </html>
    );
}
