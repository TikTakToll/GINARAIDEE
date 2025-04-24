import { useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

export default function useRoomSocket(roomCode: string, onState: (msg: any) => void, onResult: (msg: any) => void) {
    const clientRef = useRef<Client | null>(null);

    useEffect(() => {
        const socket = new SockJS('http://localhost:8080/ws');
        const client = new Client({
            webSocketFactory: () => socket,
            onConnect: () => {
                client.subscribe(`/topic/room/${roomCode}/state`, (message) => {
                    onState(JSON.parse(message.body));
                });

                client.subscribe(`/topic/room/${roomCode}/result`, (message) => {
                    onResult(JSON.parse(message.body));
                });
            },
        });

        client.activate();
        clientRef.current = client;

        return () => {
            client.deactivate();
        };
    }, [roomCode]);

    const send = (path: string, body: any) => {
        clientRef.current?.publish({
            destination: `/app/room/${roomCode}/${path}`,
            body: JSON.stringify(body),
        });
    };

    return { send };
}
