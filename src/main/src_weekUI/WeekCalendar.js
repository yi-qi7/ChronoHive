// src/components/WeekCalendar.js
// src/components/WeekCalendar.js
import React, { useState, useEffect } from 'react';
import { 
  SafeAreaView, 
  ScrollView,
  View, 
  Text, 
  TouchableOpacity, 
  Alert,
  Modal,
  Dimensions,
  StyleSheet,
  StatusBar
} from 'react-native';
import dayjs from 'dayjs';

const { width, height } = Dimensions.get('window');

const WeekCalendar = ({ events, onAddEvent, onEditEvent, onDeleteEvent, currentWeek, setCurrentWeek , onNavigateToAPI, isAPIScreenVisible}) => {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [weekDays, setWeekDays] = useState([]);
  
  // 生成一周的日期数据
  const generateWeekDays = (startDate) => {
    const days = [];
    const startOfWeek = dayjs(startDate).startOf('week');
    
    for (let i = 0; i < 7; i++) {
      const date = startOfWeek.add(i, 'day');
      const isToday = dayjs().isSame(date, 'day');
      
      days.push({
        id: i + 1,
        day: ['日', '一', '二', '三', '四', '五', '六'][date.day()],
        date: date.date(),
        month: date.month() + 1,
        year: date.year(),
        dateStr: date.format('YYYY-MM-DD'),
        isToday: isToday
      });
    }
    return days;
  };

  // 时间槽 - 精确到分钟
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 0; hour <= 23; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push({
          id: `${hour}-${minute}`,
          time: timeStr,
          hour,
          minute,
          totalMinutes: hour * 60 + minute
        });
      }
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();
  
  // 初始化周数据
  useEffect(() => {
    setWeekDays(generateWeekDays(currentWeek));
  }, [currentWeek]);

  // 打开日程详情
  const openEventDetails = (dateKey, time, event) => {
    setSelectedEvent({...event, date: dateKey, time});
    setModalVisible(true);
  };

  // 关闭日程详情
  const closeEventDetails = () => {
    setModalVisible(false);
    setSelectedEvent(null);
  };
  
  // 删除日程
  const handleDeleteEvent = () => {
    Alert.alert(
      '删除日程',
      `确定要删除"${selectedEvent.title}"吗？`,
      [
        {
          text: '取消',
          style: 'cancel',
        },
        {
          text: '删除',
          style: 'destructive',
          onPress: () => {
            onDeleteEvent(selectedEvent);
            setModalVisible(false);
          },
        },
      ]
    );
  };
  
  // 渲染日期标题
  const renderDayHeader = (day) => {
    return (
      <View key={day.id} style={styles.dayHeader}>
        <Text style={styles.dayLabel}>{day.day}</Text>
        <View style={day.isToday ? styles.specialDate : styles.dateContainer}>
          <Text style={day.isToday ? styles.specialDateText : styles.dateText}>
            {day.date}
          </Text>
        </View>
      </View>
    );
  };

  // 计算时间块位置和高度
  const calculateEventPosition = (event) => {
    if (!event) return null;
    
    const [startHour, startMinute] = event.startTime.split(':').map(Number);
    const [endHour, endMinute] = event.endTime.split(':').map(Number);
    
    const startTotalMinutes = startHour * 60 + startMinute;
    const endTotalMinutes = endHour * 60 + endMinute;
    const durationMinutes = endTotalMinutes - startTotalMinutes;
    
    // 从0:00开始的分钟数转换为垂直位置
    const topPosition = (startTotalMinutes / (24 * 60)) * 100;
    const heightPercentage = (durationMinutes / (24 * 60)) * 100;
    
    return {
      top: `${topPosition}%`,
      height: `${heightPercentage}%`,
      startTotalMinutes,
      endTotalMinutes
    };
  };

  // 渲染一天的事件块
  const renderDayEvents = (day) => {
    const dayEvents = events[day.dateStr] || {};
    
    return Object.values(dayEvents).map((event) => {
      const position = calculateEventPosition(event);
      
      return (
        <TouchableOpacity
          key={`${day.dateStr}-${event.id}`}
          style={[
            styles.eventBlock,
            styles[`${event.type}Event`],
            {
              top: position.top,
              height: position.height,
            }
          ]}
          onPress={() => openEventDetails(day.dateStr, `${event.startTime}-${event.endTime}`, event)}
        >
          <View style={styles.eventColorMarker} />
          <Text 
            numberOfLines={position.height < 5 ? 1 : 2} 
            ellipsizeMode="tail" 
            style={styles.eventTitle}
          >
            {event.title}
          </Text>
        </TouchableOpacity>
      );
    });
  };

  // 切换周
  const goToPreviousWeek = () => {
    setCurrentWeek(dayjs(currentWeek).subtract(1, 'week'));
  };

  const goToNextWeek = () => {
    setCurrentWeek(dayjs(currentWeek).add(1, 'week'));
  };

  // 获取当前显示的周文本
  const getWeekRangeText = () => {
    const start = dayjs(currentWeek).startOf('week').format('MM月DD日');
    const end = dayjs(currentWeek).endOf('week').format('MM月DD日');
    return `${start} - ${end}`;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
        {/* 顶部导航栏 */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.yearText}>{dayjs(currentWeek).format('YYYY年')}</Text>
            <Text style={styles.monthText}>{dayjs(currentWeek).format('MM月')}</Text>
          </View>
          
          <View style={styles.weekIndicator}>
            <Text style={styles.weekText}>{getWeekRangeText()}</Text>
          </View>
          
          <View style={styles.actions}>
            <TouchableOpacity style={styles.actionBtn} onPress={goToPreviousWeek}>
              <Text style={styles.actionText}>←</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn} onPress={goToNextWeek}>
              <Text style={styles.actionText}>→</Text>
            </TouchableOpacity>
            
            {/* <TouchableOpacity style={styles.actionBtn} onPress={() => onNavigateToAPI(isAPIScreenVisible)}>
              <Text style={styles.actionText}>API</Text>
            </TouchableOpacity> */}
          </View>
        </View>
        
        {/* 星期栏 */}
        <View style={styles.weekRow}>
          {/* 左侧留白 */}
          <View style={styles.weekHeaderLeft} />
          
          {/* 日期栏 */}
          {weekDays.map(day => (
            <View key={day.id} style={styles.dayHeaderWrapper}>
              {renderDayHeader(day)}
            </View>
          ))}
        </View>
        
        {/* 主网格区域 */}
        <ScrollView style={styles.gridContainer}>
          <View style={styles.timeGrid}>
            {/* 时间刻度线 */}
            <View style={styles.timeScale}>
              {timeSlots.filter(slot => slot.minute === 0).map(slot => (
                <Text key={slot.id} style={styles.timeScaleText}>
                  {slot.time}
                </Text>
              ))}
            </View>
            
            {/* 时间网格 */}
            <View style={styles.grid}>
              {weekDays.map(day => (
                <View key={`column-${day.id}`} style={styles.gridColumn}>
                  {/* 渲染当前日期的事件块 */}
                  {renderDayEvents(day)}
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
        
        {/* 添加按钮 */}
        <TouchableOpacity style={styles.addButton} onPress={onAddEvent}>
          <Text style={styles.addText}>+</Text>
        </TouchableOpacity>
        
        {/* 日程详情弹窗 */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              {/* 弹窗头部 */}
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{selectedEvent?.title}</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
                  <Text style={styles.closeText}>×</Text>
                </TouchableOpacity>
              </View>
              
              {/* 详情内容 */}
              <View style={styles.detailsContainer}>
                <View style={styles.detailRow}>
                  <Text>📅</Text>
                  <View style={styles.detailTextContainer}>
                    <Text style={styles.detailLabel}>日期</Text>
                    <Text style={styles.detailValue}>{dayjs(selectedEvent?.date).format('YYYY年MM月DD日')}</Text>
                  </View>
                </View>
                
                <View style={styles.detailRow}>
                  <Text>⏰</Text>
                  <View style={styles.detailTextContainer}>
                    <Text style={styles.detailLabel}>时间</Text>
                    <Text style={styles.detailValue}>{selectedEvent?.startTime}-{selectedEvent?.endTime}</Text>
                  </View>
                </View>
                
                {selectedEvent?.location ? (
                  <View style={styles.detailRow}>
                    <Text>📍</Text>
                    <View style={styles.detailTextContainer}>
                      <Text style={styles.detailLabel}>地点</Text>
                      <Text style={styles.detailValue}>{selectedEvent?.location}</Text>
                    </View>
                  </View>
                ) : null}
                
                {selectedEvent?.description ? (
                  <View style={styles.detailRow}>
                    <Text>📝</Text>
                    <View style={styles.detailTextContainer}>
                      <Text style={styles.detailLabel}>备注</Text>
                      <Text style={styles.detailValue}>{selectedEvent?.description}</Text>
                    </View>
                  </View>
                ) : null}
              </View>
              
              {/* 操作按钮 */}
              <View style={styles.actionButtons}>
                <TouchableOpacity 
                  style={styles.deleteButton}
                  onPress={handleDeleteEvent}
                >
                  <Text style={[styles.buttonText, { color: '#ff4d4f' }]}>删除</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.editButton}
                  onPress={() => {
                    setModalVisible(false);
                    onEditEvent(selectedEvent);
                  }}
                >
                  <Text style={[styles.buttonText, { color: '#1890ff' }]}>编辑</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eeeeee',
  },
  headerLeft: {
    alignItems: 'flex-start',
  },
  yearText: {
    fontSize: 14,
    color: '#999999',
  },
  monthText: {
    fontSize: 22,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  weekIndicator: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekText: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f0f5ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1890ff',
  },
  weekRow: {
    flexDirection: 'row',
    backgroundColor: '#fafafa',
    paddingTop: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eeeeee',
  },
  weekHeaderLeft: {
    width: 50,
  },
  dayHeaderWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayHeader: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  dayLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
    marginBottom: 4,
  },
  dateContainer: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  specialDate: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#ff4d4f',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
  },
  specialDateText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#ffffff',
  },
  gridContainer: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  timeGrid: {
    flexDirection: 'row',
    height: 24 * 60, // 代表24小时的高度
  },
  timeScale: {
    width: 50,
    paddingRight: 8,
  },
  timeScaleText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
    height: 60, // 每60px代表1小时
    paddingTop: 4,
  },
  grid: {
    flex: 1,
    flexDirection: 'row',
    position: 'relative',
  },
  gridColumn: {
    flex: 1,
    height: '100%',
    position: 'relative',
    borderLeftWidth: 1,
    borderLeftColor: '#f0f0f0',
  },
  eventBlock: {
    position: 'absolute',
    left: 4,
    right: 4,
    borderRadius: 6,
    padding: 6,
    overflow: 'hidden',
    zIndex: 10,
  },
  默认Event: {
    backgroundColor: '#e6f7ff',
  },
  重要日Event: {
    backgroundColor: '#fff2f0',
  },
  生日Event: {
    backgroundColor: '#fffbe6',
  },
  待办Event: {
    backgroundColor: '#f6ffed',
  },
  eventColorMarker: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: '#1890ff',
  },
  eventTitle: {
    fontSize: 12,
    fontWeight: '500',
    color: '#333333',
    paddingLeft: 6,
  },
  addButton: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#1890ff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#1890ff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  addText: {
    fontSize: 32,
    color: '#fff',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: width * 0.85,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333333',
    flex: 1,
  },
  detailsContainer: {
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  detailTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: '#999999',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 16,
    color: '#333333',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
    gap: 16,
  },
  deleteButton: {
    padding: 12,
    backgroundColor: '#fff2f0',
    borderRadius: 8,
    alignItems: 'center',
    minWidth: 80,
  },
  editButton: {
    padding: 12,
    backgroundColor: '#f0f5ff',
    borderRadius: 8,
    alignItems: 'center',
    minWidth: 80,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '500',
  },
});

export default WeekCalendar;