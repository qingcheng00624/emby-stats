# Emby Stats

<div align="center">

<img src="docs/logo.svg" alt="Emby Stats Logo" width="180" />

<br/><br/>

![Docker Pulls](https://img.shields.io/docker/pulls/qc0624/emby-stats?style=for-the-badge&logo=docker)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

**Emby 播放统计分析面板 - 可视化你的观影数据**

[Features](#features) • [Quick Start](#quick-start) • [Configuration](#configuration) • [FAQ](#faq)

</div>

---

## Features

| 功能 | 说明 |
|------|------|
| **实时播放监控** | 查看当前正在播放的内容、用户、设备和播放进度 |
| **播放趋势分析** | 按天查看播放次数和时长趋势图表 |
| **热门内容排行** | 剧集、电影的播放次数和累计时长排名 |
| **用户统计** | 各用户的播放时长、次数和最后活动时间 |
| **设备统计** | 播放设备和客户端分布情况 |
| **播放历史** | 最近播放记录查询，支持海报展示 |
| **PWA 支持** | 可添加到手机主屏幕作为独立应用 |
| **管理员认证** | 使用 Emby 管理员账号登录，保护数据安全 |

### Tech Stack

- **Backend**: Python + FastAPI
- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Charts**: Recharts
- **Animation**: Framer Motion

---

## Quick Start

> [!IMPORTANT]
> ## ⚠️ 必须先安装 Playback Reporting 插件！
>
> **本项目的所有数据都来自 Emby 的 Playback Reporting 插件，没装插件 = 没有数据！**
>
> 安装方法：Emby 控制台 → 插件 → 目录 → 搜索 "Playback Reporting" → 安装 → 重启 Emby
>
> 安装后需要有实际播放行为才会产生数据记录。

### 前置要求

- **Emby Server 已安装 Playback Reporting 插件**（见上方说明）
- Docker 环境

### Docker Compose（推荐）

创建 `docker-compose.yml`：

```yaml
services:
  emby-stats:
    image: qc0624/emby-stats:latest
    container_name: emby-stats
    ports:
      - "8899:8000"
    volumes:
      # 挂载包含 playback_reporting.db 的 data 目录（只读）
      - /path/to/emby/data:/data:ro
    environment:
      # Emby 服务器地址（必填）
      - EMBY_URL=http://your-emby-server:8096
      # Emby API Key（可选，不填则自动从数据库获取）
      - EMBY_API_KEY=your_api_key
      # 时区
      - TZ=Asia/Shanghai
    restart: unless-stopped
```

启动服务：

```bash
docker compose up -d
```

访问 `http://your-server:8899`，使用 Emby **管理员账号**登录。

### Docker Run

```bash
docker run -d \
  --name emby-stats \
  -p 8899:8000 \
  -v /path/to/emby/data:/data:ro \
  -e EMBY_URL=http://your-emby-server:8096 \
  -e TZ=Asia/Shanghai \
  qc0624/emby-stats:latest
```

---

## Configuration

### 环境变量

| 变量 | 必填 | 默认值 | 说明 |
|------|:----:|--------|------|
| `EMBY_URL` | ✅ | - | Emby 服务器地址，如 `http://192.168.1.100:8096` |
| `EMBY_API_KEY` | ❌ | - | Emby API Key，不填则自动从数据库获取 |
| `TZ` | ❌ | `UTC` | 时区设置，如 `Asia/Shanghai` |
| `MIN_PLAY_SECONDS` | ❌ | `60` | 最小播放秒数，低于此值不计入播放次数统计 |

### 数据目录结构

需要将 Emby 的 `data` 目录（包含 `playback_reporting.db`）挂载到容器的 `/data`：

```
/data                           # 容器内路径
└── playback_reporting.db       # 播放记录数据库（必需）
```

> **注意**: Emby 数据目录通常位于：
> - **Linux**: `/var/lib/emby/` 或 `/opt/emby-server/data/`
> - **Docker**: 查看你的 Emby 容器挂载配置
> - **Synology**: `/volume1/docker/emby/config/`
> - **Windows**: `C:\Users\<用户名>\AppData\Roaming\Emby-Server\`

### Playback Reporting 插件

本项目依赖 Emby 的 **Playback Reporting** 插件来获取播放记录：

1. 打开 Emby 控制台 → 插件 → 目录
2. 搜索 "Playback Reporting" 并安装
3. 重启 Emby 服务器
4. 等待产生播放记录后即可在统计面板查看

---

## FAQ

### Q: 显示无数据？

**A:** 请确认以下几点：
1. Emby 已安装并启用 Playback Reporting 插件
2. 插件已产生播放记录（需要有实际的播放行为）
3. 数据目录挂载正确，容器能访问到 `playback_reporting.db`

### Q: 挂载目录怎么配置？

> [!CAUTION]
> ## 这是最常见的错误！
> 你需要挂载的是 **Emby 的 data 目录**（包含 `playback_reporting.db` 的那个），不是新建空目录！

```yaml
# ❌ 错误！不要新建目录！
volumes:
  - ./emby-stats-data:/data  # 这是空目录，没有任何数据

# ✅ 正确：挂载 Emby 的 data 目录
volumes:
  - /你的emby的data目录:/data:ro
```

**如何找到正确的目录？**

```bash
# 找到 playback_reporting.db 所在目录
find / -name "playback_reporting.db" 2>/dev/null
```

找到后，挂载它的 **上一级目录**（也就是包含这个 db 文件的 data 目录）：

| 找到的路径 | 应该挂载 |
|-----------|---------|
| `/vol1/emby/data/playback_reporting.db` | `/vol1/emby/data:/data:ro` |
| `/opt/emby/config/data/playback_reporting.db` | `/opt/emby/config/data:/data:ro` |
| `/emby/data/playback_reporting.db` | `/emby/data:/data:ro` |

**验证方法：** 确认目录里有 `playback_reporting.db`：
```bash
ls -la /你的目录/playback_reporting.db
```

### Q: 无法登录？

**A:** 本面板仅允许 Emby **管理员账号**登录，普通用户无权访问。请确认你使用的账号在 Emby 中具有管理员权限。

### Q: 海报不显示？

**A:** 检查以下配置：
1. `EMBY_URL` 是否正确配置为 Emby 服务器地址
2. 容器网络是否能访问到 Emby 服务器
3. 如果使用反向代理，确保配置正确

### Q: 时区不对？

**A:** 设置环境变量 `TZ=Asia/Shanghai`（或你的时区）后重启容器。

### Q: 如何更新？

```bash
docker compose pull
docker compose up -d
```

---

## 开发

### 本地开发

```bash
# 后端
cd backend
pip install -r requirements.txt
uvicorn main:app --reload

# 前端
cd frontend
npm install
npm run dev
```

### 构建镜像

```bash
docker build -t emby-stats .
```

---

## License

MIT License

---

<div align="center">

**如果觉得有用，欢迎 Star ⭐**

</div>
