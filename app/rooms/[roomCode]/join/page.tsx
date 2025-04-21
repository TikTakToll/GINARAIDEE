// 'use client';
//
// import { useSearchParams } from 'next/navigation';
//
// export default function RoomLobbyPage({ params }: { params: { roomCode: string } }) {
//     const searchParams = useSearchParams();
//     const memberName = searchParams.get('memberName');
//
//     return (
//         <div
//             className="fixed inset-0 flex items-center justify-center"
//             style={{
//                 backgroundImage: `url("https://i.pinimg.com/1200x/13/75/0d/13750d8970141cab1ab2a703d950fb75.jpg")`,
//                 backgroundSize: 'cover',
//                 backgroundPosition: 'center',
//                 backgroundRepeat: 'no-repeat',
//                 backgroundColor: '#f8f7ff',
//                 overflow: 'hidden'
//             }}
//         >
//
//             <div className="bg-white p-6 rounded-lg shadow-md text-center max-w-md w-full">
//                 <h1 className="text-2xl font-bold mb-4">Code : {params.roomCode}</h1>
//                 <p className="text-lg">ยินดีต้อนรับ <span className="font-semibold">{memberName}</span>!</p>
//                 <p className="text-gray-600 text-sm mt-2">รอเพื่อนของคุณเข้าร่วม หรือรอหัวห้องเริ่มการสุ่มอาหาร... 🍜</p>
//             </div>
//         </div>
//     );
// }


//lobbyjoin
// 'use client';
//
// import { useEffect, useState, use } from 'react';
// import { useSearchParams } from 'next/navigation';
// import { getRoomInfo } from '@/services/roomService';
//
// // รับ params แบบ Promise และใช้ use() เพื่อดึงค่าจริง
// export default function RoomLobbyPage({ params }: { params: Promise<{ roomCode: string }> }) {
//     const { roomCode } = use(params);
//
//     const searchParams = useSearchParams();
//     const memberName = searchParams.get('memberName') || 'ผู้ใช้';
//
//     const [members, setMembers] = useState<string[]>([]);
//     const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
//     const [isLoading, setIsLoading] = useState(true);
//
//     const categories = ['อาหารไทย', 'อาหารญี่ปุ่น', 'อาหารเกาหลี', 'อาหารจีน', 'อาหารฝรั่ง'];
//
//     useEffect(() => {
//         const fetchRoomInfo = async () => {
//             try {
//                 const data = await getRoomInfo(roomCode);
//                 setMembers(data.members || []);
//                 setSelectedCategories(data.selectedCategories || []);
//             } catch (err) {
//                 console.error('Failed to fetch room info:', err);
//             } finally {
//                 setIsLoading(false);
//             }
//         };
//
//         fetchRoomInfo();
//     }, [roomCode]);
//
//     const handleCategoryChange = (category: string) => {
//         setSelectedCategories(prev =>
//             prev.includes(category)
//                 ? prev.filter(c => c !== category)
//                 : [...prev, category]
//         );
//     };
//
//     const handleRandomFood = () => {
//         if (selectedCategories.length === 0) {
//             alert('กรุณาเลือกประเภทอาหารก่อนสุ่ม');
//             return;
//         }
//         console.log('สุ่มจาก:', selectedCategories);
//         // เพิ่มการนำทางไปหน้าผลลัพธ์หรือ popup ได้ที่นี่
//     };
//
//     if (isLoading) {
//         return (
//             <div className="flex items-center justify-center h-screen">
//                 <p className="text-gray-600">กำลังโหลดข้อมูลห้อง...</p>
//             </div>
//         );
//     }
//
//     return (
//         <div
//             className="fixed inset-0 flex items-center justify-center bg-cover bg-center"
//             style={{ backgroundImage: `url("https://i.pinimg.com/1200x/13/75/0d/13750d8970141cab1ab2a703d950fb75.jpg")` }}
//         >
//             <div className="bg-white p-6 rounded-lg shadow-md text-center max-w-md w-full space-y-4">
//                 <h1 className="text-2xl font-bold">ห้อง: {roomCode}</h1>
//                 <p>ยินดีต้อนรับ <span className="font-semibold">{memberName}</span>!</p>
//                 <p className="text-gray-600 text-sm">สมาชิกทั้งหมด: {members.length} คน</p>
//
//                 <div className="text-left">
//                     <h2 className="font-semibold mb-2">สมาชิกในห้อง:</h2>
//                     <ul className="list-disc list-inside text-sm text-left">
//                         {members.map((member, index) => (
//                             <li key={index}>{member}</li>
//                         ))}
//                     </ul>
//                 </div>
//
//                 <div className="text-left">
//                     <h2 className="font-semibold mb-2">เลือกประเภทอาหาร</h2>
//                     <div className="grid grid-cols-2 gap-2">
//                         {categories.map((cat) => (
//                             <label key={cat} className="flex items-center space-x-2">
//                                 <input
//                                     type="checkbox"
//                                     checked={selectedCategories.includes(cat)}
//                                     onChange={() => handleCategoryChange(cat)}
//                                 />
//                                 <span>{cat}</span>
//                             </label>
//                         ))}
//                     </div>
//                 </div>
//
//                 <button
//                     onClick={handleRandomFood}
//                     className="w-full bg-orange-400 text-white py-2 px-4 rounded hover:bg-orange-500 transition-all"
//                 >
//                     🎲 สุ่มอาหาร!
//                 </button>
//             </div>
//         </div>
//     );
// }

//Join
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { joinRoom, getRoomInfo } from '@/services/roomService';

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
            // เรียก joinRoom แบบใหม่ (POST + body)
            await joinRoom({ roomCode, memberName });

            // ตรวจสอบห้องว่าเข้าร่วมสำเร็จ
            const room = await getRoomInfo(roomCode);

            // ไปที่หน้าห้องพร้อมส่งชื่อผู้ใช้ไป
            router.push(`/rooms/${roomCode}/lobby?memberName=${encodeURIComponent(memberName)}`);
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
                            className="w-full border-2 border-orange-300 bg-red-400 hover:bg-red-200 text-white  hover:border-orange-400 hover:text-orange-800 shadow-md hover:shadow-lg transition-all duration-300 font-medium py-2 px-4 rounded-md  cursor-pointer"
                        >
                            {isLoading ? 'กำลังเข้าร่วม...' : 'เข้าร่วมห้อง'}
                        </button>

                        <button
                            type="button"
                            onClick={() => router.push('/')}
                            disabled={isLoading}
                            className="w-full border-2 border-orange-300 bg-orange-500 hover:bg-red-200 text-white  hover:border-orange-400 hover:text-orange-800 shadow-md hover:shadow-lg transition-all duration-300 font-medium py-2 px-4 rounded-md  cursor-pointer"
                        >
                            กลับไปหน้าหลัก
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

