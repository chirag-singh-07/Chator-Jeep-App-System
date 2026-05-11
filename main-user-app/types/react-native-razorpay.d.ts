declare module "react-native-razorpay" {
  const RazorpayCheckout: {
    open(options: Record<string, unknown>): Promise<{
      razorpay_payment_id: string;
      razorpay_order_id?: string;
      razorpay_signature: string;
    }>;
  };

  export default RazorpayCheckout;
}
