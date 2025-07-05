import React, { useContext } from 'react';
import { Modal, View, Text, Button, StyleSheet } from 'react-native';
import { MessageContext } from './MessageContext';

export default function GlobalMessageModal() {
    const { message, visible, setVisible } = useContext(MessageContext);
    console.log("GlobalMessageModal - Visible:", visible, "Message:", message);

    if (!visible) return null; // 优化性能
  
    return (
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        statusBarTranslucent={true} // Android关键设置
        onRequestClose={() => setVisible(false)} // Android返回键支持
      >
        <View style={styles.root}>
          <View style={styles.content}>
            <Text style={{ marginBottom: 10 }}>{message}</Text>
            <Button title="关闭" onPress={() => setVisible(false)} />
          </View>
        </View>
      </Modal>
    );
  }
const styles = StyleSheet.create({
    root: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 9999,
      elevation: 9999, // Android专用
      backgroundColor: 'rgba(0,0,0,0.5)', // 添加半透明背景
      justifyContent: 'center',
      alignItems: 'center'
    },
    content: {
      backgroundColor: 'white',
      padding: 20,
      borderRadius: 10,
      width: '80%'
    }
  });
