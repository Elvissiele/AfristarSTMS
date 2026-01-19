FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install defaults
RUN npm install

# Copy prisma schema
COPY prisma ./prisma/

# Copy source code
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Expose port
EXPOSE 3000

# Start command
CMD ["npm", "start"]
