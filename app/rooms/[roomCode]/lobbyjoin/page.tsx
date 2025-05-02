//
// 'use client';
//
// import { useEffect, useState, use } from 'react';
// import { useSearchParams } from 'next/navigation';
// import { useRouter } from 'next/navigation';
// import { getRoomInfo, kickMember, leaveRoom,selectFood,setMemberReady } from '@/services/roomService';
//
//
//
// export default function RoomLobbyPage({ params }: { params: Promise<{ roomCode: string }> }) {
//     const { roomCode } = use(params);
//     const router = useRouter();
//     const searchParams = useSearchParams();
//     const memberName = searchParams.get('memberName');
//     const [isReady, setIsReady] = useState(false);
//
//     const [members, setMembers] = useState<string[]>([]);
//     const [selectedMyFoods, setSelectedMyFoods] = useState<string[]>([]);
//     const [owner, setOwner] = useState<string | null>(null);
//     const [isLoading, setIsLoading] = useState(true);
//     const [ownerUser, setOwnerUser] = useState<string>('');
//
//     // ✅ เพิ่ม state สำหรับเก็บสถานะ ready ของสมาชิกแต่ละคน
//     const [readyStatus, setReadyStatus] = useState<Record<string, boolean>>({});
//
//     const DEFAULT_FOOD_TYPES = [
//         "ของหวาน", "อาหารตามสั่ง", "อาหารจานเดียว",
//         "ก๋วยเตี๋ยว", "เครื่องดื่ม/น้ำผลไม้", "เบเกอรี/เค้ก",
//         "ชาบู", "อาหารเกาหลี", "ปิ้งย่าง"
//     ];
//
//
//     useEffect(() => {
//         const fetchRoomInfo = async () => {
//             try {
//                 const data = await getRoomInfo(roomCode);
//                 setMembers(data.members || []);
//                 // @ts-ignore
//                 setSelectedMyFoods(data.memberFoodSelections?.[memberName] || []);
//                 setOwner(data.owner || null);
//                 setOwnerUser(data.ownerUser);
//
//                 // ✅ ตั้งค่าตัวแปร readyStatus จากข้อมูลที่ดึงมา
//                 setReadyStatus(data.readyStatus || {});
//
//                 // ✅ ตั้ง isReady ของผู้ใช้เอง จาก readyStatus
//                 if (memberName && data.readyStatus?.[memberName] !== undefined) {
//                     setIsReady(data.readyStatus[memberName]);
//                 }
//
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
//
//     const handleKick = async (member: string) => {
//         if (!confirm(`คุณแน่ใจหรือไม่ว่าต้องการเตะ ${member} ออกจากห้อง?`)) return;
//
//         try {
//             await kickMember(roomCode, memberName, member);
//             alert(`เตะ ${member} ออกจากห้องเรียบร้อย`);
//             setMembers(prev => prev.filter(m => m !== member));
//         } catch (err: any) {
//             alert('เตะสมาชิกไม่สำเร็จ: ' + err.message);
//         }
//     };
//
//     // const handleLeaveRoom = async () => {
//     //     if (!confirm('คุณแน่ใจหรือไม่ว่าต้องการออกจากห้องนี้?')) return;
//     //
//     //     try {
//     //         const response = await leaveRoom(roomCode, memberName);
//     //         alert('ออกจากห้องเรียบร้อย: ' + response.data);
//     //         router.push('/');
//     //     } catch (err: any) {
//     //         alert('ออกจากห้องไม่สำเร็จ: ' + (err?.response?.data || err.message));
//     //     }
//     // };
//
//     //แก้ response.data ที่แดง
//
//     const handleLeaveRoom = async () => {
//         if (!confirm('คุณแน่ใจหรือไม่ว่าต้องการออกจากห้องนี้?')) return;
//
//         try {
//             const response = await leaveRoom(roomCode, memberName);
//             // ถ้า response เป็น string โดยตรง
//             alert('ออกจากห้องเรียบร้อย: ' + response);
//             router.push('/');
//         } catch (err: any) {
//             alert('ออกจากห้องไม่สำเร็จ: ' + (err?.response?.data || err.message));
//         }
//     };
//
//     // ฟังก์ชันจัดการการเลือกอาหาร
//     const handleSelectFood = async (foodType: string) => {
//         try {
//             const response = await selectFood(roomCode, memberName!, foodType);
//
//             if (response.error) {
//                 alert(response.error);
//                 return;
//             }
//
//             setSelectedMyFoods(response.selectedFoods);
//         } catch (err: any) {
//             alert('เลือกประเภทอาหารไม่สำเร็จ: ' + (err?.response?.data || err.message));
//         }
//     };
//
//     const handleReadyToggle = async () => {
//         try {
//             const newReadyStatus = !isReady; // ✅ สลับสถานะ Ready (ถ้า true → false, ถ้า false → true)
//
//             await setMemberReady(roomCode, memberName!, newReadyStatus); // ✅ เรียก API ไปอัปเดตสถานะที่หลังบ้าน
//
//             setIsReady(newReadyStatus); // ✅ อัปเดตสถานะ Ready เฉพาะของตัวเองใน state
//
//             setReadyStatus(prev => ({ ...prev, [memberName!]: newReadyStatus })); // ✅ อัปเดต readyStatus รวมของสมาชิกในห้อง
//
//             if (!newReadyStatus) {
//                 // ✅ ถ้ายกเลิก Ready (newReadyStatus = false) → เคลียร์อาหารที่เลือกของตัวเองด้วย
//                 setSelectedMyFoods([]);
//             }
//         } catch (err: any) {
//             alert('ตั้งค่าสถานะไม่สำเร็จ: ' + err.message);
//         }
//     };
//
//
//
//
//     return (
//         <div
//             className="fixed inset-0 flex items-center justify-center bg-cover bg-center"
//             style={{
//                 // backgroundImage: `url("https://i.pinimg.com/1200x/13/75/0d/13750d8970141cab1ab2a703d950fb75.jpg")`
//                 backgroundColor: '#FFEBCD',
//             }}
//         >
//             <div className="bg-white p-6 rounded-lg shadow-md text-center max-w-md w-full space-y-4">
//                 <h1 className="text-2xl font-bold">ห้อง: {roomCode}</h1>
//                 <p>ยินดีต้อนรับ <span className="font-semibold">{memberName}</span>!</p>
//                 <p className="text-gray-600 text-sm">สมาชิกทั้งหมด: {members.length} คน</p>
//
//                 <div className="text-left">
//                     <h2 className="font-semibold mb-2">สมาชิกในห้อง:</h2>
//                     <ul className="list-disc list-inside text-sm text-left space-y-1">
//                         {members.map((member, index) => {
//                             const isMemberReady = readyStatus?.[member]; // ✅ ตรวจสถานะ ready
//                             return (
//                                 <li
//                                     key={index}
//                                     className={`flex justify-between items-center p-1 rounded ${
//                                         isMemberReady ? 'border-2 border-green-500' : ''
//                                     }`}
//                                 >
//                                     <span>{member}</span>
//                                     {memberName === ownerUser && member !== ownerUser && (
//                                         <button
//                                             onClick={() => handleKick(member)}
//                                             className="text-red-500 text-xs hover:underline"
//                                         >
//                                             เตะ
//                                         </button>
//                                     )}
//                                 </li>
//                             );
//                         })}
//                     </ul>
//                 </div>
//                 <div className="text-left mt-4">
//                     <h2 className="font-semibold mb-2">เลือกประเภทอาหารที่คุณอยากกิน 🍽️</h2>
//                     <div className="flex flex-wrap gap-2">
//                         {DEFAULT_FOOD_TYPES.map((type, idx) => (
//                             <button
//                                 key={idx}
//                                 onClick={() => handleSelectFood(type)}
//                                 className={`px-3 py-1 rounded-full border ${
//                                     selectedMyFoods.includes(type)
//                                         ? 'bg-green-500 text-white border-green-600'
//                                         : 'bg-white hover:bg-gray-100 border-gray-300'
//                                 } transition-all text-sm`}
//                             >
//                                 {type}
//                             </button>
//                         ))}
//                     </div>
//
//                     <div className="mt-4">
//                         <h3 className="text-sm font-semibold mb-1">คุณเลือกแล้ว:</h3>
//                         {selectedMyFoods.length > 0 ? (
//                             <ul className="list-disc list-inside text-sm">
//                                 {selectedMyFoods.map((type, idx) => (
//                                     <li key={idx}>{type}</li>
//                                 ))}
//                             </ul>
//                         ) : (
//                             <p className="text-gray-500 text-sm">ยังไม่ได้เลือกอาหารเลย 😋</p>
//                         )}
//                     </div>
//                 </div>
//
//
//                 <button
//                     onClick={handleReadyToggle}
//                     className={`w-full py-2 px-4 rounded transition-all ${isReady ? 'bg-green-500 text-white' : 'bg-yellow-400 text-black hover:bg-yellow-500'}`}
//                 >
//                     {isReady ? '✅ พร้อมแล้ว' : '⚪ ยังไม่พร้อม'}
//                 </button>
//                 <button
//                     onClick={handleLeaveRoom}
//                     className="w-full bg-gray-300 text-black py-2 px-4 rounded hover:bg-gray-400 transition-all"
//                 >
//                     🚪 ออกจากห้อง
//                 </button>
//                 <button
//                     onClick={handleLeaveRoom}
//                     className="w-full bg-gray-300 text-black py-2 px-4 rounded hover:bg-gray-400 transition-all"
//                 >
//                     🚪 ออกจากห้อง
//                 </button>
//             </div>
//         </div>
//     );
// }




//โค้ดใหม่
'use client';

import { useEffect, useState, use } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { getRoomInfo, kickMember, leaveRoom, selectFood, setMemberReady, randomizeFood } from '@/services/roomService';
import { motion, AnimatePresence } from 'framer-motion';

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
    const [readyStatus, setReadyStatus] = useState<Record<string, boolean>>({});

    // State สำหรับการสุ่มอาหาร
    const [isSpinning, setIsSpinning] = useState(false);
    const [foodOptions, setFoodOptions] = useState<any[]>([]);
    const [selectedFood, setSelectedFood] = useState<any>(null);
    const [showModal, setShowModal] = useState(false);
    const [allMembersReady, setAllMembersReady] = useState(false);

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
                setReadyStatus(data.readyStatus || {});

                if (memberName && data.readyStatus?.[memberName] !== undefined) {
                    setIsReady(data.readyStatus[memberName]);
                }

                // Mock food options from API (จะถูกแทนที่ด้วยข้อมูลจริงเมื่อเชื่อมกับ API)
                const mockOptions = generateMockFoodOptions();
                setFoodOptions(mockOptions);

                // ตรวจสอบว่าทุกคนพร้อมหรือไม่
                checkAllMembersReady(data.members, data.readyStatus);
            } catch (err) {
                console.error('Failed to fetch room info:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchRoomInfo();

        // Poll for room updates
        const intervalId = setInterval(fetchRoomInfo, 500000);
        return () => clearInterval(intervalId);
    }, [roomCode]);

    // ตรวจสอบว่าทุกคนพร้อมหรือไม่
    const checkAllMembersReady = (membersList: any[], statusObj: { [x: string]: boolean; }) => {
        if (!membersList || !statusObj || membersList.length === 0) return false;

        const allReady = membersList.every(member => statusObj[member] === true);
        setAllMembersReady(allReady);
        return allReady;
    };

    // สร้างข้อมูลร้านอาหารจำลอง (จะถูกแทนด้วยข้อมูลจาก Google Maps API)
    const generateMockFoodOptions = () => {
        const options = [];
        const foodTypes = [...DEFAULT_FOOD_TYPES];

        for (let i = 0; i < 30; i++) {
            const randomType = foodTypes[Math.floor(Math.random() * foodTypes.length)];
            options.push({
                id: `restaurant-${i}`,
                name: `ร้าน${randomType}${i+1}`,
                type: randomType,
                rating: (Math.random() * 2 + 3).toFixed(1),
                price: '฿'.repeat(Math.floor(Math.random() * 3) + 1),
                distance: (Math.random() * 5).toFixed(1),
                location: {
                    lat: 13.736717 + (Math.random() - 0.5) * 0.05,
                    lng: 100.523186 + (Math.random() - 0.5) * 0.05
                }
            });
        }
        return options;
    };

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

    const handleLeaveRoom = async () => {
        if (!confirm('คุณแน่ใจหรือไม่ว่าต้องการออกจากห้องนี้?')) return;

        try {
            const response = await leaveRoom(roomCode, memberName);
            alert('ออกจากห้องเรียบร้อย: ' + response);
            router.push('/');
        } catch (err: any) {
            alert('ออกจากห้องไม่สำเร็จ: ' + (err?.response?.data || err.message));
        }
    };

    const handleSelectFood = async (foodType: string) => {
        try {
            const response = await selectFood(roomCode, memberName!, foodType);

            if (response.error) {
                alert(response.error);
                return;
            }

            setSelectedMyFoods(response.selectedFoods);

            // กรองร้านอาหารตามประเภทที่เลือก (จะแทนที่ด้วยการเรียก Google Maps API จริง)
            const filteredOptions = foodOptions.filter(option =>
                response.selectedFoods.includes(option.type)
            );
            setFoodOptions(filteredOptions.length > 0 ? filteredOptions : generateMockFoodOptions());

        } catch (err: any) {
            alert('เลือกประเภทอาหารไม่สำเร็จ: ' + (err?.response?.data || err.message));
        }
    };

    const handleReadyToggle = async () => {
        try {
            const newReadyStatus = !isReady;

            await setMemberReady(roomCode, memberName!, newReadyStatus);

            setIsReady(newReadyStatus);
            setReadyStatus(prev => ({ ...prev, [memberName!]: newReadyStatus }));

            if (!newReadyStatus) {
                setSelectedMyFoods([]);
            }
        } catch (err: any) {
            alert('ตั้งค่าสถานะไม่สำเร็จ: ' + err.message);
        }
    };

    // const handleStartSpin = async () => {
    //     if (memberName !== ownerUser) {
    //         alert('เฉพาะเจ้าของห้องเท่านั้นที่สามารถสุ่มอาหารได้');
    //         return;
    //     }
    //
    //     if (!allMembersReady) {
    //         alert('รอให้สมาชิกทุกคนพร้อมก่อนสุ่มอาหาร');
    //         return;
    //     }
    //
    //     try {
    //         setIsSpinning(true);
    //
    //         // เรียก API จริงสำหรับการสุ่มอาหาร (จะทำงานจริงเมื่อเชื่อมกับ backend)
    //         // const result = await randomizeFood(roomCode, ownerUser);
    //
    //         // จำลองการสุ่มอาหาร
    //         setTimeout(() => {
    //             const randomIndex = Math.floor(Math.random() * foodOptions.length);
    //             const selected = foodOptions[randomIndex];
    //             setSelectedFood(selected);
    //             setIsSpinning(false);
    //             setShowModal(true);
    //         }, 5000);
    //
    //     } catch (err: any) {
    //         setIsSpinning(false);
    //         alert('สุ่มอาหารไม่สำเร็จ: ' + err.message);
    //     }
    // };


// ✅ lobby.tsx - เพิ่มใน handleStartSpin แทน modal
    const handleStartSpin = async () => {
        if (memberName !== ownerUser) {
            alert('เฉพาะเจ้าของห้องเท่านั้นที่สามารถสุ่มอาหารได้');
            return;
        }

        if (!allMembersReady) {
            alert('รอให้สมาชิกทุกคนพร้อมก่อนสุ่มอาหาร');
            return;
        }

        try {
            setIsSpinning(true);

            // จำลองการสุ่มอาหาร
            setTimeout(() => {
                const randomIndex = Math.floor(Math.random() * foodOptions.length);
                const selected = foodOptions[randomIndex];
                setIsSpinning(false);

                // ส่งผู้ใช้ไปหน้าผลลัพธ์พร้อมข้อมูล
                router.push(`/result?name=${encodeURIComponent(selected.name)}&type=${encodeURIComponent(selected.type)}&rating=${selected.rating}&price=${selected.price}&distance=${selected.distance}&lat=${selected.location.lat}&lng=${selected.location.lng}`);

            }, 5000);

        } catch (err: any) {
            setIsSpinning(false);
            alert('สุ่มอาหารไม่สำเร็จ: ' + err.message);
        }
    };



    const closeModal = () => {
        setShowModal(false);
    };

    const openMapsLink = () => {
        if (selectedFood && selectedFood.location) {
            const url = `https://www.google.com/maps/search/?api=1&query=${selectedFood.location.lat},${selectedFood.location.lng}`;
            window.open(url, '_blank');
        }
    };

    if (isLoading) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-orange-50">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="text-center"
                >
                    <div className="w-16 h-16 border-t-4 border-orange-500 border-solid rounded-full animate-spin mx-auto"></div>
                    <p className="mt-4 text-orange-500 font-medium">กำลังโหลดข้อมูล...</p>
                </motion.div>
            </div>
        );
    }

    return (
        <div
            className="fixed inset-0 overflow-hidden bg-orange-50"
        >
            <div className="mt-20 h-full max-w-4xl mx-auto p-4 overflow-auto">
                <motion.div
                    initial={{ y: -50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.6 }}
                    className="bg-white rounded-2xl shadow-xl overflow-hidden"
                >
                    <div className="bg-gradient-to-r from-orange-400 to-yellow-400 p-6 text-white">
                        <div className="flex justify-between items-center">
                            <div>
                                <h1 className="text-3xl font-bold">ห้อง: {roomCode}</h1>
                                <p className="opacity-90">ยินดีต้อนรับ <span className="font-semibold">{memberName}</span>!</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm bg-white/20 px-3 py-1 rounded-full">
                                    สมาชิก {members.length} คน
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 grid md:grid-cols-2 gap-6">
                        {/* Left column - Members */}
                        <div className="space-y-4">
                            <h2 className="font-semibold text-lg flex items-center">
                                <span className="material-icons-outlined mr-2 text-orange-500">group</span>
                                สมาชิกในห้อง
                            </h2>

                            <div className="bg-orange-50 rounded-xl p-4">
                                {members.map((member, index) => {
                                    const isMemberReady = readyStatus?.[member];
                                    return (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            className={`flex justify-between items-center p-3 mb-2 rounded-lg ${
                                                isMemberReady ? 'bg-green-100 border-l-4 border-green-500' : 'bg-white border-l-4 border-gray-300'
                                            }`}
                                        >
                                            <div className="flex items-center">
                                                <span className={`w-2 h-2 rounded-full mr-2 ${isMemberReady ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                                                <span className="font-medium">{member}</span>
                                                {member === ownerUser && (
                                                    <span className="ml-2 text-xs bg-yellow-500 text-white px-2 py-0.5 rounded">เจ้าของห้อง</span>
                                                )}
                                            </div>
                                            {memberName === ownerUser && member !== ownerUser && (
                                                <button
                                                    onClick={() => handleKick(member)}
                                                    className="text-red-500 hover:text-red-700 text-sm flex items-center"
                                                >
                                                    <span className="material-icons-outlined text-sm mr-1">person_remove</span>
                                                    เตะ
                                                </button>
                                            )}
                                        </motion.div>
                                    );
                                })}
                            </div>

                            {/* Action buttons */}
                            <div className="flex flex-col gap-3 mt-6 cursor-pointer">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleReadyToggle}
                                    className={`py-3 w-full rounded-xl font-medium transition-all cursor-pointer ${
                                        isReady
                                            ? 'bg-green-500 text-white shadow-lg shadow-green-200'
                                            : 'bg-yellow-400 text-black hover:bg-yellow-500 shadow-lg shadow-yellow-200'
                                    }`}
                                >
                                    {isReady ? '✅ พร้อมแล้ว!' : '⚪ ยังไม่พร้อม'}
                                </motion.button>

                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleLeaveRoom}
                                    className="py-3 w-full bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300 transition-all cursor-pointer"
                                >
                                    🚪 ออกจากห้อง
                                </motion.button>
                            </div>
                        </div>

                        {/* Right column - Food selection */}
                        <div className="space-y-4">
                            <h2 className="font-semibold text-lg flex items-center">
                                <span className="material-icons-outlined mr-2 text-orange-500">restaurant</span>
                                เลือกประเภทอาหารที่คุณอยากกิน
                            </h2>

                            <div className="bg-orange-50 rounded-xl p-4">
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {DEFAULT_FOOD_TYPES.map((type, idx) => (
                                        <motion.button
                                            key={idx}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => handleSelectFood(type)}
                                            className={`px-3 py-1.5 rounded-full ${
                                                selectedMyFoods.includes(type)
                                                    ? 'bg-orange-500 text-white shadow-md'
                                                    : 'bg-white border border-orange-200 hover:border-orange-400 shadow-sm'
                                            } transition-all text-sm cursor-pointer`}
                                        >
                                            {type}
                                        </motion.button>
                                    ))}
                                </div>

                                <div className="mt-4 bg-white rounded-lg p-3">
                                    <h3 className="text-sm font-semibold mb-2 text-gray-700">คุณเลือกแล้ว:</h3>
                                    {selectedMyFoods.length > 0 ? (
                                        <div className="flex flex-wrap gap-1">
                                            {selectedMyFoods.map((type, idx) => (
                                                <motion.span
                                                    key={idx}
                                                    initial={{ opacity: 0, scale: 0.8 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    transition={{ delay: idx * 0.1 }}
                                                    className="bg-orange-100 text-orange-700 px-2 py-1 rounded text-xs inline-block"
                                                >
                                                    {type}
                                                </motion.span>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-gray-500 text-sm">ยังไม่ได้เลือกอาหารเลย 😋</p>
                                    )}
                                </div>
                            </div>

                            {/* CSGO-style Food Spinner */}
                            <div className="mt-6 bg-gray-800 rounded-xl p-4 relative overflow-hidden">
                                <h3 className="text-white font-semibold mb-3 flex items-center">
                                    {/*<span className="material-icons-outlined mr-2"></span>*/}
                                    สุ่มอาหาร
                                </h3>

                                <div className="relative h-20 bg-gray-900 rounded-lg overflow-hidden">
                                    {/* Indicator line */}
                                    <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-red-500 z-10"></div>

                                    {/* Spinning items */}
                                    <div
                                        className={`flex items-center absolute left-0 h-full transition-all duration-[5000ms] ${
                                            isSpinning ? 'animate-food-spin' : ''
                                        }`}
                                        style={{
                                            transform: isSpinning ? 'translateX(0)' : 'translateX(0)',
                                            width: `${foodOptions.length * 200}px`
                                        }}
                                    >
                                        {foodOptions.map((option, idx) => (
                                            <div
                                                key={idx}
                                                className="flex-shrink-0 w-48 h-16 mx-1 bg-gradient-to-r from-yellow-600 to-orange-600 rounded flex items-center justify-center text-white font-medium"
                                            >
                                                {option.name}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="mt-4 flex justify-center">
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={handleStartSpin}
                                        disabled={isSpinning || !allMembersReady || memberName !== ownerUser}
                                        className={`py-2 px-6 rounded-lg font-medium ${
                                            allMembersReady && memberName === ownerUser
                                                ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white hover:shadow-lg disabled:opacity-50'
                                                : 'bg-gray-600 text-gray-300 cursor-not-allowed'
                                        }`}
                                    >
                                        {isSpinning ? 'กำลังสุ่ม...' : '🎲 สุ่มเลย!'}
                                    </motion.button>
                                </div>

                                {!allMembersReady && (
                                    <p className="text-yellow-400 text-xs text-center mt-2">
                                        รอให้สมาชิกทุกคนพร้อมก่อนสุ่มอาหาร
                                    </p>
                                )}

                                {memberName !== ownerUser && (
                                    <p className="text-gray-400 text-xs text-center mt-2">
                                        เฉพาะเจ้าของห้องเท่านั้นที่สามารถสุ่มอาหารได้
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Footer */}
                <div className="mt-4 text-center text-gray-500 text-sm">
                    © 2025 WhatEat - เลือกร้านอาหารง่ายๆ กับเพื่อน
                </div>
            </div>

            {/* Result Modal */}
            <AnimatePresence>
                {showModal && selectedFood && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/50"
                    >
                        <motion.div
                            initial={{ scale: 0.8, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.8, y: 20 }}
                            className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden"
                        >
                            <div className="bg-gradient-to-r from-orange-500 to-yellow-500 p-4 text-white">
                                <h3 className="text-xl font-bold">🎉 สุ่มได้ร้านอาหารแล้ว!</h3>
                            </div>

                            <div className="p-6">
                                <h2 className="text-2xl font-bold mb-2">{selectedFood.name}</h2>
                                <div className="flex items-center mb-3">
                                    <div className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded text-sm mr-2">
                                        {selectedFood.type}
                                    </div>
                                    <div className="flex items-center text-yellow-500 text-sm">
                                        {selectedFood.rating} ★
                                    </div>
                                    <div className="ml-2 text-gray-500 text-sm">{selectedFood.price}</div>
                                </div>

                                <p className="text-gray-600 mb-6">
                                    ร้านนี้อยู่ห่างจากคุณประมาณ {selectedFood.distance} กม.
                                </p>

                                <div className="flex justify-end gap-3">
                                    <button
                                        onClick={closeModal}
                                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
                                    >
                                        ปิด
                                    </button>
                                    <button
                                        onClick={openMapsLink}
                                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center"
                                    >
                                        <span className="material-icons-outlined text-sm mr-1">map</span>
                                        ดูใน Google Maps
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Prompt:wght@300;400;500;600;700&display=swap');
                @import url('https://fonts.googleapis.com/icon?family=Material+Icons+Outlined');

                body {
                    font-family: 'Prompt', sans-serif;
                    margin: 0;
                    padding: 0;
                    overflow: hidden;
                }

                @keyframes food-spin {
                    0% {
                        transform: translateX(0);
                    }
                    10% {
                        transform: translateX(-10%);
                    }
                    30% {
                        transform: translateX(-30%);
                    }
                    60% {
                        transform: translateX(-60%);
                    }
                    80% {
                        transform: translateX(-80%);
                    }
                    100% {
                        transform: translateX(-${Math.floor(Math.random() * 85) + 10}%);
                    }
                }
            `}</style>
        </div>
    );
}