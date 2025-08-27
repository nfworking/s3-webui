# Modern Storage Web UI

A **modern web interface** for managing storage that is compatible with **MinIO**. Built with **Next.js** and powered by **pnpm** for package management. This project can run locally or in Docker for easy deployment.

---

## Features

- Modern, responsive UI for browsing and managing files
- Compatible with **MinIO** (S3-compatible storage)
- Easily deployable using **Docker** or **docker-compose**
- Lightweight and optimized for performance

---

## Requirements

- Node.js 20+
- pnpm package manager
- Docker (optional)
- Docker Compose (optional)
- MinIO instance or compatible S3 storage

---

## Getting Started (Local Development)

1. Clone the repository:

```
git clone https://github.com/<username>/<repo>.git
cd <repo>
```

2. Install dependencies using pnpm:

```
pnpm install
```

3. Set environment variables (create `.env.local`):

```
NEXT_PUBLIC_MINIO_ENDPOINT=http://localhost:9000
NEXT_PUBLIC_MINIO_ACCESS_KEY=minioaccesskey
NEXT_PUBLIC_MINIO_SECRET_KEY=miniosecretkey
```

4. Start the development server:

```
pnpm run dev
```

5. Open your browser at [http://localhost:3000](http://localhost:3000)

---

## Docker Setup

1. Build the Docker image:

```
docker build -t modern-storage-ui .
```

2. Run the Docker container:

```
docker run -p 3000:3000 modern-storage-ui
```

Your app will be available at [http://localhost:3000](http://localhost:3000).

---

## Docker Compose Setup

1. Create a `docker-compose.yaml` file to run both the web UI and MinIO.

2. Start the services:

```
docker-compose up -d
```

3. Stop the services:

```
docker-compose down
```

Your UI will be available at [http://localhost:3000](http://localhost:3000), and MinIO at [http://localhost:9000](http://localhost:9000).

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m "Add feature"`
4. Push to the branch: `git push origin feature/my-feature`
5. Open a pull request

---

## License

MIT License © [Your Name]

