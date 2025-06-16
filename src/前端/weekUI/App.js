
import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import WeekCalendar from './WeekUI/WeekCalendar';
import EventFormScreen from './WeekUI/EventFormScreen';
import APICallScreen from './WeekUI/APICallScreen'; // 导入 API 页
import { Alert } from 'react-native';
import dayjs from 'dayjs';
// 引入 Navigation 相关库
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator();

// const APINavigator = () => {
//   return (
//     <Stack.Navigator>
//       <Stack.Screen 
//         name="APICallScreen" 
//         component={() => <APICallScreen onAddSchedules={onAddSchedules} />}  // 正确传递 prop
//         options={{ title: 'API 调用界面' }} 
//       />
//     </Stack.Navigator>
//   );
// };

const App = () => {
  const [currentView, setCurrentView] = useState('calendar');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [formMode, setFormMode] = useState('create');
  const [currentWeek, setCurrentWeek] = useState(dayjs());
  const [events, setEvents] = useState({
    '2025-06-15': {
      '10:00-11:00': {
        id: '123456',
        title: '项目会议',
        type: '默认',
        date: '2025-06-15',
        startTime: '10:00',
        endTime: '11:00',
        location: '会议室A',
        description: '与开发团队讨论项目进度'
      }
    },
    '2025-06-16': {
      '09:30-10:30': {
        id: '123457',
        title: '客户沟通',
        type: '重要日',
        date: '2025-06-16',
        startTime: '09:30',
        endTime: '10:30',
        location: '线上会议',
        description: '季度项目回顾'
      }
    }
  });

  const [isAPIScreenVisible, setIsAPIScreenVisible] = useState(false); // 新增状态来控制 API 界面的显示

  // 处理保存日程
  const handleSaveEvent = (newEvent, mode) => {
    const updatedEvents = {...events};

    // 处理编辑模式，先删除旧的日程
    if (mode === 'edit') {
      const dateKey = selectedEvent.date;
      const eventKey = `${selectedEvent.startTime}-${selectedEvent.endTime}`;

      if (updatedEvents[dateKey] && updatedEvents[dateKey][eventKey]) {
        delete updatedEvents[dateKey][eventKey];

        if (Object.keys(updatedEvents[dateKey]).length === 0) {
          delete updatedEvents[dateKey];
        }
      }
    }

    // 添加新日程
    const dateKey = newEvent.date;
    const eventKey = `${newEvent.startTime}-${newEvent.endTime}`;

    if (!updatedEvents[dateKey]) {
      updatedEvents[dateKey] = {};
    }

    updatedEvents[dateKey][eventKey] = {
      ...newEvent,
      id: mode === 'edit' ? selectedEvent.id : Date.now().toString()
    };

    setEvents(updatedEvents);
    setCurrentView('calendar');

    Alert.alert(
      "日程保存成功", 
      mode === 'edit' 
        ? `"${newEvent.title}"日程已更新` 
        : `"${newEvent.title}"日程已创建`,
      [{ text: "确定" }]
    );

    setSelectedEvent(null);
  };

  // 处理删除日程
  const handleDeleteEvent = (eventToDelete) => {
    const updatedEvents = {...events};
    const dateKey = eventToDelete.date;
    const eventKey = `${eventToDelete.startTime}-${eventToDelete.endTime}`;

    if (updatedEvents[dateKey] && updatedEvents[dateKey][eventKey]) {
      delete updatedEvents[dateKey][eventKey];

      if (Object.keys(updatedEvents[dateKey]).length === 0) {
        delete updatedEvents[dateKey];
      }

      setEvents(updatedEvents);
      Alert.alert("删除成功", `"${eventToDelete.title}"日程已删除`);
    }
  };

  // 打开编辑界面
  const handleEditEvent = (event) => {
    setSelectedEvent({
      ...event,
      date: dayjs(event.date).format('YYYY-MM-DD')
    });
    setFormMode('edit');
    setCurrentView('form');
  };

  // 跳转 API 页的函数（通过局部导航实现）
  const navigateToAPIScreen = (currentVisibility) => {
    setIsAPIScreenVisible(!currentVisibility); // 翻转 API 界面的显示状态
  };

  const goBackFromAPIScreen = () => {
    setIsAPIScreenVisible(false); // 隐藏 API 界面
  };

  // 生成时间戳+随机数的唯一ID,只用时间戳生成时间太快会重复
  const generateUniqueId = () => {
    const timestamp = Date.now();
    const randomNum = Math.floor(Math.random() * 1000); // 生成0-999的随机数
    return `${timestamp}-${randomNum}`;
  };

  // 实现 onAddSchedules 函数
  const onAddSchedules = (schedules) => {
    const updatedEvents = {...events};
    schedules.forEach((schedule) => {
      const dateKey = dayjs(currentWeek).format('YYYY-MM-DD'); // 假设使用当前周的日期
      const eventKey = `${schedule.start_time}-${schedule.end_time}`;
      if (!updatedEvents[dateKey]) {
        updatedEvents[dateKey] = {};
      }
      updatedEvents[dateKey][eventKey] = {
        id:  generateUniqueId(), // 使用时间戳+随机数生成唯一ID
        title: schedule.task,
        type: '默认',
        date: dateKey,
        startTime: schedule.start_time,
        endTime: schedule.end_time,
        location: '',
        description: schedule.reason
      };
    });
    setEvents(updatedEvents);
    setIsAPIScreenVisible(false); // 隐藏 API 界面
  };

  return (
    <View style={{ flex: 1 }}>
      {/* 原有条件渲染：日历和表单页 */}
      {currentView === 'calendar' ? (
        <WeekCalendar 
          events={events}
          currentWeek={currentWeek}
          setCurrentWeek={setCurrentWeek}
          onAddEvent={() => {
            setSelectedEvent(null);
            setFormMode('create');
            setCurrentView('form');
          }} 
          onEditEvent={handleEditEvent}
          onDeleteEvent={handleDeleteEvent}
          // 传递导航函数给日历页，用于跳转 API 页
          onNavigateToAPI={navigateToAPIScreen}
          isAPIScreenVisible={isAPIScreenVisible}
        />
      ) : (
        <EventFormScreen 
          currentWeek={currentWeek}
          mode={formMode}
          eventData={selectedEvent}
          onClose={() => {
            setSelectedEvent(null);
            setCurrentView('calendar');
          }}
          onSave={handleSaveEvent}
        />
      )}

      {/* 局部导航容器：仅用于 API 页跳转 */}
      {isAPIScreenVisible && (
        <NavigationContainer independent={true} onStateChange={goBackFromAPIScreen}>
          <Stack.Navigator>
            <Stack.Screen 
              name="APICallScreen" 
              component={() => <APICallScreen onAddSchedules={onAddSchedules} />} 
              options={{ title: 'API 调用界面' }} 
            />
          </Stack.Navigator>
        </NavigationContainer>
      )}
    </View>
  );
};

export default App;