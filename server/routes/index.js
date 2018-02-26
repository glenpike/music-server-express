import express from 'express';
import trackRoutes from './tracks';
import albumRoutes from './albums';
import genreRoutes from './genres';
import artistRoutes from './artists';
import allTrackRoutes from './all-tracks';
import playbackRoutes from './playback';

const router = express.Router(); // eslint-disable-line new-cap

/** GET /api-status - Check service status **/
router.get('/api-status', (req, res) =>
    res.json({
        status: 'ok',
    })
);

router.use('/tracks', trackRoutes);
router.use('/albums', albumRoutes);
router.use('/genres', genreRoutes);
router.use('/artists', artistRoutes);
router.use('/all-tracks', allTrackRoutes);
router.use('/', playbackRoutes);

export default router;
