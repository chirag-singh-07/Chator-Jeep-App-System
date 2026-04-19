import { Navigate, Route, Routes } from "react-router-dom";
import { AdminShell } from "@/components/admin/admin-shell";
import { CategoriesPage } from "@/pages/categories-page";
import { CategoryFormPage } from "@/pages/category-form-page";
import { OrderDetailsPage } from "@/pages/order-details-page";
import { OrdersPage } from "@/pages/orders-page";
import { OverviewPage } from "@/pages/overview-page";
import { PaymentsPage } from "@/pages/payments-page";
import { ProfilePage } from "@/pages/profile-page";
import { FoodItemFormPage } from "@/pages/food-item-form-page";
import { FoodItemsPage } from "@/pages/food-items-page";
import { RestaurantFormPage } from "@/pages/restaurant-form-page";
import { RestaurantDetailsPage } from "@/pages/restaurant-details-page";
import { RestaurantsPage } from "@/pages/restaurants-page";
import { SettingsPage } from "@/pages/settings-page";
import { UserCreatePage } from "@/pages/user-create-page";
import { UserDetailsPage } from "@/pages/user-details-page";
import { UsersPage } from "@/pages/users-page";

// New Pages
import { AddonsPage } from "@/pages/addons-page";
import { AnalyticsSalesPage } from "@/pages/analytics-sales-page";
import { AnalyticsRevenuePage } from "@/pages/analytics-revenue-page";
import { DeliveryAgentsPage } from "@/pages/delivery-agents-page";
import { DeliveryPayoutsPage } from "@/pages/delivery-payouts-page";
import { DeliveryTrackingPage } from "@/pages/delivery-tracking-page";
import { CouponsPage } from "@/pages/coupons-page";
import { BannerAdsPage } from "@/pages/banner-ads-page";
import { LoyaltyPointsPage } from "@/pages/loyalty-points-page";
import { SupportTicketsPage } from "@/pages/support-tickets-page";
import { ReviewsManagementPage } from "@/pages/reviews-management-page";
import { InventoryPage } from "@/pages/inventory-page";
import { SystemLogsPage } from "@/pages/system-logs-page";
import { NotificationsPage } from "@/pages/notifications-page";
import { ZonesManagementPage } from "@/pages/zones-management-page";
import { AppConfigPage } from "@/pages/app-config-page";
import { PayoutRequestsPage } from "@/pages/payout-requests-page";
import { StaffManagementPage } from "@/pages/staff-management-page";
import { TaxSettingsPage } from "@/pages/tax-settings-page";
import { MaintenanceModePage } from "@/pages/maintenance-mode-page";
import { KitchenRequestsPage } from "@/pages/kitchen-requests-page";
import { KitchenReviewPage } from "@/pages/kitchen-review-page";

function App() {
  return (
    <Routes>
      <Route element={<AdminShell />}>
        <Route index element={<Navigate to="/overview" replace />} />
        <Route path="/overview" element={<OverviewPage />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/orders/:orderId" element={<OrderDetailsPage />} />
        <Route path="/users" element={<UsersPage />} />
        <Route path="/users/new/admin" element={<UserCreatePage mode="admin" />} />
        <Route path="/users/new/delivery" element={<UserCreatePage mode="delivery" />} />
        <Route path="/users/:userId" element={<UserDetailsPage />} />
        <Route path="/restaurants" element={<RestaurantsPage />} />
        <Route path="/restaurants/new" element={<RestaurantFormPage />} />
        <Route path="/restaurants/:restaurantId" element={<RestaurantDetailsPage />} />
        <Route path="/food-items" element={<FoodItemsPage />} />
        <Route path="/food-items/new" element={<FoodItemFormPage />} />
        <Route path="/categories" element={<CategoriesPage />} />
        <Route path="/categories/new" element={<CategoryFormPage mode="create" />} />
        <Route path="/categories/:categoryId/edit" element={<CategoryFormPage mode="edit" />} />
        
        {/* New Routes */}
        <Route path="/addons" element={<AddonsPage />} />
        
        <Route path="/analytics" element={<Navigate to="/analytics/sales" replace />} />
        <Route path="/analytics/sales" element={<AnalyticsSalesPage />} />
        <Route path="/analytics/revenue" element={<AnalyticsRevenuePage />} />
        <Route path="/analytics/performance" element={<AnalyticsSalesPage />} />
        
        <Route path="/delivery" element={<Navigate to="/delivery/agents" replace />} />
        <Route path="/delivery/agents" element={<DeliveryAgentsPage />} />
        <Route path="/delivery/payouts" element={<DeliveryPayoutsPage />} />
        <Route path="/delivery/tracking" element={<DeliveryTrackingPage />} />
        
        <Route path="/marketing" element={<Navigate to="/marketing/coupons" replace />} />
        <Route path="/marketing/coupons" element={<CouponsPage />} />
        <Route path="/marketing/banners" element={<BannerAdsPage />} />
        <Route path="/marketing/loyalty" element={<LoyaltyPointsPage />} />
        
        <Route path="/support" element={<Navigate to="/support/tickets" replace />} />
        <Route path="/support/tickets" element={<SupportTicketsPage />} />
        <Route path="/support/reviews" element={<ReviewsManagementPage />} />
        
        <Route path="/inventory" element={<InventoryPage />} />
        
        <Route path="/system" element={<Navigate to="/system/config" replace />} />
        <Route path="/system/logs" element={<SystemLogsPage />} />
        <Route path="/system/notifications" element={<NotificationsPage />} />
        <Route path="/system/zones" element={<ZonesManagementPage />} />
        <Route path="/system/config" element={<AppConfigPage />} />
        
        <Route path="/payout-requests" element={<PayoutRequestsPage />} />
        <Route path="/staff" element={<StaffManagementPage />} />
        <Route path="/tax-settings" element={<TaxSettingsPage />} />
        <Route path="/maintenance" element={<MaintenanceModePage />} />

        <Route path="/payments" element={<PaymentsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        
        <Route path="/kitchen-requests" element={<KitchenRequestsPage />} />
        <Route path="/kitchen-requests/:requestId" element={<KitchenReviewPage />} />

        <Route path="*" element={<Navigate to="/overview" replace />} />
      </Route>
    </Routes>
  );
}

export default App;
