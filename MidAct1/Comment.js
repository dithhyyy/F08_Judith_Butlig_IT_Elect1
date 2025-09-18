import React, { useState } from "react";
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet } from "react-native";

export default function Comment() {
  const [comments, setComments] = useState([
    { id: "1", text: "This is the first comment!" },
    { id: "2", text: "Nice post 👍" },
  ]);
  const [newComment, setNewComment] = useState("");

  const addComment = () => {
    if (newComment.trim().length === 0) return;
    setComments([
      ...comments,
      { id: Date.now().toString(), text: newComment },
    ]);
    setNewComment("");
  };

  const renderItem = ({ item }) => (
    <View style={styles.commentBox}>
      <Text style={styles.commentText}>{item.text}</Text>
      <TouchableOpacity style={styles.replyBtn}>
        <Text style={styles.replyText}>Reply</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={comments}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
      />

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Write a comment..."
          value={newComment}
          onChangeText={setNewComment}
        />
        <TouchableOpacity style={styles.sendBtn} onPress={addComment}>
          <Text style={styles.sendText}>Comment</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10, backgroundColor: "#fff" },
  commentBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f2f2f2",
    padding: 10,
    borderRadius: 10,
    marginBottom: 8,
  },
  commentText: { fontSize: 16, color: "#333", flex: 1 },
  replyBtn: { paddingLeft: 10 },
  replyText: { color: "#007bff", fontWeight: "500" },
  inputRow: {
    flexDirection: "row",
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#ddd",
    paddingTop: 10,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 20,
    paddingHorizontal: 15,
  },
  sendBtn: {
    marginLeft: 10,
    backgroundColor: "#007bff",
    paddingHorizontal: 15,
    justifyContent: "center",
    borderRadius: 20,
  },
  sendText: { color: "#fff", fontWeight: "600" },
});