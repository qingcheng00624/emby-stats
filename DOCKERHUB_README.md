# Emby Stats

Emby 播放统计分析面板，提供直观的播放数据可视化。

## 功能特性

- **实时播放监控** - 查看当前正在播放的内容
- **播放趋势分析** - 按天/周/月查看播放趋势图表
- **热门内容排行** - 剧集、电影播放次数和时长排名
- **用户统计** - 各用户播放时长和次数统计
- **设备/客户端统计** - 播放设备和客户端分布
- **播放历史** - 最近播放记录查询
- **PWA 支持** - 可添加到主屏幕作为独立应用
- **管理员认证** - 使用 Emby 管理员账号登录保护

## 快速开始

### Docker Compose（推荐）

```yaml
services:
  emby-stats:
    image: qc0624/emby-stats:latest
    container_name: emby-stats
    ports:
      - "8899:8000"
    volumes:
      - /path/to/emby/data:/emby-data:ro
    environment:
      - EMBY_URL=http://your-emby-server:8096
      - EMBY_API_KEY=your_api_key  # 可选
      - TZ=Asia/Shanghai
    restart: unless-stopped
```

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

## 环境变量

| 变量 | 必填 | 默认值 | 说明 |
|------|------|--------|------|
| `EMBY_URL` | 是 | - | Emby 服务器地址（如 `http://192.168.1.100:8096`） |
| `EMBY_API_KEY` | 否 | - | Emby API Key（不填则自动从数据库获取） |
| `TZ` | 否 | `UTC` | 时区设置（如 `Asia/Shanghai`） |
| `MIN_PLAY_SECONDS` | 否 | `60` | 最小播放秒数，低于此值不计入统计 |

## 数据目录

需要将 Emby 的数据目录挂载到容器的 `/emby-data`（只读即可）：

```
/emby-data
├── data/
│   └── playback_reporting.db    # 播放记录数据库（必需）
└── config/
    └── authentication.db        # 用于获取 API Key（可选）
```

> 播放统计依赖 Emby 的 Playback Reporting 插件，请确保已安装并启用。

## 登录认证

访问面板需要使用 **Emby 管理员账号** 登录。普通用户无法访问，确保统计数据安全。

## 截图

访问 `http://your-server:8899` 即可查看统计面板。

## 常见问题

**Q: 显示无数据？**
A: 请确认 Emby 已安装 Playback Reporting 插件，并且有播放记录。

**Q: 无法登录？**
A: 请使用 Emby 管理员账号登录，普通用户无权访问。

**Q: 海报不显示？**
A: 检查 `EMBY_URL` 是否正确配置，容器需要能访问 Emby 服务器。

## License

MIT
