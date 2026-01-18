export interface Message {
  id: string;
  content: string | null;
  userId: string;
  roomId: string;
  createdAt: string;
  updatedAt: string;
  isOptimistic: boolean;
  type: "TEXT" | "IMAGE" | "SYSTEM";
  fileUrl: string | null;
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
