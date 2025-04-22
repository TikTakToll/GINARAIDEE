// hooks/useRoomSocket.ts ดูก่อนว่าจะใช้มั้ย
// 'use client';
// import { useEffect } from 'react';
// import SockJS from 'sockjs-client';
// import { Client } from '@stomp/stompjs';
//
// export default function useRoomSocket(roomCode: string, onRoomUpdate: (data: any) => void) {
//     useEffect(() => {
//         const socket = new SockJS(`${process.env.NEXT_PUBLIC_SOCKET_URL}/ws-room`);
//         const stompClient = new Client({
//             webSocketFactory: () => socket,
//             onConnect: () => {
//                 stompClient.subscribe(`/topic/room/${roomCode}`, (message) => {
//                     const body = JSON.parse(message.body);
//                     onRoomUpdate(body);
//                 });
//             },
//         });
//
//         stompClient.activate();
//
//         return () => {
//             stompClient.deactivate();
//         };
//     }, [roomCode, onRoomUpdate]);
// }

