/**
 * Central API router mounting all route modules
 */
const express = require('express');
const router = express.Router();

const healthRouter = require('./health');
const authRouter = require('./authRoutes');
const complaintRouter = require('./complaintRoutes');
const voteRouter = require('./voteRoutes');
const commentRouter = require('./commentRoutes');
const userRouter = require('./userRoutes');
const municipalRouter = require('./municipalRoutes');
const uploadRouter = require('./uploadRoutes');
const aiRouter = require('./aiRoutes');

router.use('/health', healthRouter);
router.use('/auth', authRouter);
router.use('/complaints', complaintRouter);
router.use('/votes', voteRouter);
router.use('/comments', commentRouter);
router.use('/users', userRouter);
router.use('/municipal', municipalRouter);
router.use('/admin', municipalRouter);
router.use('/uploads', uploadRouter);
router.use('/ai', aiRouter);

module.exports = router;
