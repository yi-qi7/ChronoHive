import React, { Component } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Button, Modal, FlatList } from 'react-native';
import dayjs from 'dayjs';
import isLeapYear from 'dayjs/plugin/isLeapYear';
import { Switch } from 'react-native';
import { mockLocalStorage } from './mockLocalStorage'; //测试用单例
//import { scheduleTypeColors } from './mockLocalStorage';
import { ScheduleColorMapper } from './scheduleTypeColorMapper' //测试用单例
import {getTasksByDate} from './mockDeadlineStorage'; //测试用单例
import ModeButton from './modeButton'

dayjs.extend(isLeapYear);

// --------------------- 日历组件 --------------------- //
class SingleMonth extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentDate: props.date || dayjs(),

      scmapper: ScheduleColorMapper,
      isDeadlineMode: false, // 新增状态，用于切换模式
      showDeadlineModal: false, // 控制截止日期详情模态框的显示
      selectedDate: '', // 当前选中的日期
      tasksForSelectedDate: [] // 当前选中日期的所有截止任务
    };
  }

  // 获取指定日期的日程数据
  getScheduleByDate = (date) => {
    const key = date.format('YYYY-MM-DD');
    const data = mockLocalStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  };

  // 获取指定日期的截止任务数量
  getDeadlineCountByDate = (date) => {
    const formattedDate = date.format('YYYY-MM-DD');
    return getTasksByDate(formattedDate).length;
  };


  // 生成日历数据
  generateCalendar = () => {
    const calendar = [];
    const currentDate = this.state.currentDate;
    const year = currentDate.year();
    const month = currentDate.month(); // 0-11（0代表1月）
    const daysInMonth = currentDate.daysInMonth(); // 当月天数
    const firstDayOfWeek = currentDate.startOf('month').day(); // 当月第一天是星期几（0=周日）

    // 添加上个月的空白天数
    for (let i = 0; i < firstDayOfWeek; i++) {
      const prevDate = dayjs(`${year}-${month + 1}-01`)
        .subtract(firstDayOfWeek - i, 'day');
      calendar.push({
        date: prevDate,
        isCurrentMonth: false,
        scheduleTypes: this.getScheduleByDate(prevDate),
        deadlineCount: this.getDeadlineCountByDate(prevDate)
      });
    }

    // 添加当月天数
    for (let day = 1; day <= daysInMonth; day++) {
      const currentDay = dayjs(`${year}-${month + 1}-${day}`);
      calendar.push({
        date: currentDay,
        isCurrentMonth: true,
        scheduleTypes: this.getScheduleByDate(currentDay),
        deadlineCount: this.getDeadlineCountByDate(currentDay)
      });
    }

    return calendar;
  };

  render() {
    const calendarData = this.generateCalendar();
    const { scheduleMethods, isDeadlineMode, showDeadlineModal, selectedDate, tasksForSelectedDate } = this.state;
    const isCurrentMonth = dayjs().isSame(this.state.currentDate, 'month');
    const { mode } = this.props;

    return (
      <View style={[
        styles.container,
        (mode === 'dark') && styles.darkContainer,
        (mode === 'honeycomb') && styles.honeycombContainer,
      ]}>
        {/* 月份标题 */}
        <View style={[
          styles.titleContainer,
          (mode === 'dark') && styles.darkTitleContainer,
          (mode === 'honeycomb') && styles.honeycombTitleContainer,
          ]}>
          <Text style={[
            styles.monthTitle,
            isCurrentMonth && styles.currentMonthTitle,
            (mode === 'dark') && styles.darkMonthTitle,
            isCurrentMonth && (mode === 'dark') && styles.darkCurrentMonthTitle,
            (mode === 'honeycomb') && styles.honeycombMonthTitle,
            isCurrentMonth && (mode === 'honeycomb') && styles.honeycombCurrentMonthTitle,
          ]}>
            {this.state.currentDate.format('YYYY年MM月')}
          </Text>
          <View style={[
          styles.switchContainer,
          (mode === 'dark') && styles.darkSwitchContainer,
          (mode === 'honeycomb') && styles.honeycombSwitchContainer,
          ]}>
            <View style={[
            styles.switchTextContainer,
            (mode === 'dark') && styles.darkSwitchTextContainer,
            (mode === 'honeycomb') && styles.honeycombSwitchTextContainer,
            ]}>
              <Text style={[
                styles.switchText,
                (mode === 'dark') && styles.darkSwitchText,
                (mode === 'honeycomb') && styles.honeycombSwitchText,
              ]}>日程模式</Text>
            </View>
            <Switch
            value={isDeadlineMode}
            onValueChange={(value) => this.setState({ isDeadlineMode: value })}
            trackColor={{ false: (mode === 'simple')? '#ffffff':'#e0e0e0', 
              true: 
              (mode === 'dark')? '#56bacb' : 
              ((mode === 'honeycomb')? '#ffd966' : '#87ceeb')
            }}
            thumbColor={isDeadlineMode ? 
              ((mode === 'dark')? '#18b3c3' : 
              ((mode === 'honeycomb')? '#FFA500' : '#00bfff')) : '#ffffff'}
            //checkedChildren="开启"
            //unCheckedChildren="关闭"
            />
            <View style={[
            styles.switchTextContainer,
            (mode === 'dark') && styles.darkSwitchTextContainer,
            (mode === 'honeycomb') && styles.honeycombSwitchTextContainer,
            ]}>
              <Text style={[
                styles.switchText,
                (mode === 'dark') && styles.darkSwitchText,
                (mode === 'honeycomb') && styles.honeycombSwitchText,
              ]}>截止模式</Text>
            </View>
          </View>
        </View>
        

        {/* 星期标题 */}
        <View style={[
          styles.weekdays,
          (mode === 'dark') && styles.darkWeekdays,
          (mode === 'honeycomb') && styles.honeycombWeekdays,
          ]}>
          {['日', '一', '二', '三', '四', '五', '六'].map((day, index) => (
            <Text key={index} style={[
              styles.weekdayText,
              (mode === 'dark') && styles.darkWeekdayText,
              (mode === 'honeycomb') && styles.honeycombWeekdayText,
              ]}>
              {day}
            </Text>
          ))}
        </View>

        {/* 日历网格 */}
        <View style={styles.calendarGrid}>
          {calendarData.map((item, index) => {
            const date = item.date;
            const isToday = dayjs().isSame(date, 'day');
            const isWeekend = date.day() === 0 || date.day() === 6; // 0=周日，6=周六
            const hasSchedule = item.scheduleTypes.length > 0;
            const hasDeadline = item.deadlineCount > 0;

            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.dayCell,
                  isWeekend && styles.weekendDayBg,
                  (hasSchedule && !isDeadlineMode) && styles.hasScheduleBorder,
                  (hasDeadline && isDeadlineMode) && styles.hasDeadlineBorder,
                  !item.isCurrentMonth && styles.inactiveDay,
                  isToday && styles.today,
                  (mode === 'dark') && styles.darkDayCell,
                  (mode === 'dark') && isWeekend && styles.darkWeekendDayBg,
                  (mode === 'dark') && (hasSchedule && !isDeadlineMode) && styles.darkHasScheduleBorder,
                  (mode === 'dark') && (hasDeadline && isDeadlineMode) && styles.darkHasDeadlineBorder,
                  (mode === 'dark') && !item.isCurrentMonth && styles.darkInactiveDay,
                  (mode === 'dark') && isToday && styles.darkToday,
                  (mode === 'honeycomb') && styles.honeycombDayCell,
                  (mode === 'honeycomb') && isWeekend && styles.honeycombWeekendDayBg,
                  (mode === 'honeycomb') && (hasSchedule && !isDeadlineMode) && styles.honeycombHasScheduleBorder,
                  (mode === 'honeycomb') && (hasDeadline && isDeadlineMode) && styles.honeycombHasDeadlineBorder,
                  (mode === 'honeycomb') && !item.isCurrentMonth && styles.honeycombInactiveDay,
                  (mode === 'honeycomb') && isToday && styles.honeycombToday,
                ]}
                onPress={() => this.handleDatePress(item.date, scheduleMethods)}
              >
                {/* 日期数字 */}
                <Text style={[
                  styles.dayNumber,
                  isWeekend && styles.weekendText,
                  !item.isCurrentMonth && styles.inactiveDayText,
                  isToday && styles.todayText,
                  (mode === 'dark') && styles.darkDayNumber,
                  (mode === 'dark') && isWeekend && styles.darkWeekendText,
                  (mode === 'dark') && !item.isCurrentMonth && styles.darkInactiveDayText,
                  (mode === 'dark') && isToday && styles.darkTodayText,
                  (mode === 'honeycomb') && styles.honeycombDayNumber,
                  (mode === 'honeycomb') && isWeekend && styles.honeycombWeekendText,
                  (mode === 'honeycomb') && !item.isCurrentMonth && styles.honeycombInactiveDayText,
                  (mode === 'honeycomb') && isToday && styles.honeycombTodayText,
                ]}>
                  {date.date()}
                </Text>

                {/* 日程标记或截止日期标记 */}
                {isDeadlineMode ? (
                  hasDeadline && (
                    <Text style={styles.deadlineText}>
                      DDL*{item.deadlineCount}
                    </Text>
                  )
                ) : (
                  hasSchedule && (
                    <View style={styles.scheduleMarkers}>
                      {item.scheduleTypes.map((type, idx) => (
                        <View
                          key={idx}
                          style={[
                            styles.scheduleMarker,
                            /*{ backgroundColor: scheduleTypeColors[type] || '#cccccc' }*/
                            /*{ backgroundColor: ScheduleColorMapper.getColor(type) || '#cccccc' }*/
                            { backgroundColor: this.state.scmapper.getColor(type) || '#cccccc' }
                          ]}
                        />
                      ))}
                    </View>
                  )
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* 截止日期详情模态框 */}
        <Modal
          visible={showDeadlineModal}
          onRequestClose={() => this.setState({ showDeadlineModal: false })}
        >
          <View style={[
            styles.modalContainer,
            (mode === 'dark') && styles.darkModalContainer,
            (mode === 'honeycomb') && styles.honeycombModalContainer,
            ]}>
            <View style={[
              styles.modalHeader,
              (mode === 'dark') && styles.darkModalHeader,
              (mode === 'honeycomb') && styles.honeycombModalHeader,
              ]}>
              <Text style={[
                styles.modalTitle,
                (mode === 'dark') && styles.darkModalTitle,
                (mode === 'honeycomb') && styles.honeycombModalTitle,
                ]}>{selectedDate} 的截止任务</Text>
              <ModeButton
                title="关闭"
                onPress={() => this.setState({ showDeadlineModal: false })}
                buttonMode = {mode}
              />
            </View>
            {tasksForSelectedDate.length === 0 ? (
              <Text style={[
                styles.modalEmptyText,
                (mode === 'dark') && styles.darkModalEmptyText,
                (mode === 'honeycomb') && styles.honeycombModalEmptyText,
              ]}>没有截止任务</Text>
            ) : (
              <FlatList
                data={tasksForSelectedDate}
                renderItem={({ item }) => (
                  <View style={[
                    styles.modalItem,
                    (mode === 'dark') && styles.darkModalItem,
                    (mode === 'honeycomb') && styles.honeycombModalItem,
                    ]}>
                    <Text style={[
                      styles.modalItemText,
                      (mode === 'dark') && styles.darkModalItemText,
                      (mode === 'honeycomb') && styles.honeycombModalItemText,
                      ]}>{item}</Text>
                    <Text style={[
                      styles.modalItemDeadline,
                      (mode === 'dark') && styles.darkModalItemDeadline,
                      (mode === 'honeycomb') && styles.honeycombModalItemDeadline,
                      ]}>截止日期：{selectedDate}</Text>
                  </View>
                )}
                keyExtractor={(item) => item}
              />
            )}
          </View>
        </Modal>
      </View>
    );
  }

  // 点击日期处理
  handleDatePress = (date, scheduleMethods) => {
    const formattedDate = date.format('YYYY-MM-DD');
    console.log('点击日期：', formattedDate);

    if (this.state.isDeadlineMode) {
      // 截止日期模式：打开截止详情模态框
      const tasksForDate = getTasksByDate(formattedDate);

      // 显示截止详情
      this.setState({
        showDeadlineModal: true,
        selectedDate: formattedDate,
        tasksForSelectedDate: tasksForDate
      });
    } else {
      // 日程模式：跳转到周视图
      this.props.navigation.navigate('WeekView', {
        date: formattedDate,
        scheduleMethods: this.state.scheduleMethods,
        isDeadlineMode: this.state.isDeadlineMode
      });
    }
  };
}

// --------------------- 样式定义 --------------------- //
const styles = StyleSheet.create({
  // 总容器
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#fff'
  },
  darkContainer: {
    backgroundColor: '#333',
  },
  honeycombContainer: {
    backgroundColor: '#ffe4b5', // 浅暖金
  },

  // 标题容器
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10
  },
  darkTitleContainer: {
    backgroundColor: '#333',
  },
  honeycombTitleContainer: {
    //backgroundColor: '#FFECB3', // 深一号金色背景
    //borderRadius: 4,
  },

  switchContainer: {
    flexDirection: 'row',
    backgroundColor: '#e0e0e0', //浅灰
    borderRadius: 8,
  },
  darkSwitchContainer: {
    flexDirection: 'row',
    backgroundColor: '#808080', //深灰
    borderRadius: 8,
  },
  honeycombSwitchContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFECB3', // 金色
    borderRadius: 8,
  },

  switchTextContainer: {
    backgroundColor: '#bfbfbf',  //中灰
    borderRadius: 8,
  },
  darkSwitchTextContainer: {
    backgroundColor: '#4d4d4d',  //深灰
  },
  honeycombSwitchTextContainer: {
    backgroundColor: '#ffd966',  //黄色
  },

  switchText: {
    color: '#4d4d4d', //深灰
  },
  darkSwitchText: {
    color: '#ffffff', //黑色
  },
  honeycombSwitchText: {
    color: '#8B4513', // 深金色文字（马鞍棕色）
  },

  // 月标题
  monthTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    //color: '#fff'
    color:'#000000',
  },
  darkMonthTitle: {
    color: '#ffffff' // 白色
  },
  honeycombMonthTitle: {
    color: '#8B4513', // 深金色文字（马鞍棕色）
  },
  currentMonthTitle: {
    color: '#e74c3c', // 当月标题红色
  },
  darkCurrentMonthTitle: {
    color: '#18b3c3', // 青色
  },
  honeycombCurrentMonthTitle: {
    color: '#FF6F00', // 琥珀色（当前月强调色）
  },


  weekdays: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
    backgroundColor: '#f5f5f5',
    paddingVertical: 8,
    borderRadius: 4
  },
  darkWeekdays: {
    backgroundColor: '#333',
    borderWidth: 1,
    borderColor: '#ddd' 
  },
  honeycombWeekdays: {
    backgroundColor: '#FFE0B2', // 暖黄色背景
    borderColor: '#FFCC80', // 浅金色边框
  },
  weekdayText: {
    flex: 1,
    fontSize: 14,
    textAlign: 'center',
    color: '#333'
  },
  darkWeekdayText: {   
    color: '#fff'
  },
  honeycombWeekdayText: {
    color: '#8B4513', // 深金色文字
    fontWeight: '600', // 加粗增强对比
  },

  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap'
  },

  // 日期单元格
  dayCell: {
    width: '14.28%', // 7列均分
    height: 70, // 增加高度适配日程标记
    justifyContent: 'flex-start', // 内容顶部对齐
    alignItems: 'center',
    margin: 0,
    marginTop: 5,
    borderWidth: 0.5,
    borderColor: '#f0f0f0', // 浅灰色边框
    borderRadius: 4
  },
  darkDayCell: {
    backgroundColor: '#1e1e1e',
    borderColor: '#333', // 深灰色边框
  },
  honeycombDayCell: {
    backgroundColor: '#FFF3E0', // 浅橙黄色背景
    borderColor: '#FFD7A6', // 更浅的金色边框
    borderRadius: 6, // 模拟蜂巢六边形圆角
  },
  inactiveDay: {
    opacity: 0.5,
    backgroundColor: '#f8f8f8'
  },
  honeycombInactiveDay: {
    backgroundColor: '#FFF8E1', // 非当月单元格与容器同色
    opacity: 0.5, // 半透明处理
  },
  darkInactiveDay: {
    opacity: 0.5,
    backgroundColor: '#222',
  },
  today: {
    borderColor: '#e74c3c', // 当天红框
    borderWidth: 4,
  },
  darkToday: {
    borderColor: '#18b3c3', // 当天青框
    borderWidth: 4,
  },
  honeycombToday: {
    borderColor: '#FF7F50', // 当天深橙色边框
    backgroundColor: '#FFF0C9', // 高亮背景
    borderWidth: 4,
  },
  weekendDayBg: {
    backgroundColor: '#f5f5f5' // 周末浅灰背景
  },
  darkWeekendDayBg: {
    backgroundColor: '#222', // 深色周末背景
  },
  honeycombWeekendDayBg: {
    backgroundColor: '#FFF5CC', // 周末浅金色背景
  },
  hasScheduleBorder: {
    borderColor: '#ddd', // 有日程时深灰边框
    borderWidth: 3,
  },
  darkHasScheduleBorder: {
    borderColor: '#555', // 深色模式下边框颜色
    borderWidth: 2,
  },
  honeycombHasScheduleBorder: {
    borderColor: '#FFB74D', // 浅金色日程边框
    borderWidth: 2,
  },
  hasDeadlineBorder: {
    borderColor: '#FFA500', // 有截止日期时橙色边框
    borderWidth: 2,
  },
  darkHasDeadlineBorder: {
    borderColor: '#FFA500', // 橙色边框保持不变
    borderWidth: 2,
  },
  honeycombHasDeadlineBorder: {
    borderColor: '#FF6F00', // 琥珀色截止日期边框
  },

  dayNumber: {
    fontSize: 16,
    marginTop: 8,
    fontWeight: '500'
  },
  darkDayNumber: {
    color: '#ddd', // 浅色文字
  },
  honeycombDayNumber: {
    color: '#333', // 深灰色
  },
  weekendText: {
    color: '#999' // 周末文字灰色
  },
  darkWeekendText: {
    color: '#777' // 深色模式周末文字
  },
  honeycombWeekendText: {
    color: '#FF6F00', // 周末文字琥珀色
  },
  inactiveDayText: {
    color: '#ccc' // 非当月文字浅灰
  },
  darkInactiveDayText: {
    color: '#555' // 深色模式非当月文字
  },
  honeycombInactiveDayText: {
    color: '#BDBDBD', // 非当月文字浅灰色
  },
  todayText: {
    color: '#000', // 当天文字黑色
    fontWeight: 'bold'
  },
  darkTodayText: {
    color: '#fff', // 当天文字白色
    fontWeight: 'bold'
  },
  honeycombTodayText: {
    color: '#FF6F00', // 当前日文字琥珀色
  },

   // 日程标记
  scheduleMarkers: {
    flexDirection: 'row',
    width: '100%',
    paddingHorizontal: 2,
    marginTop: 4
  },
  scheduleMarker: {
    width: 8,
    height: 8,
    marginRight: 2,
    borderRadius: 4 // 圆形标记
  },

  // 截止日期文字
  deadlineText: {
    fontSize: 12,
    color: '#FFA500',
    marginTop: 4
  },

  // 模态框样式
  modalContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff'
  },
  darkModalContainer: {
    backgroundColor: '#333',
  },
  honeycombModalContainer: {
    backgroundColor: '#FFFACD', // 淡奶油金
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20
  },
  darkModalHeader: {
    borderBottomColor: '#333',
    borderBottomWidth: 1,
    paddingBottom: 10
  },
  honeycombModalHeader: {
    borderBottomColor: '#FFD180', // 模态框头部边框
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold'
  },
  darkModalTitle: {
    color: '#fff'
  },
  honeycombModalTitle: {
    color: '#8B4513', // 深金色模态框标题
  },
  modalEmptyText: {
    fontSize: 16,
    color: '#999',
    marginVertical: 20
  },
  darkModalEmptyText: {
    color: '#666'
  },
  honeycombModalEmptyText: {
    color: '#A1887F', // 深棕色文字
    fontStyle: 'italic', // 斜体
  },
  modalItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  darkModalItem: {
    borderBottomColor: '#333',
  },
  honeycombModalItem: {
    borderBottomColor: '#FFE0B2', // 模态框列表分隔线
  },
  modalItemText: {
    fontSize: 16
  },
  darkModalItemText: {
    color: '#ddd'
  },
  honeycombModalItemText: {
    color: '#333', // 深灰色文字
  },
  modalItemDeadline: {
    fontSize: 14,
    color: '#666'
  },
  darkModalItemDeadline: {
    color: '#999'
  },
  honeycombModalItemDeadline: {
    color: '#FF6F00', // 琥珀色截止日期文字
  },
});

// --------------------- 导出组件及测试工具 --------------------- //
export { SingleMonth };
export default SingleMonth;
