'use client';

import { useEffect, useState, use } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { getRoomInfo, randomizeFood, leaveRoom } from '@/services/roomService';
import Image from 'next/image';
import {motion} from "framer-motion";

export default function RandomizePage({ params }: { params: Promise<{ roomCode: string }> }) {
    const { roomCode } = use(params);
    const router = useRouter();
    const searchParams = useSearchParams();
    const memberName = searchParams.get('memberName');
    const DEFAULT_FOOD_TYPES = [
        "ของหวาน", "อาหารตามสั่ง", "อาหารจานเดียว",
        "ก๋วยเตี๋ยว", "เครื่องดื่ม/น้ำผลไม้", "เบเกอรี/เค้ก",
        "ชาบู", "อาหารเกาหลี", "ปิ้งย่าง", "คาเฟ่", "บุฟเฟ่ต์"
    ];

    // สถานะห้องและข้อมูลผู้ใช้
    const [isLoading, setIsLoading] = useState(true),
        [ownerUser, setOwnerUser] = useState<string>(''),
        [members, setMembers] = useState<string[]>([]),
        [readyStatus, setReadyStatus] = useState<Record<string, boolean>>({});

    // สถานะการสุ่มอาหาร
    const [isRandomizing, setIsRandomizing] = useState(false),
        [randomFoodResult, setRandomFoodResult] = useState<string | null>(null),
        [restaurants, setRestaurants] = useState<any[]>([]),
        [randomizingError, setRandomizingError] = useState<string | null>(null),
        [randomizationComplete, setRandomizationComplete] = useState(false);

    // การแสดงร้านอาหาร
    const [showAllRestaurants, setShowAllRestaurants] = useState(false),
        [selectedRestaurant, setSelectedRestaurant] = useState<number | null>(null);

    // เอฟเฟกต์การสุ่มแบบ CSGO
    const [foodOptions, setFoodOptions] = useState<string[]>([]),
        [displayedFoods, setDisplayedFoods] = useState<string[]>([]),
        [animationActive, setAnimationActive] = useState(false),
        [animationPhase, setAnimationPhase] = useState(1),  // 1: เริ่มต้นเร็ว, 2: ช้าลง, 3: จบ
        [spinEffect, setSpinEffect] = useState(0);  // สำหรับเอฟเฟกต์การสั่น

    // เอฟเฟกต์แสง
    const [glowIntensity, setGlowIntensity] = useState(0),
        [setShowConfetti] = useState(false);

    useEffect(() => {
        const fetchRoomInfo = async () => {
            try {
                const data = await getRoomInfo(roomCode);
                setMembers(data.members || []);
                setOwnerUser(data.ownerUser);
                setReadyStatus(data.readyStatus || {});

                // ตั้งค่าตัวเลือกสำหรับเอฟเฟกต์การสุ่ม
                setFoodOptions([...DEFAULT_FOOD_TYPES]);

                // สร้างรายการอาหารสำหรับแสดงในการสุ่ม
                const generatedFoods = [];
                for (let i = 0; i < 30; i++) {
                    generatedFoods.push(DEFAULT_FOOD_TYPES[Math.floor(Math.random() * DEFAULT_FOOD_TYPES.length)]);
                }
                setDisplayedFoods(generatedFoods);
            } catch (err) {
                console.error('Failed to fetch room info:', err);
                alert('ไม่สามารถเข้าถึงห้องได้');
                router.push('/');
            } finally {
                setIsLoading(false);
            }
        };

        fetchRoomInfo();
    }, [roomCode, router]);

    // ตรวจสอบว่าทุกคนพร้อมหรือยัง
    const areAllMembersReady = members.length > 0 &&
        members.every(member => readyStatus[member]);

    // ตรวจสอบว่าผู้ใช้ปัจจุบันเป็นเจ้าของห้องหรือไม่
    const isOwner = memberName === ownerUser;

    // ฟังก์ชันสำหรับการเริ่มการสุ่มอาหาร
    const startRandomize = async () => {
        try {
            setRandomizingError(null);
            setIsRandomizing(true);
            setRandomizationComplete(false);
            setAnimationActive(true);
            setShowAllRestaurants(false);
            setSelectedRestaurant(null);
            setAnimationPhase(1);
            setSpinEffect(0);
            setGlowIntensity(0);

            // เรียก API เพื่อหาผลลัพธ์ล่วงหน้า
            const response = await randomizeFood(roomCode, ownerUser);

            if (!response || !response.randomFood) {
                throw new Error("ไม่พบผลการสุ่มอาหาร");
            }

            setRandomFoodResult(response.randomFood);
            if (response.restaurants && Array.isArray(response.restaurants)) {
                setRestaurants(response.restaurants);
            } else {
                setRestaurants([]);
            }

            // ฟังก์ชันเพื่อตรวจสอบว่าเลขคี่หรือเลขคู่
            const isOdd = (num: number): boolean => num % 2 === 1;

            const finalFood = response.randomFood,
                foodPool = [...DEFAULT_FOOD_TYPES],
                spinLength = 150, // เพิ่มความยาวของการสุ่มให้มากขึ้น
                visibleItems = 31, // จำนวนรายการที่แสดงต่อครั้ง (ควรเป็นเลขคี่เพื่อให้มีตรงกลาง)
                centerIndex = Math.floor(visibleItems / 2), // ตำแหน่งตรงกลาง
                finalSequence: string[] = [];

            // ตรวจสอบให้แน่ใจว่า visibleItems เป็นเลขคี่เพื่อให้มีตำแหน่งตรงกลางที่ชัดเจน
            if (!isOdd(visibleItems)) {
                console.warn("Warning: visibleItems should be odd to have a clear center position");
            }

            // สร้างลำดับการสุ่มที่จะแสดงในแต่ละเฟส
            for (let i = 0; i < spinLength; i++) {
                finalSequence.push(foodPool[Math.floor(Math.random() * foodPool.length)]);
            }

            // แสดงการสุ่มแบบ smooth โดยแบ่งเป็น 4 เฟส
            let index = 0;

            // กำหนดค่าความเร็วและความยาวของแต่ละเฟส
            const phase1Speed = 30, // ms - เริ่มเร็ว
                phase1Length = 60,
                phase2Speed = 50, // ms - ปานกลาง
                phase2Length = 50,
                phase3Speed = 90, // ms - ช้าลง
                phase3Length = 30,
                phase4Speed = 200, // ms - ช้า
                phase4Length = 10;

            // สร้างฟังก์ชันสำหรับแสดงผลและอัพเดทสถานะ
            const updateDisplay = (currentIndex: number): void => {
                // คำนวณให้แสดงผลรายการโดยมีตำแหน่งกลางเป็นจุดอ้างอิง
                const startIdx: number = currentIndex;
                const displayedItems: string[] = finalSequence.slice(startIdx, startIdx + visibleItems);

                // ถ้ารายการไม่พอให้เติมด้วยรายการสุ่ม
                while (displayedItems.length < visibleItems) {
                    displayedItems.push(foodPool[Math.floor(Math.random() * foodPool.length)]);
                }

                setDisplayedFoods(displayedItems);
            };

            // เริ่มเฟส 1 - เร็วมาก
            setAnimationPhase(1);
            const phase1Interval = setInterval(() => {
                updateDisplay(index);
                index++;

                // เพิ่มเอฟเฟกต์สั่นมาก
                setSpinEffect(Math.random() * 4 - 2);

                if (index >= phase1Length) {
                    clearInterval(phase1Interval);
                    setAnimationPhase(2);

                    // เริ่มเฟส 2 - ช้าลงเล็กน้อย
                    const phase2Interval = setInterval(() => {
                        updateDisplay(index);
                        index++;

                        // เพิ่มเอฟเฟกต์สั่นปานกลาง
                        setSpinEffect(Math.random() * 2.5 - 1.25);

                        if (index >= phase1Length + phase2Length) {
                            clearInterval(phase2Interval);
                            setAnimationPhase(3);

                            // เริ่มเฟส 3 - ช้าลงมาก
                            const phase3Interval = setInterval(() => {
                                updateDisplay(index);
                                index++;

                                // ลดเอฟเฟกต์สั่น
                                setSpinEffect(Math.random() * 1.5 - 0.75);

                                // เริ่มเพิ่มความเข้มของแสงเล็กน้อย
                                const phaseProgress = (index - (phase1Length + phase2Length)) / phase3Length;
                                setGlowIntensity(phaseProgress * 0.3); // เริ่มเพิ่มแสงเล็กน้อย

                                if (index >= phase1Length + phase2Length + phase3Length) {
                                    clearInterval(phase3Interval);
                                    setAnimationPhase(4);

                                    // เริ่มเฟส 4 - ช้ามากๆ และค่อยๆ หยุด
                                    const phase4Interval = setInterval(() => {
                                        updateDisplay(index);
                                        index++;

                                        // ลดเอฟเฟกต์สั่นเหลือน้อยมาก
                                        setSpinEffect(Math.random() * 0.8 - 0.4);

                                        // เพิ่มความเข้มของแสงมากขึ้นเรื่อยๆ จนสว่างเต็มที่
                                        const finalPhaseProgress = (index - (phase1Length + phase2Length + phase3Length)) / phase4Length;
                                        setGlowIntensity(0.3 + (finalPhaseProgress * 0.7)); // เพิ่มจาก 0.3 ถึง 1.0

                                        // ตรวจสอบว่าจบการสุ่มแล้วหรือไม่
                                        if (index >= phase1Length + phase2Length + phase3Length + phase4Length) {
                                            clearInterval(phase4Interval);

                                            // สร้างชุดข้อมูลสุดท้ายที่มีผลลัพธ์อยู่ตรงกลางพอดี
                                            const finalItems: string[] = [];

                                            // สร้างรายการที่มีผลลัพธ์อยู่ตรงกลางพอดี
                                            for (let i = 0; i < visibleItems; i++) {
                                                if (i === centerIndex) {
                                                    finalItems.push(finalFood); // ใส่ผลลัพธ์ตรงกลาง
                                                } else {
                                                    finalItems.push(foodPool[Math.floor(Math.random() * foodPool.length)]);
                                                }
                                            }

                                            // แสดงผลชุดข้อมูลสุดท้าย
                                            setDisplayedFoods(finalItems);

                                            setAnimationActive(false);
                                            setRandomizationComplete(true);
                                            setIsRandomizing(false);
                                            setGlowIntensity(1);
                                            setSpinEffect(0); // รีเซ็ตเอฟเฟกต์สั่น
                                        }
                                    }, phase4Speed);
                                }
                            }, phase3Speed);
                        }
                    }, phase2Speed);
                }
            }, phase1Speed);
        } catch (err: any) {
            console.error("Error during randomization:", err);
            setRandomizingError(err?.message || "เกิดข้อผิดพลาดในการสุ่มอาหาร");
            setIsRandomizing(false);
            setAnimationActive(false);
        }
    };

    const backToLobby = () => {
        router.push(`/rooms/${roomCode}/lobbyjoin?memberName=${memberName}`);
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

    // ฟังก์ชันสำหรับเลือกร้านอาหาร
    const toggleRestaurantSelection = (index: number) => {
        if (selectedRestaurant === index) {
            setSelectedRestaurant(null);
        } else {
            setSelectedRestaurant(index);
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
        //แก้การ์ดให้เหมือนLoobyjoin
        <motion.div className="min-h-screen overflow-y-auto">
            <div className="mt-20 max-w-4xl mx-auto p-4">
                <motion.div
                    initial={{ y: -50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.6 }}
                    className="border-2 rounded-2xl shadow-xl overflow-hidden"
                >
                    {/*ปรับปรุงหน้าเว็บให้มีพื้นที่เหมาะสม ไม่บัง Navbar*/}
                    <div className="max-w-4xl mx-auto">
                        {/* การ์ดหลัก */}
                        <div className="border-2 rounded-2xl shadow-xl overflow-hidden">
                            {/* ส่วนหัว */}
                            {/*แก้สีของส่วนหัว*/}
                            <div className="bg-gradient-to-r from-red-400 to-yellow-400 p-6 text-black flex justify-between items-center shadow-2xl">
                                <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r"></div>
                                <div className="text-center">
                                    <h1 className="text-3xl font-bold mb-2">สุ่มอาหาร</h1>
                                    <div className="bg-black/20 backdrop-blur-sm rounded-xl px-2 py-2 inline-flex items-center shadow-sm">
                                        <span className="text-white font-medium">ห้อง :</span>
                                        <span className="ml-2 bg-white px-3 py-1 rounded-lg shadow-sm text-orange-600 font-bold">{roomCode}</span>
                                    </div>
                                </div>
                            </div>

                            {/* เนื้อหาหลัก */}
                            <div className="p-5 md:p-8">
                                <div className="text-center mb-6">
                                    <h2 className="font-medium text-xl text-gray-700">สุ่มตัดสินใจว่าวันนี้จะกินอะไรดี</h2>
                                </div>

                                {/* ส่วนการสุ่ม */}
                                {!randomizationComplete && (
                                    <div className="mb-6">
                                        {isRandomizing || animationActive ? (
                                            <div className="mb-6">
                                                <div className="bg-gradient-to-b from-yellow-50 to-orange-50 p-6 rounded-xl shadow-md border border-orange-200 relative">
                                                    <div
                                                        className={`relative overflow-hidden h-24 rounded-xl ${
                                                            animationPhase === 3 ? 'border-2' : 'border'
                                                        } ${
                                                            animationPhase === 3 ? 'border-orange-500' : 'border-orange-300'
                                                        } bg-gradient-to-b from-yellow-50 to-orange-50 transition-all duration-500`}
                                                    >
                                                        {/* เส้นตั้งตรงกลาง */}
                                                        <div className="absolute inset-y-0 left-1/2 w-0.5 bg-red-500 transform -translate-x-1/2 z-30"></div>

                                                        {/* แสงเรืองแสงตรงกลาง */}
                                                        <div
                                                            className="absolute inset-y-0 left-1/2 bg-gradient-to-r from-transparent via-yellow-300 to-transparent opacity-50 transform -translate-x-1/2 z-20 transition-all duration-300"
                                                            style={{
                                                                width: `${8 + glowIntensity * 16}px`,
                                                                opacity: 0.3 + glowIntensity * 0.7
                                                            }}
                                                        ></div>

                                                        <div
                                                            className="absolute inset-0 flex items-center"
                                                            style={{
                                                                overflowX: 'hidden',
                                                                transform: `translateY(${spinEffect}px)`,
                                                                transition: 'transform 0.1s ease-out'
                                                            }}
                                                        >
                                                            <div className="flex">
                                                                {displayedFoods.map((food, index) => {
                                                                    const isCenter = index === 15;
                                                                    const distanceFromCenter = Math.abs(index - 15);
                                                                    const scale = isCenter ? 1.1 + (glowIntensity * 0.1) : 1 - (distanceFromCenter * 0.02);
                                                                    // เพิ่มค่า opacity
                                                                    const opacity = isCenter ? 1 : Math.max(0.7, 1 - (distanceFromCenter * 0.03));

                                                                    return (
                                                                        <div
                                                                            key={index}
                                                                            className={`flex-shrink-0 w-32 h-16 mx-1 flex items-center justify-center 
                                                                            ${isCenter
                                                                                ? 'bg-gradient-to-br from-orange-300 to-orange-400 font-bold border-2 border-orange-500 text-orange-800 shadow-md z-30'
                                                                                : 'bg-white border border-gray-200 text-gray-900 font-medium'} 
                                                                rounded-lg p-2 text-sm transition-all duration-300`}
                                                                            style={{
                                                                                transform: `scale(${scale})`,
                                                                                opacity: opacity,
                                                                                boxShadow: isCenter ? `0 0 ${10 + glowIntensity * 20}px rgba(255, 120, 0, ${0.3 + glowIntensity * 0.7})` : 'none'
                                                                            }}
                                                                        >
                                                                            {food}
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={startRandomize}
                                                disabled={isRandomizing}
                                                className={`w-full py-5 px-6 rounded-xl text-lg font-medium transition-all ${
                                                    isRandomizing
                                                        ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                                                        : 'bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 shadow-lg hover:shadow-xl'
                                                } transform hover:scale-102 duration-300`}
                                            >
                                    <span className="flex items-center justify-center cursor-pointer">
                                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6 mr-2 animate-pulse">
                                        <path fillRule="evenodd" d="M12 1.5a.75.75 0 0 1 .75.75V4.5a.75.75 0 0 1-1.5 0V2.25A.75.75 0 0 1 12 1.5ZM5.636 4.136a.75.75 0 0 1 1.06 0l1.592 1.591a.75.75 0 0 1-1.061 1.06l-1.591-1.59a.75.75 0 0 1 0-1.061Zm12.728 0a.75.75 0 0 1 0 1.06l-1.591 1.592a.75.75 0 0 1-1.06-1.061l1.59-1.591a.75.75 0 0 1 1.061 0Zm-6.816 4.496a.75.75 0 0 1 .82.311l5.228 7.917a.75.75 0 0 1-.777 1.148l-2.097-.43 1.045 3.9a.75.75 0 0 1-1.45.388l-1.044-3.899-1.601 1.42a.75.75 0 0 1-1.247-.606l.569-9.47a.75.75 0 0 1 .554-.68ZM3 10.5a.75.75 0 0 1 .75-.75H6a.75.75 0 0 1 0 1.5H3.75A.75.75 0 0 1 3 10.5Zm14.25 0a.75.75 0 0 1 .75-.75h2.25a.75.75 0 0 1 0 1.5H18a.75.75 0 0 1-.75-.75Zm-8.962 3.712a.75.75 0 0 1 0 1.061l-1.591 1.591a.75.75 0 1 1-1.061-1.06l1.591-1.592a.75.75 0 0 1 1.06 0Z" clipRule="evenodd"/>
                                      </svg>
                                      กดเพื่อสุ่มอาหาร!
                                    </span>
                                            </button>
                                        )}
                                    </div>
                                )}

                                {/* แสดงข้อความเตือนกรณีเกิดข้อผิดพลาด */}
                                {randomizingError && (
                                    <div className="bg-red-50 text-red-800 p-4 rounded-lg mb-5 border border-red-200 shadow-sm">
                                        <div className="flex items-center">
                                            <span className="text-red-600 mr-2"></span>
                                            <span>{randomizingError}</span>
                                        </div>
                                        <button
                                            onClick={startRandomize}
                                            className="mt-3 w-full bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition-all shadow-sm"
                                        >
                                            ลองใหม่อีกครั้ง
                                        </button>
                                    </div>
                                )}

                                {/* แสดงผลลัพธ์การสุ่ม */}
                                {randomFoodResult && randomizationComplete && (
                                    <div className="mt-2">
                                        <div className="bg-gradient-to-r from-orange-100 to-yellow-100 p-3 rounded-lg mb-4">
                                            <div className="text-center">
                                                <h3 className="text-xl font-semibold text-orange-700">ผลการสุ่ม! 🎉</h3>
                                            </div>
                                        </div>

                                        {/* แสดงผลลัพธ์และร้านอาหารแบบ Responsive */}
                                        <div className=" grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                                            {/* คอลัมน์ซ้าย - ผลลัพธ์ประเภทอาหาร */}
                                            <div className="col-span-1">
                                                <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-5 rounded-xl shadow-lg text-white flex flex-col items-center justify-center h-full min-h-44 transform transition-all hover:shadow-xl">
                                                    <div className="text-sm uppercase tracking-wider mb-2 opacity-90">สุ่มได้ประเภทอาหาร</div>
                                                    <div className="text-3xl md:text-4xl font-bold my-3 drop-shadow-md">
                                                        {randomFoodResult}
                                                    </div>
                                                    <div className="flex items-center mt-2 bg-orange-400 bg-opacity-40 px-3 py-1 rounded-full">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="mr-1" viewBox="0 0 16 16">
                                                            <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm.93-9.412-1 4.705c-.07.34.029.533.304.533.194 0 .487-.07.686-.246l-.088.416c-.287.346-.92.598-1.465.598-.703 0-1.002-.422-.808-1.319l.738-3.468c.064-.293.006-.399-.287-.47l-.451-.081.082-.381 2.29-.287zM8 5.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"/>
                                                        </svg>
                                                        <span className="text-xs">นี่คือสิ่งที่พวกคุณจะได้กินวันนี้!</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* คอลัมน์ขวา */}
                                            <div className="col-span-1">
                                                <div className="bg-white rounded-xl shadow-md border border-gray-100 h-full flex flex-col overflow-hidden transform transition-all hover:shadow-lg">
                                                    {restaurants && restaurants.length > 0 ? (
                                                        <>
                                                            <div className="p-3 bg-gradient-to-r from-green-100 to-green-50 border-b border-green-200">
                                                                <h4 className="font-bold text-center text-green-800">
                                                                    {restaurants[0].name || "ร้านอาหารแนะนำ"}
                                                                </h4>
                                                            </div>
                                                            {restaurants[0].imageUrl && restaurants[0].imageUrl !== "No image available" ? (
                                                                <div className="flex-grow p-2">
                                                                    <img
                                                                        src={restaurants[0].imageUrl}
                                                                        alt={restaurants[0].name}
                                                                        className="w-full h-40 object-cover rounded-lg shadow-sm hover:opacity-95 transition-opacity"
                                                                        onError={(e) => {
                                                                            e.currentTarget.onerror = null;
                                                                            e.currentTarget.src = "https://placehold.co/400x300/orange/white?text=ไม่พบรูปภาพ";
                                                                        }}
                                                                    />
                                                                </div>
                                                            ) : (
                                                                <div className="flex-grow p-2">
                                                                    <div className="w-full h-40 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg flex items-center justify-center text-orange-800 shadow-inner">
                                                                        <div className="text-center">
                                                                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" className="mx-auto mb-2 opacity-70" viewBox="0 0 16 16">
                                                                                <path d="M14.5 3a.5.5 0 0 1 .5.5v9a.5.5 0 0 1-.5.5h-13a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h13zm-13-1A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h13a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 14.5 2h-13z"/>
                                                                                <path d="M10.5 8.5a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-7a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h7zM11 8H2v2h9V8zM5.5 5.5a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h2zM6 5H3v2h3V5z"/>
                                                                            </svg>
                                                                            <span className="text-sm">ไม่มีรูปภาพร้านอาหาร</span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )}
                                                            <div className="p-2 text-sm text-gray-700 bg-gradient-to-b from-gray-50 to-gray-100 rounded-b-lg border-t border-gray-200">
                                                                <div className="flex items-center justify-center">
                                                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" className="mr-1 text-gray-500" viewBox="0 0 16 16">
                                                                        <path d="M14.763.075A.5.5 0 0 1 15 .5v15a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5V14h-1v1.5a.5.5 0 0 1-.5.5h-9a.5.5 0 0 1-.5-.5V10a.5.5 0 0 1 .342-.474L6 7.64V4.5a.5.5 0 0 1 .276-.447l8-4a.5.5 0 0 1 .487.022zM6 8.694 1 10.36V15h5V8.694zM7 15h2v-1.5a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 .5.5V15h2V1.309l-7 3.5V15z"/>
                                                                        <path d="M2 11h1v1H2v-1zm2 0h1v1H4v-1zm-2 2h1v1H2v-1zm2 0h1v1H4v-1zm4-4h1v1H8V9zm2 0h1v1h-1V9zm-2 2h1v1H8v-1zm2 0h1v1h-1v-1zm2-2h1v1h-1V9zm0 2h1v1h-1v-1zM8 7h1v1H8V7zm2 0h1v1h-1V7zm2 0h1v1h-1V7zM8 5h1v1H8V5zm2 0h1v1h-1V5zm2 0h1v1h-1V5zm0-2h1v1h-1V3z"/>
                                                                    </svg>
                                                                    <span className="font-medium">ประเภท:</span>
                                                                    <span className="ml-1 text-gray-600">{restaurants[0].types || "ไม่ระบุ"}</span>
                                                                </div>
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <div className="flex items-center justify-center h-full p-6 text-center text-gray-500">
                                                            <div className="text-center">
                                                                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" className="mx-auto mb-2 text-gray-400" viewBox="0 0 16 16">
                                                                    <path d="M8 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z"/>
                                                                    <path d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0zm0 14.5a6.5 6.5 0 1 1 0-13 6.5 6.5 0 0 1 0 13z"/>
                                                                </svg>
                                                                <p>ไม่พบข้อมูลร้านอาหารที่แนะนำ</p>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* ร้านอาหารเพิ่มเติม */}
                                        {restaurants && restaurants.length > 1 && (
                                            <div className="mt-4">
                                                <button
                                                    onClick={() => setShowAllRestaurants(!showAllRestaurants)}
                                                    className="flex items-center justify-center mx-auto bg-blue-50 hover:bg-blue-100 text-blue-600 font-medium py-2 px-4 rounded-full mb-3 transition-all  shadow-sm"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="mr-1" viewBox="0 0 16 16">
                                                        {showAllRestaurants ?
                                                            <path d="M7.646 4.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1-.708.708L8 5.707l-5.646 5.647a.5.5 0 0 1-.708-.708l6-6z"/> :
                                                            <path d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"/>
                                                        }
                                                    </svg>
                                                    {showAllRestaurants ? "ซ่อนร้านอาหารเพิ่มเติม" : "แสดงร้านอาหารเพิ่มเติม"} ({restaurants.length - 1})
                                                </button>

                                                {showAllRestaurants && (
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                                                        {restaurants.slice(1).map((restaurant, idx) => (
                                                            <div
                                                                key={idx}
                                                                className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm cursor-pointer hover:bg-gray-50 transition-all"
                                                                onClick={() => toggleRestaurantSelection(idx + 1)}
                                                            >
                                                                <div className="flex justify-between items-center">
                                                                    <h4 className="font-medium text-gray-800">{restaurant.name || `ร้านอาหาร ${idx + 2}`}</h4>
                                                                    <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full">
                            {selectedRestaurant === idx + 1 ? "▲ ซ่อนรูป" : "▼ ดูรูป"}
                          </span>
                                                                </div>

                                                                {selectedRestaurant === idx + 1 && (
                                                                    <div className="mt-3 animate-fadeIn">
                                                                        {restaurant.imageUrl && restaurant.imageUrl !== "No image available" ? (
                                                                            <img
                                                                                src={restaurant.imageUrl}
                                                                                alt={restaurant.name}
                                                                                className="w-full h-32 object-cover rounded-lg shadow-sm mt-2 hover:opacity-95 transition-opacity"
                                                                                onError={(e) => {
                                                                                    e.currentTarget.onerror = null;
                                                                                    e.currentTarget.src = "https://placehold.co/400x300/orange/white?text=ไม่พบรูปภาพ";
                                                                                }}
                                                                            />
                                                                        ) : (
                                                                            <div className="w-full h-28 bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg mt-2 flex items-center justify-center text-orange-800 shadow-inner">
                                                                                <div className="text-center">
                                                                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="mx-auto mb-2 opacity-70" viewBox="0 0 16 16">
                                                                                        <path d="M14.5 3a.5.5 0 0 1 .5.5v9a.5.5 0 0 1-.5.5h-13a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h13zm-13-1A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h13a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 14.5 2h-13z"/>
                                                                                        <path d="M10.5 8.5a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-7a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h7zM11 8H2v2h9V8zM5.5 5.5a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h2zM6 5H3v2h3V5z"/>
                                                                                    </svg>
                                                                                    <span>ไม่มีรูปภาพร้านอาหาร</span>
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                        <div className="flex items-center mt-2 bg-gray-50 p-2 rounded-lg border border-gray-100">
                                                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" className="mr-1 text-gray-500" viewBox="0 0 16 16">
                                                                                <path d="M14.763.075A.5.5 0 0 1 15 .5v15a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5V14h-1v1.5a.5.5 0 0 1-.5.5h-9a.5.5 0 0 1-.5-.5V10a.5.5 0 0 1 .342-.474L6 7.64V4.5a.5.5 0 0 1 .276-.447l8-4a.5.5 0 0 1 .487.022zM6 8.694 1 10.36V15h5V8.694zM7 15h2v-1.5a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 .5.5V15h2V1.309l-7 3.5V15z"/>
                                                                                <path d="M2 11h1v1H2v-1zm2 0h1v1H4v-1zm-2 2h1v1H2v-1zm2 0h1v1H4v-1zm4-4h1v1H8V9zm2 0h1v1h-1V9zm-2 2h1v1H8v-1zm2 0h1v1h-1v-1zm2-2h1v1h-1V9zm0 2h1v1h-1v-1zM8 7h1v1H8V7zm2 0h1v1h-1V7zm2 0h1v1h-1V7zM8 5h1v1H8V5zm2 0h1v1h-1V5zm2 0h1v1h-1V5zm0-2h1v1h-1V3z"/>
                                                                            </svg>
                                                                            <span className="font-medium text-sm">ประเภท:</span>
                                                                            <span className="ml-1 text-gray-600 text-sm">{restaurant.types || "ไม่ระบุประเภท"}</span>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/*แก้ไขปุ่มเพิ่มระยะห่างของปุ่มและ card*/}
                            <div className="flex space-x-3 mt-6 px-4 mb-6">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={backToLobby}
                                    className="py-3 w-full bg-yellow-400 text-gray-700 rounded-xl font-medium hover:bg-yellow-500 transition-all cursor-pointer"
                                >
                                    กลับไปห้องรอ
                                </motion.button>

                                {/*แก้ไขปุ่มเพิ่มระยะห่างของปุ่มและ card*/}
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
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
}