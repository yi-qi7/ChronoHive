/*
import React from 'react';
import {
  View,
  Text,
  Switch,
  StyleSheet,
  SafeAreaView,
  SectionList,
  TouchableOpacity,
  Alert,
  Platform,
  Modal,
  TouchableWithoutFeedback,
  FlatList
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

// 语言选项
const languages = [
  { id: 'zh', name: '简体中文' },
  { id: 'en', name: 'English' },
  { id: 'ja', name: '日本語' },
  { id: 'ko', name: '한국어' },
  { id: 'fr', name: 'Français' },
  { id: 'es', name: 'Español' }
];

// AI智能体数量选项
const aiCountOptions = [1, 2, 3, 4, 5];

// AI模型选项
const aiModels = [
  { id: 'gpt4', name: 'GPT-4' },
  { id: 'claude', name: 'Claude 3' },
  { id: 'gemini', name: 'Gemini Pro' },
  { id: 'llama', name: 'Llama 3' },
  { id: 'mistral', name: 'Mistral' }
];

// 不使用 AsyncStorage 的存储解决方案
class SettingsStorage {
  constructor() {
    // 简单的内存存储
    this.storage = {};
  }
  
  // 保存设置（内存中）
  saveSettings = (settings) => {
    this.storage['appSettings'] = settings;
    console.log('设置已保存到内存');
    
    // 可选：模拟本地存储（实际项目中应该使用持久化存储）
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('appSettings', JSON.stringify(settings));
    }
  };
  
  // 加载设置
  loadSettings = () => {
    // 从内存加载
    if (this.storage['appSettings']) {
      return this.storage['appSettings'];
    }
    
    // 模拟从本地存储加载
    if (typeof localStorage !== 'undefined') {
      const settings = localStorage.getItem('appSettings');
      return settings ? JSON.parse(settings) : null;
    }
    
    return null;
  };
}

class SettingsScreen extends React.Component {
  constructor(props) {
    super(props);
    this.settingsStorage = new SettingsStorage();
    
    // 初始化状态
    const storedSettings = this.settingsStorage.loadSettings() || {
      darkMode: false,
      notifications: true,
      language: 'zh',
      aiAgents: 1,
      aiModel: 'gpt4'
    };
    
    this.state = {
      settings: storedSettings,
      modalVisible: false,
      modalContent: null
    };
  }

  // 保存设置
  saveSettings = () => {
    this.settingsStorage.saveSettings(this.state.settings);
    console.log('当前设置：', this.state.settings);
    
    // 在实际应用中，这里可以调用任何必要的回调
    if (this.props.onSettingsChange) {
      this.props.onSettingsChange(this.state.settings);
    }
  };

  // 生命周期方法 - 当设置变化时保存
  componentDidUpdate(prevProps, prevState) {
    if (prevState.settings !== this.state.settings) {
      this.saveSettings();
    }
  }

  // 处理设置变化
  handleSettingChange = (action, id) => {
    switch (action) {
      case 'toggleDarkMode':
        this.setState(
          prevState => ({
            settings: {
              ...prevState.settings,
              darkMode: !prevState.settings.darkMode
            }
          }),
          () => {
            Alert.alert('主题已切换', `已${this.state.settings.darkMode ? '启用' : '关闭'}深色模式`);
          }
        );
        break;

      case 'toggleNotifications':
        this.setState(
          prevState => ({
            settings: {
              ...prevState.settings,
              notifications: !prevState.settings.notifications
            }
          }),
          () => {
            Alert.alert('通知设置', `已${this.state.settings.notifications ? '启用' : '关闭'}通知`);
          }
        );
        break;

      case 'showLanguageSelector':
        this.showLanguageSelector();
        break;

      case 'showAICountSelector':
        this.showAICountSelector();
        break;

      case 'showModelSelector':
        this.showModelSelector();
        break;

      default:
        if (typeof action === 'function') {
          action();
        }
        break;
    }
  };

  // 显示语言选择器
  showLanguageSelector = () => {
    this.setState({
      modalContent: (
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>选择语言</Text>
          <FlatList
            data={languages}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.optionItem}
                onPress={() => {
                  this.setState(
                    prevState => ({
                      settings: {
                        ...prevState.settings,
                        language: item.id
                      }
                    }),
                    () => {
                      this.setState({ modalVisible: false });
                      Alert.alert('语言设置', `已切换到${item.name}`);
                    }
                  );
                }}
              >
                <Text style={styles.optionText}>{item.name}</Text>
                {this.state.settings.language === item.id && (
                  <MaterialIcons name="check" size={24} color="#4CAF50" />
                )}
              </TouchableOpacity>
            )}
          />
          <TouchableOpacity
            style={styles.modalCloseButton}
            onPress={() => this.setState({ modalVisible: false })}
          >
            <Text style={styles.modalCloseText}>取消</Text>
          </TouchableOpacity>
        </View>
      ),
      modalVisible: true
    });
  };

  // 显示AI数量选择器
  showAICountSelector = () => {
    this.setState({
      modalContent: (
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>AI智能体数量</Text>
          <Text style={styles.modalDescription}>
            选择同时使用的AI助手数量。多个智能体可以协作解决更复杂的问题。
          </Text>
          <View style={styles.optionsRow}>
            {aiCountOptions.map(count => (
              <TouchableOpacity
                key={count}
                style={[
                  styles.countButton,
                  this.state.settings.aiAgents === count && styles.countButtonActive
                ]}
                onPress={() => {
                  this.setState(
                    prevState => ({
                      settings: {
                        ...prevState.settings,
                        aiAgents: count
                      }
                    }),
                    () => {
                      this.setState({ modalVisible: false });
                      Alert.alert('AI设置', `已设置${count}个AI智能体`);
                    }
                  );
                }}
              >
                <Text
                  style={[
                    styles.countText,
                    this.state.settings.aiAgents === count && styles.countTextActive
                  ]}
                >
                  {count}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity
            style={styles.modalCloseButton}
            onPress={() => this.setState({ modalVisible: false })}
          >
            <Text style={styles.modalCloseText}>取消</Text>
          </TouchableOpacity>
        </View>
      ),
      modalVisible: true
    });
  };

  // 显示模型选择器
  showModelSelector = () => {
    this.setState({
      modalContent: (
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>选择AI模型</Text>
          <FlatList
            data={aiModels}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.optionItem}
                onPress={() => {
                  this.setState(
                    prevState => ({
                      settings: {
                        ...prevState.settings,
                        aiModel: item.id
                      }
                    }),
                    () => {
                      this.setState({ modalVisible: false });
                      Alert.alert('模型选择', `已选择${item.name}模型`);
                    }
                  );
                }}
              >
                <Text style={styles.optionText}>{item.name}</Text>
                {this.state.settings.aiModel === item.id && (
                  <MaterialIcons name="check" size={24} color="#4CAF50" />
                )}
              </TouchableOpacity>
            )}
          />
          <TouchableOpacity
            style={styles.modalCloseButton}
            onPress={() => this.setState({ modalVisible: false })}
          >
            <Text style={styles.modalCloseText}>取消</Text>
          </TouchableOpacity>
        </View>
      ),
      modalVisible: true
    });
  };

  // 获取显示值
  getDisplayValue = (item) => {
    switch (item.id) {
      case 'language':
        return languages.find(lang => lang.id === this.state.settings.language)?.name || this.state.settings.language;
      case 'aiAgents':
        return `${this.state.settings.aiAgents}`;
      case 'aiModel':
        return aiModels.find(model => model.id === this.state.settings.aiModel)?.name || this.state.settings.aiModel;
      default:
        return item.value || '';
    }
  };

  // 创建设置数据
  createSettingsData = () => {
    return [
      {
        title: '账户设置',
        data: [
          {
            id: 'profile',
            title: '个人信息',
            icon: 'person',
            type: 'navigation',
            action: () => Alert.alert('个人信息', '这里可以编辑个人信息')
          },
          {
            id: 'security',
            title: '安全设置',
            icon: 'lock',
            type: 'navigation',
            action: () => Alert.alert('安全设置', '修改密码和安全设置')
          },
        ]
      },
      {
        title: '偏好设置',
        data: [
          {
            id: 'darkMode',
            title: '深色模式',
            icon: 'dark-mode',
            type: 'switch',
            action: 'toggleDarkMode'
          },
          {
            id: 'notifications',
            title: '通知设置',
            icon: 'notifications',
            type: 'switch',
            action: 'toggleNotifications'
          },
          {
            id: 'language',
            title: '语言设置',
            icon: 'language',
            type: 'navigation',
            action: 'showLanguageSelector'
          },
        ]
      },
      {
        title: 'AI设置',
        data: [
          {
            id: 'aiAgents',
            title: '使用AI智能体的数量',
            icon: 'smart-toy',
            type: 'navigation',
            action: 'showAICountSelector'
          },
          {
            id: 'aiModel',
            title: 'AI模型选择',
            icon: 'model-training',
            type: 'navigation',
            action: 'showModelSelector'
          },
        ]
      },
      {
        title: '支持',
        data: [
          {
            id: 'help',
            title: '帮助中心',
            icon: 'help-center',
            type: 'navigation',
            action: () => Alert.alert('帮助中心', '获取使用帮助和支持')
          },
          {
            id: 'about',
            title: '关于应用',
            icon: 'info',
            type: 'navigation',
            action: () => Alert.alert('关于', '版本号: 1.0.0\n© 2023 AI助手')
          },
        ]
      }
    ];
  };

  // 渲染列表项
  renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.itemContainer}
      onPress={() => this.handleSettingChange(item.action, item.id)}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        <MaterialIcons name={item.icon} size={24} color="#5c6bc0" />
      </View>
      <Text style={styles.itemTitle}>{item.title}</Text>

      <View style={styles.itemRight}>
        {item.type === 'switch' ? (
          <Switch
            value={this.state.settings[item.id]}
            onValueChange={() => this.handleSettingChange(item.action, item.id)}
            trackColor={{ false: "#767577", true: "#81c784" }}
            thumbColor={Platform.OS === 'android' ? "#5c6bc0" : undefined}
          />
        ) : (
          <>
            <Text style={styles.itemValue}>{this.getDisplayValue(item)}</Text>
            <MaterialIcons name="chevron-right" size={24} color="#aaa" />
          </>
        )}
      </View>
    </TouchableOpacity>
  );

  // 渲染分组标题
  renderSectionHeader = ({ section }) => (
    <Text style={styles.sectionHeader}>{section.title}</Text>
  );

  // 渲染组件
  render() {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <MaterialIcons name="settings" size={28} color="#5c6bc0" />
          <Text style={styles.headerTitle}>设置</Text>
        </View>

        <SectionList
          sections={this.createSettingsData()}
          keyExtractor={(item, index) => item.id + index}
          renderItem={this.renderItem}
          renderSectionHeader={this.renderSectionHeader}
          stickySectionHeadersEnabled={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={() => Alert.alert('退出登录', '确定要退出当前账号吗？', [
            { text: '取消', style: 'cancel' },
            { text: '确定', onPress: () => console.log('用户已退出登录') }
          ])}
        >
          <Text style={styles.logoutText}>退出登录</Text>
        </TouchableOpacity>

        <Modal
          animationType="slide"
          transparent={true}
          visible={this.state.modalVisible}
          onRequestClose={() => this.setState({ modalVisible: false })}
        >
          <TouchableWithoutFeedback onPress={() => this.setState({ modalVisible: false })}>
            <View style={styles.modalOverlay} />
          </TouchableWithoutFeedback>
          {this.state.modalContent}
        </Modal>
      </SafeAreaView>
    );
  }
}

// 样式定义
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginLeft: 10,
  },
  sectionHeader: {
    paddingTop: 16,
    paddingBottom: 8,
    paddingHorizontal: 16,
    fontSize: 15,
    fontWeight: '600',
    color: '#555',
    backgroundColor: '#f5f5f5',
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingVertical: 15,
    paddingHorizontal: 16,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#e8eaf6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  itemTitle: {
    fontSize: 16,
    flex: 1,
    color: '#333',
  },
  itemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemValue: {
    fontSize: 15,
    marginRight: 8,
    color: '#777',
  },
  separator: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginLeft: 60,
  },
  logoutButton: {
    margin: 20,
    marginTop: 30,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e53935',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  logoutText: {
    color: '#e53935',
    fontWeight: '600',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
    paddingBottom: 30,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: '60%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  modalDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    lineHeight: 20,
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  optionText: {
    fontSize: 16,
    color: '#333',
  },
  countButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#e8eaf6',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
  },
  countButtonActive: {
    backgroundColor: '#5c6bc0',
  },
  countText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  countTextActive: {
    color: 'white',
  },
  modalCloseButton: {
    marginTop: 15,
    padding: 10,
    alignItems: 'center',
  },
  modalCloseText: {
    fontSize: 16,
    color: '#5c6bc0',
    fontWeight: 'bold',
  },
});

export default SettingsScreen;
*/

/*-----------------------基础版：只有按钮，不会真正改变任何设置-----------------------*/

import React, { useState } from 'react';
import { View, Text, Switch, StyleSheet, SafeAreaView, 
         SectionList, TouchableOpacity, Image } from 'react-native';

const SettingsScreen = () => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);

  // 设置项数据
  const settingsData = [
    {
      title: '账户设置',
      data: [
        { 
          title: '个人信息', 
          icon: '👤',
          type: 'navigation',
          onPress: () => console.log('Navigate to Profile')
        },
        // { 
        //   title: '安全设置', 
        //   icon: '🔒',
        //   type: 'navigation',
        //   onPress: () => console.log('Navigate to Security')
        // },
      ]
    },
    {
      title: '偏好设置',
      data: [
        { 
          title: '深色模式', 
          icon: '🌙',
          type: 'switch',
          value: darkModeEnabled,
          onValueChange: setDarkModeEnabled
        },
        { 
          title: '通知设置', 
          icon: '🔔',
          type: 'switch',
          value: notificationsEnabled,
          onValueChange: setNotificationsEnabled
        },
        { 
          title: '语言设置', 
          icon: '🌐',
          type: 'navigation',
          value: '中文',
          onPress: () => console.log('Change Language')
        },
        {
          title: '使用AI智能体的数量',
          icon: '🤖',
          type: 'navigation',
          value:'1',
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
          type: 'navigation' 
        },
        { 
          title: '关于应用', 
          icon: 'ℹ️',
          type: 'navigation' 
        },
      ]
    }
  ];

  const renderItem = ({ item }) => (
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
            value={item.value}
            onValueChange={item.onValueChange}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
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

  const renderSectionHeader = ({ section }) => (
    <Text style={styles.sectionHeader}>{section.title}</Text>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>设置</Text>
      </View>
      
      <SectionList
        sections={settingsData}
        keyExtractor={(item, index) => item.title + index}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        stickySectionHeadersEnabled={false}
      />
      
      <TouchableOpacity style={styles.logoutButton}>
        <Text style={styles.logoutText}>退出登录</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5',
  },
  header: {
    padding: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ddd',
    backgroundColor: 'white',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
  },
  sectionHeader: {
    paddingTop: 16,
    paddingBottom: 8,
    paddingHorizontal: 16,
    fontSize: 14,
    color: '#666',
    backgroundColor: '#f0f2f5',
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#eee',
  },
  itemIcon: {
    fontSize: 20,
    marginRight: 12,
    width: 28,
  },
  itemTitle: {
    fontSize: 16,
    flex: 1,
    color: '#333',
  },
  itemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemValue: {
    fontSize: 15,
    marginRight: 8,
    color: '#999',
  },
  chevron: {
    fontSize: 24,
    color: '#999',
    marginLeft: 8,
  },
  logoutButton: {
    margin: 20,
    marginTop: 30,
    backgroundColor: '#e74c3c',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  logoutText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
});


export default SettingsScreen;



// import React from 'react';
// import {
//   Alert,
//   View,
//   Text,
//   StyleSheet,
//   ScrollView,
//   Switch,
//   TouchableOpacity,
//   Appearance
// } from 'react-native';
// import Slider from '@react-native-community/slider';


// // 系统颜色方案定义
// const colorSchemes = {
//   default: {
//     light: {
//       primary: '#4361ee',
//       secondary: '#3f37c9',
//       background: '#ffffff',
//       cardBackground: '#f8f9fa',
//       text: '#212529',
//       border: '#dee2e6',
//       success: '#4caf50',
//       warning: '#ff9800',
//       danger: '#f44336',
//       info: '#2196f3',
//     },
//     dark: {
//       primary: '#560bad',
//       secondary: '#480ca8',
//       background: '#121212',
//       cardBackground: '#1e1e1e',
//       text: '#f8f9fa',
//       border: '#343a40',
//       success: '#2e7d32',
//       warning: '#e65100',
//       danger: '#c62828',
//       info: '#0277bd',
//     },
//   },
//   ocean: {
//     light: {
//       primary: '#0077b6',
//       secondary: '#00b4d8',
//       background: '#ffffff',
//       cardBackground: '#f8f9fa',
//       text: '#212529',
//       border: '#dee2e6',
//       success: '#4caf50',
//       warning: '#ff9800',
//       danger: '#f44336',
//       info: '#2196f3',
//     },
//     dark: {
//       primary: '#0077b6',
//       secondary: '#00b4d8',
//       background: '#121212',
//       cardBackground: '#1e1e1e',
//       text: '#f8f9fa',
//       border: '#343a40',
//       success: '#2e7d32',
//       warning: '#e65100',
//       danger: '#c62828',
//       info: '#0277bd',
//     },
//   },
//   forest: {
//     light: {
//       primary: '#2a9134',
//       secondary: '#5cb85c',
//       background: '#ffffff',
//       cardBackground: '#f8f9fa',
//       text: '#212529',
//       border: '#dee2e6',
//       success: '#4caf50',
//       warning: '#ff9800',
//       danger: '#f44336',
//       info: '#2196f3',
//     },
//     dark: {
//       primary: '#2a9134',
//       secondary: '#5cb85c',
//       background: '#121212',
//       cardBackground: '#1e1e1e',
//       text: '#f8f9fa',
//       border: '#343a40',
//       success: '#2e7d32',
//       warning: '#e65100',
//       danger: '#c62828',
//       info: '#0277bd',
//     },
//   },
//   sunset: {
//     light: {
//       primary: '#e76f51',
//       secondary: '#f4a261',
//       background: '#ffffff',
//       cardBackground: '#f8f9fa',
//       text: '#212529',
//       border: '#dee2e6',
//       success: '#4caf50',
//       warning: '#ff9800',
//       danger: '#f44336',
//       info: '#2196f3',
//     },
//     dark: {
//       primary: '#e76f51',
//       secondary: '#f4a261',
//       background: '#121212',
//       cardBackground: '#1e1e1e',
//       text: '#f8f9fa',
//       border: '#343a40',
//       success: '#2e7d32',
//       warning: '#e65100',
//       danger: '#c62828',
//       info: '#0277bd',
//     },
//   },
// };

// // 默认设置
// const defaultSettings = {
//   theme: 'system',
//   fontSize: 16,
//   fontScale: 1.0,
//   colorScheme: 'default',
//   roundedElements: true,
//   largeIcons: false,
//   notification: true,
//   vibration: true,
// };

// class SettingsScreen extends React.Component {
//     constructor(props) {
//         super(props);
        
//         // // 状态初始化
//         // this.state = {
//         //     settings: defaultSettings,
//         //     systemTheme: Appearance.getColorScheme(),
//         //     isLoading: true,
//         //     colorSchemePreview: null
//         // };
//     }

//     render() {
//         // const {inputText,responseData,error,isLoading} = this.state;

//         return(
//             <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
//                 <Text>Settings Screen</Text>
//                 <Text></Text>

//             </View>
//         );
//     }
    
// }



// class SettingsScreen extends React.Component {
//   constructor(props) {
//     super(props);
    
//     // 状态初始化
//     this.state = {
//       settings: defaultSettings,
//       systemTheme: Appearance.getColorScheme(),
//       isLoading: true,
//       colorSchemePreview: null
//     };
    
//     // 监听系统主题变化
//     this.themeListener = Appearance.addChangeListener(this.handleThemeChange);
//   }
  
//   // 组件挂载后加载设置
//   componentDidMount() {
//     this.loadSettings();
//   }
  
//   // 组件卸载时移除主题监听
//   componentWillUnmount() {
//     this.themeListener?.remove();
//   }
  
//   // 处理系统主题变化
//   handleThemeChange = (preferences) => {
//     this.setState({ systemTheme: preferences.colorScheme });
//   };

  
//   // 保存设置
//   saveSettings = (newSettings) => {
//     this.setState(prevState => ({
//       settings: { ...prevState.settings, ...newSettings }
//     }));
//   };
  
//   // 异步设置状态
//   setStateAsync = (state) => {
//     return new Promise(resolve => {
//       this.setState(state, resolve);
//     });
//   };
  
//   // 重置设置为默认值
//   resetSettings = () => {
//     Alert.alert(
//       '确认恢复默认设置',
//       '这将清除所有设置（仅当前会话）',
//       [
//         { text: '取消', style: 'cancel' },
//         {
//           text: '确定',
//           onPress: () => this.setState({ settings: defaultSettings })
//         }
//       ]
//     );
//   };
  
//   // 预览颜色方案
//   previewColorScheme = (scheme) => {
//     this.setState({ colorSchemePreview: scheme });
    
//     // 3秒后清除预览
//     setTimeout(() => {
//       this.setState({ colorSchemePreview: null });
//     }, 3000);
//   };
  
//   // 确定当前实际使用的主题
//   getActiveTheme = () => {
//     const { settings, systemTheme, colorSchemePreview } = this.state;
//     const themeType = settings.theme === 'system' ? systemTheme : settings.theme;
//     const scheme = colorSchemePreview || settings.colorScheme;
//     return colorSchemes[scheme][themeType] || colorSchemes[scheme].light;
//   };
  
//   // 渲染加载状态
//   renderLoading = () => (
//     <View style={[styles.loadingContainer, { backgroundColor: '#f8f9fa' }]}>
//       <Text style={styles.loadingText}>加载设置中...</Text>
//     </View>
//   );
  
//   // 渲染主界面
//   render() {
//     if (this.state.isLoading) {
//       return this.renderLoading();
//     }
    
//     const { settings, systemTheme } = this.state;
//     const theme = this.getActiveTheme();
    
//     // 动态创建样式
//     const styles = this.createStyles(theme, settings);
    
//     return (
//         <ScrollView style={styles.safeArea} contentContainerStyle={styles.container}>
//           <Text style={styles.header}>应用设置</Text>
  
//           {/* 示例：主题设置部分 */}
//           <View style={styles.section}>
//             <Text style={styles.sectionHeader}>主题设置</Text>
  
//             <View style={styles.settingRow}>
//               <Text style={styles.settingLabel}>浅/深色模式</Text>
//               <View style={styles.themeSwitchContainer}>
//                 <Text style={{ ...styles.themeSwitchLabel, color: theme.text }}>浅</Text>
//                 <Switch
//                   value={settings.theme === 'dark'}
//                   onValueChange={(value) => this.saveSettings({ theme: value ? 'dark' : 'light' })}
//                   trackColor={{ false: '#ccc', true: theme.primary }}
//                   thumbColor={theme.primary}
//                 />
//                 <Text style={{ ...styles.themeSwitchLabel, color: theme.text }}>深</Text>
//               </View>
//             </View>
  
//             <View style={styles.settingRow}>
//               <Text style={styles.settingLabel}>跟随系统</Text>
//               <Switch
//                 value={settings.theme === 'system'}
//                 onValueChange={(value) => this.saveSettings({ theme: value ? 'system' : 'light' })}
//                 trackColor={{ false: '#ccc', true: theme.primary }}
//                 thumbColor={theme.primary}
//               />
//             </View>
  
//             <Text style={{ marginTop: 10, fontStyle: 'italic', color: theme.text }}>
//               当前系统主题: {systemTheme}
//             </Text>
//           </View>
  
//           {/* 更多设置项保持和你原本相同逻辑即可... */}
//           {/* 字体大小、缩放、色彩方案等都可以复用你的原样式和结构，只要把 saveSettings 替换为本地调用的那个方法 */}
  
//           {/* 重置按钮 */}
//           <View style={styles.resetSection}>
//             <TouchableOpacity style={styles.resetButton} onPress={this.resetSettings}>
//               <Text style={styles.resetButtonText}>恢复默认设置</Text>
//             </TouchableOpacity>
//             <Text style={styles.resetText}>退出应用后设置将丢失</Text>
//           </View>
//         </ScrollView>
//       );
//     }
  
//     createStyles(theme, settings) {
//       return StyleSheet.create({
//         safeArea: {
//           flex: 1,
//           backgroundColor: theme.background,
//         },
//         container: {
//           padding: 20,
//           paddingBottom: 40,
//           backgroundColor: theme.background,
//         },
//         header: {
//           fontSize: 26,
//           fontWeight: 'bold',
//           color: theme.text,
//           marginBottom: 20,
//         },
//         section: {
//           marginBottom: 25,
//           padding: 16,
//           backgroundColor: theme.cardBackground,
//           borderRadius: settings.roundedElements ? 14 : 6,
//           borderColor: theme.border,
//           borderWidth: 1,
//         },
//         sectionHeader: {
//           fontSize: 20,
//           fontWeight: 'bold',
//           color: theme.primary,
//           marginBottom: 10,
//         },
//         settingRow: {
//           flexDirection: 'row',
//           justifyContent: 'space-between',
//           alignItems: 'center',
//           paddingVertical: 10,
//           borderBottomWidth: 1,
//           borderBottomColor: '#e0e0e0',
//         },
//         settingLabel: {
//           fontSize: 16,
//           color: theme.text,
//         },
//         themeSwitchContainer: {
//           flexDirection: 'row',
//           alignItems: 'center',
//         },
//         themeSwitchLabel: {
//           fontSize: 14,
//           marginHorizontal: 6,
//         },
//         resetSection: {
//           marginTop: 30,
//           alignItems: 'center',
//         },
//         resetButton: {
//           backgroundColor: theme.danger,
//           padding: 12,
//           borderRadius: 8,
//           width: '80%',
//           alignItems: 'center',
//         },
//         resetButtonText: {
//           color: 'white',
//           fontSize: 16,
//           fontWeight: 'bold',
//         },
//         resetText: {
//           marginTop: 10,
//           fontSize: 14,
//           color: theme.text,
//           opacity: 0.6,
//         }
//       });
//     }
//   }
  
  // export default SettingsScreen;