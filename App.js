import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
  Platform,
} from "react-native";
import { Fontisto } from "@expo/vector-icons";
import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { theme } from "./colors";
import Checkbox from "expo-checkbox";

const STORAGE_KEY = "@toDos";

export default function App() {
  const [working, setWorking] = useState(true);
  const [text, setText] = useState("");
  const [toDos, setToDos] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState("");
  const [editKey, setEditKey] = useState(null);
  const [checkedItems, setCheckedItems] = useState({});

  useEffect(() => {
    loadToDos();
  }, []);

  const travel = () => {
    setWorking(false);
    setEditedText("");
  };
  const work = () => {
    setWorking(true);
    setEditedText("");
  };
  const onChangeText = (payload) => setText(payload);

  const saveToDos = async (toSave) => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  };

  const loadToDos = async () => {
    const items = await AsyncStorage.getItem(STORAGE_KEY);
    setToDos(JSON.parse(items));
  };

  const addToDo = async () => {
    if (text === "") {
      return;
    }
    const newToDos = {
      ...toDos,
      [Date.now()]: { text, working, checked: false },
    };
    setToDos(newToDos);
    await saveToDos(newToDos);
    setText("");
  };

  const startEditing = (key, todoText) => {
    setIsEditing(true);
    setEditedText(todoText);
    setEditKey(key);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setEditedText("");
    setEditKey(null);
  };

  const editToDo = (key) => {
    const todoText = toDos[key].text;
    startEditing(key, todoText);
  };

  const saveEditedToDo = async () => {
    if (editedText === "") {
      return;
    }

    const updatedToDos = {
      ...toDos,
      [editKey]: { text: editedText, working },
    };

    setToDos(updatedToDos);
    await saveToDos(updatedToDos);
    cancelEditing();
  };

  const deleteToDo = (key) => {
    Alert.alert("Delete ToDo", "Are you sure?", [
      { text: "Cancel" },
      {
        text: "I'm Sure",
        style: "destructive",
        onPress: () => {
          const newToDos = { ...toDos };
          delete newToDos[key];
          setToDos(newToDos);
          saveToDos(newToDos);
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <View
        style={Platform.OS === "ios" ? styles.IosHeader : styles.AndroidHeader}
      >
        <TouchableOpacity onPress={work}>
          <Text
            style={{
              ...styles.btnText,
              color: working ? theme.white : theme.grey,
            }}
          >
            Work
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={travel}>
          <Text
            style={{
              ...styles.btnText,
              color: !working ? theme.white : theme.grey,
            }}
          >
            Travel
          </Text>
        </TouchableOpacity>
      </View>
      <TextInput
        onSubmitEditing={isEditing ? saveEditedToDo : addToDo}
        onChangeText={(payload) =>
          isEditing ? setEditedText(payload) : onChangeText(payload)
        }
        returnKeyType="done"
        value={isEditing ? editedText : text}
        placeholder={
          working ? "What do you have to do?" : "Where do you want to go?"
        }
        style={styles.input}
      />
      <ScrollView>
        {toDos &&
          Object.keys(toDos).map((key) =>
            toDos[key].working === working ? (
              <View style={styles.toDo} key={key}>
                <Checkbox
                  value={checkedItems[key]}
                  onValueChange={(value) => {
                    setCheckedItems({ ...checkedItems, [key]: value });
                  }}
                />
                <Text
                  style={[
                    styles.toDoText,
                    {
                      textDecorationLine: checkedItems[key]
                        ? "line-through"
                        : "none",
                      color: checkedItems[key] ? theme.grey : theme.white,
                    },
                  ]}
                >
                  {toDos[key].text}
                </Text>
                <View style={styles.toDoIcons}>
                  <TouchableOpacity onPress={() => editToDo(key)}>
                    <Feather name="edit" size={18} color={theme.edit} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => deleteToDo(key)}>
                    <Fontisto name="trash" size={18} color={theme.delete} />
                  </TouchableOpacity>
                </View>
              </View>
            ) : null
          )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
    paddingHorizontal: 20,
  },

  IosHeader: {
    justifyContent: "space-between",
    flexDirection: "row",
    marginTop: 100,
  },

  AndroidHeader: {
    justifyContent: "space-between",
    flexDirection: "row",
    marginTop: 20,
  },

  btnText: {
    fontSize: 38,
    fontWeight: "600",
  },

  input: {
    backgroundColor: theme.white,
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 30,
    marginVertical: 20,
    fontSize: 18,
  },

  toDo: {
    backgroundColor: theme.toDoBg,
    marginBottom: 10,
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  toDoText: {
    color: theme.white,
    fontSize: 18,
    fontWeight: "600",
    width: "80%",
    paddingHorizontal: 20,
  },

  toDoIcons: {
    flexDirection: "row",
    gap: 10,
  },
});
