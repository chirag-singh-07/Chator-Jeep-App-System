import { BannerRepository } from './banner.repository';
import { IBanner } from './banner.model';

export class BannerService {
  private repository = new BannerRepository();

  async getAllBanners(query: any = {}) {
    return await this.repository.findAll(query);
  }

  async getActiveBanners() {
    return await this.repository.findActive();
  }

  async getBannerById(id: string) {
    return await this.repository.findById(id);
  }

  async createBanner(data: Partial<IBanner>) {
    return await this.repository.create(data);
  }

  async updateBanner(id: string, data: Partial<IBanner>) {
    return await this.repository.update(id, data);
  }

  async deleteBanner(id: string) {
    return await this.repository.delete(id);
  }
}
