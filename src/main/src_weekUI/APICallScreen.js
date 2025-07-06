import React, { Component } from 'react';
import { SafeAreaView, TextInput, StyleSheet, Text, Button, ActivityIndicator, Dimensions, View } from 'react-native';

const screenHeight=Dimensions.get('window').height;
const popupHeight=screenHeight*0.9;

class APICallScreen extends Component {
  constructor(props){
    super(props);
    this.state={
      inputText:'',
      responseData:null,
      error:null,
      isLoading:false,
    };
  }

  generateSchedule=async()=>{
    const {inputText}=this.state;

    this.setState({
      isLoading:true,
      error:null,
      responseData:null,
    });

    try {
      const userInput = inputText.trim();
      if (!userInput) {
        throw new Error('请输入任务描述');
      }

      const response = await fetch('http://8.138.161.200:5000/api/generate_schedule', {
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
      this.setState({ responseData: data });
    } 
    catch (err) {
      this.setState({ error: err.message });
    } 
    finally {
      this.setState({ isLoading: false });
    }
  };
  render() {
    const {inputText,responseData,error,isLoading} = this.state;

    return(
      <View style={styles.container}>
        <TextInput
          style={styles.input}
          placeholder="请输入信息"
          placeholderTextColor="#999"
          value={inputText}
          onChangeText={(text) => this.setState({ inputText: text })}
        />
        <Button
          title={isLoading ? '处理中...' : '生成日程'}
          onPress={this.generateSchedule}
          disabled={isLoading}
        />
        {isLoading && <ActivityIndicator size="large" color="#0000ff" />}
        {error && <Text style={styles.error}>{error}</Text>}
        {responseData && (
          <Text style={styles.result}>
            {JSON.stringify(responseData, null, 2)}
          </Text>
        )}
      </View>
    );
  }
}


// const APICallScreen = () => {
//   const [inputText, setInputText] = useState('');
//   const [responseData, setResponseData] = useState(null);
//   const [error, setError] = useState(null);
//   const [isLoading, setIsLoading] = useState(false);

//    const generateSchedule = async () => {
//     setIsLoading(true);
//     setError(null);
//     setResponseData(null);

//     try {
//       const userInput = inputText.trim();
//       if (!userInput) {
//         throw new Error('请输入任务描述');
//       }

//       const response = await fetch('http://localhost:5000/api/generate_schedule', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json'
//         },
//         body: JSON.stringify({
//           text: userInput
//         })
//       });

//       if (!response.ok) {
//         throw new Error(`API请求失败，状态码: ${response.status}`);
//       }

//       const data = await response.json();
//       setResponseData(data);
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <SafeAreaView style={styles.container}>
//       <TextInput
//         style={styles.input}
//         placeholder="请输入信息"
//         placeholderTextColor="#999"
//         value={inputText}
//         onChangeText={(text) => setInputText(text)}
//       />
//       <Button
//         title={isLoading ? '处理中...' : '生成日程'}
//         onPress={generateSchedule}
//         disabled={isLoading}
//       />
//       {isLoading && <ActivityIndicator size="large" color="#0000ff" />}
//       {error && <Text style={styles.error}>{error}</Text>}
//       {responseData && (
//         <Text style={styles.result}>
//           {JSON.stringify(responseData, null, 2)}
//         </Text>
//       )}
//     </SafeAreaView>
//   );
// };

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
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.2)', // 半透明背景
  },
  popup: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    elevation: 5,
  },
});

export default APICallScreen;



// // 可以占屏幕的90%，但是输入时 键盘会将所有东西顶到上面，导致看不到。
// import React, { Component } from 'react';
// import {
//   SafeAreaView,
//   View,
//   TextInput,
//   StyleSheet,
//   Text,
//   Button,
//   ActivityIndicator,
//   Dimensions,
// } from 'react-native';

// const screenHeight = Dimensions.get('window').height;
// const popupHeight = screenHeight * 0.9;

// class APICallScreen extends Component {
//   constructor(props) {
//     super(props);
//     this.state = {
//       inputText: '',
//       responseData: null,
//       error: null,
//       isLoading: false,
//     };
//   }

//   generateSchedule = async () => {
//     const { inputText } = this.state;

//     this.setState({
//       isLoading: true,
//       error: null,
//       responseData: null,
//     });

//     try {
//       const userInput = inputText.trim();
//       if (!userInput) throw new Error('请输入任务描述');

//       const response = await fetch('http://localhost:5000/api/generate_schedule', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ text: userInput }),
//       });

//       if (!response.ok) {
//         throw new Error(`API请求失败，状态码: ${response.status}`);
//       }

//       const data = await response.json();
//       this.setState({ responseData: data });
//     } catch (err) {
//       this.setState({ error: err.message });
//     } finally {
//       this.setState({ isLoading: false });
//     }
//   };

//   render() {
//     const { inputText, responseData, error, isLoading } = this.state;

//     return (
//       <SafeAreaView style={styles.overlay}>
//         <View style={[styles.popup, { height: popupHeight }]}>
//           <TextInput
//             style={styles.input}
//             placeholder="请输入信息"
//             placeholderTextColor="#999"
//             value={inputText}
//             onChangeText={(text) => this.setState({ inputText: text })}
//           />
//           <Button
//             title={isLoading ? '处理中...' : '生成日程'}
//             onPress={this.generateSchedule}
//             disabled={isLoading}
//           />
//           {isLoading && <ActivityIndicator size="large" color="#0000ff" />}
//           {error && <Text style={styles.error}>{error}</Text>}
//           {responseData && (
//             <Text style={styles.result}>
//               {JSON.stringify(responseData, null, 2)}
//             </Text>
//           )}
//         </View>
//       </SafeAreaView>
//     );
//   }
// }

// const styles = StyleSheet.create({
//   overlay: {
//     flex: 1,
//     justifyContent: 'flex-end',
//     backgroundColor: 'rgba(0,0,0,0.2)', // 半透明背景
//   },
//   popup: {
//     backgroundColor: '#fff',
//     borderTopLeftRadius: 16,
//     borderTopRightRadius: 16,
//     padding: 16,
//     elevation: 5,
//   },
//   input: {
//     fontSize: 16,
//     color: '#333',
//     height: 40,
//     borderWidth: 1,
//     borderColor: '#ccc',
//     borderRadius: 4,
//     paddingHorizontal: 12,
//     marginBottom: 16,
//   },
//   error: {
//     color: 'red',
//     marginTop: 16,
//   },
//   result: {
//     marginTop: 16,
//     backgroundColor: '#f8f9fa',
//     padding: 15,
//     borderWidth: 1,
//     borderColor: '#ccc',
//     borderRadius: 4,
//     fontFamily: 'Courier New, monospace',
//   },
// });

// export default APICallScreen;
