import React, { useState } from "react";
import {
  SafeAreaView,
  KeyboardAvoidingView,
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Image,
  Platform,
  FlatList,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useSQLiteContext } from "expo-sqlite";
import { Ionicons } from "@expo/vector-icons";

const LoginScreen = ({ navigation }) => {
  const db = useSQLiteContext();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [otherUsers, setOtherUsers] = useState([]);
  const [profileImage, setProfileImage] = useState(null);

  // 🖼️ Pick new profile image
  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission required", "Please allow access to your gallery.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setProfileImage(uri);

      // Optionally, save to DB
      if (loggedInUser) {
        try {
          await db.runAsync("UPDATE auth_users SET profileUri = ? WHERE id = ?", [
            uri,
            loggedInUser.id,
          ]);
          Alert.alert("Updated", "Profile picture updated successfully!");
        } catch (err) {
          console.error("Error saving profile:", err);
        }
      }
    }
  };

  const handleLogin = async () => {
    const { email, password } = form;
    if (!email || !password)
      return Alert.alert("Error", "Enter email and password.");

    try {
      const user = await db.getFirstAsync(
        "SELECT * FROM auth_users WHERE email = ? AND password = ?",
        [email, password]
      );

      if (user) {
        setLoggedInUser(user);
        setForm({ email: "", password: "" });
        setProfileImage(user.profileUri || null); // Load saved image
        loadOtherUsers(user.id);
        Alert.alert("Success", `Welcome back, ${user.name}!`);
      } else {
        Alert.alert("Error", "Invalid email or password.");
      }
    } catch (error) {
      console.error("Login Error:", error);
      Alert.alert("Error", "Login failed.");
    }
  };

  const loadOtherUsers = async (userId) => {
    try {
      const users = await db.getAllAsync(
        "SELECT * FROM auth_users WHERE id != ?",
        [userId]
      );
      setOtherUsers(users);
    } catch (error) {
      console.error("Load Users Error:", error);
    }
  };

  const renderUser = ({ item }) => (
    <TouchableOpacity
      style={styles.userRow}
      onPress={() =>
        navigation.navigate("Messenger", {
          currentUser: loggedInUser,
          chatWithUser: item,
        })
      }
    >
      <Text style={styles.userName}>{item.name}</Text>
      <Text style={styles.userEmail}>{item.email}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <KeyboardAvoidingView
        style={{ flex: 1, padding: 20 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {!loggedInUser ? (
          // 🧭 LOGIN SCREEN
          <View style={styles.loginContainer}>
            <Text style={styles.title}>Login</Text>

            <TextInput
              style={styles.input}
              placeholder="Email"
              autoCapitalize="none"
              keyboardType="email-address"
              value={form.email}
              onChangeText={(text) => setForm({ ...form, email: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              secureTextEntry
              value={form.password}
              onChangeText={(text) => setForm({ ...form, password: text })}
            />

            <View style={{ marginVertical: 10 }}>
              <Button title="Login" onPress={handleLogin} color="#007bff" />
            </View>

            <TouchableOpacity onPress={() => navigation.navigate("Register")}>
              <Text style={styles.link}>Don’t have an account? Register</Text>
            </TouchableOpacity>
          </View>
        ) : (
          // 🧍 AFTER LOGIN VIEW
          <View style={{ flex: 1 }}>
            {/* 👤 User profile section */}
            <View style={styles.profileSection}>
              <TouchableOpacity onPress={pickImage}>
                {profileImage ? (
                  <Image source={{ uri: profileImage }} style={styles.profileImage} />
                ) : (
                  <Ionicons name="person-circle-outline" size={100} color="#aaa" />
                )}
              </TouchableOpacity>
              <Text style={styles.userNameBig}>{loggedInUser.name}</Text>
              <Text style={styles.userEmail}>{loggedInUser.email}</Text>
              <Text style={styles.changePhotoText}>Tap image to change photo</Text>
            </View>

            <Text style={styles.subtitle}>Select a user to message:</Text>

            <FlatList
              data={otherUsers}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderUser}
              style={{ flex: 1, marginTop: 10 }}
            />

            <View style={{ marginVertical: 10 }}>
              <Button
                title="Logout"
                onPress={() => {
                  setLoggedInUser(null);
                  setOtherUsers([]);
                  setProfileImage(null);
                }}
                color="#dc3545"
              />
            </View>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  loginContainer: { flex: 1, justifyContent: "center" },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
  },
  link: {
    color: "#007bff",
    textAlign: "center",
    marginTop: 12,
    fontSize: 16,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "500",
    marginBottom: 10,
    textAlign: "center",
  },
  profileSection: {
    alignItems: "center",
    marginBottom: 20,
    marginTop: 10,
  },
  profileImage: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 2,
    borderColor: "#007bff",
  },
  userNameBig: {
    fontSize: 20,
    fontWeight: "700",
    marginTop: 8,
  },
  changePhotoText: {
    fontSize: 12,
    color: "#555",
    marginTop: 5,
  },
  userRow: {
    padding: 12,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    marginBottom: 10,
  },
  userName: { fontSize: 16, fontWeight: "600" },
  userEmail: { fontSize: 14, color: "#555" },
});

export default LoginScreen;
