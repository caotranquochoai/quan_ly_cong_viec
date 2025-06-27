# Task Scheduler

Task Scheduler là một ứng dụng mạnh mẽ và linh hoạt được thiết kế để giúp bạn quản lý các công việc định kỳ và lời nhắc một cách dễ dàng. Nó có giao diện thân thiện với người dùng, backend mạnh mẽ và nhiều tính năng để giúp bạn luôn có tổ chức và đi đúng hướng.

## Tính năng

-   **Quản lý công việc:** Tạo, chỉnh sửa, xóa và đánh dấu công việc là đã hoàn thành.
-   **Công việc định kỳ:** Thiết lập công việc lặp lại hàng ngày, hàng tuần hoặc hàng tháng.
-   **Lời nhắc:** Nhận thông báo trước khi công việc của bạn đến hạn.
-   **Chế độ xem lịch:** Trực quan hóa các công việc của bạn ở định dạng lịch.
-   **Lịch âm:** Xem và tương tác với ngày tháng ở cả định dạng Dương lịch và Âm lịch.
-   **Xác thực người dùng:** Hệ thống đăng ký và đăng nhập người dùng an toàn.
-   **Bảng điều khiển quản trị:** Một bảng điều khiển toàn diện để quản trị viên quản lý người dùng, công việc và cài đặt ứng dụng.
-   **Thông báo qua email:** Nhận lời nhắc qua email cho các công việc của bạn và xác minh địa chỉ email của bạn.
-   **Hỗ trợ đa ngôn ngữ:** Có sẵn bằng tiếng Anh, tiếng Việt và tiếng Trung.

## Công nghệ sử dụng

-   **Framework:** [Next.js](https://nextjs.org/)
-   **Ngôn ngữ:** [TypeScript](https://www.typescriptlang.org/)
-   **Giao diện:** [Tailwind CSS](https://tailwindcss.com/) với [Shadcn UI](https://ui.shadcn.com/)
-   **Cơ sở dữ liệu:** [MySQL](https://www.mysql.com/)
-   **Xác thực:** [JWT](https://jwt.io/)
-   **Email:** [Nodemailer](https://nodemailer.com/)
-   **Quản lý gói:** [npm](https://www.npmjs.com/)

## Bắt đầu

### Yêu cầu

-   [Node.js](https://nodejs.org/) (phiên bản 18 trở lên)
-   [npm](https://www.npmjs.com/) (đi kèm với Node.js)
-   Một instance [MySQL](https://www.mysql.com/) đang chạy

### Cài đặt

1.  **Sao chép kho lưu trữ:**
    ```bash
    git clone https://your-repository-url.git
    cd task-scheduler
    ```

2.  **Cài đặt các dependencies:**
    ```bash
    npm install
    ```

### Cấu hình môi trường

Tạo một tệp `.env.local` trong thư mục gốc của dự án và thêm các biến môi trường sau. Thay thế các giá trị giữ chỗ bằng thông tin xác thực thực tế của bạn.

```
# URL ứng dụng
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Thông tin đăng nhập cơ sở dữ liệu
DB_HOST=your_database_host
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_DATABASE=your_database_name

# Thông tin đăng nhập quản trị cho ứng dụng
ADMIN_USERNAME=your_admin_username
ADMIN_PASSWORD=your_admin_password

# Thông tin đăng nhập SMTP để gửi email
SMTP_HOST=your_smtp_host
SMTP_PORT=your_smtp_port
SMTP_USER=your_smtp_user
SMTP_PASSWORD=your_smtp_password

# Tên miền cho các liên kết email
DOMAIN=your_domain.com
```

### Khởi tạo cơ sở dữ liệu

Chạy lệnh sau để tạo các bảng cần thiết trong cơ sở dữ liệu của bạn:

```bash
node scripts/init-database.js
```

Tập lệnh này cũng sẽ tạo một người dùng quản trị mặc định và một người dùng mẫu.

### Chạy ứng dụng

-   **Chế độ phát triển:**
    ```bash
    npm run dev
    ```
    Ứng dụng sẽ có sẵn tại `http://localhost:3000`.

-   **Chế độ production:**
    ```bash
    npm run build
    npm start
    ```

## Sử dụng

-   **Người dùng:** Đăng ký một tài khoản mới hoặc đăng nhập bằng một tài khoản hiện có để bắt đầu quản lý công việc của bạn.
-   **Quản trị viên:** Truy cập bảng điều khiển quản trị tại `/admin` và đăng nhập bằng thông tin đăng nhập quản trị bạn đã đặt trong tệp `.env.local`.

## Đóng góp

Chào mừng các đóng góp! Vui lòng gửi một pull request hoặc mở một issue.