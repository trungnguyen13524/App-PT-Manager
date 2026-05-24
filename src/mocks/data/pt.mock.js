export const mockStudents = [
  {
    id: 'student-1',
    fullName: 'Trần Văn A',
    email: 'tranvana@example.com',
    avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026024d',
    goal: 'Giảm cân, Tăng cơ',
    weight: '75kg',
    height: '175cm',
    package: 'Gói 3 tháng',
    progress: 45, // percentage
  },
  {
    id: 'student-2',
    fullName: 'Nguyễn Thị B',
    email: 'nguyenthib@example.com',
    avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704d',
    goal: 'Yoga, Giữ dáng',
    weight: '50kg',
    height: '160cm',
    package: 'Gói 1 tháng',
    progress: 80,
  },
  {
    id: 'student-3',
    fullName: 'Lê Hoàng C',
    email: 'lehoangc@example.com',
    avatar: 'https://i.pravatar.cc/150?u=a04258114e29026702d',
    goal: 'Tăng cân',
    weight: '60kg',
    height: '180cm',
    package: 'Gói 6 tháng',
    progress: 15,
  }
];

export const mockCourses = [
  {
    id: 'course-1',
    title: 'Giảm mỡ bụng cấp tốc trong 30 ngày',
    price: 500000,
    studentsCount: 15,
    status: 'ACTIVE',
    thumbnail: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'course-2',
    title: 'Tăng cơ cho người mới bắt đầu',
    price: 800000,
    studentsCount: 8,
    status: 'ACTIVE',
    thumbnail: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'course-3',
    title: 'Dinh dưỡng nền tảng',
    price: 300000,
    studentsCount: 22,
    status: 'DRAFT',
    thumbnail: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=800&q=80',
  }
];

export const mockEarnings = {
  balance: 15500000, // 15.5m VND
  totalEarned: 45000000,
  pendingClearance: 2000000,
  history: [
    {
      id: 'txn-1',
      date: '2026-05-20T10:00:00Z',
      amount: 500000,
      description: 'Trần Văn A mua khóa học',
      type: 'EARNING'
    },
    {
      id: 'txn-2',
      date: '2026-05-18T15:30:00Z',
      amount: 800000,
      description: 'Nguyễn Thị B đăng ký PT',
      type: 'EARNING'
    },
    {
      id: 'txn-3',
      date: '2026-05-15T09:00:00Z',
      amount: -5000000,
      description: 'Rút tiền về tài khoản ngân hàng',
      type: 'WITHDRAWAL'
    }
  ]
};
