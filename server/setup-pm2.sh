#!/bin/bash
export PATH=$PATH
cd /var/www/ai4you.mindsetai.cloud/server
cat app.pid | xargs kill -9 2>/dev/null
pkill -f 'node server/server.js' 2>/dev/null
npm install pm2
npx pm2 delete all 2>/dev/null
NODE_ENV=production npx pm2 start server.js --name "ai-api" --interpreter /opt/alt/alt-nodejs20/root/usr/bin/node
npx pm2 save
npx pm2 list
sleep 2
curl -I http://127.0.0.1:5001/api/health
