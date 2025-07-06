// import * as React from 'react';
// import { View, Text, Button,StyleSheet} from 'react-native';
// import { NavigationContainer} from '@react-navigation/native';
// import { createNativeStackNavigator } from '@react-navigation/native-stack';
// import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
// import { HeaderBackButton } from '@react-navigation/elements';
// import Calendar from './calendar';
// import SingleMonth from './singleMonth';
// import TabBar from '../src_accessory/tab_bar';
// import WeekUI from '../src_weekUI/WeekScreen';
// // import APICallScreen from '../src_weekUI/APICallScreen';
// import SettingsScreen from '../src_settingsUI/SettingsScreen';
// import APICallScreen from '../WeekUI/APICallScreen';

// const Stack = createNativeStackNavigator();
// const Tab =createBottomTabNavigator();

// // class WeekViewScreen extends React.Component {
// //   render() {
// //     const { date, scheduleMethods } = this.props.route.params; // 获取传递的参数
// //     return (
// //       // <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
// //       //   <Text>Details Screen</Text>
// //       //   <Text>Date: {date}</Text>

// //       //   {/* <Button 
// //       //     title="Go Back"
// //       //     onPress={() => this.props.navigation.goBack()} 
// //       //   /> */}
// //       // </View>
// //       <WeekUI/>
// //     );
// //   }
// // }


// function MainTabs(){
//   return (
//     <Tab.Navigator
//       tabBar={props=> <TabBar {...props}/>}
//       screenOptions={{
//         headerShown: false, // 设为 false 隐藏所有屏幕的标题栏
//       }}
//     >
//       <Tab.Screen name="Calendar" component={Calendar} />
//       <Tab.Screen name="SingleMonth" component={SingleMonth} /> 
//       {/* <Tab.Screen name="WeekView" component={WeekViewScreen} /> */}
      
//       {/* 周视图要特殊处理：显示标题栏，并在标题栏增加返回键*/}
//       <Tab.Screen 
//         name="WeekView" 
//         component={WeekUI} 
//         options= {({navigation})=>({
//           // 只为周视图显示标题栏
//           headerShown: true,
//           headerTitle: '6月',
//           headerLeft: (props) => (
//             <HeaderBackButton
//               {...props}
//               label="返回"
//               labelVisible={true}
//               onPress={() => navigation.goBack()}
//               tintColor="#007AFF"
//               style={{ marginLeft: 8 }}
//             />
//           ),
//           // 设置标题栏样式
//           headerStyle: {
//             backgroundColor: 'white',
//             height: 60,
//             elevation: 0,
//             shadowOpacity: 0,
//           },
//           headerTitleStyle: {
//             color: 'black',
//             fontSize: 18,
//             fontWeight: 'bold',
//           },
//         })}/>

        
      
//     </Tab.Navigator>
//   )
// }

// function RootStack() {
//   return (
//     <Stack.Navigator
//       screenOptions={{
//         headerShown: false, // 设为 false 隐藏所有屏幕的标题栏
//       }}
//     >
//       {/* <Stack.Screen name="Calendar" component={Calendar} />
//       <Stack.Screen name="SingleMonth" component={SingleMonth} />
//       <Stack.Screen name="WeekView" component={WeekViewScreen} /> */}
//       <Stack.Screen name="Main" component={MainTabs} />

//       <Stack.Screen 
//         name="AIScreen" 
//         component={APICallScreen} 
//         options= {({navigation})=>({
//           // 只为周视图显示标题栏
//           headerShown: true,
//           headerTitle: 'DeepSeek',
//           headerLeft: (props) => (
//             <HeaderBackButton
//               {...props}
//               label="返回"
//               labelVisible={true}
//               onPress={() => navigation.goBack()}
//               tintColor="#007AFF"
//               style={{ marginLeft: 8 }}
//             />
//           ),
//           // 设置标题栏样式
//           headerStyle: {
//             backgroundColor: 'white',
//             height: 60,
//             elevation: 0,
//             shadowOpacity: 0,
//           },
//           headerTitleStyle: {
//             color: 'black',
//             fontSize: 18,
//             fontWeight: 'bold',
//           },
//         })}/>

//       <Stack.Screen 
//         name="SettingsScreen" 
//         component={SettingsScreen} 
//         options= {({navigation})=>({
//           // 只为周视图显示标题栏
//           headerShown: true,
//           headerTitle: 'Settings',
//           headerLeft: (props) => (
//             <HeaderBackButton
//               {...props}
//               label="返回"
//               labelVisible={true}
//               onPress={() => navigation.goBack()}
//               tintColor="#007AFF"
//               style={{ marginLeft: 8 }}
//             />
//           ),
//           // 设置标题栏样式
//           headerStyle: {
//             backgroundColor: 'white',
//             height: 60,
//             elevation: 0,
//             shadowOpacity: 0,
//           },
//           headerTitleStyle: {
//             color: 'black',
//             fontSize: 18,
//             fontWeight: 'bold',
//           },
//         })}/>

//     </Stack.Navigator>
//   );
// }

// export default function MonthUI() {
//   return (
//     <NavigationContainer>
//       {/* <AppScreen/> */}
//       <RootStack />
//     </NavigationContainer>
//   );
// }

import * as React from 'react';
import { View, Text, Button,StyleSheet} from 'react-native';
import { NavigationContainer} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { HeaderBackButton } from '@react-navigation/elements';
import Calendar from './calendar';
import SingleMonth from './singleMonth';
import TabBar from '../src_accessory/tab_bar';
import WeekUI from '../src_weekUI/WeekScreen';
// import APICallScreen from '../src_weekUI/APICallScreen';
import {SettingsScreen,useSettings} from '../src_settingsUI/SettingsScreen';
import APICallScreen from '../WeekUI/APICallScreen';
import { useEffect } from 'react'; 
import {MessageProvider} from '../src_message/MessageContext';
import GlobalMessageModal from '../src_message/GlobalMessageModal';
import { MonthUI_changeThemeMode } from '../src_monthUI/themeMode';

const Stack = createNativeStackNavigator();
const Tab =createBottomTabNavigator();

function MainTabs(){
  return (
    <Tab.Navigator
      tabBar={props=> <TabBar {...props}/>}
      screenOptions={{
        headerShown: false, // 设为 false 隐藏所有屏幕的标题栏
        unmountOnBlur: true // 强制标签页切换时重新渲染
      }}
    >
      <Tab.Screen name="Calendar" component={Calendar} />
      {/* <Tab.Screen name="SingleMonth" component={SingleMonth} />  */}
      <Tab.Screen name="SingleMonth">
        {props => <SingleMonth {...props} rootNavigation={navigation} />}
      </Tab.Screen>
      
      {/* 周视图要特殊处理：显示标题栏，并在标题栏增加返回键*/}
      <Tab.Screen 
        name="WeekView" 
        component={WeekUI} 
        options= {({navigation})=>({
          // 只为周视图显示标题栏
          headerShown: true,
          headerTitle: '',//什么都不显示，只是显示一个返回键
          headerLeft: (props) => (
            <HeaderBackButton
              {...props}
              label="返回"
              labelVisible={true}
              onPress={() => navigation.goBack()}
              tintColor="#007AFF"
              style={{ marginLeft: 8 }}
            />
          ),
          // 设置标题栏样式
          headerStyle: {
            backgroundColor: 'white',
            height: 60,
            elevation: 0,
            shadowOpacity: 0,
          },
          headerTitleStyle: {
            color: 'black',
            fontSize: 18,
            fontWeight: 'bold',
          },
        })}/>

        
      
    </Tab.Navigator>
  )
}

function RootStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false, // 设为 false 隐藏所有屏幕的标题栏
      }}
    >
      {/* 主要的月界面、周界面 */}
      <Stack.Screen name="Main" component={MainTabs} />

      {/* AI界面 */}
      <Stack.Screen 
        name="AIScreen" 
        component={APICallScreen} 
        options= {({navigation})=>({
          // 只为周视图显示标题栏
          headerShown: true,
          headerTitle: 'DeepSeek',
          headerLeft: (props) => (
            <HeaderBackButton
              {...props}
              label="返回"
              labelVisible={true}
              onPress={() => navigation.goBack()}
              tintColor="#007AFF"
              style={{ marginLeft: 8 }}
            />
          ),
          // 设置标题栏样式
          headerStyle: {
            backgroundColor: 'white',
            height: 60,
            elevation: 0,
            shadowOpacity: 0,
          },
          headerTitleStyle: {
            color: 'black',
            fontSize: 18,
            fontWeight: 'bold',
          },
        })}/>

      {/* 设置界面 */}
      <Stack.Screen 
        name="SettingsScreen" 
        component={SettingsScreen} 
        options= {({navigation})=>({
          // 只为周视图显示标题栏
          headerShown: true,
          headerTitle: '设置',
          headerLeft: (props) => (
            <HeaderBackButton
              {...props}
              label="返回"
              labelVisible={true}
              onPress={() => navigation.goBack()}
              tintColor="#007AFF"
              style={{ marginLeft: 8 }}
            />
          ),
          // 设置标题栏样式
          headerStyle: {
            backgroundColor: 'white',
            height: 60,
            elevation: 0,
            shadowOpacity: 0,
          },
          headerTitleStyle: {
            color: 'black',
            fontSize: 18,
            fontWeight: 'bold',
          },
        })}/>

    </Stack.Navigator>
  );
}

export default function MonthUI() {
  const { settings } = useSettings();

  useEffect(() => {
    MonthUI_changeThemeMode(settings.darkModeEnabled ? 'dark' : 'simple');
  }, [settings.darkModeEnabled]); // 依赖项确保及时更新

  return (

      <MessageProvider>
        {/* <NavigationContainer> */}
          <RootStack />
          
        {/* </NavigationContainer> */}
        <GlobalMessageModal />
      </MessageProvider>

  );
}



