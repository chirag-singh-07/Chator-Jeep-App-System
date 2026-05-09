import { BannerModel, IBanner } from './banner.model';

export class BannerRepository {
  async findAll(query: any = {}) {
    return await BannerModel.find(query).sort({ priority: -1, createdAt: -1 });
  }

  async findActive() {
    return await BannerModel.find({ isActive: true }).sort({ priority: -1 });
  }

  async findById(id: string) {
    return await BannerModel.findById(id);
  }

  async create(data: Partial<IBanner>) {
    return await BannerModel.create(data);
  }

  async update(id: string, data: Partial<IBanner>) {
    return await BannerModel.findByIdAndUpdate(id, data, { new: true });
  }

  async delete(id: string) {
    return await BannerModel.findByIdAndDelete(id);
  }
}
