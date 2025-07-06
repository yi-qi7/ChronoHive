import dayjs from 'dayjs';
import isLeapYear from 'dayjs/plugin/isLeapYear';
import scheduleColorMapper from './scheduleTypeColorMapper'; 

dayjs.extend(isLeapYear);

// --------------------- 模拟 localStorage 模块 --------------------- //
class MockLocalStorage {
  constructor() {
    this.data = {}; 
    this.setTestData(); 
  }

  setTestData() {
    this.setItem('2025-05-30', JSON.stringify(['上课']));
    this.setItem('2025-05-31', JSON.stringify(['考试']));
    this.setItem('2025-06-02', JSON.stringify(['其他']));
    this.setItem('2025-06-02', JSON.stringify(['个人']));
  }

  getItem(key) {
    return this.data[key] || null;
  }

  setItem(key, value) {
    this.data[key] = String(value); 
  }

  removeItem(key) {
    delete this.data[key];
  }

  clear() {
    this.data = {};
  }

  // --------------------- 日程操作API --------------------- //
  addSchedule(date, type) {
    let schedules = this.getSchedules(date) || [];
    if (!schedules.includes(type)) {
      schedules.push(type);
      this.setItem(date, JSON.stringify(schedules));
    }
  }

  removeSchedule(date, type) {
    let schedules = this.getSchedules(date) || [];
    schedules = schedules.filter(t => t !== type);
    if (schedules.length > 0) {
      this.setItem(date, JSON.stringify(schedules));
    } else {
      this.removeItem(date);
    }
  }

  getSchedules(date) {
    const schedules = this.getItem(date);
    return schedules ? JSON.parse(schedules) : [];
  }

  getAllSchedules() {
    const allData = {};
    Object.keys(this.data).forEach(key => {
      allData[key] = JSON.parse(this.getItem(key));
    });
    return allData;
  }

  clearAllSchedules() {
    this.clear();
  }

  getScheduleColor(type) {
    return scheduleColorMapper.getColor(type) || '#95a5a6'; 
  }
}

// 创建模拟存储实例
const mockLocalStorage = new MockLocalStorage(); 

/**
 * 添加日程到指定日期
 * @param {string} date - 日期，格式：YYYY-MM-DD
 * @param {string} type - 日程类型
 */
function MonthUI_addSchedule(date, type) {
  mockLocalStorage.addSchedule(date, type);
}

/**
 * 从指定日期移除日程
 * @param {string} date - 日期，格式：YYYY-MM-DD
 * @param {string} type - 日程类型
 */
function MonthUI_removeSchedule(date, type) {
  mockLocalStorage.removeSchedule(date, type);
}

// 导出内容
export {
  mockLocalStorage,
  MonthUI_addSchedule,
  MonthUI_removeSchedule
};

