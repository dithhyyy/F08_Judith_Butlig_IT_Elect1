import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import Messenger from './MidAct1/Messenger';
import Comment from './MidAct1/Comment';

export default function App() {
  return (
    <View style={styles.container}>

  <Messenger/>
  <Comment/>

      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    
  },
});
