"use client"

import { useEffect, useState } from "react"
import { useMinIOConfig } from "@/hooks/use-minio-config"
import { listBuckets, listObjects, createMinIOClient } from "@/lib/minio-client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ServerIcon, Cog6ToothIcon, FolderIcon } from "@heroicons/react/24/outline"
import Link from "next/link"
import { Pie, Bar } from "react-chartjs-2"
import { Chart, ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from "chart.js"

Chart.register(ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

export default function Dashboard() {
  const { config, hasConfig } = useMinIOConfig()
  const [bucketData, setBucketData] = useState<{ name: string; size: number }[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      if (!hasConfig || !config) return
      setLoading(true)
      try {
        createMinIOClient(config)
        const buckets = await listBuckets()
        const data = await Promise.all(
          buckets.map(async (bucket) => {
            try {
              const objects = await listObjects(bucket.name)
              const totalSize = objects.reduce((sum, obj) => sum + (obj.size || 0), 0)
              return { name: bucket.name, size: totalSize / (1024 * 1024) } // MB
            } catch {
              return { name: bucket.name, size: 0 }
            }
          })
        )
        setBucketData(data)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [hasConfig, config])

  const chartData = {
    labels: bucketData.map((b) => b.name),
    datasets: [
      {
        label: "Storage Used (MB)",
        data: bucketData.map((b) => b.size),
        backgroundColor: [
          "#6366f1", "#f59e42", "#10b981", "#ef4444", "#fbbf24", "#3b82f6", "#a78bfa"
        ],
        borderWidth: 1,
      },
    ],
  }

  if (!hasConfig) {
    return (
      <div className="flex items-center justify-center h-full">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <ServerIcon className="h-12 w-12 text-primary mx-auto mb-4" />
            <CardTitle>Welcome to MinIO Client</CardTitle>
            <CardDescription>Configure your MinIO connection to get started</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/settings">
              <Button className="w-full">
                <Cog6ToothIcon className="h-4 w-4 mr-2" />
                Configure Settings
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Connected to {config?.endPoint ?? "Unknown"}
        </p>
      </div>

      {/* Storage Usage Graph */}
      <div className="mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Storage Usage</CardTitle>
            <CardDescription>Shows storage used per bucket (MB)</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div>Loading chart...</div>
            ) : (
              <div className="flex justify-center">
                <div className="w-full max-w-2xl">
                  <Bar
                    data={chartData}
                    options={{
                      responsive: true,
                      plugins: {
                        legend: { display: false },
                        tooltip: {
                          callbacks: {
                            label: ctx => `${ctx.parsed.y.toFixed(2)} MB`
                          }
                        }
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          title: { display: true, text: "MB" }
                        }
                      }
                    }}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center">
              <ServerIcon className="h-5 w-5 mr-2 text-primary" />
              Buckets
            </CardTitle>
            <CardDescription>Manage your S3 buckets</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/buckets">
              <Button variant="outline" className="w-full bg-transparent">
                View Buckets
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center">
              <FolderIcon className="h-5 w-5 mr-2 text-primary" />
              Files
            </CardTitle>
            <CardDescription>Browse and manage files</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/files">
              <Button variant="outline" className="w-full bg-transparent">
                Browse Files
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Cog6ToothIcon className="h-5 w-5 mr-2 text-primary" />
              Settings
            </CardTitle>
            <CardDescription>Configure MinIO connection</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/settings">
              <Button variant="outline" className="w-full bg-transparent">
                Open Settings
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
