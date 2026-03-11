# Backend-ConsultorioKinesiologia
Para instalar el proyecto debes utilizar un proyect manager, recuerda colocarte en la ruta ./Backend-ConsultorioKinesiologia:

```bash
npm i
# or
pnpm install
# or
bun i
```

## Init Docker
Estructura de carpetas sugerida para dockerizar el proyecto:
```
 + carpeta-raiz/
 ├── docker-compose.yml
 ├── .env
 |
 ├── + backend/
 |   ├── dockerfile
 |   └── .env
 |
 └── + frontend/
     ├── dockerfile
     └── .env 
```

### docker-compose.yml
``` yml 
services:

  mysql:
    image: percona/percona-server
    restart: always
    environment:
      MYSQL_ROOT_HOST: "%"
      MYSQL_ALLOW_EMPTY_PASSWORD: "yes"
      MYSQL_DATABASE: ${MYSQL_DATABASE}
      MYSQL_USER: ${MYSQL_USER}
      MYSQL_PASSWORD: ${MYSQL_PASSWORD}
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql
    networks:
      - app-network

  backend:
    build: ./backend
    restart: always
    ports:
      - "3000:3000"
    env_file:
      - ./backend/.env
    volumes:
      - ./backend:/app
      - /app/node_modules
    depends_on:
      - mysql
    networks:
      - app-network

  frontend:
    build: ./frontend
    restart: always
    ports:
      - "5173:5173"
    env_file:
      - ./frontend/.env
    volumes:
      - ./frontend:/app
      - /app/node_modules
    depends_on:
      - backend
    networks:
      - app-network

volumes:
  mysql_data:

networks:
  app-network:
    driver: bridge
```
### backend/Dockerfile

``` dockerfile
FROM node:20.19.0
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "start:dev"]

```

### frontend/Dockerfile

```Dockerfile
FROM node:20.19.0
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host"]
```
Despues de estructurar el proyecto configurar los `.env` y armado los `docker-compose.yml` y `Dockerfile` desde la carpeta raiz `/carpetar-raiz` ejecutar el siguiente comando en consola

``` bash
docker compose up --build
```
* obs: ejecutar el comando de docker con el Docker Desktop para poder arrancar y detener los contenedores desde la applicacion.

Cualquier error con el compose ejecutar

``` bash
docker compose down -v
```
y resale a ChatGPT
