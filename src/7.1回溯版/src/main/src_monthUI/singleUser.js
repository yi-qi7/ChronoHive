import MockLocalStorage from './mockLocalStorage'
import MockDeadlineStorage from './mockDeadlineStorage'
import ScheduleTypeColorMapper from './scheduleTypeColorMapper'
import ThemeMode from './themeMode'

class SingleUser {
    constructor(userId, name, email) {
        // 基础用户信息
        this.userId = userId;
        this.name = name;
        this.email = email;
        this.createdAt = new Date();
        
        // 动态数据
        this.isLoggedIn = false;
        this.lastLoginTime = null;
        
        // 存储实例
        this.monthLocalStorage = new MockLocalStorage();
        this.deadlineStorage = new MockDeadlineStorage();
        this.scheduleColorMapper = new ScheduleTypeColorMapper();
        this.themeMode = new ThemeMode();

        this.monthNumManager = new MonthNumManager();
    
    }

    // 记录登录状态
    setLoginStatus(isLoggedIn) {
        this.isLoggedIn = isLoggedIn;
        if (isLoggedIn) this.lastLoginTime = new Date();
    }

    // --------------------- 截止日期操作 API --------------------- //

    /**
     * 获取指定日期的所有任务
     * @param {string} date - 日期，格式：YYYY-MM-DD
     * @returns {Array} - 任务数组
     */
    MonthUI_getTasksByDate(date) {
        return this.deadlineStorage.getTasksByDate(date);
    }

    /**
     * 获取所有任务及其截止日期
     * @returns {Object} - 包含所有任务及其截止日期的对象，格式：{ '日期（YYYY-MM-DD）': ['任务名1', '任务名2'] }
     */
    MonthUI_getAllTasksWithDeadlines() {
        return { ...this.deadlineStorage.data };
    }

    /**
     * 清除所有任务及其截止日期
     */
    MonthUI_clearAllTasksWithDeadlines() {
        this.deadlineStorage.clear();
    }

    /**
     * 添加任务及其截止日期
     * @param {string} deadline - 截止日期，格式：YYYY-MM-DD
     * @param {string} task - 任务名称
     */
    MonthUI_addDeadline(deadline, task) {
        this.deadlineStorage.addTaskToDate(deadline, task);
    }

    /**
     * 移除任务及其截止日期
     * @param {string} deadline - 截止日期，格式：YYYY-MM-DD
     * @param {string} task - 任务名称
     */
    MonthUI_removeDeadline(deadline, task) {
        this.deadlineStorage.removeTaskFromDate(deadline, task);
    }

    // --------------------- 日程操作API --------------------- //

    /**
     * 添加日程到指定日期
     * @param {string} date - 日期，格式：YYYY-MM-DD
     * @param {string} type - 日程类型
     */
    MonthUI_addSchedule(date, type) {
        let schedules = this.MonthUI_getSchedules(date) || [];

        // 检查是否已存在相同类型的日程
        if (!schedules.includes(type)) {
            schedules.push(type);
            this.monthLocalStorage.setItem(date, JSON.stringify(schedules));
        }
    }

    /**
     * 从指定日期移除日程
     * @param {string} date - 日期，格式：YYYY-MM-DD
     * @param {string} type - 日程类型
     */
    MonthUI_removeSchedule(date, type) {
        let schedules = this.MonthUI_getSchedules(date) || [];
        schedules = schedules.filter(t => t !== type);

        if (schedules.length > 0) {
            this.monthLocalStorage.setItem(date, JSON.stringify(schedules));
        } else {
            // 如果没有日程了，移除整个日期的记录
            this.monthLocalStorage.removeItem(date);
        }
    }

    /**
     * 获取指定日期的所有日程
     * @param {string} date - 日期，格式：YYYY-MM-DD
     * @returns {Array<string>} - 日程类型数组
     */
    MonthUI_getSchedules(date) {
        const schedules = this.monthLocalStorage.getItem(date);
        return schedules ? JSON.parse(schedules) : [];
    }

    /**
     * 获取所有有日程的日期及其日程
     * @returns {Object} - 包含所有日程的对象，格式：{ 'YYYY-MM-DD': ['日程类型1', '日程类型2'] }
     */
    MonthUI_getAllSchedules() {
        const allData = {};
        Object.keys(this.monthLocalStorage.data).forEach(key => {
            allData[key] = JSON.parse(this.monthLocalStorage.getItem(key));
        });
        return allData;
    }

    /**
     * 清除所有日程
     */
    MonthUI_clearAllSchedules() {
        this.monthLocalStorage.clear();
    }

    /**
     * 获取日程类型的颜色
     * @param {string} type - 日程类型
     * @returns {string} - 对应的颜色代码
     */
    MonthUI_getScheduleColor(type) {
        return this.scheduleColorMapper.getColor(type) || '#95a5a6'; // 默认灰色
    }

    // --------------------- 日程颜色操作API --------------------- //

    /**
     * 添加日程类型与颜色的映射
     * @param {string} type - 日程类型
     * @param {string} color - 日程类型对应颜色，格式：'#(六位十六进制数)'，如'#3498db'（蓝色）
     */
    MonthUI_addMapping(type, color) {
        this.scheduleColorMapper.addMapping(type, color);
    }

    /**
     * 移除日程类型与颜色的映射
     * @param {string} type - 日程类型
     */
    MonthUI_removeMapping(type) {
        this.scheduleColorMapper.removeMapping(type);
    }

    // --------------------- 主题模式API --------------------- //

    /**
     * 获取当前主题模式
     * @returns {string} - 当前主题模式
     */
    MonthUI_getThemeMode() {
        return this.themeMode.getCurrentMode();
    }

    /**
     * 更改主题模式
     * @param {string} mode - 模式名称
     */
    MonthUI_changeThemeMode(mode) {
        if (mode === 'simple' || mode === 'dark' || mode === 'honeycomb') {
            this.themeMode.changeMode(mode);
        }
    }

    // --------------------- MonthNumManager方法代理 --------------------- //
    changeNumOfPrevMonth(new_num) {
        this.monthNumManager.changeNumOfPrevMonth(new_num);
    }

    changeNumOfPostMonth(new_num) {
        this.monthNumManager.changeNumOfPostMonth(new_num);
    }

    getPrevMonth() {
        return this.monthNumManager.getPrevMonth();
    }

    getPostMonth() {
        return this.monthNumManager.getPostMonth();
    }
}

export default SingleUser;
