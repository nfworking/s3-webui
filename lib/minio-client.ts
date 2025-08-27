import type { MinIOConfig, MinIOObject, BucketInfo } from "@/types/minio"

export function createMinIOClient(config: MinIOConfig): void {
  // This is a no-op function for client-side compatibility
  // The actual MinIO client is created on the server side
  console.log("MinIO client configuration set for server-side operations")
}

export async function testConnection(config: MinIOConfig): Promise<boolean> {
  const response = await fetch("/api/minio/test", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(config),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || "Connection test failed")
  }

  return response.json()
}

export async function listBuckets(): Promise<BucketInfo[]> {
  const response = await fetch("/api/minio/buckets")

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || "Failed to list buckets")
  }

  return response.json()
}

export async function listObjects(bucketName: string, prefix?: string): Promise<MinIOObject[]> {
  const url = new URL("/api/minio/objects", window.location.origin)
  url.searchParams.set("bucket", bucketName)
  if (prefix) url.searchParams.set("prefix", prefix)

  const response = await fetch(url)

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || "Failed to list objects")
  }

  return response.json()
}

export async function uploadFile(
  bucketName: string,
  objectName: string,
  file: File,
  onProgress?: (progress: { loaded: number; total: number; percentage: number }) => void,
): Promise<void> {
  const formData = new FormData()
  formData.append("file", file)
  formData.append("bucket", bucketName)
  formData.append("objectName", objectName)

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()

    if (onProgress) {
      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
          const percentage = Math.round((e.loaded / e.total) * 100)
          onProgress({ loaded: e.loaded, total: e.total, percentage })
        }
      })
    }

    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve()
      } else {
        try {
          const error = JSON.parse(xhr.responseText)
          reject(new Error(error.message || "Upload failed"))
        } catch {
          reject(new Error("Upload failed"))
        }
      }
    })

    xhr.addEventListener("error", () => {
      reject(new Error("Upload failed"))
    })

    xhr.open("POST", "/api/minio/upload")
    xhr.send(formData)
  })
}

export async function downloadFile(bucketName: string, objectName: string): Promise<Blob> {
  const url = new URL("/api/minio/download", window.location.origin)
  url.searchParams.set("bucket", bucketName)
  url.searchParams.set("object", objectName)

  const response = await fetch(url)

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || "Download failed")
  }

  return response.blob()
}

export async function deleteObject(bucketName: string, objectName: string): Promise<void> {
  const response = await fetch("/api/minio/objects", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ bucket: bucketName, object: objectName }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || "Delete failed")
  }
}

export async function createBucket(bucketName: string, region?: string): Promise<void> {
  const response = await fetch("/api/minio/buckets", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: bucketName, region }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || "Failed to create bucket")
  }
}

export async function deleteBucket(bucketName: string): Promise<void> {
  const response = await fetch("/api/minio/buckets", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: bucketName }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || "Failed to delete bucket")
  }
}

export async function bucketExists(bucketName: string): Promise<boolean> {
  const response = await fetch(`/api/minio/buckets/${bucketName}/exists`)

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || "Failed to check bucket")
  }

  return response.json()
}

export async function getBucketLocation(bucketName: string): Promise<string> {
  const response = await fetch(`/api/minio/buckets/${bucketName}/location`)

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || "Failed to get bucket location")
  }

  return response.json()
}

export async function copyObject(
  sourceBucket: string,
  sourceObject: string,
  destBucket: string,
  destObject: string,
): Promise<void> {
  const response = await fetch("/api/minio/copy", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      sourceBucket,
      sourceObject,
      destBucket,
      destObject,
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || "Copy failed")
  }
}
