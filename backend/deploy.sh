#!/bin/bash
cd ~/Chator-Jeep-App-System/backend
git pull origin main
npm install
npm run build
pm2 restart chatori-jeep-api --update-env || pm2 start dist/server.js --name chatori-jeep-api
pm2 save
echo "Deployed at $(date)" >> /var/log/deploy.log