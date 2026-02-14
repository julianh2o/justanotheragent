import { Router, Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { getBuildPath } from '../utils/paths';

const router = Router();

// GET /api/downloads/sync-helper - Download the Outreach Sync Helper app
router.get('/sync-helper', (req: Request, res: Response) => {
  const dmgPath = path.join(getBuildPath(), 'Outreach Sync Helper.dmg');

  if (!fs.existsSync(dmgPath)) {
    res.status(404).json({
      error: 'Sync helper not available',
      message: 'The sync helper has not been built yet. Run yarn build:sync-helper first.',
    });
    return;
  }

  res.download(dmgPath, 'Outreach Sync Helper.dmg');
});

export default router;
