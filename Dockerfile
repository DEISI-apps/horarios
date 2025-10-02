# Usa uma imagem base oficial do Node
FROM node:18-alpine

# Define o diretório de trabalho
WORKDIR /app

# Copia os ficheiros de dependências
COPY package.json package-lock.json ./

# Instala as dependências
RUN npm ci

# Copia o resto dos ficheiros
COPY . .

# Compila a aplicação Next.js
RUN npm run build

# Expõe a porta padrão do Next.js
EXPOSE 3000

# Inicia a aplicação em modo produção
CMD ["npm", "start"]