export interface Message {
    id: string;
    content: string | null;
    userId: string;
    roomId: string;
    type: 'TEXT' | 'IMAGE' | 'FILE' | 'SYSTEM';
    fileUrl: string | null;
    createdAt: string;
    user: {
        name: string;
        avatar: string | null;
    };
}

export interface RoomData {
    id: string;
    product: {
        name: string;
        images: string[];
        price: number;
    };
    seller: {
        id: string;
        name: string;
    };
    buyer: {
        id: string;
        name: string;
    };
}