# 18-alpine は十分軽量、ARM/AMD どちらでも動きやすい
FROM node:18-alpine

# 作業ディレクトリ作成
WORKDIR /app

# node-prune 相当の軽量化は Alpine+npm ci で十分
COPY package*.json ./
RUN npm ci --omit=dev

# Bot ソースを全コピー
COPY . .

# 本番は環境変数で TZ を JST にしても良い（例: Asia/Tokyo）
ENV NODE_ENV=production

# Koyeb のヘルスチェック (port 3000 など任意)
EXPOSE 3000

# 起動コマンド
CMD ["npm", "start"]
