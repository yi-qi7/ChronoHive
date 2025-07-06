// import React from 'react';
// import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
// import { useNavigation } from '@react-navigation/native';

// // 使锟斤拷锟皆讹拷锟斤拷图片
// const SettingsIcon =require('./img/settings.png');

// const AIIcon = require('./img/deepseek.png');
// const TabBar = () => {
//   const navigation=useNavigation();
//   // 锟斤拷锟斤拷状态
//   const [activeTab, setActiveTab] = React.useState(0);
  
//   // 锟斤拷锟斤拷锟角╋拷锟斤拷锟�
//   const tabs = [
//     { 
//       label: "AI", 
//       customIcon: AIIcon, 
//       badge: 0, // 未锟斤拷锟斤拷息锟斤拷锟斤拷
//       onPress:() => navigation.navigate('AIScreen'),
//     },
//     { 
//       label: "Settings", 
//       customIcon: SettingsIcon,
//       onPress:() =>navigation.navigate('SettingsScreen'), 
//     }
//   ];

//   return (
//     <View style={styles.tabContainer}>
//       {tabs.map((tab, index) => (
//         <TouchableOpacity
//           key={index}
//           style={styles.tabItem}
//           onPress={() => {
//             setActiveTab(index);
//             tab.onPress();
//           }}
//         >
//           {tab.badge > 0 && (
//             <View style={styles.badge}>
//               <Text style={styles.badgeText}>{tab.badge}</Text>
//             </View>
//           )}

//           {/* 锟斤拷使锟斤拷锟皆讹拷锟斤拷图片 */}
//           <Image 
//             source={tab.customIcon} 
//             style={[styles.img, ]} 
//           />
          
//           <Text style={[
//             styles.tabText,
//             activeTab === index && styles.activeTabText
//           ]}>
//             {tab.label}
//           </Text>
//         </TouchableOpacity>
//       ))}
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   tabContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-around',
//     paddingVertical: 10,
//     backgroundColor: '#f8f8f8',
//     borderTopWidth: 1,
//     borderTopColor: '#e0e0e0',
//     height: 60
//   },
//   tabItem: {
//     alignItems: 'center',
//     position: 'relative',
//     paddingHorizontal: 15
//   },
//   img: {
//     width: 24,
//     height: 24,
//     marginBottom: 4
//   },
//   tabText: {
//     fontSize: 12,
//     color: '#888'
//   },
//   activeTabText: {
//     color: '#07C160'
//   },
//   badge: {
//     position: 'absolute',
//     top: -2,
//     right: -8,
//     backgroundColor: '#FA5151',
//     borderRadius: 10,
//     minWidth: 18,
//     height: 18,
//     justifyContent: 'center',
//     alignItems: 'center',
//     zIndex: 1
//   },
//   badgeText: {
//     color: 'white',
//     fontSize: 12,
//     fontWeight: 'bold'
//   }
// });

// export default TabBar;


import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';

// 使锟斤拷锟皆讹拷锟斤拷图片
const SettingsIcon =require('./img/settings.png');

const AIIcon = require('./img/deepseek.png');
const TabBar = () => {
  const navigation=useNavigation();
  // 锟斤拷锟斤拷状态
  const [activeTab, setActiveTab] = React.useState(0);
  
  // 锟斤拷锟斤拷锟角╋拷锟斤拷锟�
  const tabs = [
    { 
      label: "AI", 
      customIcon: AIIcon, 
      badge: 0, // 未锟斤拷锟斤拷息锟斤拷锟斤拷
      onPress:() => navigation.navigate('AIScreen'),
    },
    { 
      label: "Settings", 
      customIcon: SettingsIcon,
      onPress:() =>navigation.navigate('SettingsScreen'), 
    }
  ];

  return (
    <View style={styles.tabContainer}>
      {tabs.map((tab, index) => (
        <TouchableOpacity
          key={index}
          style={styles.tabItem}
          onPress={() => {
            setActiveTab(index);
            tab.onPress();
          }}
        >
          {tab.badge > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{tab.badge}</Text>
            </View>
          )}

          {/* 锟斤拷使锟斤拷锟皆讹拷锟斤拷图片 */}
          <Image 
            source={tab.customIcon} 
            style={[styles.img, ]} 
          />
          
          <Text style={[
            styles.tabText,
            activeTab === index && styles.activeTabText
          ]}>
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    backgroundColor: '#f8f8f8',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    height: 60
  },
  tabItem: {
    alignItems: 'center',
    position: 'relative',
    paddingHorizontal: 15
  },
  img: {
    width: 24,
    height: 24,
    marginBottom: 4
  },
  tabText: {
    fontSize: 12,
    color: '#888'
  },
  activeTabText: {
    color: '#07C160'
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -8,
    backgroundColor: '#FA5151',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold'
  }
});

export default TabBar;



