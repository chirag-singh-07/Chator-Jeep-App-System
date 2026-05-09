import { Router } from 'express';
import * as controller from './banner.controller';

const router = Router();

// Public routes
router.get('/', controller.getBanners);

// Admin routes (should ideally have admin middleware)
router.get('/admin/all', controller.getAllBannersAdmin);
router.post('/admin/create', controller.createBanner);
router.put('/admin/update/:id', controller.updateBanner);
router.delete('/admin/delete/:id', controller.deleteBanner);

export default router;
