module.exports = {
  apps: [
    {
      name: 'socialvault',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3001',
      env: {
        NODE_ENV: 'production',
      },
      cwd: '/var/www/socialvault',
    },
  ],
}
