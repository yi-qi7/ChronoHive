import React, { Component } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

class ThemeMode extends Component {
  constructor(props) {
    super(props);
    this.currentMode = 'simple';
  }

  // 获取当前模式
  getCurrentMode = () => {
    return this.currentMode;
  }

  // 修改模式
  changeMode = (mode) => {
    this.currentMode = mode;
  }

}

export default ThemeMode;

const themeMode = new ThemeMode();  //测试用单例

function getThemeMode(){
    const mode = themeMode.getCurrentMode();
    return mode;
}

/**
 * 模式转换
 * @param {string} mode - 模式名称
 */
function MonthUI_changeThemeMode(mode){
    if(mode === 'simple' || mode === 'dark' || mode === 'honeycomb'){
      themeMode.changeMode(mode);
    }
}

export {
    themeMode,
    getThemeMode,
    MonthUI_changeThemeMode,
};
