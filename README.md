# Online Voting System Using Blockchain

![Banner](docs/banner.png)

Hệ thống bầu cử trực tuyến sử dụng **Blockchain**, **Smart Contract Solidity**, **MetaMask**, **Node.js/Express** và **MySQL**. Dự án tập trung vào tính minh bạch, hạn chế gian lận và hỗ trợ luồng bầu cử từ đăng ký cử tri, xác thực OTP, bỏ phiếu cho tới xem kết quả.

## Tổng Quan

Ứng dụng được xây dựng theo mô hình kết hợp:

- **Blockchain** để lưu logic bầu cử và kết quả bỏ phiếu.
- **Web app** để người dùng và quản trị viên thao tác với hệ thống.
- **MySQL** để lưu thông tin đăng ký, cử tri và ứng viên ở tầng ứng dụng.

## Tính Năng Chính

- Đăng ký tài khoản người dùng và đăng nhập.
- Đăng ký cử tri với xác thực OTP qua email.
- Quản trị viên thêm ứng viên vào hệ thống.
- Cử tri bỏ phiếu thông qua **MetaMask**.
- Chuyển trạng thái bầu cử theo 3 giai đoạn:
  - Đăng ký
  - Bỏ phiếu
  - Kết thúc
- Xem danh sách ứng viên và kết quả bầu cử.
- Giao diện quản trị riêng cho các thao tác điều hành.

## Công Nghệ Sử Dụng

- **Solidity 0.5.x**
- **Truffle**
- **Ganache**
- **MetaMask**
- **Node.js**
- **Express.js**
- **EJS**
- **MySQL / MySQL2**
- **Web3 / Ethers**

## Cấu Trúc Dự Án

- `contracts/`: Smart contract Solidity.
- `migrations/`: Script deploy contract.
- `routes/`: Route backend Express.
- `src/`: Giao diện, CSS, JS, EJS, HTML.
- `build/contracts/`: ABI và artifact sau khi compile/deploy.
- `docs/banner.png`: Ảnh banner dùng trong README.

## Yêu Cầu Trước Khi Chạy

- Node.js và npm
- Truffle
- Ganache
- MetaMask trên trình duyệt
- MySQL đang chạy cục bộ hoặc từ xa

## Cài Đặt

1. Clone repository:

```bash
git clone https://github.com/<your-username>/Online-Voting-System-Using-Blockchain.git
cd Online-Voting-System-Using-Blockchain
```

2. Cài đặt dependencies:

```bash
npm install
```

3. Khởi động Ganache và tạo một blockchain local.

4. Compile và deploy smart contract:

```bash
truffle compile
truffle migrate --reset
```

5. Cấu hình MetaMask:
- Thêm network local của Ganache.
- Import một vài account test từ Ganache để thử nghiệm.

6. Cập nhật cấu hình MySQL và email nếu cần:
- [`database.js`](database.js)
- [`routes/main.js`](routes/main.js)

## Chạy Ứng Dụng

```bash
npm run dev
```

Ứng dụng sẽ được chạy bằng `lite-server` với cấu hình trong `bs-config.js`.

## Luồng Sử Dụng

1. Đăng ký tài khoản người dùng.
2. Đăng nhập vào hệ thống.
3. Đăng ký cử tri và xác thực OTP.
4. Admin đăng nhập và thêm ứng viên.
5. Admin chuyển trạng thái sang giai đoạn bỏ phiếu.
6. Cử tri kết nối MetaMask và thực hiện bỏ phiếu.
7. Admin kết thúc bầu cử.
8. Người dùng xem kết quả.

## Lưu Ý

- Smart contract chỉ cho phép admin thực hiện các thao tác quản trị.
- Ứng viên chỉ được thêm trong giai đoạn đăng ký.
- Cử tri phải được đăng ký trước khi bỏ phiếu.
- Một số thông tin cấu hình hiện đang được hardcode trong code nguồn, nên bạn nên thay bằng biến môi trường nếu muốn triển khai thực tế.

## Demo

Video demo: [https://bit.ly/subscribetoxoandev](https://bit.ly/subscribetoxoandev)

## Tác Giả / Liên Hệ

- Email: `xoandev163@gmail.com`
- GitHub: `https://github.com/NguyenNhatHuynh`
- YouTube: [https://bit.ly/subscribetoxoandev](https://bit.ly/subscribetoxoandev)

## License

Dự án sử dụng giấy phép `MIT`. Xem chi tiết trong file [`LICENSE`](LICENSE).
