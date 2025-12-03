# Emby Stats

<div align="center">

![Emby Stats](https://img.shields.io/badge/Emby-Stats-00a4dc?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+PHBvbHlnb24gcG9pbnRzPSI1IDMgMTkgMTIgNSAyMSA1IDMiPjwvcG9seWdvbj48L3N2Zz4=)
![Docker Pulls](https://img.shields.io/docker/pulls/qc0624/emby-stats?style=for-the-badge&logo=docker)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

**Emby 播放统计分析面板 - 可视化你的观影数据**

[功能特性](#功能特性) • [快速开始](#快速开始) • [配置说明](#配置说明) • [截图预览](#截图预览) • [常见问题](#常见问题)

</div>

---

## 功能特性

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

### 技术栈

- **后端**: Python + FastAPI
- **前端**: React + TypeScript + Vite + Tailwind CSS
- **图表**: Recharts
- **动画**: Framer Motion

---

## 快速开始

### 前置要求

- Emby Server 已安装 **Playback Reporting** 插件
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
      # 将 Emby 数据目录挂载进来（只读）
      - /path/to/emby/data:/emby-data:ro
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
  -v /path/to/emby/data:/emby-data:ro \
  -e EMBY_URL=http://your-emby-server:8096 \
  -e TZ=Asia/Shanghai \
  qc0624/emby-stats:latest
```

---

## 配置说明

### 环境变量

| 变量 | 必填 | 默认值 | 说明 |
|------|:----:|--------|------|
| `EMBY_URL` | ✅ | - | Emby 服务器地址，如 `http://192.168.1.100:8096` |
| `EMBY_API_KEY` | ❌ | - | Emby API Key，不填则自动从数据库获取 |
| `TZ` | ❌ | `UTC` | 时区设置，如 `Asia/Shanghai` |
| `MIN_PLAY_SECONDS` | ❌ | `60` | 最小播放秒数，低于此值不计入播放次数统计 |

### 数据目录结构

需要将 Emby 的数据目录挂载到容器的 `/emby-data`：

```
/emby-data
├── data/
│   └── playback_reporting.db    # 播放记录数据库（必需）
└── config/
    └── authentication.db        # 用于自动获取 API Key（可选）
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

## 截图预览

### 概览页面
- 播放次数、时长、用户数等核心指标
- 播放趋势图表
- 时段热力图

### 热门页面
- 热门剧集排行（按播放次数）
- 内容播放排行
- 点击海报可查看详情和累计播放时长

### 用户页面
- 用户播放统计
- 最后活动时间

### 设备页面
- 客户端分布
- 设备列表
- 播放方式统计

### 历史页面
- 最近播放记录
- 海报展示

---

## 常见问题

### Q: 显示无数据？

**A:** 请确认以下几点：
1. Emby 已安装并启用 Playback Reporting 插件
2. 插件已产生播放记录（需要有实际的播放行为）
3. 数据目录挂载正确，容器能访问到 `playback_reporting.db`

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
