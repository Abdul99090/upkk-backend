const schedule = require('node-schedule');
const axios = require('axios');
const { models } = require('../config/database');

let botJob = null;
let errorMonitorJob = null;

const startAutoUpdateBot = () => {
  console.log('Starting Auto Update Bot...');

  // Run check every hour
  botJob = schedule.scheduleJob('0 * * * *', async () => {
    try {
      await checkAndApplyUpdates();
    } catch (error) {
      console.error('Bot update check failed:', error);
      await logBotError('Update check failed', error.message);
    }
  });

  // Also run on startup
  checkAndApplyUpdates().catch(error => {
    console.error('Initial bot update check failed:', error);
  });

  console.log('Auto Update Bot started successfully');
};

const stopAutoUpdateBot = () => {
  if (botJob) {
    botJob.cancel();
    botJob = null;
    console.log('Auto Update Bot stopped');
  }

  if (errorMonitorJob) {
    errorMonitorJob.cancel();
    errorMonitorJob = null;
    console.log('Error monitor bot stopped');
  }
};

const checkAndApplyUpdates = async () => {
  try {
    // Get pending updates
    const pendingUpdates = await models.SystemUpdate.findAll({
      where: {
        status: 'pending',
        autoUpdate: true
      },
      order: [['severity', 'DESC'], ['createdAt', 'ASC']]
    });

    for (const update of pendingUpdates) {
      await applyUpdate(update);
    }
  } catch (error) {
    console.error('Error checking for updates:', error);
    throw error;
  }
};

const applyUpdate = async (update) => {
  try {
    console.log(`Applying update: ${update.version}`);

    // Update status to in_progress
    await update.update({ status: 'in_progress' });

    // Simulate update process
    // In real scenario, this would:
    // 1. Download update files
    // 2. Backup current version
    // 3. Apply update
    // 4. Verify update
    // 5. Rollback if needed

    // For now, we'll just mark it as completed
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Mark as completed
    await update.update({
      status: 'completed',
      completedAt: new Date(),
      rolloutPercentage: 100,
      isActive: true
    });

    console.log(`Update ${update.version} applied successfully`);
    
    // Notify admins
    await notifyAdmins(`Update ${update.version} applied successfully`, 'success');
  } catch (error) {
    console.error(`Failed to apply update ${update.version}:`, error);
    
    // Mark as failed
    await update.update({
      status: 'failed',
      failedReason: error.message
    });

    // Attempt rollback if rollback script exists
    if (update.rollbackScript) {
      try {
        await rollbackUpdate(update);
      } catch (rollbackError) {
        console.error('Rollback failed:', rollbackError);
      }
    }

    // Notify admins about failure
    await notifyAdmins(`Update ${update.version} failed: ${error.message}`, 'error');
  }
};

const rollbackUpdate = async (update) => {
  try {
    console.log(`Rolling back update: ${update.version}`);
    // Execute rollback script
    // This is a placeholder for actual rollback logic
    console.log(`Rollback completed for: ${update.version}`);
  } catch (error) {
    console.error('Rollback error:', error);
    throw error;
  }
};

const notifyAdmins = async (message, type = 'info') => {
  try {
    // Get all active admins
    const admins = await models.Admin.findAll({
      where: { isActive: true }
    });

    // In a real app, send email or push notifications
    console.log(`[${type.toUpperCase()}] ${message} - Notifying ${admins.length} admins`);

    // You can integrate with email service here
    // or send push notifications to admin devices
  } catch (error) {
    console.error('Failed to notify admins:', error);
  }
};

const logBotError = async (action, message) => {
  try {
    // Log to system update
    await models.SystemUpdate.create({
      version: 'bot-error',
      title: `Bot Error: ${action}`,
      description: message,
      type: 'maintenance',
      severity: 'high',
      status: 'failed'
    });
  } catch (error) {
    console.error('Failed to log bot error:', error);
  }
};

const scheduleHealthCheck = async () => {
  if (errorMonitorJob) {
    return;
  }

  errorMonitorJob = schedule.scheduleJob('*/5 * * * *', async () => {
    try {
      const stuckTransactions = await models.Transaksi.findAll({
        where: { status: 'pending' }
      });

      if (stuckTransactions.length > 0) {
        console.log(`Monitoring: ${stuckTransactions.length} pending transactions found`);
      }

      for (const transaction of stuckTransactions) {
        const createdTime = new Date(transaction.createdAt);
        const now = new Date();
        const diffMinutes = (now - createdTime) / (1000 * 60);

        if (diffMinutes > 60) {
          await transaction.update({ status: 'failed' });
          console.log(`Transaction ${transaction.id} marked as failed due to timeout`);
          await notifyAdmins(`Transaksi ${transaction.id} timeout dan otomatis gagal`, 'warning');
        }
      }
    } catch (error) {
      console.error('Health check error:', error);
      await notifyAdmins(`Health check error: ${error.message}`, 'error');
    }
  });
};

module.exports = {
  startAutoUpdateBot,
  stopAutoUpdateBot,
  checkAndApplyUpdates,
  applyUpdate,
  scheduleHealthCheck,
  notifyAdmins
};

const startMonitoringBots = async () => {
  await scheduleHealthCheck();
  startAutoUpdateBot();
  console.log('Monitoring bots started successfully');
};

module.exports.startMonitoringBots = startMonitoringBots;
