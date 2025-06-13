import { Text, StyleSheet, View } from 'react-native'
import React, { Component } from 'react'

import {MonthUI_addSchedule, MonthUI_removeSchedule} from './src_34_calendar24/mockLocalStorage'
import {MonthUI_addDeadline, MonthUI_removeDeadline} from './src_34_calendar24/mockDeadlineStorage'
import MonthUI from './src_34_calendar24/stackNavigator'
import { MonthUI_changeThemeMode } from './src_34_calendar24/themeMode'
import { MonthUI_addMapping, MonthUI_removeMapping } from './src_34_calendar24/scheduleTypeColorMapper'
import { monthNumManager } from './src_34_calendar24/numOfMonth'


MonthUI_addSchedule('2025-06-03','个人');
//MonthUI_removeSchedule('2025-06-02','个人');
MonthUI_addSchedule('2025-06-05','会议');
MonthUI_addSchedule('2025-06-16','考试');
MonthUI_addDeadline('2025-06-20','操作系统作业');
MonthUI_addDeadline('2025-07-05','软件工程大作业');
//MonthUI_removeDeadline('2025-06-20','操作系统作业');
//MonthUI_changeThemeMode('dark');
MonthUI_changeThemeMode('simple');
//MonthUI_changeThemeMode('honeycomb');
MonthUI_addSchedule('2025-07-10','实习');
MonthUI_addSchedule('2025-07-11','社团');
//MonthUI_addMapping('实习', '#55efc4');
//MonthUI_removeMapping('社团');
//MonthUI_addMapping('考试', '#e74c3c');
monthNumManager.changeNumOfPrevMonth(1);
monthNumManager.changeNumOfPostMonth(2);


export default class App extends Component {
  render() {

    return (
      <View style={styles.container}>
        <MonthUI />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  }
})
