import dayjs from 'dayjs';
import isLeapYear from 'dayjs/plugin/isLeapYear';

dayjs.extend(isLeapYear);

class MockDeadlineStorage {
    constructor() {
        this.data = {}; // 用于存储截止日期数据
        this.setTestData(); // 初始化测试数据
    }

    // 设置测试数据
    setTestData() {
        // 格式：{ '日期（YYYY-MM-DD）': ['任务名1', '任务名2'] }
        this.addTaskToDate('2025-06-19', '作业1');
        this.addTaskToDate('2025-06-15', '汇报1');
    }

    // 获取指定日期的任务数组
    getTasksByDate(date) {
        return this.data[date] || [];
    }

    // 向指定日期添加任务
    addTaskToDate(date, task) {
        if (!this.data[date]) {
            this.data[date] = [];
        }
        if (!this.data[date].includes(task)) {
            this.data[date].push(task);
        }
    }

    // 从指定日期移除任务
    removeTaskFromDate(date, task) {
        if (this.data[date]) {
            this.data[date] = this.data[date].filter(t => t !== task);
            if (this.data[date].length === 0) {
                delete this.data[date];
            }
        }
    }

    // 清空所有数据
    clear() {
        this.data = {};
    }
}

// 创建模拟存储实例
const mockDeadlineStorage = new MockDeadlineStorage();  //测试用单例

// --------------------- 截止日期操作 API --------------------- //


/**
 * 获取指定日期的所有任务
 * @param {string} date - 日期，格式：YYYY-MM-DD
 * @returns {Array} - 任务数组
 */
function getTasksByDate(date) {
    return mockDeadlineStorage.getTasksByDate(date);
}

/**
 * 获取所有任务及其截止日期
 * @returns {Object} - 包含所有任务及其截止日期的对象，格式：{ '日期（YYYY-MM-DD）': ['任务名1', '任务名2'] }
 */
function getAllTasksWithDeadlines() {
    return { ...mockDeadlineStorage.data };
}

/**
 * 清除所有任务及其截止日期
 */
function clearAllTasksWithDeadlines() {
    mockDeadlineStorage.clear();
}

/**
 * 添加任务及其截止日期
 * @param {string} deadline - 截止日期，格式：YYYY-MM-DD
 * @param {string} task - 任务名称
 */
function MonthUI_addDeadline(deadline, task) {
    mockDeadlineStorage.addTaskToDate(deadline, task);
}

/**
 * 移除任务及其截止日期
 * @param {string} deadline - 截止日期，格式：YYYY-MM-DD
 * @param {string} task - 任务名称
 */
function MonthUI_removeDeadline(deadline, task) {
    mockDeadlineStorage.removeTaskFromDate(deadline, task);
}

export {
    mockDeadlineStorage,
    getTasksByDate,
    getAllTasksWithDeadlines,
    clearAllTasksWithDeadlines,
    MonthUI_addDeadline,
    MonthUI_removeDeadline,
};
