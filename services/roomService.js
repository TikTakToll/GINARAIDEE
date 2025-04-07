// services/roomService.js
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export async function createRoom(roomData) {
    const response = await fetch(`${API_BASE_URL}/rooms/create`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(roomData),
    });

    if (!response.ok) {
        throw new Error('Failed to create room');
    }

    return response.json();
}

export async function joinRoom({ roomCode, memberName }) {
    const response = await fetch(`${API_BASE_URL}/rooms/join/${roomCode}?memberName=${encodeURIComponent(memberName)}`, {
        method: 'POST',
    });

    if (!response.ok) {
        throw new Error('Room not found');
    }

    return response.json();
}

export async function selectFood(roomCode, member, foodType) {
    const response = await fetch(`${API_BASE_URL}/rooms/selectFood/${roomCode}?member=${encodeURIComponent(member)}&foodType=${encodeURIComponent(foodType)}`, {
        method: 'POST',
    });

    if (!response.ok) {
        throw new Error('Failed to select food');
    }

    return response.json();
}

export async function randomizeFood(roomCode, ownerUser) {
    const response = await fetch(`${API_BASE_URL}/rooms/randomFood/${roomCode}?ownerUser=${encodeURIComponent(ownerUser)}`, {
        method: 'POST',
    });

    if (!response.ok) {
        throw new Error('Failed to randomize food');
    }

    return response.json();
}

export async function leaveRoom(roomCode, memberName) {
    const response = await fetch(`${API_BASE_URL}/rooms/leave/${roomCode}?memberName=${encodeURIComponent(memberName)}`, {
        method: 'POST',
    });

    if (!response.ok) {
        throw new Error('Failed to leave room');
    }

    return response.text();
}