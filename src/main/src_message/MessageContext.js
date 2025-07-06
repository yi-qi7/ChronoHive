import React, { createContext, useState, useEffect } from 'react';
import { View, Text } from 'react-native';

export const MessageContext = createContext();
export const MessageProvider = ({ children }) => {
  const [message, setMessage] = useState({ message: "", version: "" });  // 当前要显示的消息
  const [visible, setVisible] = useState(false); // 弹窗是否显示
  const [lastUpdate, setLastUpdate] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // 简单的对象比较函数
  const isEqual = (obj1, obj2) => {
    if (obj1 === null || obj2 === null) return obj1 === obj2;
    return JSON.stringify(obj1) === JSON.stringify(obj2);
  };

  // 判断是否需要更新（比较version字段）
  const shouldUpdate = (newMsg, oldMsg) => {
    return newMsg?.version !== oldMsg?.version;
  };
  //获取数据
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://8.138.161.200:5000/message');
      const newMessage = await response.json();

      // 判断数据是否更新
      if (shouldUpdate(newMessage, message)) {
        setMessage(newMessage);
        setLastUpdate(new Date().toISOString());
        setVisible(true);//只有消息不同时才显示弹窗
        console.log('数据已更新');
      } else {
        setVisible(false);
        console.log('数据未变化');
      }
      setError(null);
    } catch (err) {
      //console.error('获取数据失败:', err);
      setError(err);
      setVisible(false); // 出错时不显示弹窗
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // 设置轮询间隔（每10秒）
    //const timer = setInterval(fetchData, 10000);
    // 清除定时器
    return () => clearInterval(timer);
  }, []);

  return (
    <MessageContext.Provider value={{ message, visible, setVisible }}>
      {children}
    </MessageContext.Provider>
  );
};
