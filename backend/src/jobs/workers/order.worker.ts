import { ORDER_STATUS } from "../../common/constants";
import { Order } from "../../modules/order/order.model";

export const cancelPendingOrder = async (orderId: string): Promise<void> => {
  await Order.findOneAndUpdate(
    { _id: orderId, status: ORDER_STATUS.PENDING },
    { $set: { status: ORDER_STATUS.CANCELLED } }
  );
};
