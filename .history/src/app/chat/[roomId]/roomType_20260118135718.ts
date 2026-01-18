export interface Message {
  id: string;
  content: string | null;
  userId: string | null;
  roomId: string;
  type: "TEXT" | "IMAGE" | "SYSTEM";
  createdAt: string;
  updatedAt: string;
  isOptimistic: boolean;
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
