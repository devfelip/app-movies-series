# Dockerfile
FROM node:14-alpine

# Define o diretório de trabalho
WORKDIR /usr/src/app

# Copia o package.json e o package-lock.json
COPY ./src/package*.json ./

# Instala as dependências
RUN npm install

# Copia o restante do código
COPY ./src .

# Expõe a porta em que o aplicativo irá rodar
EXPOSE 3000

# Comando para iniciar o aplicativo
CMD ["node", "server.js"]
