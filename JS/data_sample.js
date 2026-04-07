export const users = [
  {
    id: 1,
    firstname: "Nguyễn",
    lastname: "Minh Hiếu",
    email: "minhhieu19692016@gmail.com",
    password: "Minhhieu1109@",
    role: "admin",
    avatar: "https://i.pravatar.cc/150?u=1",
    status: "active",
  },
  {
    id: 2,
    firstname: "Lê",
    lastname: "Minh Thu",
    email: "minhthu@gmail.com",
    password: "Minhthu1111@",
    role: "user",
    avatar: "https://i.pravatar.cc/150?u=2",
    status: "active",
  },
  {
    id: 3,
    firstname: "Vũ",
    lastname: "Hồng Vân",
    email: "hongvan@yahoo.com",
    password: "Hongvan1110@",
    role: "user",
    avatar: "https://i.pravatar.cc/150?u=3",
    status: "active",
  },
];

export const articles = [
  {
    id: 1,
    authorId: 2,
    title: "Deadline đầu tiên của kỳ học",
    entries: "Personal Thoughts",
    content:
      "Hôm nay mình vừa nộp xong bài tập lớn. Mệt nhưng thấy rất nhẹ nhõm!",
    mood: "stressed",
    status: "private",
    image: "../ASSET/images/first_deadline.jpg",
    date: "23/2/2025 15:30:05",
  },
  {
    id: 2,
    authorId: 2,
    title: "Cà phê chiều chủ nhật",
    entries: "Daily Journal",
    content:
      "Ngồi một mình trong quán quen, nghe nhạc lofi và viết vài dòng nhật ký...",
    mood: "relaxed",
    status: "public",
    image: "../ASSET/images/cafe.jpg",
    date: "15/3/2025 14:30:00",
  },
];

export const entries = [
  {
    id: 1,
    categoryName: "Personal Thoughts",
  },
  {
    id: 2,
    categoryName: "Daily Journal",
  },
  {
    id: 1,
    categoryName: "Work & Career",
  },
  {
    id: 1,
    categoryName: "Emotions & Feelings",
  },
];
