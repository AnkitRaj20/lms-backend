<!-- # 🎓 LMS Backend API

Welcome to the backend of a full-featured **Learning Management System (LMS)**. This API allows users to register, enroll in courses, track their progress, and for instructors to create and manage courses. It also includes a complete **payment system via Razorpay**.

---

## 🚀 Features

- 🧑‍🎓 User Registration & Authentication (JWT)
- 👨‍🏫 Role-based Access Control (Student / Instructor)
- 📦 Course Management (Create, Update, View)
- 🎥 Lecture Upload & Management
- 💳 Course Purchase via Razorpay
- ⭐ Course Reviews & Ratings
- 📈 Progress Tracking & Completion
- 📤 File Uploads (Multer for avatar, thumbnails, lectures)
- 🛡️ Secure API with protected routes and middleware
- ✅ Health Check Endpoint

---

## 🛠️ Tech Stack

- **Node.js** + **Express.js**
- **MongoDB** + **Mongoose**
- **JWT** for authentication
- **Razorpay** for payments
- **Multer** for file uploads
- **Bcrypt** for password hashing
- **Cloudinary / Local Storage** (depending on configuration)

---
## 🧪 Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | API health check endpoint |


---



## 🛡️ Middleware

- `verifyToken` – Verifies JWT tokens for protected routes.
- `restrictTo(Role)` – Restricts routes based on user role (e.g., `INSTRUCTOR`).
- `upload.single(field)` – Handles file uploads (avatar, thumbnail, lecture).

---

## 📂 File Upload Fields

| Field | Description |
|-------|-------------|
| `avatar` | User profile picture |
| `thumbnail` | Course thumbnail |
| `video` | Lecture video |

---
## 🔐 Authentication & User Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/users/register` | Register a new user |
| `POST` | `/api/users/login` | Log in a user |
| `GET` | `/api/users/logout` | Log out the current user (requires auth) |
| `GET` | `/api/users/` | Get current user profile (requires auth) |
| `PATCH` | `/api/users/` | Update profile (requires auth & avatar upload) |
| `PATCH` | `/api/users/change-password` | Change password (requires auth) |

---

## 🧾 Course Purchase (Razorpay Integration)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/purchase/checkout` | Create a Razorpay order (requires auth) |
| `POST` | `/api/purchase/verify` | Verify Razorpay payment (requires auth) |
| `GET` | `/api/purchase/:courseId/detail-with-status` | Check purchase status of a course (requires auth) |
| `GET` | `/api/purchase/` | Get list of all purchased courses by user (requires auth) |

---

## 📚 Course Management

### 📢 Public Course Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/courses/published` | View all published courses |
| `GET` | `/api/courses/search` | Search for courses by keyword, category, etc. |

### 🔐 Protected Course Endpoints

> All routes below require authentication. Routes marked with 👨‍🏫 require the user to be an **instructor**.

#### Course Creation & Listing

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/courses/` | 👨‍🏫 Create a new course (thumbnail upload) |
| `GET` | `/api/courses/` | 👨‍🏫 Get list of instructor's courses |

#### Course Details

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/courses/:id` | Get course details |
| `PATCH` | `/api/courses/:id` | 👨‍🏫 Update course details |

#### Lecture Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/courses/:id/lectures` | Get lectures for a course |
| `POST` | `/api/courses/:id/lectures` | 👨‍🏫 Add a new lecture (video upload) |

#### Course Reviews

| Method | Endpoint | Description |
|--------|----------|-------------|
| `PATCH` | `/api/courses/review/:courseId` | Add or update course review (requires auth) |

---

## 📈 Course Progress Tracking

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/progress/:courseId` | Get course progress (requires auth) |
| `PATCH` | `/api/progress/:courseId/lectures/:lectureId` | Update progress for a lecture |
| `PATCH` | `/api/progress/:courseId/complete` | Mark course as completed |
| `PATCH` | `/api/progress/:courseId/reset` | Reset course progress |

---

## ⚙️ Environment Variables

Create a `.env` file with the following:

```env
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
RAZORPAY_KEY_ID=your_key_id
RAZORPAY_KEY_SECRET=your_key_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret -->



# 🎓 LMS Backend – Node.js + MongoDB

A full-featured **Learning Management System (LMS)** backend built with **Node.js**, **Express**, and **MongoDB**. Designed to be secure, scalable, and extensible, this project provides RESTful APIs for user management, course handling, lecture uploads, payments, and progress tracking.

---

## 🛠️ Tech Stack

- **Backend:** Node.js, Express.js
- **Database:** MongoDB, Mongoose
- **Authentication:** JWT (JSON Web Token)
- **Payment Gateway:** Razorpay
- **File Uploads:** Multer
- **Media Storage:** Cloudinary / Local Storage (configurable)
- **Password Security:** Bcrypt
- **Logging:** Winston + Morgan
- **Security:** Helmet, HPP, Express Rate Limit, CORS

---

## ✅ Features

- JWT Authentication with role-based access control (`ADMIN`, `INSTRUCTOR`, `STUDENT`)
- RESTful APIs for Courses, Lectures, Progress, Payments, and Wishlists
- Certificate generation after course completion
- Secure password handling with Bcrypt
- Course purchase and payment verification using `Razorpay`
- File uploads (avatars, thumbnails, videos) with Cloudinary/Multer
- Course progress tracking and reviews
- Global error handling with logging to `error.log`
- Activity logging to `server.log`
- Admin dashboard analytics (`revenue, users, courses`)
- Production-grade security (`rate limiting, headers, etc.`)

---

## 📦 Installation

```bash
git clone https://github.com/AnkitRaj20/lms-backend.git
cd lms-backend
npm install
```


## ⚙️ Environment Variables

Create a `.env` file with the following:

```env
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
RAZORPAY_KEY_ID=your_key_id
RAZORPAY_KEY_SECRET=your_key_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret 
```

# 📁 File Uploads
| Field       | Purpose            |
| ----------- | ------------------ |
| `avatar`    | User profile image |
| `thumbnail` | Course cover image |
| `video`     | Lecture video file |

# 🧪 API Health Check

| Method  | Endpoint                     | Description                     |
| ------- | ---------------------------- | ------------------------------- |
| `GET`  | `/api/health`        | Get Health Details


# 🛡️ Middleware

| Middleware             | Purpose                               |
| ---------------------- | ------------------------------------- |
| `verifyToken`          | Authenticates JWT tokens              |
| `restrictTo("ROLE")`   | Role-based access control             |
| `upload.single(field)` | Handles file uploads with Multer      |
| `helmet()`             | Sets secure HTTP headers              |
| `hpp()`                | Prevents HTTP parameter pollution     |
| `rateLimit()`          | Protects API from brute force attacks |
| `morgan()`             | Logs request data                     |
| `winston()`            | Logs errors and server info to files  |


# 🗃️ Logging

API Logs: stored in server.log

Error Logs: stored in error.log

# 🌐 Security Enhancements

Helmet – Secure HTTP headers

HPP – Prevent parameter pollution attacks

Rate Limiting – Limits repeated requests

CORS – Configured for cross-origin requests





# 🔐 Authentication Routes

| Method | Endpoint                       | Description                |
| ------ | ------------------------------ | -------------------------- |
| POST   | `/api/v1/user/register`        | Register new user          |
| POST   | `/api/v1/user/login`           | Login existing user        |
| GET    | `/api/v1/user/logout`          | Logout user                |
| GET    | `/api/v1/user/`                | Get logged-in user profile |
| PATCH  | `/api/v1/user/`                | Update user profile        |
| PATCH  | `/api/v1/user/change-password` | Change user password       |



# 📚 Course Management

## Public Access

| Method | Endpoint                   | Description                         |
| ------ | -------------------------- | ----------------------------------- |
| GET    | `/api/v1/course/published` | List all published courses          |
| GET    | `/api/v1/course/search`    | Search courses by keyword, category |



## Instructor-Only

| Method | Endpoint                      | Description                   |
| ------ | ----------------------------- | ----------------------------- |
| POST   | `/api/v1/course/`             | Create a new course           |
| GET    | `/api/v1/course/`             | List instructor's own courses |
| PATCH  | `/api/v1/course/:id`          | Update course details         |
| GET    | `/api/v1/course/:id/lectures` | Get all lectures for a course |
| POST   | `/api/v1/course/:id/lectures` | Add a new lecture to a course |



# 💬 Course Ratings

| Method | Endpoint                          | Description                   |
| ------ | --------------------------------- | ----------------------------- |
| PATCH  | `/api/v1/course/review/:courseId` | Add or update a course review |



# 💳 Course Purchase (Razorpay Integration)

| Method | Endpoint                                        | Description                       |
| ------ | ----------------------------------------------- | --------------------------------- |
| POST   | `/api/v1/purchase/checkout`                     | Initiate a Razorpay order         |
| POST   | `/api/v1/purchase/verify`                       | Verify Razorpay payment           |
| GET    | `/api/v1/purchase/:courseId/detail-with-status` | Get course purchase status        |
| GET    | `/api/v1/purchase/`                             | Get all purchased courses by user |


# 📈 Progress Tracking & Certificate

| Method | Endpoint                                               | Description                           |
| ------ | ------------------------------------------------------ | ------------------------------------- |
| GET    | `/api/v1/courseProgress/:courseId`                     | Get course progress                   |
| PATCH  | `/api/v1/courseProgress/:courseId/lectures/:lectureId` | Mark lecture as completed             |
| PATCH  | `/api/v1/courseProgress/:courseId/complete`            | Mark entire course as completed       |
| PATCH  | `/api/v1/courseProgress/:courseId/reset`               | Reset course progress                 |
| GET    | `/api/v1/courseProgress/certificate/:courseId`         | Generate certificate after completion |


# 💖 Wishlist

| Method | Endpoint                     | Description                      |
| ------ | ---------------------------- | -------------------------------- |
| POST   | `/api/v1/wishlist/:courseId` | Add course to wishlist           |
| GET    | `/api/v1/wishlist/:courseId` | Get wishlist status for a course |
| DELETE | `/api/v1/wishlist/:courseId` | Remove course from wishlist      |


# 📊 Admin Dashboard

| Method | Endpoint                  | Description                       |
| ------ | ------------------------- | --------------------------------- |
| GET    | `/api/v1/admin/dashboard` | Get system stats and revenue data |
