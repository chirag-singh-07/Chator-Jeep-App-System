#!/bin/bash
cd ~/Chator-Jeep-App-System/backend
git pull
npm install
npm run build
pm2 restart food-api
echo "Deployed at $(date)" >> /var/log/deploy.log