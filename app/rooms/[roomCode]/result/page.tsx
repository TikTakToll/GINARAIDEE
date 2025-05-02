// ✅ result/page.tsx
'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export default function ResultPage() {
    const params = useSearchParams();
    const router = useRouter();

    const name = params.get('name');
    const type = params.get('type');
    const rating = params.get('rating');
    const price = params.get('price');
    const distance = params.get('distance');
    const lat = params.get('lat');
    const lng = params.get('lng');

    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

    if (!name) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-orange-100">
                <div className="bg-white p-6 rounded-xl shadow-lg">
                    <h2 className="text-xl font-bold text-red-600">ไม่พบข้อมูลร้านอาหาร</h2>
                    <p className="text-sm text-gray-500">กรุณากลับไปหน้าล็อบบี้และสุ่มใหม่อีกครั้ง</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-orange-50 flex items-center justify-center p-6">
            <AnimatePresence>
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    transition={{ duration: 0.6 }}
                    className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full text-center"
                >
                    <motion.h1
                        className="text-2xl font-bold mb-4"
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        🎉 คุณได้ร้าน: {name}
                    </motion.h1>
                    <p className="mb-2">ประเภท: <strong>{type}</strong></p>
                    <p className="mb-2">เรตติ้ง: ⭐ {rating}</p>
                    <p className="mb-2">ราคา: {price}</p>
                    <p className="mb-4">ระยะทาง: {distance} กม.</p>
                    <motion.a
                        href={mapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-white bg-blue-500 px-4 py-2 rounded hover:bg-blue-600 inline-block"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        ดูใน Google Maps
                    </motion.a>
                    <motion.button
                        onClick={() => router.push('/')}
                        className="mt-4 block mx-auto text-sm text-gray-500 hover:underline"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        🔙 กลับหน้าหลัก
                    </motion.button>
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
