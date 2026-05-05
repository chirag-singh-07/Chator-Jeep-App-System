import { SystemSetting } from "./system.model";

export const getSetting = async (key: string, defaultValue: any = null) => {
  const setting = await SystemSetting.findOne({ key }).exec();
  return setting ? setting.value : defaultValue;
};

export const updateSetting = async (key: string, value: any, description?: string) => {
  return SystemSetting.findOneAndUpdate(
    { key },
    { value, description },
    { upsert: true, new: true }
  );
};

export const getPlatformConfig = async () => {
  const [commission, baseFee, perKmFee, platformFee] = await Promise.all([
    getSetting("PLATFORM_COMMISSION_PERCENTAGE", 10),
    getSetting("DELIVERY_BASE_FEE", 35),
    getSetting("DELIVERY_PER_KM_FEE", 6),
    getSetting("PLATFORM_FIXED_FEE", 0),
  ]);

  return {
    commissionPercentage: Number(commission),
    deliveryBaseFee: Number(baseFee),
    deliveryPerKmFee: Number(perKmFee),
    platformFixedFee: Number(platformFee),
  };
};
