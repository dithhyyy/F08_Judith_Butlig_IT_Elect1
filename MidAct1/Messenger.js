import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from "react-native";

export default function Messenger() {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const currentUser = "me";
  const botUser = "bot";

  const sendMessage = () => {
    if (text.trim() === "") return;

    const userMessage = {
      id: Date.now().toString(),
      text,
      sender: currentUser,
    };

    setMessages((prev) => [...prev, userMessage]);
    setText("");

    // Auto-reply after a short delay
    setTimeout(() => {
      const botReply = {
        id: (Date.now() + 1).toString(),
        text: generateBotReply(text),
        sender: botUser,
      };
      setMessages((prev) => [...prev, botReply]);
    }, 800);
  };

  // Simple auto-reply logic
  const generateBotReply = (input) => {
    const lower = input.toLowerCase();
    if (lower.includes("hello") || lower.includes("hi"))
      return "Hi there! 👋 How are you?";
    if (lower.includes("how are you"))
      return "I'm just a bot, but I'm feeling chatty today 🤖";
    if (lower.includes("name"))
      return "You can call me ChatBot! What's yours?";
    if (lower.includes("bye"))
      return "Goodbye! Talk to you soon 👋";
    return "Interesting! Tell me more...";
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {/* Message list */}
        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const isMe = item.sender === currentUser;
            return (
              <View
                style={[
                  styles.messageRow,
                  { justifyContent: isMe ? "flex-end" : "flex-start" },
                ]}
              >
                {!isMe && (
                  <Image
                    source={{
                      uri: "assets/ditditt.jpgg", // receiver (bot)
                    }}
                    style={styles.avatar}
                  />
                )}
                <View
                  style={[
                    styles.message,
                    {
                      backgroundColor: isMe ? "#DCF8C6" : "#EEE",
                      alignSelf: isMe ? "flex-end" : "flex-start",
                    },
                  ]}
                >
                  <Text>{item.text}</Text>
                </View>
                {isMe && (
                  <Image
                    source={{
                      uri: "https://cdn-icons-png.flaticon.com/512/147/147144.png", // sender (you)
                    }}
                    style={styles.avatar}
                  />
                )}
              </View>
            );
          }}
        />

        {/* Input section */}
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Type a message"
            value={text}
            onChangeText={setText}
          />
          <Button title="Send" onPress={sendMessage} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  messageRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 6,
  },
  message: {
    padding: 10,
    borderRadius: 10,
    maxWidth: "70%",
  },
  avatar: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    marginHorizontal: 8,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 8,
    marginRight: 8,
  },
});
