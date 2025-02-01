export interface DeviceInfo {
  name: string
  type: string
  browser: string
  os: string
}

export interface SessionInfo {
  id: string
  lastActive: Date
  current: boolean
  device: DeviceInfo
} 