ARG NODE_IMAGE=docker.m.daocloud.io/library/node:20-alpine
ARG NGINX_IMAGE=docker.m.daocloud.io/library/nginx:1.27-alpine

FROM ${NODE_IMAGE} AS build

WORKDIR /app

COPY repo/package*.json ./

RUN npm install

COPY repo/ ./

RUN npm run build

FROM ${NGINX_IMAGE}

COPY --from=build /app/build /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
# ========== SSH plugin (pluggable, for Cursor/Trae vibe coding) ==========
# Drop-in block: copy the same `ssh_plugin/` folder next to this Dockerfile
# and paste this block at the end of any business Dockerfile. Nothing else
# in the business logic needs to change.
#
# Optional customisation (add BEFORE this block if needed):
#   ENV SSH_PASSWORD=mysecret           # change root password (default: password)
#   ENV SSH_PORT=2222                   # change sshd port     (default: 22)
#   ENV ORIG_ENTRYPOINT=/docker-entrypoint.sh   # chain base image's ENTRYPOINT
#                                                # (e.g. postgres, mysql, jupyter)
#
# NOTE: this block runs as root (required to install sshd). If the base image
#       uses a non-root USER, restore it at the very end, e.g. `USER node`.
USER root
COPY ssh_plugin/ /opt/ssh_plugin/
RUN chmod +x /opt/ssh_plugin/*.sh && /opt/ssh_plugin/install_ssh.sh
EXPOSE 22
ENTRYPOINT ["/opt/ssh_plugin/entrypoint.sh"]
# USER <original-user>   # uncomment & set if the base image requires non-root
# ========== end SSH plugin ==========