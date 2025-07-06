

// import { Text, StyleSheet, View } from 'react-native'
// import React, { Component } from 'react'

// import {MonthUI_addSchedule, MonthUI_removeSchedule} from './src_monthUI/mockLocalStorage'
// import {MonthUI_addDeadline, MonthUI_removeDeadline} from './src_monthUI/mockDeadlineStorage'
// import MonthUI from './src_monthUI/stackNavigator'
// import { MonthUI_changeThemeMode } from './src_monthUI/themeMode'
// import { MonthUI_addMapping, MonthUI_removeMapping } from './src_monthUI/scheduleTypeColorMapper'
// import { monthNumManager } from './src_monthUI/numOfMonth'


// MonthUI_addSchedule('2025-06-03','锟斤拷锟斤拷');
// //MonthUI_removeSchedule('2025-06-02','锟斤拷锟斤拷');
// MonthUI_addSchedule('2025-06-05','锟斤拷锟斤拷');
// MonthUI_addSchedule('2025-06-16','锟斤拷锟斤拷');
// MonthUI_addDeadline('2025-06-20','锟斤拷锟斤拷系统锟斤拷业');
// MonthUI_addDeadline('2025-07-05','锟斤拷锟斤拷锟斤拷锟教达拷锟斤拷业');
// //MonthUI_removeDeadline('2025-06-20','锟斤拷锟斤拷系统锟斤拷业');
// //MonthUI_changeThemeMode('dark');
// MonthUI_changeThemeMode('simple');
// //MonthUI_changeThemeMode('honeycomb');
// MonthUI_addSchedule('2025-07-10','实习');
// MonthUI_addSchedule('2025-07-11','锟斤拷锟斤拷');
// //MonthUI_addMapping('实习', '#55efc4');
// //MonthUI_removeMapping('锟斤拷锟斤拷');
// //MonthUI_addMapping('锟斤拷锟斤拷', '#e74c3c');
// monthNumManager.changeNumOfPrevMonth(1);
// monthNumManager.changeNumOfPostMonth(2);


// export default class App extends Component {
//   render() {

//     return (
//       <View style={styles.container}>
//         <MonthUI />
//       </View>
//     )
//   }
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#fff',
//   }
// })


import { StyleSheet, View } from 'react-native';
import React, { Component } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// ������ĸ���ģ��
import { MonthUI_addSchedule, MonthUI_removeSchedule } from './src_monthUI/mockLocalStorage';
import { MonthUI_addDeadline, MonthUI_removeDeadline } from './src_monthUI/mockDeadlineStorage';
import MonthUI from './src_monthUI/stackNavigator';
import { MonthUI_changeThemeMode } from './src_monthUI/themeMode';
import { MonthUI_addMapping, MonthUI_removeMapping } from './src_monthUI/scheduleTypeColorMapper';
import { monthNumManager } from './src_monthUI/numOfMonth';
import SettingsProvider from './src_settingsUI/SettingsScreen';
import LoginScreen from './src_loginUI/LoginScreen';


MonthUI_addDeadline('2025-07-06', '提交软件工程作业');
MonthUI_changeThemeMode('simple');

monthNumManager.changeNumOfPrevMonth(1);
monthNumManager.changeNumOfPostMonth(2);

const Stack = createNativeStackNavigator();

export default class App extends Component {
  render() {
    return (
      <SettingsProvider>
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName="Login"
            screenOptions={{
              headerShown: false // ����������Ļ�ı�����
            }}
          >
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="MainApp" component={MainAppWrapper} />
          </Stack.Navigator>
        </NavigationContainer>
      </SettingsProvider>
    );
  }
}

// ��װ����������ڰ��������Ӧ�ý���
function MainAppWrapper() {
  return (
    <View style={styles.container}>
      <MonthUI />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  }
});