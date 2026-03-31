// JS/data_sample.js

// Dữ liệu mẫu cho người dùng (Dựa trên ảnh 1)
export const users = [
    {
        id: 1,
        firstname: "Lê",
        lastname: "Minh Thu",
        email: "minhthu@gmail.com",
        password: "123456",
    },
    {
        id: 2,
        firstname: "Vũ",
        lastname: "Hồng Vân",
        email: "hongvan@yahoo.com",
        password: "abc123",
    },
];

// Dữ liệu mẫu cho bài viết (Dựa trên ảnh 2)
export const articles = [
    {
        id: 1,
        title: "Deadline đầu tiên của kỳ học",
        entries: "Nhật ký học tập",
        content: "Hôm nay mình vừa nộp xong bài tập lớn. Mệt nhưng thấy rất nhẹ nhõm!",
        mood: "Căng thẳng",
        status: "Riêng tư",
        image: "image1.jpg",
        date: "2025-02-23",
    },
    {
        id: 2,
        title: "Cà phê chiều chủ nhật",
        entries: "Nhật ký trải nghiệm - học qua đời sống",
        content: "Ngồi một mình trong quán quen, nghe nhạc lofi và viết vài dòng nhật ký...",
        mood: "Thư giãn",
        status: "Công khai",
        image: "image2.jpg",
        date: "2025-03-15",
    },
];

// Dữ liệu mẫu cho danh mục (Entries - Dựa trên cột "Entries" ở ảnh 2)
export const entries = [
    {
        id: 1,
        categoryName: "Nhật ký học tập",
    },
    {
        id: 2,
        categoryName: "Nhật ký trải nghiệm - học qua đời sống",
    },
];