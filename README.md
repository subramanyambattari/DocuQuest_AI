# DocuQuest AI

A highly scalable Document Processing & Question Extraction Service.

## Architecture Stack
* **Frontend**: Next.js, Tailwind CSS
* **Backend**: Node.js, Express.js, TypeScript
* **Database**: PostgreSQL (via Prisma ORM)
* **Background Workers**: BullMQ with Redis
* **AI Engine**: Google Gemini Vision API
* **Object Storage**: MinIO (S3 Compatible)

## Setup Instructions

### 1. Database & Services
Ensure PostgreSQL, Redis, and MinIO are running on your machine.
Copy the environment variables:
```bash
cp backend/.env.example backend/.env
```

### 2. Install Dependencies
This project uses `concurrently` to run both frontend and backend seamlessly.
```bash
npm install
cd backend
npm install
npx prisma generate
npx prisma migrate dev --name init
cd ../frontend
npm install
```

### 3. Run the application
Run both the API and the Dashboard from the root directory:
```bash
npm run dev
```

### API Postman Collection
Import `postman_collection.json` into Postman to test the Auth and Document Upload endpoints.
