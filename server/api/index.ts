import { Router } from 'express';
import contactsRouter from './contacts';
import contactsCsvRouter from './contacts-csv';
import lookupsRouter from './lookups';
import discordRouter from './discord';
import messagesRouter from './messages';

const router = Router();

router.use('/contacts', contactsRouter);
router.use('/contacts/csv', contactsCsvRouter);
router.use('/lookups', lookupsRouter);
router.use('/discord', discordRouter);
router.use('/messages', messagesRouter);

export default router;
