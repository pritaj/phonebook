FROM node:24 AS development

RUN apt-get update && apt-get install -y \
    curl \
    build-essential \
    git git-flow \
    ca-certificates

RUN mkdir -p /workspace && chown -R node:node /workspace
    
USER node

WORKDIR /workspace