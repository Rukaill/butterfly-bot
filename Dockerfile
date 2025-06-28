# Dockerfile
FROM node:18-alpine

# 作業ディレクトリ作成
WORKDIR /app

# パッケージコピーとインストール
COPY package*.json ./
RUN npm install

# ソースコードを全てコピー
COPY . .

# 起動コマンド（index.js を起動）
CMD ["node", "index.js"]
