import { AccountDeletionRequest, IAccountDeletionRequest } from "./deletion.model";

export class DeletionRepository {
  /**
   * Create a new deletion request
   */
  async createRequest(data: Partial<IAccountDeletionRequest>) {
    return await AccountDeletionRequest.create(data);
  }

  /**
   * Find a deletion request by ID
   */
  async findById(id: string) {
    return await AccountDeletionRequest.findById(id);
  }

  /**
   * Find pending deletion request by email
   */
  async findPendingByEmail(email: string) {
    return await AccountDeletionRequest.findOne({
      email: email.toLowerCase(),
      status: "PENDING",
    });
  }

  /**
   * Find all deletion requests (paginated)
   */
  async findAll(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    const requests = await AccountDeletionRequest.find()
      .sort({ requestedAt: -1 })
      .skip(skip)
      .limit(limit);
    const total = await AccountDeletionRequest.countDocuments();
    return { requests, total, page, limit };
  }

  /**
   * Find deletion requests by status
   */
  async findByStatus(status: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    const requests = await AccountDeletionRequest.find({ status })
      .sort({ requestedAt: -1 })
      .skip(skip)
      .limit(limit);
    const total = await AccountDeletionRequest.countDocuments({ status });
    return { requests, total, page, limit };
  }

  /**
   * Update deletion request status
   */
  async updateStatus(id: string, status: string, additionalData?: any) {
    return await AccountDeletionRequest.findByIdAndUpdate(
      id,
      { status, ...additionalData },
      { new: true }
    );
  }

  /**
   * Confirm deletion request
   */
  async confirmDeletion(id: string) {
    return await AccountDeletionRequest.findByIdAndUpdate(
      id,
      { status: "CONFIRMED", confirmedAt: new Date() },
      { new: true }
    );
  }

  /**
   * Cancel deletion request
   */
  async cancelDeletion(id: string, reason?: string) {
    return await AccountDeletionRequest.findByIdAndUpdate(
      id,
      {
        status: "CANCELLED",
        cancelledAt: new Date(),
        cancellationReason: reason,
      },
      { new: true }
    );
  }

  /**
   * Find deletion requests that have passed their confirmation deadline
   */
  async findExpiredRequests() {
    return await AccountDeletionRequest.find({
      status: "CONFIRMED",
      confirmationDeadline: { $lt: new Date() },
    });
  }

  /**
   * Get deletion statistics for admin
   */
  async getStatistics() {
    const stats = await AccountDeletionRequest.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);
    return stats;
  }

  /**
   * Search deletion requests
   */
  async search(query: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    const requests = await AccountDeletionRequest.find({
      $or: [
        { email: { $regex: query, $options: "i" } },
        { reason: { $regex: query, $options: "i" } },
      ],
    })
      .sort({ requestedAt: -1 })
      .skip(skip)
      .limit(limit);
    const total = await AccountDeletionRequest.countDocuments({
      $or: [
        { email: { $regex: query, $options: "i" } },
        { reason: { $regex: query, $options: "i" } },
      ],
    });
    return { requests, total, page, limit };
  }
}

export default new DeletionRepository();
