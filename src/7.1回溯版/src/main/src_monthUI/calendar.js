import React, { Component } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, Switch } from 'react-native';
import dayjs from 'dayjs';
import isLeapYear from 'dayjs/plugin/isLeapYear';
import SingleMonth from './singleMonth';
import { themeMode, getThemeMode } from './themeMode' //测试用单例
import { monthNumManager } from './numOfMonth' //测试用单例

dayjs.extend(isLeapYear);


class Calendar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentDate: dayjs(),
      isDeadlineMode: false, // 模式切换状态
      mode: getThemeMode() || 'simple',
      numPrevMonth: monthNumManager.getPrevMonth(),
      numPostMonth: monthNumManager.getPostMonth(),
    };
    this.scrollViewRef = React.createRef();
    this.monthHeights = []; // 存储每个月的高度
    this.isScrollingToCurrent = false; // 滚动状态标志
  }


  // 生成前6个月和后6个月的日期列表
  generateMonths = () => {
    const months = [];
    /*
    // 前6个月
    for (let i = 1; i > 0; i--) {
      const prevMonth = this.state.currentDate.subtract(i, 'month');
      months.push(prevMonth);
    }
    */
    for (let i = this.state.numPrevMonth; i > 0; i--) {
      const prevMonth = this.state.currentDate.subtract(i, 'month');
      months.push(prevMonth);
    }

    // 当前月
    months.push(this.state.currentDate);
    
    /*
    // 后6个月
    for (let i = 1; i <= 1; i++) {
      const nextMonth = this.state.currentDate.add(i, 'month');
      months.push(nextMonth);
    }
    */
    for (let i = 1; i <= this.state.numPostMonth; i++) {
      const nextMonth = this.state.currentDate.add(i, 'month');
      months.push(nextMonth);
    }
    return months;
  };

  componentDidMount() {
    // 等待组件渲染完成后滚动到当前月份
    this.scrollToCurrentMonth();
  }

  scrollToCurrentMonth = () => {
    // 防止重复调用
    if (this.isScrollingToCurrent) return;
    
    this.isScrollingToCurrent = true;
    
    // 使用setTimeout确保所有月份组件都已渲染完成
    setTimeout(() => {
      const months = this.generateMonths();
      const currentIndex = months.findIndex(month => 
        month.isSame(this.state.currentDate, 'month')
      );
      
      // 计算当前月份的滚动偏移量
      let offset = 0;
      for (let i = 0; i < currentIndex; i++) {
        offset += this.monthHeights[i] || 0;
      }
      
      // 获取屏幕高度
      const windowHeight = Dimensions.get('window').height;
      
      // 如果有当前月份的高度信息，微调偏移量使当前月份居中
      if (this.monthHeights[currentIndex]) {
        offset += (this.monthHeights[currentIndex] - windowHeight) / 2;
        offset += 30;  //月界面星期栏大致高度
        offset = Math.max(0, offset);  // 确保偏移量不小于0
      }
      
      // 执行滚动
      if (this.scrollViewRef.current) {
        this.scrollViewRef.current.scrollTo({ y: offset, animated: false });
      }
      
      this.isScrollingToCurrent = false;
    }, 300); // 适当延迟，确保布局完成
  };

  onMonthLayout = (index) => (event) => {
    // 更新对应索引的月份高度
    this.monthHeights[index] = event.nativeEvent.layout.height;
  };

  render() {
    const months = this.generateMonths();
    const { navigation } = this.props;
    const { isDeadlineMode } = this.state;
    const mode = this.state.mode;
    //const mode = getThemeMode() || 'simple';

    return (
      <View style={[
        styles.container,
        (mode === 'dark') && styles.darkContainer,
        (mode === 'honeycomb') && styles.honeycombContainer,
        ]}>
        
        {/* 星期标题，固定在顶部 */}
        <View style={[
          styles.weekdays,
          (mode === 'dark') && styles.darkWeekdays,
          (mode === 'honeycomb') && styles.honeycombWeekdays
          ]}>
          {['日', '一', '二', '三', '四', '五', '六'].map((day, index) => (
            <Text key={index} style={[
              styles.weekday,
              (mode === 'dark') && styles.darkWeekday,
              (mode === 'honeycomb') && styles.honeycombWeekday
              ]}>
              {day}
            </Text>
          ))}
        </View>

        <ScrollView ref={this.scrollViewRef}>
          {months.map((month, index) => (
            <View key={index} onLayout={this.onMonthLayout(index)}>
              <SingleMonth 
                date={month} 
                navigation={navigation} 
                mode={mode}
              />
            </View>
          ))}
          {/* 底部空白区域 */}
          <View style={{ height: Dimensions.get('window').height * 0.15 }} />
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
   // 主容器
  container: {
    padding: 16,
    backgroundColor: '#fff'
  },
  darkContainer: {
    backgroundColor: '#000'
  },
  honeycombContainer: {
    backgroundColor: '#FFF8E1', // 浅金色，浅金色背景（类似蜂巢底色）
  },

  modeSwitchContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 10
  },
  switchLabel: {
    marginRight: 10,
    fontSize: 16
  },
  
  // 星期标题栏
  weekdays: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
    backgroundColor: '#f5f5f5',
    paddingVertical: 8,
    borderRadius: 4
  },
  darkWeekdays: {
    backgroundColor: '#333'
  },
  honeycombWeekdays: {
    //蜂巢纹理背景
    backgroundColor: '#FFE0B2', // 暖黄色背景
    borderWidth: 1,
    borderColor: '#FFD180', // 浅金色边框
  },
  
  // 星期文字
  weekday: {
    width: "14.28%",
    textAlign: 'center',
    fontWeight: '500'
  },
  darkWeekday: {
    color: '#fff'
  },
  honeycombWeekday: {
    // 星期文字：深金色字体
    color: '#B8860B', // 深金色文字
    fontWeight: '600', // 加粗
  },
});

export default Calendar;
