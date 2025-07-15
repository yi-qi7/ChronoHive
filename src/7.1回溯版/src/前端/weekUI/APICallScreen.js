

import { View } from 'react-native';
import React, { useState } from 'react';
import { SafeAreaView, TextInput, StyleSheet, Text, Button, ActivityIndicator, TouchableOpacity } from 'react-native';

const APICallScreen = ({ onAddSchedules }) => {
  const [inputText, setInputText] = useState('');
  const [responseData, setResponseData] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedButton, setSelectedButton] = useState(1); // 初始默认选中按钮1

  const generateSchedule = async () => {
    setIsLoading(true);
    setError(null);
    setResponseData(null);

    try {
      const userInput = inputText.trim();
      if (!userInput) {
        throw new Error('请输入任务描述');
      }

      const response = await fetch('http://172.19.78.145:5000/api/generate_schedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: userInput
        })
      });

      if (!response.ok) {
        throw new Error(`API请求失败，状态码: ${response.status}`);
      }

      const data = await response.json();
      setResponseData(data);
      onAddSchedules(data.schedule.schedule);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // 按钮点击处理函数（防止取消选中）
  const handleButtonPress = (buttonValue) => {
    if (buttonValue !== selectedButton) { // 仅当点击非当前选中按钮时切换
      setSelectedButton(buttonValue);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="请告诉我您今天想要做什么~"
        placeholderTextColor="#999"
        value={inputText}
        onChangeText={(text) => setInputText(text)}
      />

      {/* agent数目说明文字 */}
      <Text style={styles.agentLabel}>agent数目：</Text>
      
      {/* 按钮组 - 水平排列4个按钮 */}
      <View style={styles.buttonGroup}>
        <TouchableOpacity
          style={[
            styles.button,
            selectedButton === 1 ? styles.buttonSelected : styles.buttonUnselected
          ]}
          onPress={() => handleButtonPress(1)}
        >
          <Text style={styles.buttonText}>1</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.button,
            selectedButton === 2 ? styles.buttonSelected : styles.buttonUnselected
          ]}
          onPress={() => handleButtonPress(2)}
        >
          <Text style={styles.buttonText}>2</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.button,
            selectedButton === 4 ? styles.buttonSelected : styles.buttonUnselected
          ]}
          onPress={() => handleButtonPress(4)}
        >
          <Text style={styles.buttonText}>4</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.button,
            selectedButton === 5 ? styles.buttonSelected : styles.buttonUnselected
          ]}
          onPress={() => handleButtonPress(5)}
        >
          <Text style={styles.buttonText}>5</Text>
        </TouchableOpacity>
      </View>
      
      <Button
        title={isLoading ? '处理中...' : '生成日程'}
        onPress={generateSchedule}
        disabled={isLoading}
      />
      {isLoading && <ActivityIndicator size="large" color="#0000ff" />}
      {error && <Text style={styles.error}>{error}</Text>}
      {responseData && (
        <Text style={styles.result}>
          {JSON.stringify(responseData, null, 2)}
        </Text>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f9f9f9',
  },
  input: {
    fontSize: 16,
    color: '#333',
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  error: {
    color: 'red',
    marginTop: 16,
  },
  result: {
    marginTop: 16,
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    fontFamily: 'Courier New, monospace',
  },
  // 按钮相关样式
  buttonGroup: {
    flexDirection: 'row',       // 水平排列
    justifyContent: 'space-between', // 均匀分布
    marginVertical: 10,
  },
  button: {
    flex: 1,                    // 等宽
    height: 40,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 15,        // 按钮间间距
  },
  buttonSelected: {
    backgroundColor: '#1890ff', // 选中时蓝色背景
  },
  buttonUnselected: {
    backgroundColor: '#e8e8e8', // 未选中时浅灰色背景
  },
  buttonText: {
    color: 'white',             // 文字颜色
    fontSize: 16,
  },
});

export default APICallScreen;