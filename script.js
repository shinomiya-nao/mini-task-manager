"use strict";

// Dữ liệu mẫu được tạo từ mảng đối tượng trong JavaScript.
const items = [
  { id: 1, title: "Viết báo cáo HTML", dueDate: "2026-10-20", dueTime: "17:00", priority: "Cao", category: "Học tập", status: "pending", completedAt: null },
  { id: 2, title: "Ôn Flexbox", dueDate: "2026-10-23", dueTime: "20:00", priority: "Trung bình", category: "Học tập", status: "pending", completedAt: null },
  { id: 3, title: "Làm bài DOM", dueDate: "2026-10-19", dueTime: "18:00", priority: "Cao", category: "Học tập", status: "done", completedAt: "2026-10-19T16:30:00" },
  { id: 4, title: "Đọc tài liệu CSS", dueDate: "2026-10-25", dueTime: "21:00", priority: "Thấp", category: "Học tập", status: "pending", completedAt: null },
  { id: 5, title: "Thiết kế trang cá nhân", dueDate: "2026-10-21", dueTime: "17:30", priority: "Trung bình", category: "Làm việc", status: "done", completedAt: "2026-10-21T16:00:00" }
];

const taskForm = document.querySelector("#taskForm");
const taskTitleInput = document.querySelector("#taskTitle");
const dueDateInput = document.querySelector("#dueDate");
const dueTimeInput = document.querySelector("#dueTime");
const priorityInput = document.querySelector("#priority");
const categoryInput = document.querySelector("#category");
const formMessage = document.querySelector("#formMessage");
const searchInput = document.querySelector("#searchInput");
const statusFilter = document.querySelector("#statusFilter");
const studyTaskList = document.querySelector("#studyTaskList");
const workTaskList = document.querySelector("#workTaskList");
const studyEmpty = document.querySelector("#studyEmpty");
const workEmpty = document.querySelector("#workEmpty");
const emptyState = document.querySelector("#emptyState");
const studyCount = document.querySelector("#studyCount");
const workCount = document.querySelector("#workCount");
const totalCount = document.querySelector("#totalCount");
const pendingCount = document.querySelector("#pendingCount");
const doneCount = document.querySelector("#doneCount");
const visibleCount = document.querySelector("#visibleCount");

let nextId = Math.max(...items.map((item) => item.id)) + 1;

function getDeadline(item) {
  if (!item.dueDate) return null;
  return new Date(`${item.dueDate}T${item.dueTime || "23:59"}:00`);
}

function formatDate(dateString) {
  if (!dateString) return "Chưa đặt ngày";
  const [year, month, day] = dateString.split("-");
  return `${day}/${month}/${year}`;
}

function formatDeadline(item) {
  if (!item.dueDate) return "Chưa đặt hạn";
  return `${item.dueTime || "23:59"} · ${formatDate(item.dueDate)}`;
}

function isOverdue(item) {
  const deadline = getDeadline(item);
  return Boolean(deadline && Date.now() > deadline.getTime());
}

function getDisplayStatus(item) {
  if (item.status === "done") {
    if (item.completedAt && getDeadline(item) && new Date(item.completedAt) > getDeadline(item)) {
      return { label: "Hoàn thành muộn", className: "status-late" };
    }
    return { label: "Đã hoàn thành", className: "status-done" };
  }
  if (isOverdue(item)) return { label: "Quá hạn", className: "status-overdue" };
  return { label: "Chưa hoàn thành", className: "status-pending" };
}

function getPriorityClass(priority) {
  if (priority === "Cao") return "priority-high";
  if (priority === "Thấp") return "priority-low";
  return "priority-medium";
}

function updateSummary() {
  const completed = items.filter((item) => item.status === "done").length;
  totalCount.textContent = items.length;
  doneCount.textContent = completed;
  pendingCount.textContent = items.length - completed;
}

function createTaskElement(item) {
  const article = document.createElement("article");
  article.className = `task-item${item.status === "done" ? " is-done" : ""}`;

  const main = document.createElement("div");
  main.className = "task-main";
  const title = document.createElement("p");
  title.className = "task-title";
  title.textContent = item.title;

  const meta = document.createElement("div");
  meta.className = "task-meta";
  const due = document.createElement("span");
  due.textContent = `Hạn: ${formatDeadline(item)}`;

  const category = document.createElement("span");
  category.className = "meta-chip category-chip";
  category.textContent = item.category;

  const priority = document.createElement("span");
  priority.className = `meta-chip ${getPriorityClass(item.priority)}`;
  priority.textContent = `Ưu tiên: ${item.priority}`;

  // Trạng thái được xử lý qua nút hành động và bộ lọc, không hiển thị nhãn trạng thái trong từng thẻ.
  meta.append(due, category, priority);
  main.append(title, meta);

  const actions = document.createElement("div");
  actions.className = "task-actions";

  const completeButton = document.createElement("button");
  completeButton.type = "button";
  completeButton.className = "btn btn-complete";
  completeButton.textContent = item.status === "done"
    ? "Đánh dấu chưa hoàn thành"
    : "Đánh dấu đã hoàn thành";
  completeButton.setAttribute("aria-pressed", String(item.status === "done"));
  completeButton.addEventListener("click", () => toggleTask(item.id));

  const deleteButton = document.createElement("button");
  deleteButton.type = "button";
  deleteButton.className = "btn btn-delete";
  deleteButton.textContent = "Xóa công việc";
  deleteButton.addEventListener("click", () => deleteTask(item.id));

  actions.append(completeButton, deleteButton);
  article.append(main, actions);
  return article;
}

function renderTasks() {
  const keyword = searchInput.value.trim().toLocaleLowerCase("vi");
  const selectedStatus = statusFilter.value;

  const filteredItems = items.filter((item) => {
    const matchesTitle = item.title.toLocaleLowerCase("vi").includes(keyword);
    const displayStatus = getDisplayStatus(item);
    const matchesStatus = selectedStatus === "all"
      || (selectedStatus === "pending" && item.status === "pending" && !isOverdue(item))
      || (selectedStatus === "done" && item.status === "done" && displayStatus.label === "Đã hoàn thành")
      || (selectedStatus === "late" && (displayStatus.label === "Quá hạn" || displayStatus.label === "Hoàn thành muộn"));
    return matchesTitle && matchesStatus;
  });

  const studyItems = filteredItems.filter((item) => item.category === "Học tập");
  const workItems = filteredItems.filter((item) => item.category === "Làm việc");
  studyTaskList.replaceChildren();
  workTaskList.replaceChildren();
  studyItems.forEach((item) => studyTaskList.appendChild(createTaskElement(item)));
  workItems.forEach((item) => workTaskList.appendChild(createTaskElement(item)));

  studyEmpty.hidden = studyItems.length !== 0;
  workEmpty.hidden = workItems.length !== 0;
  emptyState.hidden = filteredItems.length !== 0;
  studyCount.textContent = `${studyItems.length} công việc`;
  workCount.textContent = `${workItems.length} công việc`;
  visibleCount.textContent = `${filteredItems.length} công việc`;
  updateSummary();
}

function toggleTask(id) {
  const item = items.find((task) => task.id === id);
  if (!item) return;

  if (item.status === "done") {
    item.status = "pending";
    item.completedAt = null;
  } else {
    item.status = "done";
    item.completedAt = new Date().toISOString();
  }
  renderTasks();
}

function deleteTask(id) {
  const index = items.findIndex((item) => item.id === id);
  if (index === -1) return;
  items.splice(index, 1);
  renderTasks();
}

taskForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const title = taskTitleInput.value.trim();

  if (!title) {
    formMessage.textContent = "Vui lòng nhập tên công việc trước khi thêm.";
    taskTitleInput.focus();
    return;
  }

  items.unshift({
    id: nextId++,
    title,
    dueDate: dueDateInput.value,
    dueTime: dueTimeInput.value || "23:59",
    priority: priorityInput.value,
    category: categoryInput.value,
    status: "pending",
    completedAt: null
  });

  taskForm.reset();
  priorityInput.value = "Trung bình";
  categoryInput.value = "Học tập";
  dueTimeInput.value = "23:59";
  formMessage.textContent = "";
  searchInput.value = "";
  statusFilter.value = "all";
  renderTasks();
  taskTitleInput.focus();
});

taskTitleInput.addEventListener("input", () => {
  if (taskTitleInput.value.trim()) formMessage.textContent = "";
});
searchInput.addEventListener("input", renderTasks);
statusFilter.addEventListener("change", renderTasks);

// Hiển thị 5 công việc mẫu khi mở trang.
renderTasks();
