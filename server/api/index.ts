import { Router } from 'express';
import contactsRouter from './contacts';
import contactsCsvRouter from './contacts-csv';
import lookupsRouter from './lookups';

const router = Router();

router.use('/contacts', contactsRouter);
router.use('/contacts/csv', contactsCsvRouter);
router.use('/lookups', lookupsRouter);

export default router;
