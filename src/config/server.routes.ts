import { Router } from 'express';
import HealthRoutes from '../modules/health/health.routes';
// import NotificationsRoutes from '../modules/notifications/notifications.routes'; // si existe

const router = Router();

router.use('/api', HealthRoutes);
// router.use('/api/notifications', NotificationsRoutes); // si existe

router.use((req, res) => {
  console.log('Not found:', req.method, req.originalUrl);
  res.status(404).send({
    message: 'route not found',
  });
});

export default router;
