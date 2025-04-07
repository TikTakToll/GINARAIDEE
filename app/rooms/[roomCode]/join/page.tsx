'use client';

import { useSearchParams } from 'next/navigation';

export default function RoomLobbyPage({ params }: { params: { roomCode: string } }) {
    const searchParams = useSearchParams();
    const memberName = searchParams.get('memberName');

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

            <div className="bg-white p-6 rounded-lg shadow-md text-center max-w-md w-full">
                <h1 className="text-2xl font-bold mb-4">Code : {params.roomCode}</h1>
                <p className="text-lg">ยินดีต้อนรับ <span className="font-semibold">{memberName}</span>!</p>
                <p className="text-gray-600 text-sm mt-2">รอเพื่อนของคุณเข้าร่วม หรือรอหัวห้องเริ่มการสุ่มอาหาร... 🍜</p>
            </div>
        </div>
    );
}
