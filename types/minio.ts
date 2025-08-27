export interface MinIOConfig {
  endPoint: string
  port?: number
  useSSL: boolean
  accessKey: string
  secretKey: string
  region?: string
}

export interface MinIOObject {
  name: string
  lastModified: Date
  etag: string
  size: number
  prefix?: string
}

export interface BucketInfo {
  name: string
  creationDate: Date
}

export interface UploadProgress {
  loaded: number
  total: number
  percentage: number
}

export interface MinIOError {
  code: string
  message: string
  resource?: string
}
