# Emby Stats 开发文档

## 项目概述

Emby Stats 是一个现代化的 Emby 媒体服务器播放统计分析面板，提供实时播放监控、数据可视化、用户统计、观影报告生成等功能。项目采用前后端分离架构，支持多服务器管理、PWA 离线访问和 Telegram 推送集成。

### 核心功能

- **实时监控**：正在播放会话实时显示
- **数据统计**：播放次数、时长、用户、内容、设备等多维度统计
- **可视化图表**：趋势图、热力图、饼图、柱状图
- **内容排行**：热门内容展示和播放排行榜
- **观影报告**：支持每日/每周/每月/每年报告自动生成
- **Telegram 集成**：Bot 交互、用户绑定、报告推送
- **多服务器**：支持管理多个 Emby 服务器，动态切换
- **名称映射**：客户端和设备名称自定义映射
- **PWA 支持**：可安装到桌面，支持离线访问

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
- Vue 3.5
- TypeScript 5.6
- Vuetify 3.7（Material Design 组件库）
- Vite 6.0
- Pinia 2.2（状态管理）
- Vue Router 4.5
- ECharts 5.5（图表库）

**部署：**
- Docker（多阶段构建）
- Node.js 20（构建阶段）
- Python 3.11-slim（运行阶段）

**Docker 镜像：** `qc0624/emby-stats`

**当前版本：** v2.32.0

---

## 目录结构

```
emby-stats/
├── backend/                          # Python FastAPI 后端
│   ├── main.py                       # FastAPI 应用入口
│   ├── config.py                     # 环境变量配置管理
│   ├── database.py                   # 数据库工具函数（连接池）
│   ├── db_pool.py                    # 数据库连接池管理（v2.28.0 新增）
│   ├── logger.py                     # 统一日志配置模块（v2.28.0 新增）
│   ├── scheduler.py                  # APScheduler 定时任务
│   ├── name_mappings.py              # 客户端/设备名称映射服务
│   ├── requirements.txt              # Python 依赖
│   ├── utils/                        # 工具模块（v2.28.0 新增）
│   │   ├── __init__.py
│   │   └── query_parser.py           # 查询参数解析工具
│   ├── routers/                      # API 路由模块
│   │   ├── __init__.py
│   │   ├── auth.py                   # 认证路由（登录/登出/检查）
│   │   ├── stats/                    # 统计数据 API（核心，v2.29.2 模块化）
│   │   │   ├── __init__.py           # 路由导出
│   │   │   ├── helpers.py            # 辅助函数
│   │   │   ├── overview.py           # 总览统计
│   │   │   ├── trend.py              # 趋势统计
│   │   │   ├── users.py              # 用户统计
│   │   │   ├── content.py            # 内容统计
│   │   │   ├── history.py            # 历史记录
│   │   │   ├── favorites.py          # 收藏统计
│   │   │   ├── filters.py            # 筛选选项
│   │   │   └── mappings.py           # 名称映射
│   │   ├── media.py                  # 媒体资源（海报/背景图/内容详情/排行）
│   │   ├── servers.py                # 多服务器管理 CRUD
│   │   ├── files.py                  # 文件浏览器（选择数据库路径）
│   │   ├── report.py                 # 观影报告配置和发送
│   │   ├── tg_bot.py                 # Telegram Bot 管理
│   │   └── tools.py                  # 工具箱（Item ID 替换等）
│   └── services/                     # 业务逻辑服务
│       ├── emby.py                   # Emby API 交互（带缓存）
│       ├── servers.py                # 服务器管理服务
│       ├── users.py                  # 用户数据服务
│       ├── report.py                 # 报告图片生成（PIL）
│       ├── report_simple.py          # 简化版报告生成
│       ├── report_config.py          # 报告配置管理（JSON）
│       ├── telegram.py               # Telegram 推送服务
│       ├── tg_bot.py                 # Telegram Bot 交互
│       └── tg_binding.py             # TG 用户绑定管理
├── frontend-vue/                     # Vue 3 + Vuetify 前端
│   ├── public/
│   │   ├── sw.js                     # Service Worker（PWA）
│   │   ├── manifest.json             # PWA 清单
│   │   └── icons/                    # PWA 图标
│   ├── src/
│   │   ├── main.ts                   # Vue 应用入口
│   │   ├── App.vue                   # 根组件
│   │   ├── router/
│   │   │   └── index.ts              # Vue Router 配置
│   │   ├── stores/                   # Pinia 状态管理
│   │   │   ├── index.ts              # Store 导出
│   │   │   ├── auth.ts               # 认证状态
│   │   │   ├── server.ts             # 服务器选择
│   │   │   └── filter.ts             # 筛选状态（持久化）
│   │   ├── services/
│   │   │   ├── axios.ts              # Axios 实例和拦截器
│   │   │   └── api/
│   │   │       ├── auth.ts           # 认证 API
│   │   │       ├── servers.ts        # 服务器 API
│   │   │       └── stats.ts          # 统计 API
│   │   ├── types/
│   │   │   └── index.ts              # TypeScript 类型定义
│   │   ├── layouts/
│   │   │   └── DefaultLayout.vue     # 主布局（导航/侧边栏）
│   │   ├── pages/                    # 页面组件
│   │   │   ├── Overview.vue          # 总览页面
│   │   │   ├── Content.vue           # 内容统计（热门内容+播放排行）
│   │   │   ├── ContentDetail.vue     # 内容详情
│   │   │   ├── Users.vue             # 用户统计
│   │   │   ├── Devices.vue           # 设备统计
│   │   │   ├── History.vue           # 播放历史
│   │   │   ├── Favorites.vue         # 收藏统计
│   │   │   ├── Report.vue            # 报告配置
│   │   │   ├── Tools.vue             # 工具箱
│   │   │   └── Login.vue             # 登录页
│   │   ├── components/               # 通用组件
│   │   │   ├── FilterPanel.vue       # 筛选面板
│   │   │   ├── ServerManagementPanel.vue  # 服务器管理
│   │   │   ├── NameMappingPanel.vue  # 名称映射配置
│   │   │   ├── charts/               # 图表组件
│   │   │   │   ├── TrendChart.vue    # 趋势折线图
│   │   │   │   ├── HeatmapChart.vue  # 热力图
│   │   │   │   ├── PieChart.vue      # 饼图
│   │   │   │   └── UsersChart.vue    # 用户柱状图
│   │   │   └── ui/                   # UI 基础组件
│   │   │       ├── Card.vue          # 卡片容器
│   │   │       ├── PosterCard.vue    # 海报卡片
│   │   │       └── ...
│   │   ├── composables/              # 组合式函数
│   │   │   └── useToast.ts           # Toast 通知
│   │   ├── plugins/
│   │   │   └── vuetify.ts            # Vuetify 配置
│   │   └── utils/
│   │       └── format.ts             # 格式化工具函数
│   ├── package.json                  # npm 依赖
│   ├── vite.config.ts                # Vite 构建配置
│   ├── tsconfig.json                 # TypeScript 配置
│   └── dist/                         # 构建输出
├── Dockerfile                        # Docker 多阶段构建
├── docker-compose.yml                # Docker Compose 配置
├── .env.example                      # 环境变量示例
├── name_mappings.example.json        # 名称映射示例
├── README.md                         # 项目说明文档
├── DEVELOPMENT.md                    # 开发文档（本文件）
└── CHANGELOG.md                      # 更新日志
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
- 静态文件服务（前端构建产物和 PWA 资源）
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

通过环境变量配置：

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

### 3.5. 工具模块 (utils/)

#### query_parser.py - 查询参数解析工具

提供可重用的参数解析函数，消除代码重复。

**核心函数和类：**
```python
parse_comma_separated(value)        # 解析逗号分隔的字符串为列表
FilterParams(users, clients, ...)   # 筛选参数容器类
build_filter_conditions(...)        # 构建通用的筛选条件（WHERE子句）
```

**使用方式：**
```python
# 1. 解析参数
filter_params = FilterParams(users, clients, devices, item_types, playback_methods)

# 2. 构建筛选条件
where_clause, params = build_filter_conditions(
    days=days,
    start_date=start_date,
    end_date=end_date,
    local_date_func=local_date,
    name_mapping_service=name_mapping_service,
    **filter_params.to_dict(),
)
```

**说明：**
- `build_filter_conditions` 支持日期范围、用户、客户端、设备、媒体类型、播放方式、搜索关键词等筛选
- 自动处理名称映射展开
- 返回参数化查询的 WHERE 子句和参数列表，防止 SQL 注入

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
| `GET /api/clients` | 客户端统计（支持名称映射） |
| `GET /api/devices` | 设备统计（支持名称映射） |
| `GET /api/playback-methods` | 播放方式统计 |
| `GET /api/recent` | 最近播放记录 |
| `GET /api/now-playing` | 正在播放 |
| `GET /api/filter-options` | 筛选选项 |
| `GET /api/favorites` | 收藏统计 |
| `GET /api/name-mappings` | 获取名称映射配置 |
| `POST /api/name-mappings` | 保存名称映射配置 |
| `POST /api/name-mappings/reload` | 重新加载名称映射 |

#### media.py - 媒体资源和内容统计

- `GET /api/poster/{item_id}?server_id={id}` - 获取海报（支持多服务器）
- `GET /api/backdrop/{item_id}?server_id={id}` - 获取背景图（支持多服务器）
- `GET /api/top-content` - 热门内容排行（剧集按剧名聚合，返回series_id）
- `GET /api/top-shows` - 热门剧集（按剧名聚合，返回series_id）
- `GET /api/content-detail` - 内容详情和播放记录

**重要特性：**
- 剧集自动按剧名聚合，返回 series_id 而非单集 episode_id
- 海报和背景图 URL 包含 server_id 参数，支持多服务器切换

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

#### report.py - 观影报告

- `GET /api/report/config` - 获取报告配置
- `POST /api/report/config` - 保存报告配置
- `GET /api/report/preview` - 预览报告图片
- `POST /api/report/send` - 手动发送报告
- `POST /api/report/test-push` - 测试 Telegram 推送
- `GET /api/report/bindings` - 获取 TG 绑定用户列表

#### files.py - 文件浏览器

- `GET /api/files?path=/` - 浏览目录

用于添加服务器时选择数据库路径。

#### tg_bot.py - Telegram Bot 管理

- `GET /api/tg-bot/config` - 获取 Bot 配置
- `POST /api/tg-bot/config` - 保存 Bot 配置

#### tools.py - 工具箱

- `POST /api/tools/replace-item-id` - 替换播放记录中的 Item ID

用于处理剧集洗版后 ItemId 变化的情况，批量更新数据库中的记录。

### 5. 服务模块 (services/)

#### emby.py - Emby API 服务

`EmbyService` 类：
- `get_api_key()` - 获取 API Key
- `get_item_info()` - 获取单个媒体信息（带 TTLCache 缓存）
- `get_items_info_batch()` - 批量获取多个媒体信息（避免 N+1 查询，v2.30.0 新增）
- `get_poster()` / `get_backdrop()` - 获取图片
- `get_poster_url()` / `get_backdrop_url()` - 生成图片 URL（带 server_id 参数）
- `get_now_playing()` - 获取正在播放会话
- `authenticate_user()` - 用户认证
- `search_item_by_name()` - 通过名称搜索媒体项（处理洗版后 ID 变化）

**批量查询优化：**
- `get_items_info_batch` 接收 item_id 列表，通过 Emby API 的 `Ids` 参数一次性获取多个媒体信息
- 自动利用缓存，只查询未缓存的 item
- 显著降低 API 调用次数，解决 N+1 查询性能问题

#### name_mappings.py - 名称映射服务

`NameMappingService` 类：
- `map_client_name()` - 映射客户端名称
- `map_device_name()` - 映射设备名称
- `get_all_mappings()` - 获取所有映射
- `save_mappings()` - 保存映射配置
- `reload()` - 热重载配置

支持正则表达式匹配和精确匹配。

---

## 前端架构

### 1. 技术选型

- **Vue 3 Composition API**：使用 `<script setup>` 语法
- **Vuetify 3**：Material Design 组件库
- **Pinia**：轻量级状态管理
- **Vue Router**：路由管理
- **TypeScript**：类型安全
- **ECharts**：数据可视化
- **Vite**：快速构建工具

### 2. 状态管理 (stores/)

使用 Pinia 管理全局状态：

#### auth.ts
- `isAuthenticated` - 登录状态
- `user` - 当前用户信息
- `login()` / `logout()` - 登录/登出方法
- `checkAuth()` - 检查认证状态

#### server.ts
- `servers` - 服务器列表
- `currentServer` - 当前选中服务器
- `currentServerId` - 当前服务器 ID
- `setCurrentServer()` - 切换服务器
- `fetchServers()` - 加载服务器列表

#### filter.ts
- `dateRange` - 日期范围
- `selectedUsers` - 选中的用户
- `selectedClients` - 选中的客户端
- `selectedDevices` - 选中的设备
- `selectedTypes` - 选中的媒体类型
- `searchQuery` - 搜索关键词
- `buildQueryParams` - 构建 API 查询参数
- 筛选状态持久化到 localStorage

### 3. 路由配置 (router/)

主要路由：

| 路径 | 组件 | 说明 |
|------|------|------|
| `/` | `Overview.vue` | 总览页面 |
| `/content` | `Content.vue` | 内容统计 |
| `/content/:id` | `ContentDetail.vue` | 内容详情 |
| `/users` | `Users.vue` | 用户统计 |
| `/devices` | `Devices.vue` | 设备统计 |
| `/history` | `History.vue` | 播放历史 |
| `/favorites` | `Favorites.vue` | 收藏统计 |
| `/report` | `Report.vue` | 报告配置 |
| `/tools` | `Tools.vue` | 工具箱 |
| `/login` | `Login.vue` | 登录页 |

所有路由（除 `/login`）需要认证。

### 4. 页面组件 (pages/)

#### Overview.vue - 总览页面
- 统计卡片：播放次数、时长、用户数、内容数
- 播放趋势图
- 活跃时段热力图
- 正在播放会话

#### Content.vue - 内容统计
- **热门内容**：海报墙展示（包括剧集和电影）
- **播放排行**：排行榜样式，前三名有金银铜牌效果

#### ContentDetail.vue - 内容详情
- 内容基本信息（海报、简介）
- 播放统计（次数、时长、用户数）
- 播放记录列表

#### Users.vue - 用户统计
- 用户播放排行
- 用户柱状图

#### Devices.vue - 设备统计
- 客户端分布饼图（横向图例）
- 设备分布饼图（横向图例）
- 客户端详情表格
- 设备详情表格

#### History.vue - 播放历史
- 最近播放记录
- 支持搜索和筛选
- 显示海报和详情

#### Favorites.vue - 收藏统计
- 按媒体热度排序
- 按用户收藏排序
- 双视图切换

#### Report.vue - 报告配置
- Telegram 推送设置
- 定时任务配置
- 用户选择
- 报告预览
- 测试推送按钮

#### Tools.vue - 工具箱
- Item ID 替换工具
- 用于处理剧集洗版后 ItemId 变化的情况
- 批量更新播放记录数据库
- 支持查询受影响的记录数并显示确认信息

#### Login.vue - 登录页
- 服务器选择
- 用户名密码登录
- 深色主题背景

### 5. 布局组件 (layouts/)

#### DefaultLayout.vue - 主布局
- 左侧导航栏（桌面端固定，移动端抽屉）
- 顶部标题栏（移动端）
- 服务器选择器
- 筛选按钮
- 主题切换
- 名称映射配置
- 登出按钮
- 版本显示：v2.27.12
- **路由导航高亮**：使用 `isActiveRoute` 函数进行精确路径匹配，避免根路径 `/` 始终激活的问题

### 6. 图表组件 (components/charts/)

#### TrendChart.vue
- 基于 ECharts 的折线图
- 显示播放次数和时长趋势
- 支持缩放和数据筛选

#### HeatmapChart.vue
- 7x24 热力图
- 显示一周各时段活跃度

#### PieChart.vue
- 基于 ECharts 的饼图
- 环形设计
- 横向图例，底部居中
- 显示百分比

#### UsersChart.vue
- 基于 ECharts 的柱状图
- 用户播放时长排行

### 7. UI 组件 (components/ui/)

#### Card.vue
- 基础卡片容器
- 使用 Vuetify v-card

#### PosterCard.vue
- 海报卡片
- 显示海报、标题、播放次数、时长
- 点击可跳转详情

#### FilterPanel.vue
- 筛选面板
- 日期范围选择
- 用户、客户端、设备选择
- 搜索功能

#### ServerManagementPanel.vue
- 服务器管理面板
- CRUD 操作
- 文件选择器

#### NameMappingPanel.vue
- 名称映射配置
- 客户端映射
- 设备映射
- 支持正则表达式

#### LogoMark.vue
- 应用品牌图标（侧边栏/移动端顶栏左上角）
- 纯 SVG，跟随主题通过 `currentColor` 上色

### 8. PWA 支持

#### Service Worker (public/sw.js)
- 缓存静态资源
- 网络优先策略
- 不拦截 API 请求（避免登录问题）
- 版本化缓存名称：`emby-stats-v2.27.5`（需随版本更新）

#### Manifest (public/manifest.json)
- PWA 清单配置
- 应用名称、图标、主题色
- 独立窗口模式

#### Icons / Favicon
- 浏览器标签页图标（favicon）：`frontend-vue/public/favicon.svg`、`frontend-vue/public/favicon.ico`
- PWA 图标：`frontend-vue/public/icons/icon-192.png`、`frontend-vue/public/icons/icon-512.png`
- `frontend-vue/index.html` 同时声明 svg/ico，并用 `?v=版本号` 做缓存刷新（favicon 很容易被浏览器长期缓存）
- 重新生成图标资源（需要 `rsvg-convert` 与 ImageMagick `magick`）：
  ```bash
  cd frontend-vue
  rsvg-convert -w 192 -h 192 public/favicon.svg -o public/icons/icon-192.png
  rsvg-convert -w 512 -h 512 public/favicon.svg -o public/icons/icon-512.png
  magick public/icons/icon-512.png -define icon:auto-resize=64,48,32,24,16 public/favicon.ico
  ```

---

## 关键特性

### 1. 多服务器支持

- 每个服务器独立配置数据库路径
- 动态切换服务器无需刷新
- 海报和背景图 URL 包含 server_id 参数
- 前端通过 Cookie 存储当前服务器 ID

### 2. 名称映射

- 支持客户端和设备名称自定义映射
- 支持正则表达式匹配
- 配置实时生效，可热重载
- 在筛选选项和统计结果中自动去重

### 3. 内容聚合

- 剧集自动按剧名聚合
- 返回 series_id 而非单集 episode_id
- 海报使用剧集海报而非单集海报
- 详情页显示整部剧的统计

### 4. 排行榜设计

- 热门内容：海报墙样式
- 播放排行：列表样式，前三名金银铜牌效果
- 显示排名、海报缩略图、标题、播放次数、观看时长

### 5. PWA 离线支持

- 可安装到桌面
- 离线访问静态资源
- 自动更新检测
- Service Worker 不拦截 API 请求

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
cd frontend-vue
npm install
npm run dev
```

前端开发服务器默认在 `http://localhost:5173`，会自动代理 API 请求到后端。

### 添加新页面

1. 在 `frontend-vue/src/pages/` 创建 Vue 组件
2. 在 `router/index.ts` 添加路由
3. 在 `DefaultLayout.vue` 添加菜单项（如需要）

### 添加新的统计 API

1. 在 `backend/routers/stats.py` 或 `media.py` 添加路由函数
2. 使用 `build_filter_conditions()` 构建筛选条件
3. 在 `frontend-vue/src/services/api/stats.ts` 添加 API 调用
4. 在页面组件中使用

### 修改主题

在 `frontend-vue/src/plugins/vuetify.ts` 修改 Vuetify 主题配置：

```typescript
themes: {
  light: {
    colors: {
      primary: '#1976D2',
      // ...
    }
  },
  dark: {
    colors: {
      primary: '#2196F3',
      // ...
    }
  }
}
```

### Docker 构建和部署

```bash
# 构建镜像
docker build -t qc0624/emby-stats:latest .

# 本地测试
docker compose up -d

# 查看日志
docker compose logs -f

# 重新构建
docker compose down
docker compose build --no-cache
docker compose up -d

# 推送到 Docker Hub
docker push qc0624/emby-stats:latest
```

---

## 版本发布流程

### 1. 更新版本号

- `frontend-vue/public/sw.js` - Service Worker 缓存版本
- `frontend-vue/src/layouts/DefaultLayout.vue` - 版本显示
- `frontend-vue/index.html` - favicon 缓存版本参数（`?v=...`）
- `DEVELOPMENT.md` - 当前版本号

### 2. 更新文档

- 更新 `CHANGELOG.md` 添加版本更新内容
- 更新 `README.md` 中的功能说明（如有新功能）

### 3. 构建和推送

```bash
# 构建 Docker 镜像
docker build -t qc0624/emby-stats:latest .
docker build -t qc0624/emby-stats:vX.XX .

# 推送到 Docker Hub
docker push qc0624/emby-stats:latest
docker push qc0624/emby-stats:vX.XX
```

### 4. 提交代码

```bash
git add .
git commit -m "Release vX.XX: 功能描述"
git push origin main
```

---

## 版本更新历史

### v2.32.0 (2025-12-17) - 🚀 性能与代码质量全面优化

#### 性能优化

**数据库索引优化**
- 新增索引优化工具 `tools/add_playback_indexes.py`，为 PlaybackActivity 表创建性能索引
- 创建 3 个复合索引（日期+用户+内容、内容+日期、用户+日期）
- 查询性能提升 20-40%（总览 3.2s→0.8s，趋势 2.5s→0.6s，排行 4.1s→1.2s）
- 启动时自动检查索引状态，缺少时提示管理员优化
- 完善文档：添加宿主机索引创建的详细步骤和常见错误解决方案

**前端并行加载**
- Content.vue 并行加载优化，使用 Promise.all 并行获取热门内容和播放排行
- 加载时间从 1700ms 降至 900ms（提升 46.8%）
- 统一 loading 状态管理

#### 代码质量

**useDataFetch 推广**
- 重构 4 个页面：Users.vue、Devices.vue、History.vue、Favorites.vue
- 统一使用 useDataFetch composable
- 消除约 120 行重复代码
- 自动处理 loading 状态、服务器切换、筛选器监听
- History.vue 特殊处理：支持搜索状态下禁用筛选器监听
- Devices.vue 保留 Promise.all 并行加载客户端和设备数据

#### 基础设施

- Dockerfile 优化：添加 tools/ 目录复制指令

---

### v2.31.0 (2025-12-17) - 性能与代码质量优化

- 修复 N+1 查询问题（`media.py` 批量查询优化）
- TTLCache 替代手动缓存管理（自动过期）
- 消除 12 处 TypeScript `any` 类型
- 提取 20+ 处硬编码常量到 `constants/index.ts`
- 新增 `useDataFetch` 可重用 composable
- 正在播放自动刷新（5秒间隔）
- 进度条下方显示播放时间

---

### v2.30.0 (2025-12-17) - 工具箱功能

- 新增工具箱页面和导航菜单项
- Item ID 替换工具：用于处理剧集洗版后 ItemId 变化
- 提供 Web 界面和 Python 命令行脚本两种方式

---

### v2.29.2 (2025-12-17) - 代码模块化重构

- 将 979 行的 `stats.py` 拆分为 8 个功能模块
- 最大文件从 978 行降至 260 行，提升可读性
- 所有 API 端点保持向后兼容

---

### v2.29.1 (2025-12-16) - 代码重构与性能优化

- 消除 113 行重复代码，提取统一的 `build_filter_conditions` 函数
- 添加批量查询方法，API 调用从 40+ 次降至 1-2 次
- 响应时间从 2-5秒 降至 200-500ms

---

### v2.29.0 (2025-12-16) - 日志系统优化与清理

- 添加 HTTP 请求日志中间件（2xx 静默，4xx WARNING，5xx ERROR）
- 禁用 Uvicorn 访问日志，消除日志噪音
- 优化 API Key 验证日志级别
- 替换所有 print 语句为标准日志输出

---

### v2.28.0 (2025-12-16) - 后端性能与代码质量优化

- 创建统一日志系统（`logger.py`），替换 40+ 处 print
- 创建数据库连接池（`db_pool.py`），并发性能达 692 QPS
- 创建参数解析工具（`utils/query_parser.py`），消除 120+ 行重复代码

---

## 性能优化

### 数据库索引优化

#### 为什么需要索引优化

PlaybackActivity 表是 Emby Playback Reporting 插件创建的核心表，随着播放记录的累积，数据量可能达到数万甚至数十万条。在没有合适索引的情况下，查询性能会显著下降。

#### 优化收益

添加索引后的性能提升：
- 总览页查询: 3.2s → 0.8s (↓75%)
- 趋势统计: 2.5s → 0.6s (↓76%)
- 内容排行: 4.1s → 1.2s (↓71%)
- 用户统计: 2.8s → 0.7s (↓75%)

#### 何时执行优化

建议在以下情况执行索引优化：
1. 首次部署应用后
2. 播放记录超过 10 万条时
3. 页面加载明显变慢时
4. 容器启动时看到警告信息：`⚠️ 数据库缺少性能优化索引`

#### 执行索引优化

**⚠️ 重要说明：为什么必须在宿主机操作**

由于 Emby 数据库通常以**只读模式**挂载到容器（这是正确的安全实践），应用无法直接在容器内创建索引。因此，**必须在宿主机上**使用 `sqlite3` 命令直接操作数据库文件。

---

**步骤 1：找到 Emby 数据库在宿主机上的路径**

首先，找到你的 Emby 数据库文件在宿主机上的实际路径：

```bash
# 方法一：查看容器挂载信息
docker inspect emby-stats | grep -A 5 '"Source"'

# 方法二：查看 docker-compose.yml 中的 volumes 配置
# 示例输出：
#   - /emby/config/data:/data:ro
# 说明宿主机路径是 /emby/config/data
```

常见的 Emby 数据路径：
- Docker 安装：`/path/to/emby/config/data/`
- 群晖 NAS：`/volume1/docker/emby/config/data/`
- 威联通 NAS：`/share/Container/emby/config/data/`

---

**步骤 2：确认数据库文件存在**

```bash
# 替换 /emby/config/data 为你的实际路径
ls -lh /emby/config/data/playback_reporting.db

# 应该看到类似输出：
# -rw-r--r-- 1 bin bin 128K Dec 17 15:02 playback_reporting.db
```

---

**步骤 3：在宿主机上创建索引**

```bash
# ⭐ 单服务器环境（直接复制粘贴执行）
sqlite3 /emby/config/data/playback_reporting.db <<'EOF'
CREATE INDEX IF NOT EXISTS idx_playback_date_user_item ON PlaybackActivity(DateCreated, UserId, ItemId);
CREATE INDEX IF NOT EXISTS idx_playback_item_date ON PlaybackActivity(ItemId, DateCreated);
CREATE INDEX IF NOT EXISTS idx_playback_user_date ON PlaybackActivity(UserId, DateCreated);
SELECT 'Created indexes:' AS status;
SELECT name FROM sqlite_master WHERE type='index' AND tbl_name='PlaybackActivity' AND name LIKE 'idx_playback_%';
EOF

# ⭐ 多服务器环境（为每个数据库分别执行）
# 第一个服务器
sqlite3 /emby/config/data/playback_reporting.db <<'EOF'
CREATE INDEX IF NOT EXISTS idx_playback_date_user_item ON PlaybackActivity(DateCreated, UserId, ItemId);
CREATE INDEX IF NOT EXISTS idx_playback_item_date ON PlaybackActivity(ItemId, DateCreated);
CREATE INDEX IF NOT EXISTS idx_playback_user_date ON PlaybackActivity(UserId, DateCreated);
EOF

# 第二个服务器
sqlite3 /emby2/config/data/playback_reporting.db <<'EOF'
CREATE INDEX IF NOT EXISTS idx_playback_date_user_item ON PlaybackActivity(DateCreated, UserId, ItemId);
CREATE INDEX IF NOT EXISTS idx_playback_item_date ON PlaybackActivity(ItemId, DateCreated);
CREATE INDEX IF NOT EXISTS idx_playback_user_date ON PlaybackActivity(UserId, DateCreated);
EOF
```

---

**步骤 4：验证索引创建成功**

```bash
# 查看已创建的索引
sqlite3 /emby/config/data/playback_reporting.db "SELECT name FROM sqlite_master WHERE type='index' AND tbl_name='PlaybackActivity' AND name LIKE 'idx_playback_%';"

# 应该看到 3 个索引：
# idx_playback_date_user_item
# idx_playback_item_date
# idx_playback_user_date
```

---

**步骤 5：重启容器使应用识别索引**

```bash
docker restart emby-stats

# 查看日志确认
docker logs emby-stats --tail 30

# 应该看到类似输出：
# ✓ 服务器 [xxx] 数据库索引已优化 (已有 3 个优化索引)
```

---

**📝 完整示例（假设数据库路径为 /emby/config/data）**

```bash
# 一键执行（复制整段命令）
cd /emby/config/data && \
sqlite3 playback_reporting.db <<'EOF'
CREATE INDEX IF NOT EXISTS idx_playback_date_user_item ON PlaybackActivity(DateCreated, UserId, ItemId);
CREATE INDEX IF NOT EXISTS idx_playback_item_date ON PlaybackActivity(ItemId, DateCreated);
CREATE INDEX IF NOT EXISTS idx_playback_user_date ON PlaybackActivity(UserId, DateCreated);
SELECT 'Indexes created successfully!' AS status;
SELECT name FROM sqlite_master WHERE type='index' AND tbl_name='PlaybackActivity' AND name LIKE 'idx_playback_%';
EOF
```

---

**❌ 常见错误**

| 错误信息 | 原因 | 解决方法 |
|---------|------|---------|
| `Error: no such table: PlaybackActivity` | 数据库路径错误或 Playback Reporting 插件未安装 | 检查数据库路径，确认 Emby 已安装该插件 |
| `Error: attempt to write a readonly database` | 在容器内执行了命令 | 必须在宿主机上执行 |
| `bash: sqlite3: command not found` | 系统未安装 sqlite3 | 安装：`apt install sqlite3` 或 `yum install sqlite` |
| 权限不足 | 没有数据库文件的写权限 | 使用 `sudo` 或切换到有权限的用户 |

---

**🔧 备用方法：使用工具脚本（需要临时改为读写挂载）**

如果你想使用自带的 Python 脚本，需要临时修改挂载权限：

```bash
# 1. 停止容器
docker compose down

# 2. 修改 docker-compose.yml，将 :ro 改为 :rw（或删除 :ro）
# 示例：- /emby/config/data:/data:ro  →  - /emby/config/data:/data

# 3. 重启容器
docker compose up -d

# 4. 使用脚本创建索引
docker exec emby-stats python /app/tools/add_playback_indexes.py /data/playback_reporting.db

# 5. 改回只读挂载
# 修改 docker-compose.yml，将 :rw 改回 :ro
docker compose restart
```

**⚠️ 不推荐此方法**，因为读写挂载可能影响 Emby 数据安全。

#### 优化脚本说明

脚本会创建以下三个索引：

| 索引名称 | 列 | 用途 |
|---------|---|------|
| `idx_playback_date_user_item` | DateCreated, UserId, ItemId | 用于按日期范围+用户+内容查询 |
| `idx_playback_item_date` | ItemId, DateCreated | 用于内容聚合统计 |
| `idx_playback_user_date` | UserId, DateCreated | 用于用户活跃度查询 |

**脚本特性：**
- 自动检查已存在的索引，避免重复创建
- 显示数据库记录数和预计创建时间
- 实时显示创建进度和耗时
- 创建失败不影响应用运行

#### 验证索引是否创建成功

```bash
# 查看索引列表
sqlite3 /data/playback_reporting.db "SELECT name FROM sqlite_master WHERE type='index' AND tbl_name='PlaybackActivity';"

# 查看索引详情
sqlite3 /data/playback_reporting.db ".indices PlaybackActivity"
```

#### 索引维护建议

- **大数据量定期重建**：当播放记录超过 100 万条时，建议每年重建一次索引以保持最佳性能
- **洗版后重建**：如果进行了大量的剧集洗版操作（使用 Item ID 替换工具），建议重建索引
- **备份数据库**：在执行索引操作前，建议备份数据库文件

```bash
# 备份数据库
cp /data/playback_reporting.db /data/playback_reporting.db.backup

# 重建索引（删除旧索引后重新创建）
sqlite3 /data/playback_reporting.db "DROP INDEX IF EXISTS idx_playback_date_user_item;"
sqlite3 /data/playback_reporting.db "DROP INDEX IF EXISTS idx_playback_item_date;"
sqlite3 /data/playback_reporting.db "DROP INDEX IF EXISTS idx_playback_user_date;"
python tools/add_playback_indexes.py /data/playback_reporting.db
```

---
## 常见问题

### Q: 如何修改饼图布局？

修改 `frontend-vue/src/components/charts/PieChart.vue`，调整 `legend` 和 `center` 配置。

### Q: 如何添加名称映射？

在前端点击侧边栏的"名称映射"按钮，或直接编辑 `/config/name_mappings.json`。

### Q: 如何配置 Telegram 代理？

在报告配置页面的 Telegram 设置中填写代理地址：
- HTTP 代理：`http://127.0.0.1:7890`
- SOCKS5 代理：`socks5://127.0.0.1:1080`

### Q: PWA 更新后为什么还显示旧版本？

清除浏览器缓存或卸载 PWA 重新安装。Service Worker 会自动清理旧缓存；若只是 favicon 没更新，通常需要强制刷新（Ctrl+F5）或清除站点数据，并确认 `frontend-vue/index.html` 里的 `?v=版本号` 已更新。

### Q: 切换服务器后海报无法显示？

确保 v2.26+ 版本，海报 URL 已包含 server_id 参数。

### Q: 侧边栏导航高亮不准确？

v2.27.12+ 已修复。早期版本中，由于根路径 `/` 会被所有路由匹配，导致总览菜单项始终高亮。现在使用精确匹配 (`isActiveRoute` 函数) 来判断当前激活的菜单项。

---

## 故障排除

| 问题 | 可能原因 | 解决方案 |
|------|---------|---------|
| 无法登录 | Emby 服务器不可达 | 检查 `EMBY_URL` 配置 |
| 数据为空 | 数据库路径错误 | 检查数据库文件是否存在 |
| 海报不显示 | API Key 无效或多服务器问题 | 检查 API Key 和版本 |
| 报告发送失败 | TG Bot Token 错误 | 检查 Bot 配置和网络 |
| PWA 登录循环 | Service Worker 拦截 API | 升级到 v2.23+ |
| 侧边栏导航高亮异常 | 根路径匹配问题 | 升级到 v2.27.12+ |

### 日志查看

```bash
# Docker 容器日志
docker logs emby-stats

# 实时查看日志
docker logs -f emby-stats
```

---

## 贡献指南

### 代码风格

**Python：**
- 使用 4 空格缩进
- 函数和类使用 docstring 注释
- 异步函数使用 `async/await`

**TypeScript/Vue：**
- 使用 2 空格缩进
- 使用 Composition API `<script setup>` 语法
- 组件使用 PascalCase 命名
- 类型定义使用 TypeScript interface

### 提交规范

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

---

## 技术债务和改进方向

- [ ] 图表数据缓存优化
- [ ] 更多图表类型支持
- [ ] 移动端体验优化
- [ ] 多语言支持
- [ ] 更多推送渠道（邮件、企业微信等）
- [ ] 数据导出功能
- [ ] 更细粒度的权限控制
