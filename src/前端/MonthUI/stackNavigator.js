import * as React from 'react';
import { View, Text, Button } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Calendar from './calendar';
import SingleMonth from './singleMonth';

const Stack = createNativeStackNavigator();

class WeekViewScreen extends React.Component {
  render() {
    const { date, scheduleMethods } = this.props.route.params; // 获取传递的参数
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text>Details Screen</Text>
        <Text>Date: {date}</Text>
        <Button 
          title="Go Back"
          onPress={() => this.props.navigation.goBack()} 
        />
      </View>
    );
  }
}

function RootStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false, // 设为 false 隐藏所有屏幕的标题栏
      }}
    >
      <Stack.Screen name="Calendar" component={Calendar} />
      <Stack.Screen name="SingleMonth" component={SingleMonth} />
      <Stack.Screen name="WeekView" component={WeekViewScreen} />
    </Stack.Navigator>
  );
}

export default function MonthUI() {
  return (
    <NavigationContainer>
      <RootStack />
    </NavigationContainer>
  );
}

