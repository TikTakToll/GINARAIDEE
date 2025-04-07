'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { joinRoom } from '@/services/roomService';

export default function JoinRoomPage() {
    const [roomCode, setRoomCode] = useState('');
    const [memberName, setMemberName] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleJoinRoom = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!roomCode.trim()) {
            setError('กรุณาใส่รหัสห้อง');
            return;
        }

        if (!memberName.trim()) {
            setError('กรุณาใส่ชื่อของคุณ');
            return;
        }

        setError('');
        setIsLoading(true);

        try {
            // สำหรับการพัฒนาจริง คุณจะใช้ API จริง
            const response = await joinRoom({
                roomCode,
                memberName
             });

            // เปลี่ยนเส้นทางไปยังหน้าห้อง
            router.push(`/rooms/${roomCode}/join?memberName=${encodeURIComponent(memberName)}`);
        } catch (err: any) {
            setError(err.message || 'เกิดข้อผิดพลาดในการเข้าร่วมห้อง กรุณาลองใหม่อีกครั้ง');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div
            className="fixed inset-0 flex items-center justify-center"
            style={{
                backgroundImage: `url("https://i.pinimg.com/1200x/13/75/0d/13750d8970141cab1ab2a703d950fb75.jpg")`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                backgroundColor: '#f8f7ff',
                overflow: 'hidden'
            }}
        >
            <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-xl">
                <h1 className="text-2xl font-bold mb-6 text-center">เข้าร่วมห้อง</h1>
                <p className="text-center text-gray-600 mb-6">ใส่รหัสห้องเพื่อเข้าร่วมห้องที่มีอยู่แล้ว</p>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}

                <form onSubmit={handleJoinRoom}>
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2" htmlFor="roomCode">
                            รหัสห้อง
                        </label>
                        <input
                            id="roomCode"
                            type="text"
                            value={roomCode}
                            onChange={(e) => setRoomCode(e.target.value)}
                            className="w-full px-3 py-2 border rounded-md"
                            placeholder="ใส่รหัสห้อง"
                            disabled={isLoading}
                            required
                        />
                    </div>

                    <div className="mb-6">
                        <label className="block text-gray-700 mb-2" htmlFor="memberName">
                            ชื่อของคุณ
                        </label>
                        <input
                            id="memberName"
                            type="text"
                            value={memberName}
                            onChange={(e) => setMemberName(e.target.value)}
                            className="w-full px-3 py-2 border rounded-md"
                            placeholder="ใส่ชื่อของคุณ"
                            disabled={isLoading}
                            required
                        />
                    </div>

                    <div className="flex flex-col space-y-3">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md disabled:bg-blue-300"
                        >
                            {isLoading ? 'กำลังเข้าร่วม...' : 'เข้าร่วมห้อง'}
                        </button>

                        <button
                            type="button"
                            onClick={() => router.push('/')}
                            disabled={isLoading}
                            className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-md disabled:bg-gray-100"
                        >
                            กลับไปหน้าหลัก
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}