/* eslint-env node */
/**
 * PM2 ecosystem file for the SUST Codex preliminary backend.
 *
 * Usage:
 *   pm2 start ecosystem.config.cjs
 *   pm2 reload ecosystem.config.cjs
 *   pm2 stop ecosystem.config.cjs
 */
module.exports = {
  apps: [
    {
      name: 'sust-prili',
      script: 'dist/main.js',
      instances: 'max',
      exec_mode: 'cluster',
      autorestart: true,
      max_memory_restart: '512M',
      kill_timeout: 15000,
      wait_ready: true,
      listen_timeout: 10000,
      node_args: ['--enable-source-maps'],
      env: {
        NODE_ENV: 'production',
      },
      env_production: {
        NODE_ENV: 'production',
      },
      env_development: {
        NODE_ENV: 'development',
      },
    },
  ],
};