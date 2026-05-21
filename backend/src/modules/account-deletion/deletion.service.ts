import deletionRepository from "./deletion.repository";
import { AppError } from "../../common/errors/app-error";
import { StatusCode } from "../../common/constants/status-code";
import { sendEmail } from "../../common/utils/mailer";

export class DeletionService {
  /**
   * Request account deletions
   */
  async requestDeletion(
    email: string,
    reason: string,
    ipAddress?: string,
    userAgent?: string,
  ) {
    // Check if there's already a pending deletion request
    const existingRequest = await deletionRepository.findPendingByEmail(email);
    if (existingRequest) {
      throw new AppError(
        "You already have a pending deletion request. Please wait for the process to complete.",
        StatusCode.CONFLICT,
      );
    }

    // Create new deletion request
    const request = await deletionRepository.createRequest({
      email: email.toLowerCase(),
      reason,
      ipAddress,
      userAgent,
      status: "PENDING",
      requestedAt: new Date(),
      confirmationDeadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });

    // Send confirmation email
    await this.sendDeletionConfirmationEmail(email, request._id as string);

    return request;
  }

  /**
   * Send deletion confirmation email
   */
  private async sendDeletionConfirmationEmail(
    email: string,
    requestId: string,
  ) {
    const confirmationUrl = `${process.env.FRONTEND_URL}/account/delete/confirm/${requestId}`;
    const cancelUrl = `${process.env.FRONTEND_URL}/account/delete/cancel/${requestId}`;

    const emailTemplate = `
      <h2>Account Deletion Request</h2>
      <p>Hello,</p>
      <p>We have received a request to delete your Chatori Jeeb account. This action cannot be undone.</p>
      
      <h3>What will be deleted:</h3>
      <ul>
        <li>Your profile and personal information</li>
        <li>Your order history</li>
        <li>Your reviews and ratings</li>
        <li>Your payment methods</li>
        <li>Your account balance and credits</li>
      </ul>

      <h3>Timeline:</h3>
      <p>You have 7 days to confirm or cancel this request. After 7 days, your account will be automatically deleted.</p>

      <h3>Next Steps:</h3>
      <p>
        <a href="${confirmationUrl}" style="background-color: #dc2626; color: white; padding: 10px 20px; border-radius: 5px; text-decoration: none;">
          Confirm Deletion
        </a>
        or
        <a href="${cancelUrl}" style="background-color: #6b7280; color: white; padding: 10px 20px; border-radius: 5px; text-decoration: none;">
          Cancel Request
        </a>
      </p>

      <p style="color: #999; font-size: 12px;">
        If you did not request this action, please click the Cancel button or ignore this email.
      </p>
    `;

    try {
      await sendEmail({
        to: email,
        subject: "Account Deletion Request - Action Required",
        text: "Account Deletion Request - Action Required",
        html: emailTemplate,
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Confirm deletion (when user clicks the link in email)
   */
  async confirmDeletion(requestId: string) {
    const request = await deletionRepository.findById(requestId);
    if (!request) {
      throw new AppError("Deletion request not found", StatusCode.NOT_FOUND);
    }
    if (request.status !== "PENDING") {
      throw new AppError(
        `Cannot confirm deletion. Request status is ${request.status}`,
        StatusCode.BAD_REQUEST,
      );
    }

    const updated = await deletionRepository.confirmDeletion(requestId);

    // Send confirmation email
    await sendEmail({
      to: request.email,
      subject: "Account Deletion Confirmed",
      html: `
        <h2>Deletion Confirmed</h2>
        <p>Your account deletion has been confirmed. Your account will be deleted on ${new Date(request.confirmationDeadline).toDateString()}.</p>
        <p>If you want to cancel this process, click the link below:</p>
        <a href="${process.env.FRONTEND_URL}/account/delete/cancel/${requestId}">Cancel Deletion</a>
      `,
    });

    return updated;
  }

  /**
   * Cancel deletion request
   */
  async cancelDeletion(requestId: string, reason?: string) {
    const request = await deletionRepository.findById(requestId);
    if (!request) {
      throw new AppError("Deletion request not found", StatusCode.NOT_FOUND);
    }
    if (request.status === "CANCELLED" || request.status === "DELETED") {
      throw new AppError(
        "Cannot cancel deletion. Request has already been processed.",
        StatusCode.BAD_REQUEST,
      );
    }

    const updated = await deletionRepository.cancelDeletion(requestId, reason);

    // Send cancellation email
    await sendEmail({
      to: request.email,
      subject: "Account Deletion Cancelled",
      html: `
        <h2>Deletion Cancelled</h2>
        <p>Your account deletion request has been cancelled. Your account is safe and active.</p>
        <p>You can continue using Chatori Jeeb normally.</p>
      `,
    });

    return updated;
  }

  /**
   * Process expired deletion requests (admin job)
   */
  async processExpiredDeletions() {
    const expiredRequests = await deletionRepository.findExpiredRequests();

    for (const request of expiredRequests) {
      try {
        // Delete user account (connect with user service)
        // TODO: Call user deletion service when confirmed

        // Update deletion request status
        await deletionRepository.updateStatus(
          request._id as string,
          "DELETED",
          {
            deletedAt: new Date(),
          },
        );

        console.log(`Deleted account for email: ${request.email}`);
      } catch (error) {
        console.error(`Failed to delete account for ${request.email}:`, error);
      }
    }
  }

  /**
   * Get deletion request details (admin)
   */
  async getRequest(requestId: string) {
    const request = await deletionRepository.findById(requestId);
    if (!request) {
      throw new AppError("Deletion request not found", StatusCode.NOT_FOUND);
    }
    return request;
  }

  /**
   * Get all deletion requests (admin)
   */
  async getAllRequests(page: number = 1, limit: number = 20) {
    return await deletionRepository.findAll(page, limit);
  }

  /**
   * Get deletion statistics (admin)
   */
  async getStatistics() {
    return await deletionRepository.getStatistics();
  }

  /**
   * Search deletion requests (admin)
   */
  async searchRequests(query: string, page: number = 1, limit: number = 20) {
    if (!query || query.trim().length === 0) {
      return await deletionRepository.findAll(page, limit);
    }
    return await deletionRepository.search(query, page, limit);
  }
}

export default new DeletionService();
