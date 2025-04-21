'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createRoom } from '@/services/roomService';

export default function CreateRoomPage() {
    const router = useRouter();
    const [ownerUser, setOwnerUser] = useState('');
    const [maxUsers, setMaxUsers] = useState(5);
    const [maxFoodSelectionsPerMember, setMaxFoodSelectionsPerMember] = useState(3);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!ownerUser.trim()) {
            setError('กรุณาระบุชื่อผู้สร้างห้อง');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const roomData = {
                ownerUser,
                maxUsers,
                maxFoodSelectionsPerMember
            };

            const newRoom = await createRoom(roomData);

            // นำทางไปยังหน้าห้องที่สร้างใหม่
            router.push(`/rooms/${newRoom.roomCode}/lobbyjoin?ownerUser=${encodeURIComponent(ownerUser)}`);
        } catch (err) {
            setError('เกิดข้อผิดพลาดในการสร้างห้อง กรุณาลองใหม่อีกครั้ง');
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
                <h1 className="text-2xl font-bold mb-6 text-center">สร้างห้องใหม่</h1>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2" htmlFor="ownerUser">
                            ชื่อของคุณ
                        </label>
                        <input
                            id="ownerUser"
                            type="text"
                            value={ownerUser}
                            onChange={(e) => setOwnerUser(e.target.value)}
                            className="w-full px-3 py-2 border rounded-md"
                            placeholder="ชื่อหัวหน้าห้อง"
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2" htmlFor="maxUsers">
                            จำนวนผู้เข้าร่วมสูงสุด
                        </label>
                        <input
                            id="maxUsers"
                            type="number"
                            value={maxUsers}
                            onChange={(e) => setMaxUsers(parseInt(e.target.value))}
                            min="1"
                            max="10"
                            className="w-full px-3 py-2 border rounded-md"
                            required
                        />
                    </div>

                    <div className="mb-6">
                        <label className="block text-gray-700 mb-2" htmlFor="maxFoodSelectionsPerMember">
                            จำนวนอาหารที่เลือกได้ต่อคน
                        </label>
                        <input
                            id="maxFoodSelectionsPerMember"
                            type="number"
                            value={maxFoodSelectionsPerMember}
                            onChange={(e) => setMaxFoodSelectionsPerMember(parseInt(e.target.value))}
                            min="1"
                            max="10"
                            className="w-full px-3 py-2 border rounded-md"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full border-2 border-orange-300 bg-red-400 hover:bg-red-200 text-white  hover:border-orange-400 hover:text-orange-800 shadow-md hover:shadow-lg transition-all duration-300 font-medium py-2 px-4 rounded-md  cursor-pointer"
                    >
                        {isLoading ? 'กำลังสร้างห้อง...' : 'สร้างห้อง'}
                    </button>

                </form>
            </div>
        </div>
    );
}

