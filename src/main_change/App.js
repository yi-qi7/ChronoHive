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

// ��ʼ������
MonthUI_addSchedule('2025-06-03', '����');
MonthUI_addSchedule('2025-06-05', '����');
MonthUI_addSchedule('2025-06-16', '����');
MonthUI_addDeadline('2025-06-20', '����ϵͳ��ҵ');
MonthUI_addDeadline('2025-07-05', '������̴���ҵ');
MonthUI_changeThemeMode('simple');
MonthUI_addSchedule('2025-07-10', 'ʵϰ');
MonthUI_addSchedule('2025-07-11', '����');
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