FROM node:lts AS setup
WORKDIR /usr/dev
COPY . .
RUN yarn install

FROM setup AS analyze
RUN yarn lint

FROM setup AS check
RUN yarn check

FROM setup AS test
RUN yarn test

FROM setup AS build
RUN yarn build

FROM build AS release
USER root
RUN git config --global credential.helper store && \
    git config --global user.name "Circle CI" && \
    git config --global user.email "circle-ci@zthunworks.com" && \
    git remote set-url origin https://github.com/zthun/crumbtrail && \
    git remote -v && \
    git checkout latest
RUN --mount=type=secret,id=GIT_CREDENTIALS,dst=/root/.git-credentials npx lerna version --conventional-commits --yes --no-push -m "chore: version [skip ci]" && \
    yarn install && \
    git add . && \
    git commit --allow-empty -m "chore: update yarn lockfile [skip ci]" && \
    git push && \
    git push --tags
RUN --mount=type=secret,id=NPM_CREDENTIALS,dst=/root/.npmrc npx lerna publish from-package --yes

FROM node:lts-alpine AS crumbtrail-cli
ARG USER=crumbtrail
ARG GROUP=breadbox
ARG UID=10001
ARG GID=10002
RUN addgroup -g ${GID} -S ${GROUP} && \
    adduser -u ${UID} -S -G ${GROUP} -h /home/${USER} ${USER} && \
    mkdir -p /home/${USER} && \
    chown -R ${USER}:${GROUP} /home/${USER} && \
    npm install -g @zthun/crumbtrail-cli && \
    npm cache clean --force
USER ${USER}
WORKDIR /home/${USER}
CMD ["crumbtrail-cli"]

FROM node:lts-alpine AS crumbtrail-web-install
RUN npm install -g @zthun/crumbtrail-web

FROM nginx:stable-alpine AS crumbtrail-web
COPY --from=crumbtrail-web-install /usr/local/lib/node_modules/@zthun/crumbtrail-web/dist/. /usr/share/nginx/html/
