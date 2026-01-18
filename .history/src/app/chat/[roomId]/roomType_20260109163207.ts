export interface Message {
    id: string;
    roomId: string;
    userId: string;
    content: string | null;
    type: "TEXT" | "IMAGE" | "SYSTEM";
    fileUrl: string | null;
    createdAt: string;
    user?: {
        name: string;
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
