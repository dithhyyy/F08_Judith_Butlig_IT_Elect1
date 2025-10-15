import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  ImageBackground,
  TouchableOpacity, // ✅ you missed this import
} from "react-native";

export default function Messenger() {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  const sendMessage = () => {
    if (text.trim() === "") return;
    setMessages((prev) => [...prev, { id: Date.now().toString(), text }]);
    setText("");
  };

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        source={require("./picture/background.webp")}
        style={styles.background}
        resizeMode="cover"
      >
        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          {/* Message list */}
          <FlatList
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.message}>
                <Text>{item.text}</Text>
              </View>
            )}
          />

          {/* Input area */}
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="Type a message"
              placeholderTextColor="#aaa"
              value={text}
              onChangeText={setText}
            />
            <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
              <Text style={styles.sendText}>Send</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
    padding: 10,
    justifyContent: "space-between",
  },
  message: {
    padding: 10,
    marginVertical: 4,
    backgroundColor: "rgba(186, 58, 255, 0.8)",
    borderRadius: 6,
    alignSelf: "flex-end",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 20,
    padding: 6,
  },
  input: {
    flex: 1,
    borderWidth: 0,
    padding: 8,
    marginRight: 8,
  },
  sendButton: {
    backgroundColor: "transparent", // ✅ transparent background
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#007bff",
  },
  sendText: {
    color: "#007bff",
    fontWeight: "bold",
  },
});
