class MonthNumManager {
    constructor() {
      this.num_prevMonth = 6;
      this.num_postMonth = 6;
    }
  
    changeNumOfPrevMonth(new_num) {
      this.num_prevMonth = new_num;
    }
  
    changeNumOfPostMonth(new_num) {
      this.num_postMonth = new_num;
    }
  
    getPrevMonth() {
      return this.num_prevMonth;
    }
  
    getPostMonth() {
      return this.num_postMonth;
    }
  }
  
// 单例实例
const monthNumManager = new MonthNumManager();  //测试用单例
export {monthNumManager};
export default MonthNumManager;
