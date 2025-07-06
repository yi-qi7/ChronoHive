import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, SafeAreaView,Image,ImageBackground} from 'react-native';

const LoginScreen = ({ navigation }) => {
  // 模拟正确的用户凭据（实际应用中应从安全存储或API获取）
  const CORRECT_CREDENTIALS = {
    username: 'aaa',
    password: '123456'
  };

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // 新增：API登录函数
  const handleApiLogin = async () => {
    setIsLoading(true);
    
    try {
      const response = await fetch('http://8.138.161.200:5000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username.trim(),
          password: password.trim()
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // 登录成功（假设API返回success字段）
        if (data.message) {
          navigation.replace('MainApp');
        } else {
          Alert.alert('登录失败', data.error || '用户名或密码错误');
        }
      } else {
        Alert.alert('服务器错误', data.error || '登录请求失败');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = () => {
    // 验证输入不为空
    if(!username.trim() && !password.trim())
    {
        Alert.alert('账号和密码不能为空');
      return;
    }
    if (!username.trim()) {
      Alert.alert('账号不能为空');
      return;
    }
    if(!password.trim()) {
        Alert.alert('密码不能为空');
        return;
    }

    setIsLoading(true);

    // setTimeout(() => {
    //   handleApiLogin(), 1000
    // })
    handleApiLogin();
    // // 模拟网络请求延迟
    // setTimeout(() => {
    //   setIsLoading(false);
      
    //   // 验证凭据
    //   if (username === CORRECT_CREDENTIALS.username && 
    //       password === CORRECT_CREDENTIALS.password) {
    //     // 登录成功，导航到主界面
    //     navigation.replace('MainApp');
    //   } else {
    //     // 登录失败，显示错误提示
    //     Alert.alert(
    //       '登录失败',
    //       '密码错误，请重新输入密码',
    //       [
    //         { text: '确定', onPress: () => {
    //                 setPassword('');
    //                 setUsername('');
    //             }
    //         } // 清空密码输入框
    //       ]
    //     );
    //   }
    // }, 1000);
  };

     

  return (
    <ImageBackground
      source={require('./logo.jpg')}
      style={[styles.backgroundImage,
      ]}
      resizeMode="contain" 
    >
        <SafeAreaView style={styles.container}>
        <View style={styles.formContainer}>
            <Text style={styles.title}>时光蜂巢</Text>
            
            <TextInput
            style={styles.input}
            placeholder="请输入账号"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            placeholderTextColor="#999"
            />
            
            <TextInput
            style={styles.input}
            placeholder="请输入密码"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholderTextColor="#999"
            />
            
            <TouchableOpacity 
            style={styles.button} 
            onPress={handleLogin}
            disabled={isLoading}
            >
            <Text style={styles.buttonText}>
                {isLoading ? '登录中...' : '登录'}
            </Text>
            </TouchableOpacity>
        </View>
        </SafeAreaView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
        flex: 1,
        width: '100%',
        height: '40%',
        top: 20,                 // 距顶部距离
      },
  container: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'center',
  },
  formContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    marginHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
    color: '#333',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#3498db',
    borderRadius: 8,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default LoginScreen;