import { Router } from 'express';
import HealthRoutes from '../modules/health/health.routes';
//import Par3Routes from '../modules/notifications/par3/par3.routes';//nueva importación
const router = Router();

router.use('/api', HealthRoutes);
//router.use('/api/notifications/par3', Par3Routes);//Nueva ruta
router.use((req, res) => {
  console.log('Not found:', req.method, req.originalUrl);
  res.status(404).send({
    message: 'route not found',
  });
});

export default router;