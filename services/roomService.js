//Service ต้นแบบ

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
    try {
        const response = await fetch(`${API_BASE_URL}/rooms/join/${roomCode}?memberName=${encodeURIComponent(memberName)}`, {
            method: 'POST',
        });

        //Announce
        if (!response.ok) {
            const errorData = await response.json().catch(() => null); // ป้องกัน parse error
            const message = errorData?.message || `Failed with status: ${response.status}`;
            throw new Error(message); // ✅ แสดงเฉพาะข้อความสำคัญ เช่น "Room is full!"
        }


        return response.json();
    } catch (error) {
        console.error('Error joining room:', error);
        throw error;
    }
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


//ออกจากห้อง
export async function leaveRoom(roomCode, memberName) {
    const response = await fetch(`${API_BASE_URL}/rooms/leave/${roomCode}?memberName=${encodeURIComponent(memberName)}`, {
        method: 'POST',
    });

    if (!response.ok) {
        throw new Error('Failed to leave room');
    }

    return response.text();
}



//Update
export async function getRoomInfo(roomCode) {
    const response = await fetch(`${API_BASE_URL}/rooms/${roomCode}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error('Failed to get room info');
    }

    return response.json(); // ได้ Room object มาใช้
}

//Kick members
export async function kickMember(roomCode, ownerUser, memberName) {
    const response = await fetch(`${API_BASE_URL}/rooms/kick/${roomCode}?ownerUser=${encodeURIComponent(ownerUser)}&memberName=${encodeURIComponent(memberName)}`, {
        method: 'POST',
    });

    if (!response.ok) {
        throw new Error('Failed to kick member');
    }

    return response.text();
}

//Set ready
export async function setMemberReady(roomCode, memberName, ready) {
    const response = await fetch(`${API_BASE_URL}/rooms/ready/${roomCode}?memberName=${encodeURIComponent(memberName)}&ready=${ready}`, {
        method: 'POST',
    });

    if (!response.ok) {
        throw new Error('Failed to set ready status');
    }

    return response.text(); // หรือ .json() ถ้า backend return json
}




