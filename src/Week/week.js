import React, { useState } from 'react';
import { 
  SafeAreaView, 
  ScrollView,
  View, 
  Text, 
  TouchableOpacity, 
  TextInput,
  Modal,
  StyleSheet, 
  StatusBar,
  Dimensions,
  Alert
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const { width, height } = Dimensions.get('window');

// 主屏幕组件
const WeekCalendar = ({ onAddEvent, onEditEvent }) => {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  
  // 事件数据结构
  const initialEvents = {
    9: {
      '09:00': { id: 1, title: '采购会议', location: '会议室A', startTime: '09:00', endTime: '10:00', date: 9, description: '季度采购计划讨论' },
      '14:00': { id: 2, title: '客户访谈', location: '客户公司', startTime: '14:00', endTime: '15:30', date: 9, description: '新产品需求分析' }
    },
    10: {
      '10:00': { id: 3, title: '项目评审', location: '评审室', startTime: '10:00', endTime: '11:30', date: 10, description: 'Q2项目进度审查' }
    },
    11: {
      '11:00': { id: 4, title: '用户调研', location: '用户中心', startTime: '11:00', endTime: '12:30', date: 11, description: '产品体验反馈收集' }
    },
    12: {
      '13:00': { id: 5, title: '需求分析', location: '设计中心', startTime: '13:00', endTime: '14:00', date: 12, description: '新功能需求梳理' }
    },
    13: {
      '09:00': { id: 6, title: '软件工程', location: '开发中心', startTime: '09:00', endTime: '11:00', date: 13, description: '系统架构设计讨论' },
      '18:00': { id: 7, title: '父亲节聚餐', location: '玫瑰餐厅', startTime: '18:00', endTime: '20:00', date: 13, description: '家庭庆祝晚宴' }
    },
    14: {
      '15:00': { id: 8, title: '团队周会', location: '会议室B', startTime: '15:00', endTime: '16:00', date: 14, description: '团队工作同步会议' }
    }
  };

  const [events, setEvents] = useState(initialEvents);
  
  // 日期数据
  const weekDays = [
    { id: 1, day: '一', date: 9, lunar: '十四' },
    { id: 2, day: '二', date: 10, lunar: '十五' },
    { id: 3, day: '三', date: 11, lunar: '十六' },
    { id: 4, day: '四', date: 12, lunar: '十七' },
    { id: 5, day: '五', date: 13, lunar: '十八', special: '父亲节' },
    { id: 6, day: '六', date: 14, lunar: '十九' },
    { id: 7, day: '日', date: 15, lunar: '二十' }
  ];

  // 时间槽
  const timeSlots = [
    { id: 1, time: '08:00' },
    { id: 2, time: '09:00' },
    { id: 3, time: '10:00' },
    { id: 4, time: '11:00' },
    { id: 5, time: '12:00' },
    { id: 6, time: '13:00' },
    { id: 7, time: '14:00' },
    { id: 8, time: '15:00' },
    { id: 9, time: '16:00' },
    { id: 10, time: '17:00' },
    { id: 11, time: '18:00' },
    { id: 12, time: '19:00' },
    { id: 13, time: '20:00' },
  ];

  // 全天事件
  const allDayEvents = [
    { id: 1, title: '父亲节' }
  ];

  // 打开日程详情
  const openEventDetails = (date, time, event) => {
    setSelectedEvent({...event, date, time});
    setModalVisible(true);
  };

  // 关闭日程详情
  const closeEventDetails = () => {
    setModalVisible(false);
    setSelectedEvent(null);
  };

  // 删除日程
  const deleteEvent = () => {
    if (!selectedEvent) return;
    
    Alert.alert(
      "删除日程",
      `确定要删除日程 "${selectedEvent.title}" 吗?`,
      [
        {
          text: "取消",
          style: "cancel"
        },
        { 
          text: "确认删除", 
          onPress: () => {
            const { date, time } = selectedEvent;
            
            // 创建新的事件对象副本
            const newEvents = {...events};
            
            // 检查指定日期是否存在事件
            if (newEvents[date] && newEvents[date][time]) {
              // 删除指定时间的日程
              delete newEvents[date][time];
              
              // 如果该日期没有其他日程，删除整个日期条目
              if (Object.keys(newEvents[date]).length === 0) {
                delete newEvents[date];
              }
              
              // 更新状态
              setEvents(newEvents);
              setModalVisible(false);
            }
          } 
        }
      ]
    );
  };

  // 编辑日程
  const handleEditEvent = () => {
    if (onEditEvent && selectedEvent) {
      onEditEvent(selectedEvent);
      setModalVisible(false);
    }
  };

  // 渲染日期标题
  const renderDayHeader = (day) => (
    <View key={day.id} style={styles.dayHeader}>
      <Text style={styles.dayLabel}>{day.day}</Text>
      <View style={day.date === 13 ? styles.specialDate : styles.dateContainer}>
        <Text style={day.date === 13 ? styles.specialDateText : styles.dateText}>
          {day.date}
        </Text>
      </View>
      <Text style={day.special ? styles.specialLunar : styles.lunarDate}>
        {day.lunar}
      </Text>
      {day.special && <Text style={styles.specialText}>{day.special}</Text>}
    </View>
  );

  // 渲染时间槽
  const renderTimeSlotRow = (slot) => {
    const rowStyle = slot.id % 2 === 0 ? styles.timeSlotRowEven : styles.timeSlotRow;
    
    return (
      <View key={slot.id} style={rowStyle}>
        <View style={styles.timeSlotLabel}>
          <Text style={styles.timeSlotText}>{slot.time}</Text>
        </View>
        
        {/* 为每个日期渲染事件块 */}
        {weekDays.map(day => {
          const dayEvents = events[day.date] || {};
          const event = dayEvents[slot.time];
          
          return (
            <TouchableOpacity 
              key={`${day.date}-${slot.time}`}
              style={styles.dayCell}
              onPress={() => event && openEventDetails(day.date, slot.time, event)}
              activeOpacity={0.7}
            >
              {event ? (
                <View style={[
                  styles.eventBlock,
                  { backgroundColor: day.date === 13 ? '#ffe7e8' : '#e6f7ff' }
                ]}>
                  <View style={styles.eventColorMarker} />
                  <Text style={styles.eventTitle}>{event.title}</Text>
                </View>
              ) : null}
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
        {/* 顶部导航栏 */}
        <View style={styles.header}>
          <View>
            <Text style={styles.yearText}>2025年</Text>
            <Text style={styles.monthText}>6月</Text>
          </View>
          <View style={styles.weekIndicator}>
            <Text style={styles.weekText}>24周</Text>
          </View>
          <View style={styles.actions}>
            <TouchableOpacity style={styles.actionBtn}>
              <Icon name="search" size={20} color="#1890FF" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn}>
              <Icon name="filter" size={20} color="#1890FF" />
            </TouchableOpacity>
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
        
        {/* 全天事件区域 */}
        <View style={styles.allDaySection}>
          <Text style={styles.allDayTitle}>全天</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {allDayEvents.map(event => (
              <View key={event.id} style={styles.allDayEvent}>
                <Text style={styles.allDayText}>{event.title}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
        
        {/* 主网格区域 */}
        <ScrollView style={styles.gridContainer}>
          {timeSlots.map(renderTimeSlotRow)}
        </ScrollView>
        
        {/* 添加按钮 */}
        <TouchableOpacity style={styles.addButton} onPress={onAddEvent}>
          <Icon name="add" size={30} color="white" />
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
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Icon name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>
              
              {/* 详情内容 */}
              <View style={styles.detailsContainer}>
                <View style={styles.detailRow}>
                  <Icon name="calendar-outline" size={20} color="#666" />
                  <View style={styles.detailTextContainer}>
                    <Text style={styles.detailLabel}>日期</Text>
                    <Text style={styles.detailValue}>6月{selectedEvent?.date}日</Text>
                  </View>
                </View>
                
                <View style={styles.detailRow}>
                  <Icon name="time-outline" size={20} color="#666" />
                  <View style={styles.detailTextContainer}>
                    <Text style={styles.detailLabel}>时间</Text>
                    <Text style={styles.detailValue}>{selectedEvent?.startTime}-{selectedEvent?.endTime}</Text>
                  </View>
                </View>
                
                <View style={styles.detailRow}>
                  <Icon name="location-outline" size={20} color="#666" />
                  <View style={styles.detailTextContainer}>
                    <Text style={styles.detailLabel}>地点</Text>
                    <Text style={styles.detailValue}>{selectedEvent?.location}</Text>
                  </View>
                </View>
                
                <View style={styles.detailRow}>
                  <Icon name="document-text-outline" size={20} color="#666" />
                  <View style={styles.detailTextContainer}>
                    <Text style={styles.detailLabel}>备注</Text>
                    <Text style={styles.detailValue}>{selectedEvent?.description}</Text>
                  </View>
                </View>
              </View>
              
              {/* 操作按钮 */}
              <View style={styles.modalButtons}>
                <TouchableOpacity 
                  style={styles.editButton}
                  onPress={handleEditEvent}
                >
                  <Text style={styles.buttonText}>编辑</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.deleteButton}
                  onPress={deleteEvent}
                >
                  <Text style={[styles.buttonText, {color: '#ff4d4f'}]}>删除</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
};

// 新建/编辑日程组件
const EventFormScreen = ({ onClose, mode = 'create', eventData, onSave }) => {
  // 表单状态管理
  const [title, setTitle] = useState(eventData?.title || '');
  const [eventType, setEventType] = useState(eventData?.type || '默认');
  const [allDay, setAllDay] = useState(eventData?.allDay || false);
  const [startDate, setStartDate] = useState(eventData?.date || 13);
  const [startTime, setStartTime] = useState(eventData?.startTime || '10:00');
  const [endTime, setEndTime] = useState(eventData?.endTime || '11:00');
  const [location, setLocation] = useState(eventData?.location || '');
  const [description, setDescription] = useState(eventData?.description || '');
  
  const eventTypes = ['默认', '重要日', '生日', '待办'];
  
  // 保存日程
  const handleSave = () => {
    if (!title.trim()) {
      Alert.alert('请输入标题');
      return;
    }
    
    const newEvent = {
      id: eventData?.id || Date.now(),
      title,
      type: eventType,
      allDay,
      date: startDate,
      startTime,
      endTime,
      location,
      description
    };
    
    onSave(newEvent, mode);
    onClose();
  };
  
  // 时间选择器
  const renderTimeSelector = (label, time, setTime) => (
    <TouchableOpacity 
      style={styles.timeRow}
      onPress={() => showTimePicker(label, setTime)}
    >
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.timeText}>{time}</Text>
    </TouchableOpacity>
  );

  // 时间选择器实现
  const showTimePicker = (title, setter) => {
    const timeOptions = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'];
    
    Alert.alert(
      `选择${title}时间`,
      null,
      [
        ...timeOptions.map(time => ({ 
          text: time, 
          onPress: () => setter(time) 
        })),
        { text: '取消', style: 'cancel' }
      ]
    );
  };
  
  return (
    <SafeAreaView style={styles.newEventContainer}>
      {/* 顶部导航栏 */}
      <View style={styles.newEventHeader}>
        <TouchableOpacity onPress={onClose}>
          <Icon name="close" size={28} color="#666" />
        </TouchableOpacity>
        <Text style={styles.newEventTitle}>
          {mode === 'edit' ? '编辑日程' : '新建日程'}
        </Text>
        <TouchableOpacity onPress={handleSave}>
          <Icon name="checkmark" size={28} color="#1890ff" />
        </TouchableOpacity>
      </View>
      
      {/* 日程类型选择 */}
      <ScrollView horizontal style={styles.eventTypeContainer} showsHorizontalScrollIndicator={false}>
        {eventTypes.map((type) => (
          <TouchableOpacity 
            key={type}
            style={[
              styles.eventTypeBtn,
              eventType === type && styles.selectedEventType
            ]}
            onPress={() => setEventType(type)}
          >
            <Text style={[
              styles.eventTypeText,
              eventType === type && styles.selectedEventTypeText
            ]}>
              {type}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      
      {/* 内容区域 */}
      <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
        {/* 标题输入 - 相当于"一句话智慧创建" */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.quickInput}
            placeholder="请输入日程标题..."
            placeholderTextColor="#999"
            value={title}
            onChangeText={setTitle}
          />
        </View>
        
        {/* 详细表单 */}
        <View style={styles.detailForm}>
          {/* 全天开关 */}
          <TouchableOpacity style={styles.toggleRow} onPress={() => setAllDay(!allDay)}>
            <Text style={styles.label}>全天</Text>
            <View style={styles.toggle}>
              {allDay ? (
                <Icon name="toggle" size={36} color="#1890ff" />
              ) : (
                <Icon name="toggle-outline" size={36} color="#ddd" />
              )}
            </View>
          </TouchableOpacity>
          
          {/* 开始时间选择器 */}
          {renderTimeSelector('开始时间', startTime, setStartTime)}
          
          {/* 结束时间选择器 */}
          {renderTimeSelector('结束时间', endTime, setEndTime)}
          
          {/* 日期选择器 */}
          <TouchableOpacity 
            style={styles.timeRow}
            onPress={() => showDatePicker(setStartDate)}
          >
            <Text style={styles.label}>日期</Text>
            <Text style={styles.timeText}>6月{startDate}日</Text>
          </TouchableOpacity>
          
          {/* 地点输入 */}
          <View style={styles.inputRow}>
            <TextInput
              style={styles.inputField}
              placeholder="地点"
              placeholderTextColor="#999"
              value={location}
              onChangeText={setLocation}
            />
          </View>
          
          {/* 描述输入 */}
          <View style={styles.inputRow}>
            <TextInput
              style={styles.inputField}
              placeholder="备注"
              placeholderTextColor="#999"
              value={description}
              onChangeText={setDescription}
              multiline
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// 应用主组件
const App = () => {
  const [currentView, setCurrentView] = useState('calendar'); // calendar | form
  const [selectedEvent, setSelectedEvent] = useState(null); // 编辑的事件
  const [formMode, setFormMode] = useState('create'); // create | edit
  
  // 处理保存日程
  const handleSaveEvent = (newEvent, mode) => {
    setCurrentView('calendar');
    
    // 在实际应用中，这里会更新存储的事件数据
    Alert.alert(
      "日程保存成功", 
      mode === 'edit' 
        ? `"${newEvent.title}"日程已更新` 
        : `"${newEvent.title}"日程已创建`,
      [{ text: "确定" }]
    );
  };
  
  // 打开编辑界面
  const handleEditEvent = (event) => {
    setSelectedEvent(event);
    setFormMode('edit');
    setCurrentView('form');
  };
  
  // 关闭表单视图
  const closeFormView = () => {
    setCurrentView('calendar');
  };

  return (
    <View style={{ flex: 1 }}>
      {currentView === 'calendar' ? (
        <WeekCalendar 
          onAddEvent={() => {
            setFormMode('create');
            setCurrentView('form');
          }} 
          onEditEvent={handleEditEvent}
        />
      ) : (
        <EventFormScreen 
          mode={formMode}
          eventData={selectedEvent}
          onClose={closeFormView}
          onSave={handleSaveEvent}
        />
      )}
    </View>
  );
};

// 样式定义
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
    position: 'absolute',
    top: 14,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  weekText: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    gap: 16,
  },
  actionBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f0f5ff',
    justifyContent: 'center',
    alignItems: 'center',
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
  lunarDate: {
    fontSize: 11,
    color: '#999999',
  },
  specialLunar: {
    fontSize: 11,
    color: '#ff4d4f',
    fontWeight: '500',
  },
  specialText: {
    fontSize: 10,
    color: '#ff4d4f',
    marginTop: 4,
    backgroundColor: '#fff0f0',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
  },
  allDaySection: {
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eeeeee',
    backgroundColor: '#fafafa',
    alignItems: 'center',
  },
  allDayTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666666',
    marginRight: 12,
    width: 40,
  },
  allDayEvent: {
    backgroundColor: '#f0f7ff',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 6,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#d1e9ff',
  },
  allDayText: {
    fontSize: 14,
    color: '#1890ff',
    fontWeight: '500',
  },
  gridContainer: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  timeSlotRow: {
    flexDirection: 'row',
    minHeight: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  timeSlotRowEven: {
    flexDirection: 'row',
    minHeight: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#f5f5f5',
  },
  timeSlotLabel: {
    width: 50,
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingRight: 8,
    paddingTop: 8,
  },
  timeSlotText: {
    fontSize: 12,
    color: '#999999',
  },
  dayCell: {
    flex: 1,
    padding: 2,
    height: '100%',
  },
  eventBlock: {
    flex: 1,
    borderRadius: 6,
    padding: 8,
    justifyContent: 'center',
    marginHorizontal: 1,
    backgroundColor: '#e6f7ff',
    borderLeftWidth: 4,
    borderLeftColor: '#1890ff',
  },
  eventColorMarker: {
    position: 'absolute',
    left: -1,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: '#1890ff',
  },
  eventTitle: {
    fontSize: 12,
    fontWeight: '500',
    color: '#333333',
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
  
  // 模态框样式
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
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333333',
    flex: 1,
    paddingRight: 10,
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
    justifyContent: 'space-between',
    marginTop: 10,
  },
  editButton: {
    flex: 1,
    padding: 12,
    backgroundColor: '#f0f5ff',
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 8,
  },
  deleteButton: {
    flex: 1,
    padding: 12,
    backgroundColor: '#fff0f0',
    borderRadius: 8,
    alignItems: 'center',
    marginLeft: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1890ff',
  },
  
  // 新建/编辑日程界面样式
  newEventContainer: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  newEventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
  },
  newEventTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  eventTypeContainer: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
  },
  eventTypeBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#eee',
  },
  selectedEventType: {
    backgroundColor: '#1890ff',
    borderColor: '#1890ff',
  },
  eventTypeText: {
    fontSize: 15,
    color: '#666',
  },
  selectedEventTypeText: {
    color: '#fff',
    fontWeight: '500',
  },
  formContainer: {
    flex: 1,
    padding: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  quickInput: {
    height: 50,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
  },
  detailForm: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  label: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  toggle: {
    marginRight: 10,
  },
  timeRow: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timeText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  inputRow: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  inputField: {
    fontSize: 16,
    color: '#333',
    paddingVertical: 8,
  },
});

export default App;
