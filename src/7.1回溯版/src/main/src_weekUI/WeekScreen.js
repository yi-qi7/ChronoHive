// import React from 'react';
// import { View, StyleSheet } from 'react-native';
// import WeekCalendar from './WeekCalendar';
// import EventFormScreen from './EventFormScreen';
// import APICallScreen from '../WeekUI/APICallScreen';
// import { Alert } from 'react-native';
// import dayjs from 'dayjs';
// import { NavigationContainer } from '@react-navigation/native';
// import { createNativeStackNavigator } from '@react-navigation/native-stack';

// const Stack = createNativeStackNavigator();

// class WeekUI extends React.Component {
//   constructor(props) {
//     super(props);
//     this.state = {
//       currentView: 'calendar',
//       selectedEvent: null,
//       formMode: 'create',
//       currentWeek: dayjs(),
//       events: {
//         '2025-06-15': {
//           '10:00-11:00': {
//             id: '123456',
//             title: '项目会议',
//             type: '默认',
//             date: '2025-06-15',
//             startTime: '10:00',
//             endTime: '11:00',
//             location: '会议室A',
//             description: '与开发团队讨论项目进度'
//           }
//         },
//         '2025-06-16': {
//           '09:30-10:30': {
//             id: '123457',
//             title: '客户沟通',
//             type: '重要日',
//             date: '2025-06-16',
//             startTime: '09:30',
//             endTime: '10:30',
//             location: '线上会议',
//             description: '季度项目回顾'
//           }
//         }
//       },
//       isAPIScreenVisible: false
//     };
//   }

//   handleSaveEvent = (newEvent, mode) => {
//     const updatedEvents = {...this.state.events};

//     // 处理编辑模式，先删除旧的日程
//     if (mode === 'edit') {
//       const dateKey = this.state.selectedEvent.date;
//       const eventKey = `${this.state.selectedEvent.startTime}-${this.state.selectedEvent.endTime}`;

//       if (updatedEvents[dateKey] && updatedEvents[dateKey][eventKey]) {
//         delete updatedEvents[dateKey][eventKey];

//         if (Object.keys(updatedEvents[dateKey]).length === 0) {
//           delete updatedEvents[dateKey];
//         }
//       }
//     }

//     // 添加新日程
//     const dateKey = newEvent.date;
//     const eventKey = `${newEvent.startTime}-${newEvent.endTime}`;

//     if (!updatedEvents[dateKey]) {
//       updatedEvents[dateKey] = {};
//     }

//     updatedEvents[dateKey][eventKey] = {
//       ...newEvent,
//       id: mode === 'edit' ? this.state.selectedEvent.id : Date.now().toString()
//     };

//     this.setState({
//       events: updatedEvents,
//       currentView: 'calendar',
//       selectedEvent: null
//     });

//     Alert.alert(
//       "日程保存成功", 
//       mode === 'edit' 
//         ? `"${newEvent.title}"日程已更新` 
//         : `"${newEvent.title}"日程已创建`,
//       [{ text: "确定" }]
//     );
//   };

//   handleDeleteEvent = (eventToDelete) => {
//     const updatedEvents = {...this.state.events};
//     const dateKey = eventToDelete.date;
//     const eventKey = `${eventToDelete.startTime}-${eventToDelete.endTime}`;

//     if (updatedEvents[dateKey] && updatedEvents[dateKey][eventKey]) {
//       delete updatedEvents[dateKey][eventKey];

//       if (Object.keys(updatedEvents[dateKey]).length === 0) {
//         delete updatedEvents[dateKey];
//       }

//       this.setState({ events: updatedEvents });
//       Alert.alert("删除成功", `"${eventToDelete.title}"日程已删除`);
//     }
//   };

//   handleEditEvent = (event) => {
//     this.setState({
//       selectedEvent: {
//         ...event,
//         date: dayjs(event.date).format('YYYY-MM-DD')
//       },
//       formMode: 'edit',
//       currentView: 'form'
//     });
//   };

//   navigateToAPIScreen = (currentVisibility) => {
//     this.setState({ isAPIScreenVisible: !currentVisibility });
//   };

//   goBackFromAPIScreen = () => {
//     this.setState({ isAPIScreenVisible: false });
//   };

//   generateUniqueId = () => {
//     const timestamp = Date.now();
//     const randomNum = Math.floor(Math.random() * 1000);
//     return `${timestamp}-${randomNum}`;
//   };

//   onAddSchedules = (schedules) => {
//     const updatedEvents = {...this.state.events};
//     schedules.forEach((schedule) => {
//       const dateKey = dayjs(this.state.currentWeek).format('YYYY-MM-DD');
//       const eventKey = `${schedule.start_time}-${schedule.end_time}`;
//       if (!updatedEvents[dateKey]) {
//         updatedEvents[dateKey] = {};
//       }
//       updatedEvents[dateKey][eventKey] = {
//         id: this.generateUniqueId(),
//         title: schedule.task,
//         type: '默认',
//         date: dateKey,
//         startTime: schedule.start_time,
//         endTime: schedule.end_time,
//         location: '',
//         description: schedule.reason
//       };
//     });
//     this.setState({ 
//       events: updatedEvents,
//       isAPIScreenVisible: false
//     });
//   };

//   render() {
//     return (
//       <View style={{ flex: 1 }}>

//         {this.state.currentView === 'calendar' ? (
//           <WeekCalendar 
//             events={this.state.events}
//             currentWeek={this.state.currentWeek}
//             setCurrentWeek={(week) => this.setState({ currentWeek: week })}
//             onAddEvent={() => {
//               this.setState({
//                 selectedEvent: null,
//                 formMode: 'create',
//                 currentView: 'form'
//               });
//             }} 
//             onEditEvent={this.handleEditEvent}
//             onDeleteEvent={this.handleDeleteEvent}
//             onNavigateToAPI={this.navigateToAPIScreen}
//             isAPIScreenVisible={this.state.isAPIScreenVisible}
//           />
//         ) : (
//           <EventFormScreen 
//             currentWeek={this.state.currentWeek}
//             mode={this.state.formMode}
//             eventData={this.state.selectedEvent}
//             onClose={() => {
//               this.setState({
//                 selectedEvent: null,
//                 currentView: 'calendar'
//               });
//             }}
//             onSave={this.handleSaveEvent}
//           />
//         )}

//         {this.state.isAPIScreenVisible && (
//           <NavigationContainer independent={true} onStateChange={this.goBackFromAPIScreen}>
//             <Stack.Navigator>
//               <Stack.Screen 
//                 name="APICallScreen" 
//                 component={() => <APICallScreen onAddSchedules={this.onAddSchedules} />} 
//                 options={{ title: 'API 调用界面' }} 
//               />
//             </Stack.Navigator>
//           </NavigationContainer>
//         )}
//       </View>
//     );
//   }
// }
// // const styles = StyleSheet.create({
// //   popup: {
// //       position: 'absolute',
// //       bottom: 0,
// //       height: screenHeight * 0.75,
// //       width: '100%',
// //       backgroundColor: 'white',
// //       borderTopLeftRadius: 16,
// //       borderTopRightRadius: 16,
// //       elevation: 10,
// //       shadowColor: '#000',
// //       shadowOpacity: 0.2,
// //       shadowRadius: 8,
// //     },
// // });

// export default WeekUI;

import React from 'react';
import { View, StyleSheet, useFocusEffect } from 'react-native';
import WeekCalendar from './WeekCalendar';
import EventFormScreen from './EventFormScreen';
import APICallScreen from '../WeekUI/APICallScreen';
import { Alert } from 'react-native';
import dayjs from 'dayjs';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';


const Stack = createNativeStackNavigator();

class WeekUI extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentView: 'calendar',
      selectedEvent: null,
      formMode: 'create',
      currentWeek: dayjs(),
      events: {
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
      },
      isAPIScreenVisible: false
    };
    this.unsubscribe = null; // 用于保存导航事件的卸载函数
  }

  // 组件挂载后，添加导航焦点监听
  // componentDidMount() {
  //   this.unsubscribe = this.props.navigation.addListener('focus', () => {
  //     const routes = this.props.navigation.getState().routes;
  //     if (routes.length === 0) return;
  //     const currentRoute = routes[routes.length - 1]; // 获取当前路由
  //     const { params } = currentRoute;
  //     if (params && params.schedules) {
  //       this.onAddSchedules(params.schedules); // 调用新增日程逻辑
  //     }
  //   });
  // }
  componentDidMount() {
    // 监听导航参数变化
    this.unsubscribe = this.props.navigation.addListener('focus', () => {
      const { params } = this.props.route; // 从route中获取参数
      if (params && params.scheduleData) {
        this.onAddSchedules(params.scheduleData);
      }
    });
  }

  // 组件卸载前，移除导航焦点监听（避免内存泄漏）
  componentWillUnmount() {
    if (this.unsubscribe) {
      this.unsubscribe(); // 卸载监听
    }
  }

  handleSaveEvent = (newEvent, mode) => {
    const updatedEvents = {...this.state.events};

    // 处理编辑模式，先删除旧的日程
    if (mode === 'edit') {
      const dateKey = this.state.selectedEvent.date;
      const eventKey = `${this.state.selectedEvent.startTime}-${this.state.selectedEvent.endTime}`;

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
      id: mode === 'edit' ? this.state.selectedEvent.id : Date.now().toString()
    };

    this.setState({
      events: updatedEvents,
      currentView: 'calendar',
      selectedEvent: null
    });

    Alert.alert(
      "日程保存成功", 
      mode === 'edit' 
        ? `"${newEvent.title}"日程已更新` 
        : `"${newEvent.title}"日程已创建`,
      [{ text: "确定" }]
    );
  };

  handleDeleteEvent = (eventToDelete) => {
    const updatedEvents = {...this.state.events};
    const dateKey = eventToDelete.date;
    const eventKey = `${eventToDelete.startTime}-${eventToDelete.endTime}`;

    if (updatedEvents[dateKey] && updatedEvents[dateKey][eventKey]) {
      delete updatedEvents[dateKey][eventKey];

      if (Object.keys(updatedEvents[dateKey]).length === 0) {
        delete updatedEvents[dateKey];
      }

      this.setState({ events: updatedEvents });
      Alert.alert("删除成功", `"${eventToDelete.title}"日程已删除`);
    }
  };

  handleEditEvent = (event) => {
    this.setState({
      selectedEvent: {
        ...event,
        date: dayjs(event.date).format('YYYY-MM-DD')
      },
      formMode: 'edit',
      currentView: 'form'
    });
  };

  navigateToAPIScreen = (currentVisibility) => {
    this.setState({ isAPIScreenVisible: !currentVisibility });
  };

  goBackFromAPIScreen = () => {
    this.setState({ isAPIScreenVisible: false });
  };

  generateUniqueId = () => {
    const timestamp = Date.now();
    const randomNum = Math.floor(Math.random() * 1000);
    return `${timestamp}-${randomNum}`;
  };

  onAddSchedules = (schedules) => {
    const updatedEvents = {...this.state.events};
    schedules.forEach((schedule) => {
      const dateKey = dayjs(this.state.currentWeek).format('YYYY-MM-DD');
      const eventKey = `${schedule.start_time}-${schedule.end_time}`;
      if (!updatedEvents[dateKey]) {
        updatedEvents[dateKey] = {};
      }
      updatedEvents[dateKey][eventKey] = {
        id: this.generateUniqueId(),
        title: schedule.task,
        type: '默认',
        date: dateKey,
        startTime: schedule.start_time,
        endTime: schedule.end_time,
        location: '',
        description: schedule.reason
      };
    });
    this.setState({ 
      events: updatedEvents,
      isAPIScreenVisible: false
    });
  };

  render() {
    return (
      <View style={{ flex: 1 }}>
        {this.state.currentView === 'calendar' ? (
          <WeekCalendar 
            events={this.state.events}
            currentWeek={this.state.currentWeek}
            setCurrentWeek={(week) => this.setState({ currentWeek: week })}
            onAddEvent={() => {
              this.setState({
                selectedEvent: null,
                formMode: 'create',
                currentView: 'form'
              });
            }} 
            onEditEvent={this.handleEditEvent}
            onDeleteEvent={this.handleDeleteEvent}
            onNavigateToAPI={this.navigateToAPIScreen}
            isAPIScreenVisible={this.state.isAPIScreenVisible}
          />
        ) : (
          <EventFormScreen 
            currentWeek={this.state.currentWeek}
            mode={this.state.formMode}
            eventData={this.state.selectedEvent}
            onClose={() => {
              this.setState({
                selectedEvent: null,
                currentView: 'calendar'
              });
            }}
            onSave={this.handleSaveEvent}
          />
        )}

        {this.state.isAPIScreenVisible && (
          <NavigationContainer independent={true} onStateChange={this.goBackFromAPIScreen}>
            <Stack.Navigator>
              <Stack.Screen 
                name="APICallScreen" 
                component={APICallScreen} 
                options={{ title: 'API 调用界面' }} 
              />
            </Stack.Navigator>
          </NavigationContainer>
        )}
      </View>
    );
  }
}

export default WeekUI;