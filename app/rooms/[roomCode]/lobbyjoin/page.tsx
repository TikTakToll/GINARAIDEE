
'use client';

import { useEffect, useState, use } from 'react';
import { useRouter,useSearchParams } from 'next/navigation';
import {getRoomInfo, kickMember, leaveRoom} from '@/services/roomService';


export default function RoomLobbyPage({ params }: { params: Promise<{ roomCode: string }> }) {
    const { roomCode } = use(params);
    const router = useRouter();
    const searchParams = useSearchParams();
    const memberName = searchParams.get('memberName') || 'ผู้ใช้';

    const [members, setMembers] = useState<string[]>([]);
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [owner, setOwner] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [ownerUser, setOwnerUser] = useState<string>('');


    const categories = ['อาหารไทย', 'อาหารญี่ปุ่น', 'อาหารเกาหลี', 'อาหารจีน', 'อาหารฝรั่ง'];

    useEffect(() => {
        const fetchRoomInfo = async () => {
            try {
                const data = await getRoomInfo(roomCode);
                setMembers(data.members || []);
                setSelectedCategories(data.selectedCategories || []);
                setOwner(data.owner || null);
                setOwnerUser(data.ownerUser); // ✅ ดึง owner มาเก็บไว้
            } catch (err) {
                console.error('Failed to fetch room info:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchRoomInfo();
    }, [roomCode]);

    const handleCategoryChange = (category: string) => {
        setSelectedCategories(prev =>
            prev.includes(category)
                ? prev.filter(c => c !== category)
                : [...prev, category]
        );
    };


    //เตะคน
    const handleKick = async (member: string) => {
        if (!confirm(`คุณแน่ใจหรือไม่ว่าต้องการเตะ ${member} ออกจากห้อง?`)) return;

        try {
            await kickMember(roomCode, memberName, member); // memberName = คนที่ login เข้ามา
            alert(`เตะ ${member} ออกจากห้องเรียบร้อย`);
            setMembers(prev => prev.filter(m => m !== member)); // อัปเดตทันที
        } catch (err) {
            // @ts-ignore
            alert('เตะสมาชิกไม่สำเร็จ: ' + err.message);
        }
    };


    const handleLeaveRoom = async () => {
        if (!confirm('คุณแน่ใจหรือไม่ว่าต้องการออกจากห้องนี้?')) return;

        try {
            const response = await leaveRoom(roomCode, memberName!);
            // @ts-ignore
            alert('ออกจากห้องเรียบร้อย: ' + response.data);
            router.push('/');
        } catch (err: any) {
            alert('ออกจากห้องไม่สำเร็จ: ' + (err?.response?.data || err.message));
        }
    };


    const handleRandomFood = () => {
        if (selectedCategories.length === 0) {
            alert('กรุณาเลือกประเภทอาหารก่อนสุ่ม');
            return;
        }
        console.log('สุ่มจาก:', selectedCategories);
        // เพิ่มการนำทางไปหน้าผลลัพธ์หรือ popup ได้ที่นี่
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <p className="text-gray-600">กำลังโหลดข้อมูลห้อง...</p>
            </div>
        );
    }

    return (
        <div
            className="fixed inset-0 flex items-center justify-center bg-cover bg-center"
            style={{ backgroundImage: `url("https://i.pinimg.com/1200x/13/75/0d/13750d8970141cab1ab2a703d950fb75.jpg")` }}
        >
            <div className="bg-white p-6 rounded-lg shadow-md text-center max-w-md w-full space-y-4">
                <h1 className="text-2xl font-bold">ห้อง: {roomCode}</h1>
                <p>ยินดีต้อนรับ <span className="font-semibold">{memberName}</span>!</p>
                <p className="text-gray-600 text-sm">สมาชิกทั้งหมด: {members.length} คน</p>

                <div className="text-left">
                    <h2 className="font-semibold mb-2">สมาชิกในห้อง:</h2>
                    <ul className="list-disc list-inside text-sm text-left space-y-1">
                        {members.map((member, index) => (
                            <li key={index} className="flex justify-between items-center">
                                <span>{member}</span>

                                {memberName === ownerUser && member !== ownerUser && (
                                    <button
                                        onClick={() => handleKick(member)}
                                        className="text-red-500 text-xs hover:underline"
                                    >
                                        เตะ
                                    </button>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="text-left">
                    <h2 className="font-semibold mb-2">เลือกประเภทอาหาร</h2>
                    <div className="grid grid-cols-2 gap-2">
                        {categories.map((cat) => (
                            <label key={cat} className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    checked={selectedCategories.includes(cat)}
                                    onChange={() => handleCategoryChange(cat)}
                                />
                                <span>{cat}</span>
                            </label>
                        ))}
                    </div>
                </div>

                <button
                    onClick={handleRandomFood}
                    className="w-full bg-orange-400 text-white py-2 px-4 rounded hover:bg-orange-500 transition-all"
                >
                    🎲 สุ่มอาหาร!
                </button>

                <button
                    onClick={handleLeaveRoom}
                    className="w-full bg-gray-300 text-black py-2 px-4 rounded hover:bg-gray-400 transition-all"
                >
                    🚪 ออกจากห้อง
                </button>
            </div>
        </div>
    );
}
