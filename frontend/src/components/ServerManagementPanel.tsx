import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus, Trash2, Edit2, Server as ServerIcon, Loader2, Check, FolderOpen } from 'lucide-react'
import { api } from '@/services/api'
import { useServer, type Server } from '@/contexts/ServerContext'
import { FilePickerModal } from './FilePickerModal'

interface ServerManagementPanelProps {
  isOpen: boolean
  onClose: () => void
}

export function ServerManagementPanel({ isOpen, onClose }: ServerManagementPanelProps) {
  const { servers, currentServer, setCurrentServer, refreshServers } = useServer()
  const [isLoading, setIsLoading] = useState(false)
  const [editingServer, setEditingServer] = useState<Server | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    emby_url: '',
    playback_db: '',
    users_db: '',
    auth_db: '',
    emby_api_key: '',
    is_default: false,
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [filePickerOpen, setFilePickerOpen] = useState(false)
  const [filePickerField, setFilePickerField] = useState<'playback_db' | 'users_db' | 'auth_db'>('playback_db')

  useEffect(() => {
    if (!isOpen) {
      setShowAddForm(false)
      setEditingServer(null)
      setFormData({
        name: '',
        emby_url: '',
        playback_db: '',
        users_db: '',
        auth_db: '',
        emby_api_key: '',
        is_default: false,
      })
      setError('')
      setSuccess('')
    }
  }, [isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setIsLoading(true)

    try {
      if (editingServer) {
        // 编辑模式下只发送非空字段，避免覆盖原有的数据库路径
        const updateData: Record<string, any> = {}
        if (formData.name) updateData.name = formData.name
        if (formData.emby_url) updateData.emby_url = formData.emby_url
        if (formData.playback_db) updateData.playback_db = formData.playback_db
        if (formData.users_db) updateData.users_db = formData.users_db
        if (formData.auth_db) updateData.auth_db = formData.auth_db
        if (formData.emby_api_key) updateData.emby_api_key = formData.emby_api_key
        updateData.is_default = formData.is_default
        await api.updateServer(editingServer.id, updateData)
        setSuccess('服务器更新成功')
      } else {
        const result = await api.createServer(formData)
        setSuccess('服务器添加成功')
        // 如果是默认服务器，设置为当前服务器
        if (formData.is_default) {
          await refreshServers()
          const newServer = servers.find(s => s.id === result.server_id) || servers[0]
          if (newServer) {
            setCurrentServer(newServer)
          }
        }
      }
      await refreshServers()
      setTimeout(() => {
        setShowAddForm(false)
        setEditingServer(null)
        setFormData({
          name: '',
          emby_url: '',
          playback_db: '',
          users_db: '',
          auth_db: '',
          emby_api_key: '',
          is_default: false,
        })
      }, 1000)
    } catch (err: any) {
      setError(err.message || '操作失败')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (serverId: string) => {
    if (!confirm('确定要删除这个服务器吗？')) {
      return
    }

    setIsLoading(true)
    setError('')
    try {
      await api.deleteServer(serverId)
      // 如果删除的是当前服务器，切换到默认服务器
      if (currentServer?.id === serverId) {
        const remainingServers = servers.filter(s => s.id !== serverId)
        if (remainingServers.length > 0) {
          const defaultServer = remainingServers.find(s => s.is_default) || remainingServers[0]
          if (defaultServer) {
            setCurrentServer(defaultServer)
          }
        }
      }
      await refreshServers()
      setSuccess('服务器删除成功')
    } catch (err: any) {
      setError(err.message || '删除失败')
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (server: Server) => {
    setEditingServer(server)
    setShowAddForm(true)
    setFormData({
      name: server.name,
      emby_url: server.emby_url,
      playback_db: '', // 这些字段在编辑时不需要显示
      users_db: '',
      auth_db: '',
      emby_api_key: '',
      is_default: server.is_default,
    })
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40"
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-[var(--color-content1)] border-l border-[var(--color-border)] z-50 flex flex-col shadow-2xl backdrop-blur-xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-[var(--color-border)]">
              <div className="flex items-center gap-2">
                <ServerIcon className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold">服务器管理</h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-[var(--color-hover-overlay)] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Messages */}
              {error && (
                <div className="p-3 rounded-lg bg-danger/10 border border-danger/20 text-danger text-sm">
                  {error}
                </div>
              )}
              {success && (
                <div className="p-3 rounded-lg bg-success/10 border border-success/20 text-success text-sm flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  {success}
                </div>
              )}

              {/* Server List */}
              {!showAddForm && (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium">已配置的服务器</h3>
                    <button
                      onClick={() => {
                        setShowAddForm(true)
                        setEditingServer(null)
                        setFormData({
                          name: '',
                          emby_url: '',
                          playback_db: '',
                          users_db: '',
                          auth_db: '',
                          emby_api_key: '',
                          is_default: false,
                        })
                      }}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary text-white text-sm hover:bg-primary/90 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      添加服务器
                    </button>
                  </div>

                  <div className="space-y-2">
                    {servers.map((server) => (
                      <div
                        key={server.id}
                        className={`p-3 rounded-lg border ${
                          currentServer?.id === server.id
                            ? 'border-primary bg-primary/5'
                            : 'border-[var(--color-border)] bg-content1'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium truncate">{server.name}</h4>
                              {server.is_default && (
                                <span className="px-2 py-0.5 text-xs rounded bg-primary/20 text-primary">
                                  默认
                                </span>
                              )}
                              {currentServer?.id === server.id && (
                                <span className="px-2 py-0.5 text-xs rounded bg-success/20 text-success">
                                  当前
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-[var(--color-text-muted)] mt-1 truncate">
                              {server.emby_url}
                            </p>
                          </div>
                          <div className="flex items-center gap-1 ml-2">
                            <button
                              onClick={() => handleEdit(server)}
                              className="p-1.5 rounded hover:bg-[var(--color-hover-overlay)] transition-colors"
                              title="编辑"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            {servers.length > 1 && (
                              <button
                                onClick={() => handleDelete(server.id)}
                                className="p-1.5 rounded hover:bg-danger/10 text-danger transition-colors"
                                title="删除"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* Add/Edit Form */}
              {showAddForm && (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">服务器名称</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-content1 border border-[var(--color-border)] focus:border-primary focus:outline-none"
                      placeholder="例如：主服务器"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Emby 服务器地址</label>
                    <input
                      type="text"
                      value={formData.emby_url}
                      onChange={(e) => setFormData({ ...formData, emby_url: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-content1 border border-[var(--color-border)] focus:border-primary focus:outline-none"
                      placeholder="http://192.168.1.100:8096"
                      required
                    />
                  </div>

                  {!editingServer && (
                    <>
                      <div>
                        <label className="block text-sm font-medium mb-2">播放记录数据库路径</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={formData.playback_db}
                            onChange={(e) => setFormData({ ...formData, playback_db: e.target.value })}
                            className="flex-1 px-3 py-2 rounded-lg bg-content1 border border-[var(--color-border)] focus:border-primary focus:outline-none"
                            placeholder="/data/playback_reporting.db"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setFilePickerField('playback_db')
                              setFilePickerOpen(true)
                            }}
                            className="px-3 py-2 rounded-lg border border-[var(--color-border)] hover:bg-[var(--color-hover-overlay)] transition-colors"
                            title="浏览文件"
                          >
                            <FolderOpen className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">用户数据库路径</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={formData.users_db}
                            onChange={(e) => setFormData({ ...formData, users_db: e.target.value })}
                            className="flex-1 px-3 py-2 rounded-lg bg-content1 border border-[var(--color-border)] focus:border-primary focus:outline-none"
                            placeholder="/data/users.db"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setFilePickerField('users_db')
                              setFilePickerOpen(true)
                            }}
                            className="px-3 py-2 rounded-lg border border-[var(--color-border)] hover:bg-[var(--color-hover-overlay)] transition-colors"
                            title="浏览文件"
                          >
                            <FolderOpen className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">认证数据库路径</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={formData.auth_db}
                            onChange={(e) => setFormData({ ...formData, auth_db: e.target.value })}
                            className="flex-1 px-3 py-2 rounded-lg bg-content1 border border-[var(--color-border)] focus:border-primary focus:outline-none"
                            placeholder="/data/authentication.db"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setFilePickerField('auth_db')
                              setFilePickerOpen(true)
                            }}
                            className="px-3 py-2 rounded-lg border border-[var(--color-border)] hover:bg-[var(--color-hover-overlay)] transition-colors"
                            title="浏览文件"
                          >
                            <FolderOpen className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </>
                  )}

                  <div>
                    <label className="block text-sm font-medium mb-2">API Key（可选）</label>
                    <input
                      type="text"
                      value={formData.emby_api_key}
                      onChange={(e) => setFormData({ ...formData, emby_api_key: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-content1 border border-[var(--color-border)] focus:border-primary focus:outline-none"
                      placeholder="留空则自动从数据库获取"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="is_default"
                      checked={formData.is_default}
                      onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
                      className="w-4 h-4 rounded border-[var(--color-border)]"
                    />
                    <label htmlFor="is_default" className="text-sm">
                      设为默认服务器
                    </label>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddForm(false)
                        setEditingServer(null)
                      }}
                      className="flex-1 px-4 py-2 rounded-lg border border-[var(--color-border)] hover:bg-[var(--color-hover-overlay)] transition-colors"
                    >
                      取消
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex-1 px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          保存中...
                        </>
                      ) : editingServer ? (
                        '更新'
                      ) : (
                        '添加'
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </motion.div>

          {/* File Picker Modal */}
          <FilePickerModal
            open={filePickerOpen}
            onClose={() => setFilePickerOpen(false)}
            onSelect={(path) => {
              setFormData({ ...formData, [filePickerField]: path })
            }}
            initialPath={formData[filePickerField] || '/data'}
            title={
              filePickerField === 'playback_db'
                ? '选择播放记录数据库'
                : filePickerField === 'users_db'
                ? '选择用户数据库'
                : '选择认证数据库'
            }
            description="浏览容器内文件，选择 .db 数据库文件"
          />
        </>
      )}
    </AnimatePresence>
  )
}


