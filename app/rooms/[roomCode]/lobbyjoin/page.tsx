'use client';

import { useEffect, useState, use } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { getRoomInfo, kickMember, leaveRoom,selectFood,setMemberReady } from '@/services/roomService';


export default function RoomLobbyPage({ params }: { params: Promise<{ roomCode: string }> }) {
    const { roomCode } = use(params);
    const router = useRouter();
    const searchParams = useSearchParams();
    const memberName = searchParams.get('memberName');
    const [isReady, setIsReady] = useState(false);

    const [members, setMembers] = useState<string[]>([]);
    const [selectedMyFoods, setSelectedMyFoods] = useState<string[]>([]);
    const [owner, setOwner] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [ownerUser, setOwnerUser] = useState<string>('');

    // ✅ เพิ่ม state สำหรับเก็บสถานะ ready ของสมาชิกแต่ละคน
    const [readyStatus, setReadyStatus] = useState<Record<string, boolean>>({});

    const DEFAULT_FOOD_TYPES = [
        "ของหวาน", "อาหารตามสั่ง", "อาหารจานเดียว",
        "ก๋วยเตี๋ยว", "เครื่องดื่ม/น้ำผลไม้", "เบเกอรี/เค้ก",
        "ชาบู", "อาหารเกาหลี", "ปิ้งย่าง"
    ];


    useEffect(() => {
        const fetchRoomInfo = async () => {
            try {
                const data = await getRoomInfo(roomCode);
                setMembers(data.members || []);
                // @ts-ignore
                setSelectedMyFoods(data.memberFoodSelections?.[memberName] || []);
                setOwner(data.owner || null);
                setOwnerUser(data.ownerUser);

                // ✅ ตั้งค่าตัวแปร readyStatus จากข้อมูลที่ดึงมา
                setReadyStatus(data.readyStatus || {});

                // ✅ ตั้ง isReady ของผู้ใช้เอง จาก readyStatus
                if (memberName && data.readyStatus?.[memberName] !== undefined) {
                    setIsReady(data.readyStatus[memberName]);
                }

            } catch (err) {
                console.error('Failed to fetch room info:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchRoomInfo();
    }, [roomCode]);


    const handleKick = async (member: string) => {
        if (!confirm(`คุณแน่ใจหรือไม่ว่าต้องการเตะ ${member} ออกจากห้อง?`)) return;

        try {
            await kickMember(roomCode, memberName, member);
            alert(`เตะ ${member} ออกจากห้องเรียบร้อย`);
            setMembers(prev => prev.filter(m => m !== member));
        } catch (err: any) {
            alert('เตะสมาชิกไม่สำเร็จ: ' + err.message);
        }
    };

    // const handleLeaveRoom = async () => {
    //     if (!confirm('คุณแน่ใจหรือไม่ว่าต้องการออกจากห้องนี้?')) return;
    //
    //     try {
    //         const response = await leaveRoom(roomCode, memberName);
    //         alert('ออกจากห้องเรียบร้อย: ' + response.data);
    //         router.push('/');
    //     } catch (err: any) {
    //         alert('ออกจากห้องไม่สำเร็จ: ' + (err?.response?.data || err.message));
    //     }
    // };

    //แก้ response.data ที่แดง

    const handleLeaveRoom = async () => {
        if (!confirm('คุณแน่ใจหรือไม่ว่าต้องการออกจากห้องนี้?')) return;

        try {
            const response = await leaveRoom(roomCode, memberName);
            // ถ้า response เป็น string โดยตรง
            alert('ออกจากห้องเรียบร้อย: ' + response);
            router.push('/');
        } catch (err: any) {
            alert('ออกจากห้องไม่สำเร็จ: ' + (err?.response?.data || err.message));
        }
    };

    // ฟังก์ชันจัดการการเลือกอาหาร
    const handleSelectFood = async (foodType: string) => {
        try {
            const response = await selectFood(roomCode, memberName!, foodType);

            if (response.error) {
                alert(response.error);
                return;
            }

            setSelectedMyFoods(response.selectedFoods);
        } catch (err: any) {
            alert('เลือกประเภทอาหารไม่สำเร็จ: ' + (err?.response?.data || err.message));
        }
    };

    const handleReadyToggle = async () => {
        try {
            const newReadyStatus = !isReady; // ✅ สลับสถานะ Ready (ถ้า true → false, ถ้า false → true)

            await setMemberReady(roomCode, memberName!, newReadyStatus); // ✅ เรียก API ไปอัปเดตสถานะที่หลังบ้าน

            setIsReady(newReadyStatus); // ✅ อัปเดตสถานะ Ready เฉพาะของตัวเองใน state

            setReadyStatus(prev => ({ ...prev, [memberName!]: newReadyStatus })); // ✅ อัปเดต readyStatus รวมของสมาชิกในห้อง

            if (!newReadyStatus) {
                // ✅ ถ้ายกเลิก Ready (newReadyStatus = false) → เคลียร์อาหารที่เลือกของตัวเองด้วย
                setSelectedMyFoods([]);
            }
        } catch (err: any) {
            alert('ตั้งค่าสถานะไม่สำเร็จ: ' + err.message);
        }
    };




    return (
        <div
            className="fixed inset-0 flex items-center justify-center bg-cover bg-center"
            style={{
                // backgroundImage: `url("https://i.pinimg.com/1200x/13/75/0d/13750d8970141cab1ab2a703d950fb75.jpg")`
                backgroundColor: '#FFEBCD',
            }}
        >
            <div className="bg-white p-6 rounded-lg shadow-md text-center max-w-md w-full space-y-4">
                <h1 className="text-2xl font-bold">ห้อง: {roomCode}</h1>
                <p>ยินดีต้อนรับ <span className="font-semibold">{memberName}</span>!</p>
                <p className="text-gray-600 text-sm">สมาชิกทั้งหมด: {members.length} คน</p>

                <div className="text-left">
                    <h2 className="font-semibold mb-2">สมาชิกในห้อง:</h2>
                    <ul className="list-disc list-inside text-sm text-left space-y-1">
                        {members.map((member, index) => {
                            const isMemberReady = readyStatus?.[member]; // ✅ ตรวจสถานะ ready
                            return (
                                <li
                                    key={index}
                                    className={`flex justify-between items-center p-1 rounded ${
                                        isMemberReady ? 'border-2 border-green-500' : ''
                                    }`}
                                >
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
                            );
                        })}
                    </ul>
                </div>
                <div className="text-left mt-4">
                    <h2 className="font-semibold mb-2">เลือกประเภทอาหารที่คุณอยากกิน 🍽️</h2>
                    <div className="flex flex-wrap gap-2">
                        {DEFAULT_FOOD_TYPES.map((type, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleSelectFood(type)}
                                className={`px-3 py-1 rounded-full border ${
                                    selectedMyFoods.includes(type)
                                        ? 'bg-green-500 text-white border-green-600'
                                        : 'bg-white hover:bg-gray-100 border-gray-300'
                                } transition-all text-sm`}
                            >
                                {type}
                            </button>
                        ))}
                    </div>

                    <div className="mt-4">
                        <h3 className="text-sm font-semibold mb-1">คุณเลือกแล้ว:</h3>
                        {selectedMyFoods.length > 0 ? (
                            <ul className="list-disc list-inside text-sm">
                                {selectedMyFoods.map((type, idx) => (
                                    <li key={idx}>{type}</li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-gray-500 text-sm">ยังไม่ได้เลือกอาหารเลย 😋</p>
                        )}
                    </div>
                </div>


                <button
                    onClick={handleReadyToggle}
                    className={`w-full py-2 px-4 rounded transition-all ${isReady ? 'bg-green-500 text-white' : 'bg-yellow-400 text-black hover:bg-yellow-500'}`}
                >
                    {isReady ? '✅ พร้อมแล้ว' : '⚪ ยังไม่พร้อม'}
                </button>
                <button
                    onClick={handleLeaveRoom}
                    className="w-full bg-gray-300 text-black py-2 px-4 rounded hover:bg-gray-400 transition-all"
                >
                    🚪 ออกจากห้อง
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
