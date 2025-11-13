import "react-native-gesture-handler";
import React from "react";
import { SQLiteProvider } from "expo-sqlite";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

// Screens
import RegisterScreen from "./RegisterScreen";
import LoginScreen from "./LoginScreen";
import UserListScreen from "./UserListScreen";
import MessengerScreen from "./MessengerScreen";
import CommentScreen from "./CommentScreen";

const Stack = createStackNavigator();

export default function App() {
  return (
    <SQLiteProvider
      databaseName="authDatabase.db"
      onInit={async (db) => {
        // ✅ Create necessary tables
        await db.execAsync(`
          -- Users table
          CREATE TABLE IF NOT EXISTS auth_users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL
          );

          -- Messages table
          CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            sender TEXT NOT NULL,
            receiver TEXT NOT NULL,
            message TEXT NOT NULL,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
          );

          -- Comments table
          CREATE TABLE IF NOT EXISTS comments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user TEXT NOT NULL,
            comment TEXT NOT NULL,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
          );
        `);

        // ✅ Add missing column for profile image (safe check)
        try {
          await db.runAsync("ALTER TABLE auth_users ADD COLUMN profileUri TEXT;");
          console.log("✅ Added profileUri column to auth_users");
        } catch (error) {
          // Ignore 'duplicate column' error if it already exists
          if (!error.message.includes("duplicate column")) {
            console.error("Error adding profileUri column:", error);
          }
        }
      }}
    >
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Register"
          screenOptions={{
            headerStyle: { backgroundColor: "#0084ff" },
            headerTintColor: "#fff",
            headerTitleStyle: { fontWeight: "bold" },
          }}
        >
          <Stack.Screen
            name="Register"
            component={RegisterScreen}
            options={{ title: "Register" }}
          />
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ title: "Login" }}
          />
          <Stack.Screen
            name="Users"
            component={UserListScreen}
            options={{ title: "User List" }}
          />
          <Stack.Screen
            name="Messenger"
            component={MessengerScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Comments"
            component={CommentScreen}
            options={{ title: "Comments" }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SQLiteProvider>
  );
}
