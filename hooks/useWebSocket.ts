import { useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

interface WebSocketCallbacks {
  setMembers?: (members: string[]) => void;
  setReadyStatus?: (status: Record<string, boolean>) => void;
  setMemberFoodSelections?: (selections: Record<string, string[]>) => void;
  onRoomDeleted?: () => void;
}

export default function useWebSocket(
  roomCode: string,
  callbacks: WebSocketCallbacks = {}
) {
  const { setMembers, setReadyStatus, setMemberFoodSelections, onRoomDeleted } = callbacks;
  const stompClientRef = useRef<Client | null>(null);

  useEffect(() => {
    if (!roomCode) return;

    const client = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
      reconnectDelay: 5000,
      onConnect: () => {
        client.subscribe(`/topic/members/${roomCode}`, (message) => {
          const members = JSON.parse(message.body);
          console.log("สมาชิกอัปเดต:", members);
          setMembers?.(members);
        });

        client.subscribe(`/topic/ready-status/${roomCode}`, (message) => {
          const readyStatus = JSON.parse(message.body);
          console.log("สถานะพร้อม:", readyStatus);
          setReadyStatus?.(readyStatus);
        });

        client.subscribe(`/topic/room-deleted/${roomCode}`, () => {
          alert("ห้องถูกลบแล้ว!");
          onRoomDeleted?.();
        });
      }
    });

    stompClientRef.current = client;
    client.activate();

    return () => {
      stompClientRef.current?.deactivate();
    };
  }, [roomCode]);
}
