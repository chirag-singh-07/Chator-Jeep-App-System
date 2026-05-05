import { Schema, model, models, Document } from "mongoose";

export interface ISystemSetting extends Document {
  key: string;
  value: any;
  description?: string;
  updatedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const systemSettingSchema = new Schema<ISystemSetting>(
  {
    key: { type: String, required: true, unique: true, index: true },
    value: { type: Schema.Types.Mixed, required: true },
    description: { type: String },
    updatedBy: { type: String },
  },
  { timestamps: true }
);

export const SystemSetting = models.SystemSetting || model<ISystemSetting>("SystemSetting", systemSettingSchema);
