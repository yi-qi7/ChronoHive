import React, { useState } from 'react';
import { 
  SafeAreaView, 
  ScrollView,
  View, 
  Text, 
  TouchableOpacity, 
  TextInput,
  StyleSheet,
  Alert
} from 'react-native';
import dayjs from 'dayjs';

const EventFormScreen = ({ onClose, mode = 'create', eventData, onSave, currentWeek }) => {
  // 表单状态管理
  const [title, setTitle] = useState(eventData?.title || '');
  const [eventType, setEventType] = useState(eventData?.type || '默认');
  const [startDate, setStartDate] = useState(
    eventData?.date || dayjs(currentWeek).startOf('week').format('YYYY-MM-DD')
  );
  const [startTime, setStartTime] = useState(eventData?.startTime || '10:00');
  const [endTime, setEndTime] = useState(eventData?.endTime || '11:00');
  const [location, setLocation] = useState(eventData?.location || '');
  const [description, setDescription] = useState(eventData?.description || '');
  
  const eventTypes = ['默认', '重要日', '生日', '待办'];
  
  // 保存日程
  const handleSave = () => {
    // 验证时间格式
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    
    if (!title.trim()) {
      Alert.alert('请输入标题');
      return;
    }
    
    if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
      Alert.alert('时间格式不正确', '请使用 HH:mm 格式（例如 10:30）');
      return;
    }
    
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);
    
    // 验证时间范围
    if (startHour < 0 || startHour > 23 || startMinute < 0 || startMinute > 59 ||
        endHour < 0 || endHour > 23 || endMinute < 0 || endMinute > 59) {
      Alert.alert('时间范围不正确', '请使用 00:00 - 23:59 范围内的时间');
      return;
    }
    
    // 验证开始时间是否早于结束时间
    const startTimeNum = startHour * 60 + startMinute;
    const endTimeNum = endHour * 60 + endMinute;
    
    if (startTimeNum >= endTimeNum) {
      Alert.alert('时间不正确', '开始时间必须早于结束时间');
      return;
    }
    
    const newEvent = {
      id: eventData?.id || Date.now(),
      title,
      type: eventType,
      date: startDate,
      startTime,
      endTime,
      location,
      description
    };
    
    onSave(newEvent, mode);
    onClose();
  };
  
  return (
    <SafeAreaView style={styles.newEventContainer}>
      {/* 顶部导航栏 */}
      <View style={styles.newEventHeader}>
        <TouchableOpacity onPress={onClose} style={styles.iconButton}>
          <Text style={styles.iconText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.newEventTitle}>
          {mode === 'edit' ? '编辑日程' : '新建日程'}
        </Text>
        <TouchableOpacity onPress={handleSave} style={styles.iconButton}>
          <Text style={[styles.iconText, styles.saveText]}>✓</Text>
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
        {/* 标题输入 */}
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
          {/* 开始时间输入 */}
          <View style={styles.inputRow}>
            <View style={styles.inputIcon}>
              <Text>⏰</Text>
            </View>
            <View style={styles.inputFieldContainer}>
              <Text style={styles.inputLabel}>开始时间</Text>
              <TextInput
                style={styles.inputField}
                placeholder="HH:mm (例如 10:30)"
                placeholderTextColor="#999"
                value={startTime}
                onChangeText={setStartTime}
                keyboardType="numeric"
              />
            </View>
          </View>
          
          {/* 结束时间输入 */}
          <View style={styles.inputRow}>
            <View style={styles.inputIcon}>
              <Text>⏰</Text>
            </View>
            <View style={styles.inputFieldContainer}>
              <Text style={styles.inputLabel}>结束时间</Text>
              <TextInput
                style={styles.inputField}
                placeholder="HH:mm (例如 11:30)"
                placeholderTextColor="#999"
                value={endTime}
                onChangeText={setEndTime}
                keyboardType="numeric"
              />
            </View>
          </View>
          
          {/* 日期输入 */}
          <View style={styles.inputRow}>
            <View style={styles.inputIcon}>
              <Text>📅</Text>
            </View>
            <View style={styles.inputFieldContainer}>
              <Text style={styles.inputLabel}>日期</Text>
              <TextInput
                style={styles.inputField}
                placeholder="YYYY-MM-DD (例如 2025-06-15)"
                placeholderTextColor="#999"
                value={startDate}
                onChangeText={setStartDate}
                keyboardType="numeric"
              />
            </View>
          </View>
          
          {/* 地点输入 */}
          <View style={styles.inputRow}>
            <View style={styles.inputIcon}>
              <Text>📍</Text>
            </View>
            <View style={styles.inputFieldContainer}>
              <Text style={styles.inputLabel}>地点</Text>
              <TextInput
                style={styles.inputField}
                placeholder="输入地点"
                placeholderTextColor="#999"
                value={location}
                onChangeText={setLocation}
              />
            </View>
          </View>
          
          {/* 描述输入 */}
          <View style={styles.inputRow}>
            <View style={styles.inputIcon}>
              <Text>📝</Text>
            </View>
            <View style={styles.inputFieldContainer}>
              <Text style={styles.inputLabel}>备注</Text>
              <TextInput
                style={[styles.inputField, styles.multilineField]}
                placeholder="输入备注信息"
                placeholderTextColor="#999"
                value={description}
                onChangeText={setDescription}
                multiline
              />
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  newEventContainer: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  newEventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  iconButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    fontSize: 24,
    color: '#333',
  },
  saveText: {
    color: '#1890ff',
    fontWeight: 'bold',
  },
  newEventTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  eventTypeContainer: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  eventTypeBtn: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 16,
    marginHorizontal: 8,
    backgroundColor: '#f0f0f0',
  },
  selectedEventType: {
    backgroundColor: '#1890ff',
  },
  eventTypeText: {
    fontSize: 15,
    color: '#666',
  },
  selectedEventTypeText: {
    color: '#fff',
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  inputContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  quickInput: {
    fontSize: 16,
    color: '#333',
    height: 40,
  },
  detailForm: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginTop: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  inputIcon: {
    width: 32,
    alignItems: 'center',
  },
  inputFieldContainer: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 13,
    color: '#999',
    marginBottom: 2,
  },
  inputField: {
    fontSize: 16,
    color: '#333',
    paddingVertical: 0,
    height: 26,
  },
  multilineField: {
    height: 80,
    paddingVertical: 8,
    textAlignVertical: 'top',
  },
});

export default EventFormScreen;