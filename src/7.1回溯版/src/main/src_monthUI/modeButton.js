import React, { Component } from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

// 自定义多模式按钮类组件
class ModeButton extends Component {
  render() {
    const { title, buttonMode, onPress } = this.props; // 解构 props
    
    return (
      <TouchableOpacity
        style={[
          styles.button,
          buttonMode === 'simple' && styles.simpleButton,
          buttonMode === 'dark' && styles.darkButton,
          buttonMode === 'honeycomb' && styles.honeycombButton
        ]}
        onPress={onPress}
      >
        <Text style={[
            styles.buttonText,
            buttonMode === 'simple' && styles.simpleButtonText,
            buttonMode === 'dark' && styles.darkButtonText,
            buttonMode === 'honeycomb' && styles.honeycombButtonText,
            ]}>
          {title}
        </Text>
      </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
  // 基础按钮样式
  button: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 12,
    fontWeight: '500',
  },

  // 简约模式按钮
  simpleButton: {
    backgroundColor: '#2196F3', // 蓝色背景
    borderWidth: 1,
    borderColor: '#1976D2',
  },
  simpleButtonText: {
    color: 'white',
  },

  // 黑夜模式按钮
  darkButton: {
    backgroundColor: '#424242', // 深灰色背景
    borderWidth: 1,
    borderColor: '#616161',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3, // Android 阴影
  },
  darkButtonText: {
    color: '#EEEEEE', // 浅灰色文字
  },

  // 蜂巢模式按钮
  honeycombButton: {
    backgroundColor: '#FF6F00', // 琥珀色背景
    borderWidth: 1,
    borderColor: '#FFD180', // 浅金色边框
    borderRadius: 8,
    shadowColor: '#8B4513',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  honeycombButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default ModeButton;
