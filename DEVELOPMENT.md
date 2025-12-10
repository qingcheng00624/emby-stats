# Emby Stats 开发文档

## 项目概述

Emby Stats 是一个功能完整的 Emby 媒体服务器播放统计分析面板，提供实时播放监控、数据可视化、用户统计、观影报告生成等功能。项目采用现代化的前后端分离架构，支持多服务器管理和 Telegram 推送集成。

### 核心功能

- **实时监控**：正在播放会话实时显示
- **数据统计**：播放次数、时长、用户、内容、设备等多维度统计
- **可视化图表**：趋势图、热力图、饼图、柱状图
- **观影报告**：支持每日/每周/每月/每年报告自动生成
- **Telegram 集成**：Bot 交互、用户绑定、报告推送
- **多服务器**：支持管理多个 Emby 服务器

### 技术栈

**后端：**
- Python 3.11
- FastAPI 0.104.1
- aiosqlite 0.19.0
- APScheduler 3.10.4
- Pillow 10.1.0（报告图片生成）
- python-telegram-bot 20.7
- httpx 0.25.2
- cachetools 5.3.2

**前端：**
- React 19.2.0
- TypeScript 5.9.3
- Vite 7.2.4
- Tailwind CSS 4.1.17
- ECharts 6.0.0
- Framer Motion 12.23.25
- React Router 7.10.0
- Lucide React 0.555.0

**部署：**
- Docker（多阶段构建）
- Node.js 20（构建阶段）
- Python 3.11-slim（运行阶段）

**Docker 镜像：** `qc0624/emby-stats`

---

## 目录结构

```
emby-stats/
├── backend/                          # Python FastAPI 后端
│   ├── main.py                       # FastAPI 应用入口
│   ├── config.py                     # 环境变量配置管理
│   ├── database.py                   # 数据库工具函数
│   ├── scheduler.py                  # APScheduler 定时任务
│   ├── name_mappings.py              # 客户端/设备名称映射服务
│   ├── requirements.txt              # Python 依赖
│   ├── routers/                      # API 路由模块
│   │   ├── __init__.py
│   │   ├── auth.py                   # 认证路由（登录/登出/检查）
│   │   ├── stats.py                  # 统计数据 API（核心）
│   │   ├── media.py                  # 媒体资源（海报/背景图）
│   │   ├── servers.py                # 多服务器管理 CRUD
│   │   ├── files.py                  # 文件浏览器（选择数据库路径）
│   │   ├── report.py                 # 观影报告配置和发送
│   │   └── tg_bot.py                 # Telegram Bot 管理
│   └── services/                     # 业务逻辑服务
│       ├── emby.py                   # Emby API 交互（缓存）
│       ├── servers.py                # 服务器管理服务
│       ├── users.py                  # 用户数据服务
│       ├── report.py                 # 报告图片生成（PIL）
│       ├── report_config.py          # 报告配置管理（JSON）
│       ├── telegram.py               # Telegram 推送服务
│       ├── tg_bot.py                 # Telegram Bot 交互
│       └── tg_binding.py             # TG 用户绑定管理
├── frontend/                         # React + TypeScript 前端
│   ├── src/
│   │   ├── main.tsx                  # React 入口
│   │   ├── App.tsx                   # 主应用组件（路由）
│   │   ├── index.css                 # 全局样式
│   │   ├── services/
│   │   │   └── api.ts                # API 调用封装
│   │   ├── types/
│   │   │   └── index.ts              # TypeScript 类型定义
│   │   ├── contexts/                 # React Context 状态管理
│   │   │   ├── AuthContext.tsx       # 认证状态
│   │   │   ├── ServerContext.tsx     # 服务器选择
│   │   │   ├── FilterContext.tsx     # 筛选状态（持久化）
│   │   │   └── ThemeContext.tsx      # 主题管理
│   │   ├── pages/                    # 页面组件
│   │   │   ├── Overview.tsx          # 总览页面
│   │   │   ├── Content.tsx           # 内容统计
│   │   │   ├── Users.tsx             # 用户统计
│   │   │   ├── Devices.tsx           # 设备统计
│   │   │   ├── History.tsx           # 播放历史
│   │   │   ├── Favorites.tsx         # 收藏统计（双视图）
│   │   │   ├── Report.tsx            # 报告配置
│   │   │   ├── Login.tsx             # 登录页
│   │   │   └── ContentDetail.tsx     # 内容详情
│   │   ├── components/               # 通用组件
│   │   │   ├── Layout.tsx            # 主布局（导航/侧边栏）
│   │   │   ├── NowPlaying.tsx        # 正在播放组件
│   │   │   ├── FilterPanel.tsx       # 筛选面板
│   │   │   ├── ServerManagementPanel.tsx  # 服务器管理
│   │   │   ├── NameMappingPanel.tsx  # 名称映射配置
│   │   │   ├── FilePickerModal.tsx   # 文件选择器
│   │   │   ├── charts/               # 图表组件
│   │   │   │   ├── TrendChart.tsx    # 趋势折线图
│   │   │   │   ├── HeatmapChart.tsx  # 热力图
│   │   │   │   ├── PieChart.tsx      # 饼图
│   │   │   │   └── UsersChart.tsx    # 用户柱状图
│   │   │   └── ui/                   # UI 基础组件
│   │   │       ├── Card.tsx          # 卡片容器
│   │   │       ├── Modal.tsx         # 模态框
│   │   │       ├── Avatar.tsx        # 用户头像
│   │   │       ├── Skeleton.tsx      # 骨架屏
│   │   │       └── ...
│   │   ├── hooks/
│   │   │   └── useStats.ts           # 统计数据 Hook
│   │   └── lib/
│   │       └── utils.ts              # 工具函数
│   ├── package.json                  # npm 依赖
│   ├── vite.config.ts                # Vite 构建配置
│   ├── tsconfig.json                 # TypeScript 配置
│   └── dist/                         # 构建输出
├── Dockerfile                        # Docker 多阶段构建
├── docker-compose.yml                # Docker Compose 配置
├── docker-compose.override.yml       # 本地开发覆盖配置
├── .env.example                      # 环境变量示例
├── name_mappings.example.json        # 名称映射示例
├── README.md                         # 项目说明文档
├── DEVELOPMENT.md                    # 开发文档（本文件）
├── CHANGELOG.md                      # 更新日志
└── docs/
    └── logo.svg                      # 项目 Logo
```

### 运行时目录

容器内的关键目录：

| 目录 | 说明 | 权限 |
|------|------|------|
| `/app` | 应用代码目录 | 只读 |
| `/app/frontend` | 前端构建产物 | 只读 |
| `/data` | Emby 数据目录（挂载） | 只读 |
| `/config` | 配置目录（挂载） | 读写 |

`/config` 目录下的文件：
- `sessions.db` - 会话数据库
- `servers.db` - 服务器配置数据库
- `tg_bindings.db` - TG 用户绑定数据库
- `tg_bot_config.json` - TG Bot 配置
- `report_config_{server_id}.json` - 各服务器的报告配置
- `name_mappings.json` - 名称映射配置

---

## 后端架构

### 1. 应用入口 (main.py)

FastAPI 应用的核心入口，负责：
- 应用实例化和中间件配置
- CORS 配置（允许所有来源）
- 认证中间件（保护 `/api/*` 路由）
- 静态文件服务（前端构建产物）
- 启动/关闭生命周期事件

**公开路径（无需认证）：**
```python
PUBLIC_PATHS = {
    "/api/auth/login",
    "/api/auth/check",
    "/api/auth/logout",
    "/manifest.json",
    "/sw.js",
}

PUBLIC_PREFIXES = [
    "/api/servers",      # 服务器列表（登录页需要）
    "/icons/",
    "/static/",
]
```

**启动流程：**
1. 初始化会话表 (`init_sessions_table`)
2. 初始化服务器表 (`server_service.init_servers_table`)
3. 迁移旧版配置 (`server_service.migrate_legacy_config`)
4. 初始化 TG 绑定数据库 (`tg_binding_service.init_db`)
5. 启动定时任务调度器 (`start_scheduler`)
6. 启动 Telegram Bot (`tg_bot_service.start`)

### 2. 配置管理 (config.py)

通过环境变量配置，使用 Pydantic Settings 管理：

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `TZ` | 系统时区 | `Asia/Shanghai` |
| `PLAYBACK_DB` | 播放记录数据库路径 | `/data/playback_reporting.db` |
| `USERS_DB` | 用户数据库路径 | `/data/users.db` |
| `AUTH_DB` | 认证数据库路径 | `/data/authentication.db` |
| `EMBY_URL` | Emby 服务器地址 | `http://localhost:8096` |
| `EMBY_API_KEY` | Emby API Key（可选） | 空（自动从数据库获取） |
| `MIN_PLAY_DURATION` | 最小播放时长过滤（秒） | `0`（不过滤） |
| `TZ_OFFSET` | 时区偏移（小时） | `8`（北京时间） |

**说明：**
- `EMBY_API_KEY` 如果不填，会自动从 Emby 认证数据库获取
- `MIN_PLAY_DURATION` 用于过滤短时间播放记录，低于此时长的不计入播放次数（但时长仍统计）
- `TZ_OFFSET` 用于 SQLite 查询时的时间转换（UTC → 本地时间）

### 3. 数据库工具 (database.py)

**数据库连接函数：**
```python
get_playback_db(server_config)      # 播放记录数据库（Emby Playback Reporting 插件）
get_users_db(server_config)         # 用户数据库
get_auth_db(server_config)          # 认证数据库
get_sessions_db()                   # 会话数据库（/config/sessions.db）
```

**SQL 辅助函数：**
```python
get_count_expr()                    # 播放次数统计（支持最小时长过滤）
get_duration_filter()               # 播放时长过滤条件
local_datetime(column)              # UTC 转本地时间
local_date(column)                  # UTC 转本地日期
convert_guid_bytes_to_standard()    # .NET GUID 字节转换
```

**GUID 转换说明：**
SQLite 存储的是 .NET GUID 的字节格式，前三部分需要反转字节序：
- 前 4 字节反转
- 接下来 2 字节反转
- 再接下来 2 字节反转
- 后 8 字节保持不变

### 数据库表结构

#### 会话表 (sessions.db)

```sql
CREATE TABLE sessions (
    session_id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    username TEXT NOT NULL,
    is_admin INTEGER NOT NULL,
    expires REAL NOT NULL,
    created_at REAL DEFAULT (unixepoch())
);
CREATE INDEX idx_sessions_expires ON sessions(expires);
```

#### 服务器表 (servers.db)

```sql
CREATE TABLE servers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    emby_url TEXT NOT NULL,
    emby_api_key TEXT,
    playback_db TEXT NOT NULL,
    users_db TEXT NOT NULL,
    auth_db TEXT NOT NULL,
    is_default INTEGER DEFAULT 0,
    created_at REAL DEFAULT (unixepoch()),
    updated_at REAL DEFAULT (unixepoch())
);
```

#### TG 绑定表 (tg_bindings.db)

```sql
CREATE TABLE tg_bindings (
    tg_user_id TEXT NOT NULL,
    tg_username TEXT,
    tg_first_name TEXT,
    server_id TEXT NOT NULL,
    emby_user_id TEXT NOT NULL,
    emby_username TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    PRIMARY KEY (tg_user_id, server_id)
);
CREATE INDEX idx_tg_bindings_server ON tg_bindings(server_id);
CREATE INDEX idx_tg_bindings_emby_user ON tg_bindings(server_id, emby_user_id);
```

#### Emby PlaybackActivity 表（来自 Playback Reporting 插件）

```sql
-- 主要字段
DateCreated     -- 播放时间（UTC）
UserId          -- 用户 ID（GUID 字节格式）
ItemId          -- 媒体 ID
ItemName        -- 媒体名称
ItemType        -- 类型（Movie/Episode/Audio 等）
ClientName      -- 客户端名称
DeviceName      -- 设备名称
PlayDuration    -- 播放时长（秒）
PlaybackMethod  -- 播放方式（DirectPlay/Transcode 等）
```

### 4. 路由模块 (routers/)

#### stats.py - 统计 API

所有统计接口支持统一的筛选参数：
- `days` - 天数范围
- `start_date`, `end_date` - 日期范围
- `users` - 用户 ID 列表（逗号分隔）
- `clients` - 客户端列表
- `devices` - 设备列表
- `item_types` - 媒体类型
- `playback_methods` - 播放方式
- `server_id` - 服务器 ID

**主要端点：**
| 端点 | 说明 |
|------|------|
| `GET /api/overview` | 总览统计 |
| `GET /api/trend` | 播放趋势（按天） |
| `GET /api/hourly` | 按小时统计（热力图） |
| `GET /api/users` | 用户统计 |
| `GET /api/clients` | 客户端统计 |
| `GET /api/devices` | 设备统计 |
| `GET /api/playback-methods` | 播放方式统计 |
| `GET /api/recent` | 最近播放记录 |
| `GET /api/now-playing` | 正在播放 |
| `GET /api/filter-options` | 筛选选项 |
| `GET /api/content-detail` | 内容详情 |
| `GET /api/favorites` | 收藏统计（按媒体和按用户分组） |

#### auth.py - 认证

- `POST /api/auth/login` - 登录（通过 Emby API 验证）
- `GET /api/auth/check` - 检查登录状态
- `POST /api/auth/logout` - 登出

认证使用 Cookie 存储 session_id，会话存储在 SQLite。

#### servers.py - 多服务器管理

- `GET /api/servers` - 获取服务器列表
- `POST /api/servers` - 添加服务器
- `PUT /api/servers/{id}` - 更新服务器
- `DELETE /api/servers/{id}` - 删除服务器

#### media.py - 媒体资源

- `GET /api/poster/{item_id}` - 获取海报
- `GET /api/backdrop/{item_id}` - 获取背景图

#### report.py - 观影报告

- `GET /api/report/config` - 获取报告配置
- `POST /api/report/config` - 保存报告配置
- `GET /api/report/preview` - 预览报告图片
- `POST /api/report/send` - 手动发送报告
- `GET /api/report/bindings` - 获取 TG 绑定用户列表

#### files.py - 文件浏览器

- `GET /api/files?path=/` - 浏览目录

用于添加服务器时选择数据库路径，返回指定路径下的文件和目录列表。

#### tg_bot.py - Telegram Bot 管理

- `GET /api/tg-bot/config` - 获取 Bot 配置
- `POST /api/tg-bot/config` - 保存 Bot 配置

### 5. 服务模块 (services/)

#### emby.py - Emby API 服务

`EmbyService` 类：
- `get_api_key()` - 获取 API Key（优先配置 > 数据库）
- `get_item_info()` - 获取媒体信息（带 TTLCache 缓存）
- `get_poster()` / `get_backdrop()` - 获取图片
- `get_now_playing()` - 获取正在播放会话
- `authenticate_user()` - 用户认证

#### servers.py - 服务器管理服务

`ServerService` 类：
- 服务器配置 CRUD
- 缓存管理
- 旧配置迁移

数据存储：`/config/servers.db`

#### report.py - 报告生成服务

`ReportService` 类：
- `generate_report_image()` - 生成报告图片（PIL）
- `get_stats()` - 获取统计数据
- `get_top_content()` - 获取热门内容

报告图片特性：
- 现代深色主题（渐变背景）
- 圆角卡片设计
- 海报展示（带阴影）
- 排名颜色（金/银/铜）
- 支持缩放因子
- 中文字体支持（Noto Sans CJK）

报告内容：
- 观看时长（小时）
- 播放次数
- 观看内容数
- 热门内容排行（可配置数量）

#### report_config.py - 报告配置管理

配置结构：
```python
class ReportConfig:
    telegram: TelegramConfig      # TG 推送配置
    schedule: ScheduleConfig      # 定时任务配置
    users: list[str]              # 报告用户（空=所有）
    content_count: int            # 热门内容数量

class TelegramConfig:
    enabled: bool
    bot_token: str
    chat_id: str
    proxy: str                    # HTTP 或 SOCKS5 代理

class ScheduleConfig:
    daily: ScheduleItemConfig     # 每天 21:00
    weekly: ScheduleItemConfig    # 每周日 21:00
    monthly: ScheduleItemConfig   # 每月 1 号 21:00
    yearly: ScheduleItemConfig    # 每年 1 月 1 号 21:00
```

存储位置：`/config/report_config_{server_id}.json`

#### telegram.py - Telegram 推送服务

`TelegramService` 类：
- `send_photo_with_config()` - 发送图片
- `send_message()` - 发送文本消息

代理支持：
- HTTP 代理：`http://127.0.0.1:7890`
- SOCKS5 代理：`socks5://127.0.0.1:1080`

#### users.py - 用户服务

`UserService` 类：
- `get_user_map()` - 获取用户 ID 到用户名映射
- `get_report_users()` - 获取报告用户列表

缓存：5 分钟 TTL，每个服务器独立缓存

### 6. 定时任务 (scheduler.py)

使用 APScheduler 实现定时任务：

**定时任务类型：**
| 任务 | 默认 Cron | 说明 |
|------|-----------|------|
| 每日报告 | `0 21 * * *` | 每天 21:00 |
| 每周报告 | `0 21 * * 0` | 每周日 21:00 |
| 每月报告 | `0 21 1 * *` | 每月 1 号 21:00 |
| 每年报告 | `0 21 1 1 *` | 每年 1 月 1 号 21:00 |
| 会话清理 | `0 * * * *` | 每小时 |

每个服务器独立配置，支持启用/禁用和自定义 Cron 表达式

### 7. Telegram Bot (services/tg_bot.py)

Bot 提供用户交互功能，支持账户绑定和个人报告查询。

**Bot 命令：**
| 命令 | 说明 |
|------|------|
| `/start` | 开始使用，显示欢迎信息 |
| `/bind` | 绑定 Emby 账户 |
| `/unbind` | 解除绑定 |
| `/report` | 获取个人观影报告 |
| `/myinfo` | 查看绑定状态 |
| `/help` | 帮助信息 |
| `/cancel` | 取消当前操作 |

**绑定流程：**
1. 用户发送 `/bind`
2. 选择服务器（如有多个）
3. 输入 Emby 用户名
4. 输入密码验证（或 `/skip` 跳过）
5. 验证成功后保存绑定关系

**报告查询：**
- 支持选择报告周期（今日/本周/本月/本年）
- 多服务器绑定时可选择服务器
- 生成个人专属报告图片

**配置文件：** `/config/tg_bot_config.json`
```json
{
  "enabled": true,
  "bot_token": "your_bot_token",
  "default_period": "monthly"
}
```

---

## 前端架构

### 1. 状态管理 (contexts/)

使用 React Context 管理全局状态：

#### AuthContext
- `isAuthenticated` - 登录状态
- `username` - 当前用户名
- `login()` / `logout()` - 登录/登出方法

#### ServerContext
- `servers` - 服务器列表
- `currentServer` - 当前选中服务器
- `setCurrentServer()` - 切换服务器

#### FilterContext
- `filters` - 筛选状态（天数、日期范围、用户、客户端等）
- `options` - 可用筛选选项
- `buildQueryParams()` - 构建 API 查询参数
- 筛选状态持久化到 localStorage

### 2. API 服务 (services/api.ts)

封装所有 API 调用：
- 自动添加 `server_id` 参数
- 401 错误自动触发登出
- 类型安全的响应

### 3. 类型定义 (types/index.ts)

定义所有 API 响应类型：
- `OverviewData`, `TrendData`, `HourlyData`
- `UsersData`, `ClientsData`, `DevicesData`
- `RecentData`, `NowPlayingData`
- `ContentDetailData`, `FilterOptionsData`
- `FavoritesData`, `FavoriteItem`, `UserFavorites`, `UserFavoriteItem`

### 4. 页面组件 (pages/)

| 页面 | 说明 |
|------|------|
| `Overview` | 总览：统计卡片、趋势图、热力图、热门内容 |
| `Content` | 内容：热门剧集/电影排行 |
| `Users` | 用户：用户播放统计 |
| `Devices` | 设备：客户端/设备/播放方式统计 |
| `History` | 历史：最近播放记录 |
| `Favorites` | 收藏：双视图（按用户/热门榜单）、搜索、类型筛选 |
| `Report` | 报告：Telegram 推送配置 |
| `ContentDetail` | 详情：单个内容的播放记录 |

### 5. 图表组件 (components/charts/)

| 组件 | 库 | 说明 |
|------|-----|------|
| `TrendChart` | ECharts | 趋势折线图（播放次数/时长） |
| `HeatmapChart` | 自定义 | 活跃时段热力图（7x24） |
| `PieChart` | ECharts | 饼图（客户端/设备/播放方式） |
| `UsersChart` | ECharts | 用户柱状图（播放时长排行） |

### 6. 通用组件 (components/)

| 组件 | 说明 |
|------|------|
| `Layout` | 主布局（导航栏、侧边栏、内容区） |
| `NowPlaying` | 正在播放会话（实时刷新） |
| `FilterPanel` | 筛选面板（时间、用户、设备等） |
| `ServerManagementPanel` | 服务器管理（CRUD） |
| `NameMappingPanel` | 名称映射配置 |
| `FilePickerModal` | 文件选择器（选择数据库路径） |

### 7. UI 基础组件 (components/ui/)

基于 Tailwind CSS 的基础组件：
- `Card` - 卡片容器
- `Modal` - 模态框
- `Avatar` - 用户头像
- `Skeleton` - 骨架屏加载
- `Chip` - 标签
- `Progress` - 进度条
- `PosterCard` - 海报卡片
- `PosterModal` - 海报模态框

---

## 数据流

### 播放数据来源

数据来自 Emby Playback Reporting 插件的 SQLite 数据库：

**PlaybackActivity 表主要字段：**
- `DateCreated` - 播放时间（UTC）
- `UserId` - 用户 ID
- `ItemId` - 媒体 ID
- `ItemName` - 媒体名称
- `ItemType` - 类型（Movie/Episode）
- `ClientName` - 客户端名称
- `DeviceName` - 设备名称
- `PlayDuration` - 播放时长（秒）
- `PlaybackMethod` - 播放方式

### 多服务器支持

1. 服务器配置存储在 `/config/servers.db`
2. 每个服务器独立配置数据库路径
3. API 请求通过 `server_id` 参数指定服务器
4. 前端通过 Cookie 存储当前服务器 ID

---

## 开发指南

### 本地开发环境

**前置要求：**
- Python 3.11+
- Node.js 20+
- Emby 服务器（带 Playback Reporting 插件）

**后端启动：**
```bash
cd backend
pip install -r requirements.txt

# 设置环境变量
export EMBY_URL=http://your-emby:8096
export PLAYBACK_DB=/path/to/playback_reporting.db
export USERS_DB=/path/to/users.db
export AUTH_DB=/path/to/authentication.db

# 启动开发服务器
uvicorn main:app --reload --port 8000
```

**前端启动：**
```bash
cd frontend
npm install
npm run dev
```

前端开发服务器默认在 `http://localhost:5173`，会自动代理 API 请求到后端。

**使用 Docker Compose 开发：**
```bash
# 使用 override 配置进行本地开发
docker-compose -f docker-compose.yml -f docker-compose.override.yml up
```

### 添加新的统计 API

1. 在 `routers/stats.py` 添加路由函数
2. 使用 `build_filter_conditions()` 构建筛选条件
3. 使用 `get_server_config()` 获取服务器配置
4. 在 `frontend/src/services/api.ts` 添加 API 调用
5. 在 `frontend/src/types/index.ts` 添加类型定义

### 添加新的服务

1. 在 `backend/services/` 创建服务模块
2. 创建单例实例导出
3. 在需要的路由中导入使用

### 调试技巧

**后端调试：**
- 使用 `print()` 输出日志（会显示在容器日志中）
- FastAPI 自动生成 API 文档：`http://localhost:8000/docs`
- 使用 `--reload` 参数启动，代码修改后自动重载

**前端调试：**
- 使用浏览器开发者工具
- React DevTools 扩展
- Vite 支持热模块替换（HMR）

**数据库调试：**
```bash
# 查看 SQLite 数据库
sqlite3 /config/sessions.db ".schema"
sqlite3 /config/servers.db "SELECT * FROM servers"
```

### Docker 构建

```bash
# 构建镜像
docker build -t qc0624/emby-stats .

# 本地测试
docker run -p 8899:8000 \
  -v /path/to/emby/data:/data:ro \
  -v /path/to/config:/config \
  -e EMBY_URL=http://your-emby:8096 \
  qc0624/emby-stats

# 推送到 Docker Hub
docker push qc0624/emby-stats
```

---

## 关键设计决策

### 1. 时区处理
- 数据库存储 UTC 时间
- 查询时使用 `TZ_OFFSET` 转换为本地时间
- 前端显示本地时间

### 2. 缓存策略
- Emby 媒体信息使用 TTLCache（1小时过期，最大500条）
- 服务器配置使用内存缓存
- 前端筛选选项按需加载

### 3. 认证机制
- 通过 Emby API 验证用户凭据
- 会话存储在本地 SQLite
- Cookie 存储 session_id

### 4. 名称映射
- 支持客户端/设备名称自定义映射
- 配置存储在 `/config/name_mappings.json`
- 运行时可热重载

---

## 常见问题

### Q: 如何添加新的筛选维度？

1. 后端：在 `build_filter_conditions()` 添加条件
2. 前端：在 `FilterContext` 添加状态
3. 前端：在 `FilterPanel` 添加 UI

### Q: 如何修改报告样式？

修改 `services/report.py` 中的 `ReportService` 类：
- 颜色配置在 `__init__`
- 布局在 `generate_report_image()`
- 字体在 `_get_font()`

### Q: 如何添加新的推送渠道？

1. 在 `services/` 创建新的推送服务
2. 在 `scheduler.py` 的 `send_report_for_server()` 中调用
3. 在前端 Report 页面添加配置 UI

### Q: 如何配置 Telegram 代理？

在报告配置页面的 Telegram 设置中填写代理地址：
- HTTP 代理：`http://127.0.0.1:7890`
- SOCKS5 代理：`socks5://127.0.0.1:1080`

### Q: 为什么播放记录不显示？

1. 检查 Emby Playback Reporting 插件是否已安装并启用
2. 检查数据库路径是否正确
3. 检查 `MIN_PLAY_DURATION` 设置是否过滤了短时间播放

---

## 故障排除

### 常见问题

| 问题 | 可能原因 | 解决方案 |
|------|---------|---------|
| 无法登录 | Emby 服务器不可达 | 检查 `EMBY_URL` 配置 |
| 数据为空 | 数据库路径错误 | 检查数据库文件是否存在 |
| 海报不显示 | API Key 无效 | 检查 `EMBY_API_KEY` 或认证数据库 |
| 报告发送失败 | TG Bot Token 错误 | 检查 Bot 配置和网络 |
| 时间显示错误 | 时区配置错误 | 检查 `TZ_OFFSET` 设置 |

### 日志查看

```bash
# Docker 容器日志
docker logs emby-stats

# 实时查看日志
docker logs -f emby-stats
```

---

## 版本发布流程

### 1. 更新版本号

在以下文件中更新版本号：
- `frontend/src/components/Layout.tsx` - 页面底部版本显示
- `CHANGELOG.md` - 更新日志

### 2. 更新文档

- 更新 `README.md` 中的功能说明（如有新功能）
- 更新 `CHANGELOG.md` 添加版本更新内容

### 3. 构建和推送

```bash
# 构建 Docker 镜像
docker build -t qc0624/emby-stats:latest .
docker build -t qc0624/emby-stats:v1.xx .

# 推送到 Docker Hub
docker push qc0624/emby-stats:latest
docker push qc0624/emby-stats:v1.xx
```

### 4. 提交代码

```bash
git add .
git commit -m "Release v1.xx: 功能描述"
git push origin main
```

### 5. 更新 GitHub 文档（可选）

使用 GitHub API 更新 README 和 CHANGELOG：
```bash
# 使用项目配置的 GitHub Token
```

---

## 贡献指南

### 代码风格

**Python：**
- 使用 4 空格缩进
- 函数和类使用 docstring 注释
- 异步函数使用 `async/await`

**TypeScript：**
- 使用 2 空格缩进
- 使用 TypeScript 严格模式
- 组件使用函数式组件 + Hooks

### 提交规范

提交信息格式：
```
<type>: <description>

[optional body]
```

类型：
- `feat` - 新功能
- `fix` - Bug 修复
- `docs` - 文档更新
- `style` - 代码格式
- `refactor` - 重构
- `perf` - 性能优化
- `chore` - 构建/工具
