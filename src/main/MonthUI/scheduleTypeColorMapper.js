class ScheduleTypeColorMapper {
    constructor(initialMappings = {}) {
      this.mappings = {
        ...{
          '上课': '#3498db',    // 蓝色-上课
          '考试': '#e74c3c',    // 红色-考试
          '个人': '#2ecc71',    // 绿色-个人
          '会议': '#f39c12',    // 橙色-会议
          '讲座': '#1abc9c',    // 青色-讲座
          '实验': '#d35400',    // 深橙色-实验
          '社团': '#8e44ad',    // 深紫色-社团
          '运动': '#f1c40f',    // 黄色-运动
          '娱乐': '#ecf0f1',    // 浅灰色-娱乐
          '实习': '#55efc4',    // 薄荷绿-实习
          '旅行': '#00cec9',    // 亮青色-旅行
          '作业': '#6c5ce7',    // 靛蓝色-作业
          '其他': '#9b59b6',    // 紫色-其他
        },
        ...initialMappings
      };
    }
  
    // 添加或更新日程类型的颜色映射
    addMapping(type, color) {
      if (typeof type !== 'string' || typeof color !== 'string') {
        throw new Error('日程类型和颜色必须为字符串');
      }
      this.mappings[type] = color;
      return this;
    }
  
    // 批量添加或更新映射
    addMappings(batchMappings) {
      Object.entries(batchMappings).forEach(([type, color]) => {
        this.addMapping(type, color);
      });
      return this;
    }
  
    // 删除日程类型的颜色映射
    removeMapping(type) {
      if (this.mappings.hasOwnProperty(type)) {
        delete this.mappings[type];
        return true;
      }
      return false;
    }
  
    // 获取日程类型的颜色
    getColor(type) {
      return this.mappings[type] || null;
    }
  
    // 获取所有映射
    getAllMappings() {
      return { ...this.mappings };
    }
  
    // 获取所有日程类型
    getTypes() {
      return Object.keys(this.mappings);
    }
  
    // 获取所有颜色
    getColors() {
      return Object.values(this.mappings);
    }
  
    // 检查是否存在某个日程类型的映射
    hasType(type) {
      return this.mappings.hasOwnProperty(type);
    }
  
    // 导出映射为JSON字符串
    toJSON() {
      return JSON.stringify(this.mappings);
    }
  
    // 从JSON字符串导入映射
    fromJSON(jsonString) {
      try {
        const parsed = JSON.parse(jsonString);
        this.mappings = { ...this.mappings, ...parsed };
        return true;
      } catch (error) {
        console.error('导入JSON失败:', error);
        return false;
      }
    }
  }
  
  // 导出默认实例
  export const ScheduleColorMapper = new ScheduleTypeColorMapper();  //测试用单例
  
  // 导出类本身，支持创建自定义实例
  export default ScheduleTypeColorMapper;  

// --------------------- 日程颜色操作API --------------------- //
/**
 * 添加日程到指定日期
 * @param {string} type - 日程类型
 * @param {string} color - 日程类型对应颜色，格式：'#(六位十六进制数)'，如'#3498db'（蓝色）
 */
function MonthUI_addMapping(type, color) {
    ScheduleColorMapper.addMapping(type, color);
}

/**
 * 添加日程到指定日期
 * @param {string} type - 日程类型
 */
function MonthUI_removeMapping(type) {
    ScheduleColorMapper.removeMapping(type);
}

export { MonthUI_addMapping, MonthUI_removeMapping };
