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

export type RoomData = {
  id: string;
  product: {
    id: string;
    name: string;
  };
  buyerId: string;
  sellerId: string;
  otherUser: {
    id: string;
    name: string | null;
    image: string | null;
  };
  isBuyer: boolean;
};
