import React, { useState, useRef } from 'react';
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Image,
  ImageBackground,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'; // ✅ Updated import
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';

import userPhoto from './picture/background.webp';
import chatmatePhoto from './picture/Chatmate.jpg';
import bgPhoto from './picture/Me.jpg';

const MyFlatList = ({ messages }) => {
  return (
    <FlatList
      data={messages}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => (
        <View
          style={[
            styles.messageRow,
            item.sender === 'you' ? styles.rightAlign : styles.leftAlign,
          ]}
        >
          {item.sender === 'chatmate' && <Image source={chatmatePhoto} style={styles.avatar} />}
          <View
            style={[
              styles.messageBubble,
              item.sender === 'you' ? styles.yourBubble : styles.chatmateBubble,
            ]}
          >
            {item.image ? (
              <Image source={{ uri: item.image }} style={styles.messageImage} />
            ) : (
              <Text
                style={[
                  styles.messageText,
                  item.sender === 'you' ? styles.yourText : styles.chatmateText,
                ]}
              >
                {item.text}
              </Text>
            )}
          </View>
          {item.sender === 'you' && <Image source={userPhoto} style={styles.avatar} />}
        </View>
      )}
      inverted
      contentContainerStyle={{ flexGrow: 1, justifyContent: 'flex-end', paddingVertical: 10 }}
    />
  );
};

export default function Messenger() {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const nextId = useRef(1);

  const getSmartReply = (userMessage) => {
    const msg = userMessage.toLowerCase();

    if (msg.includes('hi') || msg.includes('hello') || msg.includes('hey')) {
      const greetings = ['Hey there!', 'Hello! How’s your day going?', 'Hi! What’s up?', 'Heyy'];
      return greetings[Math.floor(Math.random() * greetings.length)];
    }
    if (msg.includes('how are you')) {
      const responses = ['I’m doing great! Thanks for asking 💜', 'Feeling good today, you?'];
      return responses[Math.floor(Math.random() * responses.length)];
    }
    if (msg.includes('thank')) {
      const thanksReplies = ['You’re very welcome'];
      return thanksReplies[Math.floor(Math.random() * thanksReplies.length)];
    }
    if (msg.includes('bye')) {
      const byeReplies = ['Bye! Take care', 'See you soon', 'Goodbye! Hope we chat again'];
      return byeReplies[Math.floor(Math.random() * byeReplies.length)];
    }
    if (msg.includes('haha') || msg.includes('lol') || msg.includes('😂')) {
      const laughReplies = ['Haha! You’re funny', 'LOL same here'];
      return laughReplies[Math.floor(Math.random() * laughReplies.length)];
    }
    if (msg.includes('love')) {
      const loveReplies = ['That’s so sweet!', 'That made me smile'];
      return loveReplies[Math.floor(Math.random() * loveReplies.length)];
    }
    if (msg.includes('ok') || msg.includes('okay')) {
      const okReplies = ['Got it', 'Okayyy', 'Cool!'];
      return okReplies[Math.floor(Math.random() * okReplies.length)];
    }
    const randomReplies = [
      'That’s interesting',
      'Cool',
      'Haha nice one!',
      'Oh wow',
      'Same here!',
      'Hmm, I get you',
      'Not bad!',
      'Wow, amazing!',
    ];
    return randomReplies[Math.floor(Math.random() * randomReplies.length)];
  };

  const sendMessage = () => {
    if (inputText.trim() === '') return;

    const newMessage = {
      id: nextId.current,
      text: inputText.trim(),
      sender: 'you',
    };
    nextId.current += 1;

    setMessages((prev) => [newMessage, ...prev]);

    setTimeout(() => {
      const reply = {
        id: nextId.current,
        text: getSmartReply(inputText),
        sender: 'chatmate',
      };
      nextId.current += 1;
      setMessages((prev) => [reply, ...prev]);
    }, 1500);

    setInputText('');
  };

const pickImage = async () => {
  // Ask for permission
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== 'granted') {
    alert('Permission to access gallery is required!');
    return;
  }

  // Open gallery
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: [ImagePicker.MediaType.image], // fixed syntax
    allowsEditing: true,
    quality: 0.8,
  });

  // ✅ Check if the user selected an image (newer SDKs use result.canceled)
  if (!result.canceled && result.assets && result.assets.length > 0) {
    const imageUri = result.assets[0].uri;

    const newMessage = {
      id: nextId.current,
      image: imageUri,
      sender: 'you',
    };
    nextId.current += 1;
    setMessages((prev) => [newMessage, ...prev]);

    // Chatmate auto-reply
    setTimeout(() => {
      const reply = {
        id: nextId.current,
        text: 'Nice photo 📸',
        sender: 'chatmate',
      };
      nextId.current += 1;
      setMessages((prev) => [reply, ...prev]);
    }, 1500);
  } else {
    console.log('User canceled image picker or no image selected.');
  }
};

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground source={bgPhoto} style={styles.backgroundImage}>
        <KeyboardAvoidingView
          style={styles.innerContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={90}
        >
          <Text style={styles.headerText}>MESSENGER💜</Text>
          <MyFlatList messages={messages} />
          <View style={styles.inputContainer}>
            <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
              <Text style={styles.imageButtonText}>📷</Text>
            </TouchableOpacity>
            <TextInput
              style={styles.textInput}
              placeholder="Type a message..."
              placeholderTextColor="#bda0d9"
              value={inputText}
              onChangeText={setInputText}
              multiline
            />
            <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
              <Ionicons name="send" size={22} color="#fff" />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  innerContainer: { flex: 1, justifyContent: 'flex-end' },
  headerText: {
    fontSize: 18,
    padding: 15,
    borderBottomWidth: 1,
    borderColor: 'rgba(190, 140, 255, 0.3)',
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#fff',
    backgroundColor: 'rgba(150, 80, 200, 0.5)',
  },
  backgroundImage: { flex: 1, width: '100%', height: '100%' },
  messageRow: { flexDirection: 'row', marginVertical: 4, marginHorizontal: 12, alignItems: 'flex-end' },
  rightAlign: { alignSelf: 'flex-end' },
  leftAlign: { alignSelf: 'flex-start' },
  messageBubble: { padding: 10, borderRadius: 12, maxWidth: '70%' },
  yourBubble: { backgroundColor: 'rgba(150, 80, 200, 0.75)', borderBottomRightRadius: 2 },
  chatmateBubble: { backgroundColor: 'rgba(230, 210, 250, 0.6)', borderBottomLeftRadius: 2 },
  messageText: { fontSize: 16 },
  yourText: { color: '#fff' },
  chatmateText: { color: '#3e206d' },
  messageImage: { width: 200, height: 200, borderRadius: 10 },
  avatar: { width: 35, height: 35, borderRadius: 20, marginHorizontal: 5 },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderColor: 'rgba(190, 140, 255, 0.3)',
    backgroundColor: 'rgba(150, 80, 200, 0.25)',
  },
  imageButton: { justifyContent: 'center', alignItems: 'center', marginRight: 8 },
  imageButtonText: { fontSize: 26 },
  textInput: {
    flex: 1,
    maxHeight: 100,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.8)', // ✅ Fixed typo
    borderRadius: 20,
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(180, 140, 255, 0.5)',
    color: '#4b1f7c',
  },
  sendButton: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(140, 60, 200, 0.9)',
    borderRadius: 25,
    padding: 12,
    marginLeft: 8,
    shadowColor: '#b67bff',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.6,
    shadowRadius: 4,
    elevation: 4,
  },
});
