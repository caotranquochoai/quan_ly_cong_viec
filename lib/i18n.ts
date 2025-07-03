export type Language = "en" | "vi" | "zh"

export interface Translations {
  // App Title & Navigation
  appTitle: string
  appSubtitle: string

  // Tabs
  calendar: string
  upcoming: string
  overdue: string
  completed: string
  all: string

  // Stats
  totalTasks: string
  dueToday: string

  // Actions
  addTask: string
  editTask: string
  deleteTask: string
  markComplete: string
  markIncomplete: string
  save: string
  cancel: string
  dismiss: string

  // Task Form
  taskTitle: string
  description: string
  category: string
  dueDate: string
  reminderTime: string
  recurringTask: string
  repeat: string

  // Categories
  serverRenewal: string
  electricityBill: string
  internetBill: string
  waterBill: string
  rentPayment: string
  insurance: string
  subscription: string
  maintenance: string
  other: string

  // Recurring Types
  daily: string
  weekly: string
  monthly: string

  // Reminder Times
  minutes15: string
  minutes30: string
  hour1: string
  hours2: string
  day1: string
  days2: string
  week1: string

  // Status
  today: string
  tomorrow: string
  created: string

  // Messages
  noTasks: string
  noTasksSubtitle: string
  noTasksForDate: string
  noNotifications: string

  // Notifications
  notifications: string
  reminder: string

  // Days of Week
  sunday: string
  monday: string
  tuesday: string
  wednesday: string
  thursday: string
  friday: string
  saturday: string

  // Days Short
  sun: string
  mon: string
  tue: string
  wed: string
  thu: string
  fri: string
  sat: string

  // Months
  january: string
  february: string
  march: string
  april: string
  may: string
  june: string
  july: string
  august: string
  september: string
  october: string
  november: string
  december: string

  // Task Details
  tasksFor: string
  dueDateLabel: string
  reminderLabel: string
  createdLabel: string
  completedLabel: string

  // Placeholders
  enterTaskTitle: string
  addTaskDetails: string

  // Time formats
  at: string
  before: string

  // User Profile & Settings
  profile: string
  settings: string
  account: string
  timezone: string
  username: string
  email: string
  password: string
  currentPassword: string
  newPassword: string
  confirmPassword: string
  updateProfile: string
  changePassword: string
  selectTimezone: string
  systemTime: string
  userTime: string
  profileUpdated: string
  passwordChanged: string
  invalidCurrentPassword: string
  passwordMismatch: string
  emailInUse: string
  usernameInUse: string
  profileUpdateError: string
  passwordChangeError: string,
  showLunar: string,
  numberOfRepetitions: string,

  // Recurring Task Dialog
  recurringUpdateTitle: string,
  recurringUpdateDescription: string,
  updateThisTaskOnly: string,
  updateFutureTasks: string,
  recurringDeleteTitle: string,
  recurringDeleteDescription: string,
  deleteThisTaskOnly: string,
  deleteFutureTasks: string,
}

export const translations: Record<Language, Translations> = {
  en: {
    // App Title & Navigation
    appTitle: "Task Scheduler",
    appSubtitle: "Manage your recurring tasks and reminders",

    // Tabs
    calendar: "Calendar",
    upcoming: "Upcoming",
    overdue: "Overdue",
    completed: "Completed",
    all: "All",

    // Stats
    totalTasks: "Total Tasks",
    dueToday: "Due Today",

    // Actions
    addTask: "Add Task",
    editTask: "Edit Task",
    deleteTask: "Delete Task",
    markComplete: "Mark Complete",
    markIncomplete: "Mark Incomplete",
    save: "Save",
    cancel: "Cancel",
    dismiss: "Dismiss",

    // Task Form
    taskTitle: "Task Title",
    description: "Description (Optional)",
    category: "Category",
    dueDate: "Due Date & Time",
    reminderTime: "Reminder (minutes before)",
    recurringTask: "Recurring Task",
    repeat: "Repeat",

    // Categories
    serverRenewal: "Server Renewal",
    electricityBill: "Electricity Bill",
    internetBill: "Internet Bill",
    waterBill: "Water Bill",
    rentPayment: "Rent Payment",
    insurance: "Insurance",
    subscription: "Subscription",
    maintenance: "Maintenance",
    other: "Other",

    // Recurring Types
    daily: "Daily",
    weekly: "Weekly",
    monthly: "Monthly",

    // Reminder Times
    minutes15: "15 minutes",
    minutes30: "30 minutes",
    hour1: "1 hour",
    hours2: "2 hours",
    day1: "1 day",
    days2: "2 days",
    week1: "1 week",

    // Status
    today: "Today",
    tomorrow: "Tomorrow",
    created: "Created",

    // Messages
    noTasks: "No tasks scheduled",
    noTasksSubtitle: "Add your first task to get started",
    noTasksForDate: "No tasks scheduled for this date",
    noNotifications: "No new notifications",

    // Notifications
    notifications: "Notifications",
    reminder: "Reminder",

    // Days of Week
    sunday: "Sunday",
    monday: "Monday",
    tuesday: "Tuesday",
    wednesday: "Wednesday",
    thursday: "Thursday",
    friday: "Friday",
    saturday: "Saturday",

    // Days Short
    sun: "Sun",
    mon: "Mon",
    tue: "Tue",
    wed: "Wed",
    thu: "Thu",
    fri: "Fri",
    sat: "Sat",

    // Months
    january: "January",
    february: "February",
    march: "March",
    april: "April",
    may: "May",
    june: "June",
    july: "July",
    august: "August",
    september: "September",
    october: "October",
    november: "November",
    december: "December",

    // Task Details
    tasksFor: "Tasks for",
    dueDateLabel: "Due Date",
    reminderLabel: "Reminder",
    createdLabel: "Created",
    completedLabel: "Completed",

    // Placeholders
    enterTaskTitle: "Enter task title",
    addTaskDetails: "Add task details",

    // Time formats
    at: "at",
    before: "before",

    // User Profile & Settings
    profile: "Profile",
    settings: "Settings",
    account: "Account",
    timezone: "Timezone",
    username: "Username",
    email: "Email",
    password: "Password",
    currentPassword: "Current Password",
    newPassword: "New Password",
    confirmPassword: "Confirm Password",
    updateProfile: "Update Profile",
    changePassword: "Change Password",
    selectTimezone: "Select Timezone",
    systemTime: "System Time",
    userTime: "Your Time",
    profileUpdated: "Profile updated successfully",
    passwordChanged: "Password changed successfully",
    invalidCurrentPassword: "Current password is incorrect",
    passwordMismatch: "Passwords do not match",
    emailInUse: "Email is already in use",
    usernameInUse: "Username is already taken",
    profileUpdateError: "Failed to update profile",
    passwordChangeError: "Failed to change password",
    showLunar: "Show Lunar",
    numberOfRepetitions: "Number of repetitions",

    // Recurring Task Dialog
    recurringUpdateTitle: "Recurring Task Update",
    recurringUpdateDescription: "Do you want to apply these changes to this task only, or to this and all future tasks in the series?",
    updateThisTaskOnly: "Update This Task Only",
    updateFutureTasks: "Update Future Tasks",
    recurringDeleteTitle: "Recurring Task Deletion",
    recurringDeleteDescription: "Do you want to delete only this task, or this and all future tasks in the series?",
    deleteThisTaskOnly: "Delete This Task Only",
    deleteFutureTasks: "Delete Future Tasks",
  },

  vi: {
    // App Title & Navigation
    appTitle: "Lịch Công Việc",
    appSubtitle: "Quản lý các công việc định kỳ và lời nhắc",

    // Tabs
    calendar: "Lịch",
    upcoming: "Sắp tới",
    overdue: "Quá hạn",
    completed: "Hoàn thành",
    all: "Tất cả",

    // Stats
    totalTasks: "Tổng Công Việc",
    dueToday: "Hạn Hôm Nay",

    // Actions
    addTask: "Thêm Công Việc",
    editTask: "Sửa Công Việc",
    deleteTask: "Xóa Công Việc",
    markComplete: "Đánh Dấu Hoàn Thành",
    markIncomplete: "Đánh Dấu Chưa Hoàn Thành",
    save: "Lưu",
    cancel: "Hủy",
    dismiss: "Bỏ Qua",

    // Task Form
    taskTitle: "Tiêu Đề Công Việc",
    description: "Mô Tả (Tùy Chọn)",
    category: "Danh Mục",
    dueDate: "Ngày & Giờ Hạn",
    reminderTime: "Nhắc Nhở (phút trước)",
    recurringTask: "Công Việc Định Kỳ",
    repeat: "Lặp Lại",

    // Categories
    serverRenewal: "Gia Hạn Server",
    electricityBill: "Hóa Đơn Điện",
    internetBill: "Hóa Đơn Internet",
    waterBill: "Hóa Đơn Nước",
    rentPayment: "Tiền Thuê Nhà",
    insurance: "Bảo Hiểm",
    subscription: "Đăng Ký Dịch Vụ",
    maintenance: "Bảo Trì",
    other: "Khác",

    // Recurring Types
    daily: "Hàng Ngày",
    weekly: "Hàng Tuần",
    monthly: "Hàng Tháng",

    // Reminder Times
    minutes15: "15 phút",
    minutes30: "30 phút",
    hour1: "1 giờ",
    hours2: "2 giờ",
    day1: "1 ngày",
    days2: "2 ngày",
    week1: "1 tuần",

    // Status
    today: "Hôm Nay",
    tomorrow: "Ngày Mai",
    created: "Đã Tạo",

    // Messages
    noTasks: "Không có công việc nào được lên lịch",
    noTasksSubtitle: "Thêm công việc đầu tiên để bắt đầu",
    noTasksForDate: "Không có công việc nào cho ngày này",
    noNotifications: "Không có thông báo mới",

    // Notifications
    notifications: "Thông Báo",
    reminder: "Nhắc Nhở",

    // Days of Week
    sunday: "Chủ Nhật",
    monday: "Thứ Hai",
    tuesday: "Thứ Ba",
    wednesday: "Thứ Tư",
    thursday: "Thứ Năm",
    friday: "Thứ Sáu",
    saturday: "Thứ Bảy",

    // Days Short
    sun: "CN",
    mon: "T2",
    tue: "T3",
    wed: "T4",
    thu: "T5",
    fri: "T6",
    sat: "T7",

    // Months
    january: "Tháng Một",
    february: "Tháng Hai",
    march: "Tháng Ba",
    april: "Tháng Tư",
    may: "Tháng Năm",
    june: "Tháng Sáu",
    july: "Tháng Bảy",
    august: "Tháng Tám",
    september: "Tháng Chín",
    october: "Tháng Mười",
    november: "Tháng Mười Một",
    december: "Tháng Mười Hai",

    // Task Details
    tasksFor: "Công việc cho",
    dueDateLabel: "Ngày Hạn",
    reminderLabel: "Nhắc Nhở",
    createdLabel: "Đã Tạo",
    completedLabel: "Hoàn Thành",

    // Placeholders
    enterTaskTitle: "Nhập tiêu đề công việc",
    addTaskDetails: "Thêm chi tiết công việc",

    // Time formats
    at: "lúc",
    before: "trước",

    // User Profile & Settings
    profile: "Hồ Sơ",
    settings: "Cài Đặt",
    account: "Tài Khoản",
    timezone: "Múi Giờ",
    username: "Tên Người Dùng",
    email: "Email",
    password: "Mật Khẩu",
    currentPassword: "Mật Khẩu Hiện Tại",
    newPassword: "Mật Khẩu Mới",
    confirmPassword: "Xác Nhận Mật Khẩu",
    updateProfile: "Cập Nhật Hồ Sơ",
    changePassword: "Đổi Mật Khẩu",
    selectTimezone: "Chọn Múi Giờ",
    systemTime: "Giờ Hệ Thống",
    userTime: "Giờ Của Bạn",
    profileUpdated: "Cập nhật hồ sơ thành công",
    passwordChanged: "Đổi mật khẩu thành công",
    invalidCurrentPassword: "Mật khẩu hiện tại không đúng",
    passwordMismatch: "Mật khẩu không khớp",
    emailInUse: "Email đã được sử dụng",
    usernameInUse: "Tên người dùng đã được sử dụng",
    profileUpdateError: "Không thể cập nhật hồ sơ",
    passwordChangeError: "Không thể đổi mật khẩu",
    showLunar: "Hiển thị Âm lịch",
    numberOfRepetitions: "Số lần lặp lại",

    // Recurring Task Dialog
    recurringUpdateTitle: "Cập nhật công việc định kỳ",
    recurringUpdateDescription: "Bạn muốn áp dụng các thay đổi này chỉ cho công việc này, hay cho công việc này và tất cả các công việc trong tương lai của chuỗi?",
    updateThisTaskOnly: "Chỉ cập nhật công việc này",
    updateFutureTasks: "Cập nhật các công việc trong tương lai",
    recurringDeleteTitle: "Xóa công việc định kỳ",
    recurringDeleteDescription: "Bạn muốn chỉ xóa công việc này, hay xóa công việc này và tất cả các công việc trong tương lai của chuỗi?",
    deleteThisTaskOnly: "Chỉ xóa công việc này",
    deleteFutureTasks: "Xóa các công việc trong tương lai",
  },

  zh: {
    // App Title & Navigation
    appTitle: "任务调度器",
    appSubtitle: "管理您的定期任务和提醒",

    // Tabs
    calendar: "日历",
    upcoming: "即将到来",
    overdue: "逾期",
    completed: "已完成",
    all: "全部",

    // Stats
    totalTasks: "总任务",
    dueToday: "今日到期",

    // Actions
    addTask: "添加任务",
    editTask: "编辑任务",
    deleteTask: "删除任务",
    markComplete: "标记完成",
    markIncomplete: "标记未完成",
    save: "保存",
    cancel: "取消",
    dismiss: "忽略",

    // Task Form
    taskTitle: "任务标题",
    description: "描述（可选）",
    category: "类别",
    dueDate: "截止日期和时间",
    reminderTime: "提醒（分钟前）",
    recurringTask: "重复任务",
    repeat: "重复",

    // Categories
    serverRenewal: "服务器续费",
    electricityBill: "电费账单",
    internetBill: "网费账单",
    waterBill: "水费账单",
    rentPayment: "房租支付",
    insurance: "保险",
    subscription: "订阅服务",
    maintenance: "维护",
    other: "其他",

    // Recurring Types
    daily: "每日",
    weekly: "每周",
    monthly: "每月",

    // Reminder Times
    minutes15: "15分钟",
    minutes30: "30分钟",
    hour1: "1小时",
    hours2: "2小时",
    day1: "1天",
    days2: "2天",
    week1: "1周",

    // Status
    today: "今天",
    tomorrow: "明天",
    created: "已创建",

    // Messages
    noTasks: "没有安排的任务",
    noTasksSubtitle: "添加您的第一个任务开始使用",
    noTasksForDate: "此日期没有安排任务",
    noNotifications: "没有新通知",

    // Notifications
    notifications: "通知",
    reminder: "提醒",

    // Days of Week
    sunday: "星期日",
    monday: "星期一",
    tuesday: "星期二",
    wednesday: "星期三",
    thursday: "星期四",
    friday: "星期五",
    saturday: "星期六",

    // Days Short
    sun: "日",
    mon: "一",
    tue: "二",
    wed: "三",
    thu: "四",
    fri: "五",
    sat: "六",

    // Months
    january: "一月",
    february: "二月",
    march: "三月",
    april: "四月",
    may: "五月",
    june: "六月",
    july: "七月",
    august: "八月",
    september: "九月",
    october: "十月",
    november: "十一月",
    december: "十二月",

    // Task Details
    tasksFor: "任务于",
    dueDateLabel: "截止日期",
    reminderLabel: "提醒",
    createdLabel: "创建时间",
    completedLabel: "完成时间",

    // Placeholders
    enterTaskTitle: "输入任务标题",
    addTaskDetails: "添加任务详情",

    // Time formats
    at: "在",
    before: "之前",

    // User Profile & Settings
    profile: "个人资料",
    settings: "设置",
    account: "账户",
    timezone: "时区",
    username: "用户名",
    email: "邮箱",
    password: "密码",
    currentPassword: "当前密码",
    newPassword: "新密码",
    confirmPassword: "确认密码",
    updateProfile: "更新资料",
    changePassword: "更改密码",
    selectTimezone: "选择时区",
    systemTime: "系统时间",
    userTime: "您的时间",
    profileUpdated: "资料更新成功",
    passwordChanged: "密码更改成功",
    invalidCurrentPassword: "当前密码不正确",
    passwordMismatch: "密码不匹配",
    emailInUse: "邮箱已被使用",
    usernameInUse: "用户名已被使用",
    profileUpdateError: "更新资料失败",
    passwordChangeError: "更改密码失败",
    showLunar: "显示农历",
    numberOfRepetitions: "重复次数",

    // Recurring Task Dialog
    recurringUpdateTitle: "更新重复任务",
    recurringUpdateDescription: "您要将这些更改仅应用于此任务，还是应用于此任务及系列中所有未来的任务？",
    updateThisTaskOnly: "仅更新此任务",
    updateFutureTasks: "更新未来的任务",
    recurringDeleteTitle: "删除重复任务",
    recurringDeleteDescription: "您要仅删除此任务，还是删除此任务及系列中所有未来的任务？",
    deleteThisTaskOnly: "仅删除此任务",
    deleteFutureTasks: "删除未来的任务",
  },
}

export const useTranslation = (language: Language) => {
  return translations[language]
}

// Date formatting functions for different languages
export const formatDate = (
  date: string | Date,
  language: Language,
  format: "full" | "short" | "month" | "day" = "short",
) => {
  // Ensure we have a proper Date object
  const dateObj = typeof date === "string" ? new Date(date) : date

  // Check if the date is valid
  if (!dateObj || isNaN(dateObj.getTime())) {
    return "Invalid Date"
  }

  const t = translations[language]

  const dayNames = [t.sunday, t.monday, t.tuesday, t.wednesday, t.thursday, t.friday, t.saturday]
  const dayNamesShort = [t.sun, t.mon, t.tue, t.wed, t.thu, t.fri, t.sat]
  const monthNames = [
    t.january,
    t.february,
    t.march,
    t.april,
    t.may,
    t.june,
    t.july,
    t.august,
    t.september,
    t.october,
    t.november,
    t.december,
  ]

  const day = dateObj.getDate()
  const month = dateObj.getMonth()
  const year = dateObj.getFullYear()
  const dayOfWeek = dateObj.getDay()
  const hours = dateObj.getHours()
  const minutes = dateObj.getMinutes()

  const timeString = `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`

  switch (format) {
    case "full":
      if (language === "zh") {
        return `${year}年${month + 1}月${day}日 ${dayNames[dayOfWeek]} ${timeString}`
      } else if (language === "vi") {
        return `${dayNames[dayOfWeek]}, ${day} ${monthNames[month]} ${year} ${t.at} ${timeString}`
      } else {
        return `${dayNames[dayOfWeek]}, ${monthNames[month]} ${day}, ${year} ${t.at} ${timeString}`
      }

    case "short":
      if (language === "zh") {
        return `${month + 1}月${day}日`
      } else if (language === "vi") {
        return `${day} ${monthNames[month]}`
      } else {
        return `${monthNames[month]} ${day}`
      }

    case "month":
      if (language === "zh") {
        return `${year}年${month + 1}月`
      } else if (language === "vi") {
        return `${monthNames[month]} ${year}`
      } else {
        return `${monthNames[month]} ${year}`
      }

    case "day":
      return dayNamesShort[dayOfWeek]

    default:
      return dateObj.toLocaleDateString()
  }
}
