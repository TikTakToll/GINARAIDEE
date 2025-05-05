'use client';

import { useEffect, useState, use } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import useWebSocket from "@/hooks/useWebSocket"; // ปรับ path ตามของจริง
import {
    getRoomInfo,
    kickMember,
    leaveRoom,
    selectFood,
    setMemberReady,
    randomizeFood,
} from "@/services/roomService";
import { motion } from "framer-motion";

export default function RoomLobbyPage({
                                          params,
                                      }: {
    params: Promise<{ roomCode: string }>;
}) {
    const { roomCode } = use(params);
    const router = useRouter();
    const searchParams = useSearchParams();
    const memberName = searchParams.get("memberName");
    // ✅ WebSocket: รับข้อมูลจาก server แบบเรียลไทม์


    const [isReady, setIsReady] = useState(false),
        [members, setMembers] = useState<string[]>([]),
        [selectedMyFoods, setSelectedMyFoods] = useState<string[]>([]),
        [ownerUser, setOwnerUser] = useState<string>(""),
        [readyStatus, setReadyStatus] = useState<Record<string, boolean>>({}),
        [memberFoodSelections, setMemberFoodSelections] = useState<Record<string, string[]>>({}),
        [isLoading, setIsLoading] = useState(true),
        [foodOptions, setFoodOptions] = useState<any[]>([]),
        [allMembersReady, setAllMembersReady] = useState(false),
        [randomResult, setRandomResult] = useState<{ randomFood: string; restaurants: any[] } | null>(null);
    //เหลือเชื่อมต่อกับ hooks เพื่อดึงฟังก์ชัน

    useWebSocket(roomCode, {
        setMembers,
        setReadyStatus,
        setMemberFoodSelections,
        onRoomDeleted: () => {
            alert("ห้องนี้ถูกลบแล้ว");
            router.push("/");
        },
    });

    const isAllReady = members.every((member) => readyStatus[member]);

    const DEFAULT_FOOD_TYPES = [
        "ของหวาน",
        "อาหารตามสั่ง",
        "อาหารจานเดียว",
        "ก๋วยเตี๋ยว",
        "เครื่องดื่ม/น้ำผลไม้",
        "เบเกอรี/เค้ก",
        "ชาบู",
        "อาหารเกาหลี",
        "ปิ้งย่าง",
    ];


    useEffect(() => {
        const fetchRoomInfo = async () => {
            try {
                const data = await getRoomInfo(roomCode);
                setMembers(data.members || []);
                setSelectedMyFoods(data.memberFoodSelections?.[memberName!] || []);
                setOwnerUser(data.ownerUser);
                setReadyStatus(data.readyStatus || {});
                setMemberFoodSelections(data.memberFoodSelections || {});
                if (memberName && data.readyStatus?.[memberName] !== undefined) {
                    setIsReady(data.readyStatus[memberName]);
                }
                const mockOptions = generateMockFoodOptions();
                setFoodOptions(mockOptions);
                checkAllMembersReady(data.members, data.readyStatus);
            } catch (err) {
                console.error("Failed to fetch room info:", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchRoomInfo(); // เรียกครั้งแรกเท่านั้น

        // ❌ ไม่ต้อง setInterval แล้ว
    }, [roomCode]);

    const checkAllMembersReady = (membersList: string[], statusObj: Record<string, boolean>) => {
        if (!membersList || !statusObj || membersList.length === 0) return false;
        const allReady = membersList.every((member) => statusObj[member]);
        setAllMembersReady(allReady);
        return allReady;
    };

    const generateMockFoodOptions = () => {
        const options = [];
        const foodTypes = [...DEFAULT_FOOD_TYPES];
        for (let i = 0; i < 30; i++) {
            const randomType = foodTypes[Math.floor(Math.random() * foodTypes.length)];
            options.push({
                id: `restaurant-${i}`,
                name: `ร้าน${randomType}${i + 1}`,
                type: randomType,
                rating: (Math.random() * 2 + 3).toFixed(1),
                price: "฿".repeat(Math.floor(Math.random() * 3) + 1),
                distance: (Math.random() * 5).toFixed(1),
                location: {
                    lat: 13.736717 + (Math.random() - 0.5) * 0.05,
                    lng: 100.523186 + (Math.random() - 0.5) * 0.05,
                },
            });
        }
        return options;
    };

    const handleKick = async (member: string) => {
        if (!confirm(`คุณแน่ใจหรือไม่ว่าต้องการเตะ ${member} ออกจากห้อง?`)) return;
        try {
            await kickMember(roomCode, memberName!, member);
            alert(`เตะ ${member} ออกจากห้องเรียบร้อย`);
            setMembers((prev) => prev.filter((m) => m !== member));
        } catch (err: any) {
            alert("เตะสมาชิกไม่สำเร็จ: " + err.message);
        }
    };

    const handleLeaveRoom = async () => {
        if (!confirm("คุณแน่ใจหรือไม่ว่าต้องการออกจากห้องนี้?")) return;
        try {
            await leaveRoom(roomCode, memberName!);
            alert("ออกจากห้องเรียบร้อย");
            router.push("/");
        } catch (err: any) {
            alert("ออกจากห้องไม่สำเร็จ: " + (err?.response?.data || err.message));
        }
    };

    const handleSelectFood = async (foodType: string) => {
        try {
            const response = await selectFood(roomCode, memberName!, foodType);
            if (response.error) {
                alert(response.error);
                return;
            }

            // ✅ อัปเดตเฉพาะของตัวเอง
            setSelectedMyFoods(response.selectedFoods);

            // ✅ โหลดข้อมูลห้องใหม่เพื่อให้ได้ของสมาชิกคนอื่นด้วย
            const updatedRoom = await getRoomInfo(roomCode);
            setMemberFoodSelections(updatedRoom.memberFoodSelections || {});
        } catch (err: any) {
            alert("เลือกประเภทอาหารไม่สำเร็จ: " + (err?.response?.data || err.message));
        }
    };

    const handleReadyToggle = async () => {
        try {
            const newReadyStatus = !isReady;
            await setMemberReady(roomCode, memberName!, newReadyStatus);
            setIsReady(newReadyStatus);
            setReadyStatus((prev) => ({ ...prev, [memberName!]: newReadyStatus }));
            if (!newReadyStatus) setSelectedMyFoods([]);
        } catch (err: any) {
            alert("ตั้งค่าสถานะไม่สำเร็จ: " + err.message);
        }
    };


    const handleRandomizeFood = async () => {
        try {
            router.push(`/rooms/${roomCode}/randomizer?memberName=${memberName}`);
        } catch (err: any) {
            alert("สุ่มอาหารไม่สำเร็จ: " + (err?.response?.data || err.message));
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
        <motion.div className="min-h-screen overflow-y-auto">
            <div className="mt-30 max-w-4xl mx-auto p-4">
                <motion.div
                    initial={{ y: -50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.6 }}
                    className="border-2 rounded-2xl shadow-xl overflow-hidden"
                >
                    {/* Header */}
                    <div className="bg-gradient-to-r from-red-400 to-yellow-400 p-6 text-black flex justify-between items-center shadow-2xl">
                        <div>
                            <h1 className="text-3xl font-bold">ห้อง: {roomCode}</h1>
                            <p className="opacity-90">
                                ยินดีต้อนรับ <span className="font-semibold">{memberName}</span>!
                            </p>
                        </div>
                        <p className="text-sm  bg-yellow-500 border-2 px-3 py-1 rounded-full">
                            สมาชิก {members.length} คน
                        </p>
                    </div>

                    {/* Main content */}
                    <div className="p-6 grid md:grid-cols-2 gap-6">
                        {/* Left: Members */}
                        <div className="space-y-4">
                            <h2 className="font-semibold text-lg text-orange-500">สมาชิกในห้อง</h2>
                            <div className=" rounded-xl p-4 border-2">
                                {/*ส่วนของสมาชิกฝั่งซ้าย*/}
                                {members.map((member, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className={`flex justify-between items-center p-3 mb-2 rounded-lg ${
                                            readyStatus[member]
                                                ? "bg-green-100 border-l-4 border-green-500"
                                                : "bg-white border-l-4 border-gray-300"
                                        }`}
                                    >
                                        <div className="flex items-center">
                                            <span
                                                className={`w-2 h-2 rounded-full mr-2 ${
                                                    readyStatus[member] ? "bg-green-500" : "bg-red-400"
                                                }`}
                                            ></span>
                                            <span className="font-medium text-black">{member}</span>
                                            {member === ownerUser && (
                                                <span className="ml-2 text-xs bg-yellow-500 text-white px-2 py-0.5 rounded">
                                                    เจ้าของห้อง
                                                </span>
                                            )}
                                        </div>
                                        {memberName === ownerUser && member !== ownerUser && (
                                            <button
                                                onClick={() => handleKick(member)}
                                                className="text-red-500 hover:text-red-700 text-sm flex items-center cursor-pointer"
                                            >
                                                เตะ
                                            </button>
                                        )}
                                    </motion.div>
                                ))}
                            </div>

                            {/* Ready & Leave */}
                            <div className="flex flex-col gap-3 mt-6">
                                {ownerUser === memberName && (
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={handleRandomizeFood}
                                        disabled={!isAllReady}
                                        className={`py-3 w-full rounded-xl font-medium transition-all cursor-pointer shadow-lg ${
                                            isAllReady
                                                ? "bg-red-500 text-white hover:bg-red-600"
                                                : "bg-gray-300 text-gray-500 cursor-not-allowed shadow-none"
                                        }`}
                                    >
                                        🎲 สุ่มอาหาร
                                    </motion.button>
                                )}
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleReadyToggle}
                                    className={`py-3 w-full rounded-xl font-medium transition-all cursor-pointer ${
                                        isReady
                                            ? "bg-green-500 text-white shadow-lg "
                                            : "bg-yellow-400 text-black hover:bg-yellow-500 shadow-lg"
                                    }`}
                                >
                                    {isReady ? "✅ พร้อมแล้ว!" : "⚪ ยังไม่พร้อม"}
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

                        {/* Right: Food Selection */}
                        <div className="space-y-4">
                            <h2 className="font-semibold text-lg text-orange-500">เลือกประเภทอาหารที่คุณอยากกิน</h2>

                            <div className="flex flex-wrap gap-2 mb-4 border-2 rounded-lg p-3">
                                {DEFAULT_FOOD_TYPES.map((type, idx) => (
                                    <motion.button
                                        key={idx}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => handleSelectFood(type)}
                                        className={`px-3 py-1.5 rounded-full cursor-pointer ${
                                            selectedMyFoods.includes(type)
                                                ? "bg-orange-500 text-white shadow-md"
                                                : "bg-white border border-orange-200 hover:border-orange-400 shadow-sm"
                                        } text-black transition-all text-sm`}
                                    >
                                        {type}
                                    </motion.button>
                                ))}
                            </div>
                            <div className="mt-4 bg-white rounded-lg p-3">
                                <h3 className="text-sm font-semibold mb-2 text-gray-700">
                                    รายการอาหารที่สมาชิกเลือกไว้ (เฉพาะคนที่กดพร้อม)
                                </h3>
                                {members.filter((m) => readyStatus[m]).length > 0 ? (
                                    members.map((member) => {
                                        if (!readyStatus[member]) return null;
                                        const foods = memberFoodSelections[member] || [];
                                        return (
                                            <div key={member}>
                                                <p className="text-sm font-medium text-orange-600">
                                                    🍽️ {member}
                                                </p>
                                                <div className="flex flex-wrap gap-1 mt-1 mb-2">
                                                    {foods.length > 0 ? (
                                                        foods.map((food, idx) => (
                                                            <motion.span
                                                                key={idx}
                                                                initial={{ opacity: 0, scale: 0.8 }}
                                                                animate={{ opacity: 1, scale: 1 }}
                                                                transition={{ delay: idx * 0.1 }}
                                                                className="bg-orange-100 text-orange-700 px-2 py-1 rounded text-xs"
                                                            >
                                                                {food}
                                                            </motion.span>
                                                        ))
                                                    ) : (
                                                        <p className="text-xs text-gray-400">ยังไม่เลือกประเภทอาหาร</p>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <p className="text-gray-500 text-sm">ยังไม่มีสมาชิกคนไหนกดพร้อมเลย 😅</p>
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
        </motion.div>
    );
}