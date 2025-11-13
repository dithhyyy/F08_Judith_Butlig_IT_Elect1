import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  StatusBar,
  Keyboard,
  Image,
} from "react-native";
import { useSQLiteContext } from "expo-sqlite";

const MessengerScreen = ({ route, navigation }) => {
  const { currentUser, chatWithUser } = route.params;
  const db = useSQLiteContext();
  const flatListRef = useRef();

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [currentUserPic, setCurrentUserPic] = useState(null);
  const [chatWithUserPic, setChatWithUserPic] = useState(null);

  // Fetch user profile pictures
  const loadUserPics = async () => {
    try {
      const current = await db.getFirstAsync(
        "SELECT profileUri FROM auth_users WHERE name = ?",
        [currentUser.name]
      );
      const chatWith = await db.getFirstAsync(
        "SELECT profileUri FROM auth_users WHERE name = ?",
        [chatWithUser.name]
      );
      setCurrentUserPic(current?.profileUri || null);
      setChatWithUserPic(chatWith?.profileUri || null);
    } catch (err) {
      console.error("Load user pics error:", err);
    }
  };

  // Create messages table
  const createTable = async () => {
    try {
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS messages (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          sender TEXT NOT NULL,
          receiver TEXT NOT NULL,
          message TEXT NOT NULL,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP
        );
      `);
    } catch (error) {
      console.error("DB Error:", error);
    }
  };

  // Load messages
  const loadMessages = async () => {
    try {
      const results = await db.getAllAsync(
        `SELECT * FROM messages
         WHERE (sender = ? AND receiver = ?)
            OR (sender = ? AND receiver = ?)
         ORDER BY created_at ASC`,
        [currentUser.name, chatWithUser.name, chatWithUser.name, currentUser.name]
      );
      setMessages(results);
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error("Load Messages Error:", error);
    }
  };

  // Send message
  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    try {
      await db.runAsync(
        "INSERT INTO messages (sender, receiver, message) VALUES (?, ?, ?)",
        [currentUser.name, chatWithUser.name, newMessage.trim()]
      );
      setNewMessage("");
      loadMessages();
    } catch (error) {
      console.error("Send Message Error:", error);
    }
  };

  useEffect(() => {
    createTable().then(() => {
      loadMessages();
      loadUserPics();
    });

    const showSub = Keyboard.addListener("keyboardDidShow", (e) =>
      setKeyboardHeight(e.endCoordinates.height)
    );
    const hideSub = Keyboard.addListener("keyboardDidHide", () => setKeyboardHeight(0));

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const renderItem = ({ item }) => {
    const isMe = item.sender === currentUser.name;
    const profilePic = isMe ? currentUserPic : chatWithUserPic;

    return (
      <View style={[styles.messageRow, isMe ? styles.rowRight : styles.rowLeft]}>
        {!isMe && (
          <Image
            source={profilePic ? { uri: profilePic } : require("./assets/default.png")}
            style={styles.chatHeadImage}
          />
        )}
        <View style={[styles.messageBubble, isMe ? styles.myMessage : styles.otherMessage]}>
          <Text style={isMe ? styles.myMessageText : styles.otherMessageText}>{item.message}</Text>
        </View>
        {isMe && (
          <Image
            source={profilePic ? { uri: profilePic } : require("./assets/default.png")}
            style={styles.chatHeadImage}
          />
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0084ff" />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backText}>◀ Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerName}>{chatWithUser.name}</Text>
          <View style={{ width: 60 }} />
        </View>

        {/* Messages */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ paddingVertical: 10 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        />

        {/* Input */}
        <View style={[styles.inputRow, { marginBottom: keyboardHeight }]}>
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            value={newMessage}
            onChangeText={setNewMessage}
            multiline
          />
          <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
            <Text style={{ color: "#fff", fontWeight: "bold" }}>Send</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#e5e5e5" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0084ff",
    paddingHorizontal: 12,
    paddingVertical: 10,
    justifyContent: "space-between",
  },
  backButton: { padding: 4 },
  backText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  headerName: { color: "#fff", fontSize: 18, fontWeight: "bold", textAlign: "center", flex: 1 },
  container: { flex: 1 },
  messageRow: { flexDirection: "row", alignItems: "flex-end", marginVertical: 6, paddingHorizontal: 10 },
  rowLeft: { justifyContent: "flex-start" },
  rowRight: { justifyContent: "flex-end" },
  chatHeadImage: { width: 36, height: 36, borderRadius: 18, marginHorizontal: 4 },
  messageBubble: { padding: 10, borderRadius: 18, maxWidth: "70%" },
  myMessage: { backgroundColor: "#0084ff", marginLeft: 6 },
  otherMessage: { backgroundColor: "#f0f0f0", marginRight: 6 },
  myMessageText: { color: "#fff", fontSize: 16 },
  otherMessageText: { color: "#000", fontSize: 16 },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    borderTopWidth: 1,
    borderTopColor: "#ccc",
    backgroundColor: "#fff",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 6,
    marginRight: 8,
    backgroundColor: "#f9f9f9",
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: "#0084ff",
    borderRadius: 25,
    padding: 10,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default MessengerScreen;
