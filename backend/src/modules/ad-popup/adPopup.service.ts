import { AdPopup, IAdPopup } from './adPopup.model';
import { AppError } from '../../common/errors/app-error';

export const getActiveAdPopup = async (isNewUser: boolean = false) => {
  // Try to find a new_user popup first if applicable
  if (isNewUser) {
    const newUserPopup = await AdPopup.findOne({ isActive: true, type: 'new_user' }).sort({ createdAt: -1 });
    if (newUserPopup) return newUserPopup;
  }
  // Otherwise, return general active popup
  return await AdPopup.findOne({ isActive: true, type: 'general' }).sort({ createdAt: -1 });
};

export const getAllAdPopups = async () => {
  return await AdPopup.find().sort({ createdAt: -1 });
};

export const createAdPopup = async (data: Partial<IAdPopup>) => {
  // If making a new one active, maybe we want to deactivate others of same type?
  // We can just keep it simple: the app fetches the most recently created active one.
  return await AdPopup.create(data);
};

export const updateAdPopup = async (id: string, data: Partial<IAdPopup>) => {
  const popup = await AdPopup.findByIdAndUpdate(id, data, { new: true });
  if (!popup) throw new AppError('AdPopup not found', 404);
  return popup;
};

export const deleteAdPopup = async (id: string) => {
  const popup = await AdPopup.findByIdAndDelete(id);
  if (!popup) throw new AppError('AdPopup not found', 404);
  return popup;
};
