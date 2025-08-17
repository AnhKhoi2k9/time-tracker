# Time Tracker - Hệ thống quản lý thời gian

## Tính năng mới: Đăng nhập/Đăng ký bằng Google

### Mô tả
Hệ thống đã được cập nhật để hỗ trợ đăng nhập và đăng ký bằng Google, giúp người dùng dễ dàng truy cập mà không cần tạo tài khoản mới.

### Các tính năng đã thêm

#### 1. Đăng nhập bằng Google
- Nút "Đăng nhập với Google" trên trang đăng nhập
- Tự động lấy thông tin profile từ Google (tên, email, ảnh đại diện)
- Lưu thông tin người dùng vào Firebase Authentication và Firestore

#### 2. Đăng ký bằng Google
- Nút "Đăng ký với Google" trên trang đăng ký
- Tự động tạo tài khoản mới với thông tin từ Google
- Lưu thông tin vào hệ thống

#### 3. Hiển thị thông tin người dùng trên Profile
- Hiển thị tên người dùng từ Google
- Hiển thị ảnh đại diện từ Google
- Lưu và hiển thị bio cá nhân
- Quản lý notes cá nhân
- Lưu trữ dữ liệu vào Firestore

#### 4. Chức năng đăng xuất
- Nút đăng xuất trên trang profile
- Xóa session và chuyển hướng về trang đăng nhập

### Cách sử dụng

#### Đăng nhập bằng Google
1. Truy cập trang đăng nhập (`login.html`)
2. Nhấn nút "Đăng nhập với Google"
3. Chọn tài khoản Google của bạn
4. Cho phép quyền truy cập
5. Hệ thống sẽ tự động chuyển hướng đến dashboard

#### Đăng ký bằng Google
1. Truy cập trang đăng ký (`register.html`)
2. Nhấn nút "Đăng ký với Google"
3. Chọn tài khoản Google của bạn
4. Cho phép quyền truy cập
5. Hệ thống sẽ tự động tạo tài khoản và chuyển hướng

#### Xem thông tin profile
1. Sau khi đăng nhập, truy cập trang profile
2. Thông tin từ Google sẽ được hiển thị tự động
3. Có thể chỉnh sửa tên và bio
4. Thêm/xóa notes cá nhân
5. Tất cả thay đổi sẽ được lưu vào Firestore

### Cấu hình Firebase

Đảm bảo rằng Firebase project của bạn đã được cấu hình:

1. **Authentication**: Bật Google Sign-in provider
2. **Firestore**: Tạo collection "users" để lưu thông tin người dùng
3. **Security Rules**: Cấu hình quyền truy cập phù hợp

### Cấu trúc dữ liệu

#### User Document trong Firestore
```json
{
  "uid": "user_id_from_firebase_auth",
  "email": "user@example.com",
  "displayName": "Tên người dùng",
  "photoURL": "https://lh3.googleusercontent.com/...",
  "providerId": "google.com",
  "role_id": 2,
  "balance": 0,
  "bio": "Bio cá nhân",
  "notes": ["Note 1", "Note 2"],
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### Lưu ý bảo mật

1. **Popup Blocker**: Người dùng cần cho phép popup cho trang web
2. **HTTPS**: Chức năng Google Auth yêu cầu HTTPS trong production
3. **Domain Verification**: Đảm bảo domain được thêm vào Firebase Console

### Xử lý lỗi

Hệ thống đã được cập nhật để xử lý các lỗi phổ biến:

- Popup bị chặn
- Người dùng hủy đăng nhập
- Lỗi mạng
- Tài khoản đã tồn tại
- Quyền truy cập bị từ chối

### Tương lai

Có thể mở rộng thêm:
- Đăng nhập bằng Facebook, GitHub
- Two-factor authentication
- Social login với các provider khác
- Profile picture upload
- Email verification

---

**Lưu ý**: Đảm bảo rằng tất cả các file JavaScript đều được cập nhật và Firebase project đã được cấu hình đúng cách.
