import React, { useState, createContext, useContext, useEffect } from 'react';
import { View, Text, Switch, StyleSheet, SafeAreaView, 
         SectionList, TouchableOpacity } from 'react-native';
import { MonthUI_changeThemeMode } from '../src_monthUI/themeMode';
import { useNavigation } from '@react-navigation/native';
import userInfoData from '../data/userInfo.json'; // 导入JSON文件

// 主题颜色定义
const lightColors = {
  background: '#f0f2f5',
  surface: 'white',
  text: '#333',
  secondaryText: '#666',
  border: '#eee',
  icon: '#333',
  switchTrack: '#767577',
  switchThumb: '#f4f3f4',
  switchActive: '#81b0ff',
  logoutButton: '#e74c3c',
  logoutText: 'white',
};

const darkColors = {
  background: '#121212',
  surface: '#1e1e1e',
  text: '#f0f0f0',
  secondaryText: '#aaa',
  border: '#333',
  icon: '#f0f0f0',
  switchTrack: '#555',
  switchThumb: '#f4f3f4',
  switchActive: '#81b0ff',
  logoutButton: '#c0392b',
  logoutText: 'white',
};

// 创建上下文
const SettingsContext = createContext();

// 设置提供者组件
const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    notificationsEnabled: true,
    darkModeEnabled: false,
    language: '中文',
  });

  //从JSON文件读取用户信息
  const [userInfo, setUserInfo] = useState(userInfoData);

  // 主题同步逻辑
  useEffect(() => {
    MonthUI_changeThemeMode(settings.darkModeEnabled ? 'dark' : 'light');
  }, [settings.darkModeEnabled]);

  const updateSettings = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <SettingsContext.Provider value={{ 
      settings, updateSettings,
      userInfo,setUserInfo }}>
      {children}
    </SettingsContext.Provider>
  );
};

// 自定义hook
const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

// 动态样式生成函数
const getStyles = (darkMode) => {
  const colors = darkMode ? darkColors : lightColors;
  
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    sectionHeader: {
      paddingTop: 16,
      paddingBottom: 8,
      paddingHorizontal: 16,
      fontSize: 14,
      color: colors.secondaryText,
      backgroundColor: colors.background,
    },
    itemContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      paddingVertical: 14,
      paddingHorizontal: 16,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
    },
    itemIcon: {
      fontSize: 20,
      marginRight: 12,
      width: 28,
      color: colors.icon,
    },
    itemTitle: {
      fontSize: 16,
      flex: 1,
      color: colors.text,
    },
    itemRight: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    itemValue: {
      fontSize: 15,
      marginRight: 8,
      color: colors.secondaryText,
    },
    chevron: {
      fontSize: 24,
      color: colors.secondaryText,
      marginLeft: 8,
    },
    logoutButton: {
      margin: 20,
      marginTop: 30,
      backgroundColor: colors.logoutButton,
      borderRadius: 8,
      padding: 16,
      alignItems: 'center',
    },
    logoutText: {
      color: colors.logoutText,
      fontWeight: '600',
      fontSize: 16,
    },
    switch: {
      transform: [{ scaleX: 0.9 }, { scaleY: 0.9 }],
    },
  });
};

// 设置页面组件
const SettingsScreen = () => {
  const navigation = useNavigation();
  const { settings, updateSettings,userInfo } = useSettings();
  const styles = getStyles(settings.darkModeEnabled);

    // 日期格式化函数
    const formatDate = (dateString) => {
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(dateString).toLocaleDateString('zh-CN', options);
    };

  const settingsData = [
    {
      title: '账户设置',
      data: [
        { 
          title: '个人信息', 
          icon: '👤',
          type: 'userInfo',
          items: [
            { label: '昵称', value: userInfo.nickname},
            { label: '账号', value: userInfo.username },
            { label: '生日', value: formatDate(userInfo.birthday) },

          ]
        },
      ]
    },
    {
      title: '偏好设置',
      data: [
        { 
          title: '深色模式', 
          icon: '🌙',
          type: 'switch',
          value: settings.darkModeEnabled,
          onValueChange: (value) => updateSettings('darkModeEnabled', value)
        },
        { 
          title: '通知设置', 
          icon: '🔔',
          type: 'switch',
          value: settings.notificationsEnabled,
          onValueChange: (value) => updateSettings('notificationsEnabled', value)
        },
        { 
          title: '语言设置', 
          icon: '🌐',
          type: 'navigation',
          value: settings.language,
          onPress: () => console.log('Change Language')
        },
      ]
    },
    {
      title: '支持',
      data: [
        { 
          title: '帮助中心', 
          icon: '❓',
          type: 'navigation',
          onPress: () => console.log('Help Center')
        },
        { 
          title: '关于应用', 
          icon: 'ℹ️',
          type: 'navigation',
          onPress: () => console.log('About App')
        },
      ]
    }
  ];

  const renderItem = ({ item }) => {
    if (item.type === 'userInfo') {
      return (
        <TouchableOpacity 
          style={[styles.itemContainer, { alignItems: 'flex-start' }]}
          onPress={item.onPress}
          activeOpacity={0.7}
        >
          <Text style={styles.itemIcon}>{item.icon}</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.itemTitle}>{item.title}</Text>
            <View style={{ marginTop: 8 }}>
              {item.items.map((info, index) => (
                <View key={index} style={{ 
                  flexDirection: 'row', 
                  marginBottom: 6,
                  justifyContent: 'space-between'
                }}>
                  <Text style={{ 
                    fontSize: 13, 
                    color: styles.itemValue.color 
                  }}>
                    {info.label}
                  </Text>
                  <Text style={{ 
                    fontSize: 13, 
                    color: styles.itemTitle.color 
                  }}>
                    {info.value}
                  </Text>
                </View>
              ))}
            </View>
          </View>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>
      );
    }
    return(
    <TouchableOpacity 
      style={styles.itemContainer}
      onPress={item.onPress}
      activeOpacity={0.7}
    >
      <Text style={styles.itemIcon}>{item.icon}</Text>
      <Text style={styles.itemTitle}>{item.title}</Text>
      
      <View style={styles.itemRight}>
        {item.type === 'switch' && (
          <Switch
            style={styles.switch}
            value={item.value}
            onValueChange={item.onValueChange}
            trackColor={{
              false: styles.switch.trackColor,
              true: styles.switch.trackColorActive
            }}
            thumbColor={styles.switch.thumbColor}
          />
        )}
        {item.value && item.type !== 'switch' && (
          <Text style={styles.itemValue}>{item.value}</Text>
        )}
        {item.type === 'navigation' && (
          <Text style={styles.chevron}>›</Text>
        )}
      </View>
    </TouchableOpacity>
      );

    };

  const renderSectionHeader = ({ section }) => (
    <Text style={styles.sectionHeader}>{section.title}</Text>
  );

  const handleLogout=()=>{
    navigation.replace('Login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <SectionList
        sections={settingsData}
        keyExtractor={(item, index) => item.title + index}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        stickySectionHeadersEnabled={false}
      />
      
      <TouchableOpacity 
        style={styles.logoutButton}
        onPress={handleLogout}
      >
        <Text style={styles.logoutText}>退出登录</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export { SettingsScreen, useSettings };
export default SettingsProvider;
