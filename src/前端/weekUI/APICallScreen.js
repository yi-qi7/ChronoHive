
import React, { useState } from 'react';
import { SafeAreaView, TextInput, StyleSheet, Text, Button, ActivityIndicator } from 'react-native';

const APICallScreen = ({ onAddSchedules }) => {
  const [inputText, setInputText] = useState('');
  const [responseData, setResponseData] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

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
      // 调用父组件的函数添加日程
      onAddSchedules(data.schedule.schedule);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
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
});

export default APICallScreen;