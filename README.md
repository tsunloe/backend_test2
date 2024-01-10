# Backend
run
npm run dev

swagger
{host}/api-docs


Docker
docker build -t test-node-app .

docker network create mynetwork
docker run -d --name mongodb-container --network mynetwork -p 27017:27017 mongo
docker run -d --name nodejs-container --network mynetwork -p 3000:3000 test-node-app