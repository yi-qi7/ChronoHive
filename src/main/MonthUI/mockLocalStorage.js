import dayjs from 'dayjs';
import isLeapYear from 'dayjs/plugin/isLeapYear';
import scheduleColorMapper from './scheduleTypeColorMapper'

dayjs.extend(isLeapYear);

// --------------------- 模拟 localStorage 模块 --------------------- //
class MockLocalStorage {
  constructor() {
    this.data = {}; // 存储数据的对象
    this.setTestData(); // 初始化测试数据
  }

  // 设置测试数据（可按需修改）
  setTestData() {
    // 格式：YYYY-MM-DD: ['日程类型1', '日程类型2']
    this.setItem('2025-05-30', JSON.stringify(['上课']));
    this.setItem('2025-05-31', JSON.stringify(['考试']));
    this.setItem('2025-06-02', JSON.stringify(['其他']));
    this.setItem('2025-06-02', JSON.stringify(['个人']));
  }

  // 获取数据
  getItem(key) {
    return this.data[key] || null;
  }

  // 设置数据
  setItem(key, value) {
    this.data[key] = String(value); // 模拟真实 localStorage 的字符串存储
  }

  // 删除数据
  removeItem(key) {
    delete this.data[key];
  }

  // 清空数据
  clear() {
    this.data = {};
  }
}

// 创建模拟存储实例
const mockLocalStorage = new MockLocalStorage(); //测试用单例

// --------------------- 日程类型颜色映射 --------------------- //
const scheduleTypeColors = {
  上课: '#3498db',    // 蓝色-上课
  考试: '#e74c3c',    // 红色-考试
  个人: '#2ecc71',    // 绿色-个人
  会议: '#f39c12',    // 橙色-会议
  讲座: '#1abc9c',    // 青色-讲座
  实验: '#d35400',    // 深橙色-实验
  社团: '#8e44ad',    // 深紫色-社团
  运动: '#f1c40f',    // 黄色-运动
  娱乐: '#ecf0f1',    // 浅灰色-娱乐
  实习: '#55efc4',    // 薄荷绿-实习
  旅行: '#00cec9',    // 亮青色-旅行
  作业: '#6c5ce7',    // 靛蓝色-作业
  其他: '#9b59b6',    // 紫色-其他
};

// --------------------- 日程操作API --------------------- //
/**
 * 添加日程到指定日期
 * @param {string} date - 日期，格式：YYYY-MM-DD
 * @param {string} type - 日程类型
 */
function MonthUI_addSchedule(date, type) {
  let schedules = MonthUI_getSchedules(date) || [];

  // 检查是否已存在相同类型的日程
  if (!schedules.includes(type)) {
    schedules.push(type);
    mockLocalStorage.setItem(date, JSON.stringify(schedules));
  }
}

/**
 * 从指定日期移除日程
 * @param {string} date - 日期，格式：YYYY-MM-DD
 * @param {string} type - 日程类型
 */
function MonthUI_removeSchedule(date, type) {
  let schedules = MonthUI_getSchedules(date) || [];
  schedules = schedules.filter(t => t !== type);

  if (schedules.length > 0) {
    mockLocalStorage.setItem(date, JSON.stringify(schedules));
  } else {
    // 如果没有日程了，移除整个日期的记录
    mockLocalStorage.removeItem(date);
  }
}

/**
 * 获取指定日期的所有日程
 * @param {string} date - 日期，格式：YYYY-MM-DD
 * @returns {Array<string>} - 日程类型数组
 */
function MonthUI_getSchedules(date) {
  const schedules = mockLocalStorage.getItem(date);
  return schedules ? JSON.parse(schedules) : [];
}

/**
 * 获取所有有日程的日期及其日程
 * @returns {Object} - 包含所有日程的对象，格式：{ 'YYYY-MM-DD': ['日程类型1', '日程类型2'] }
 */
function MonthUI_getAllSchedules() {
  const allData = {};
  Object.keys(mockLocalStorage.data).forEach(key => {
    allData[key] = JSON.parse(mockLocalStorage.getItem(key));
  });
  return allData;
}

/**
 * 清除所有日程
 */
function MonthUI_clearAllSchedules() {
  mockLocalStorage.clear();
}

/**
 * 获取日程类型的颜色
 * @param {string} type - 日程类型
 * @returns {string} - 对应的颜色代码
 */
function MonthUI_getScheduleColor(type) {
  //return scheduleTypeColors[type] || '#95a5a6'; // 默认灰色
  return scheduleColorMapper.getColor(type) || '#95a5a6'; // 默认灰色
}

export {
  mockLocalStorage,
  scheduleTypeColors,
  MonthUI_addSchedule,
  MonthUI_removeSchedule,
  MonthUI_getSchedules,
  MonthUI_getAllSchedules,
  MonthUI_clearAllSchedules,
  MonthUI_getScheduleColor
};
