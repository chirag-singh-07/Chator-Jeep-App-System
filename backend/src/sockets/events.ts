import { getIO } from "./index";

export const orderEvent = (room: string, event: string, payload: unknown): void => {
  getIO().to(room).emit(event, payload);
};

export const deliveryEvent = (room: string, event: string, payload: unknown): void => {
  getIO().to(room).emit(event, payload);
};
