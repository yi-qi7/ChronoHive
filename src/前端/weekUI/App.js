import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import WeekCalendar from './weekUI/WeekCalendar';
import EventFormScreen from './weekUI/EventFormScreen';
import { Alert } from 'react-native';
import dayjs from 'dayjs';

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

  return (
    <View style={{ flex: 1 }}>
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
    </View>
  );
};

export default App;
