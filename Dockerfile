FROM node:22-alpine AS runner

# 设置工作目录
WORKDIR /opt/deployments

# 设置生产环境
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# 安装 git（skills 同步所需）
RUN apk add --no-cache git

# 创建非 root 用户以增强安全性
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# 创建 skills 数据目录
RUN mkdir -p /data/skills-cache /data/skills-output && \
    chown -R nextjs:nodejs /data

# 为预渲染缓存(prerender cache)设置正确的权限以防止 EACCES
RUN mkdir .next && chown nextjs:nodejs .next

# 假定在构建机已经执行了 npm run build
# 只需要拷贝 standalone 产物和静态资源
# 注意：这些路径相对于 Dockerfile 所在的根目录
COPY --chown=nextjs:nodejs .next/standalone ./
RUN echo "--- ls ROOT ---" && ls -la && echo "--- ls .next ---" && ls -la .next || true

COPY --chown=nextjs:nodejs .next/static ./.next/static
RUN echo "--- ls .next/static ---" && ls -la .next/static || true

COPY --chown=nextjs:nodejs public ./public
RUN echo "--- ls public ---" && ls -la public || true

# 切换到非 root 用户
USER nextjs

EXPOSE 3000

# server.js 是 next build 在 standalone 模式下生成的入口文件
CMD ["node", "server.js"]
