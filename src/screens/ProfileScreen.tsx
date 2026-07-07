// src/screens/ProfileScreen.tsx

import React from "react";
import {
  View, Text, TouchableOpacity,
  StyleSheet, Alert
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { logoutUser } from "../services/authService";
import { useNavigation } from "@react-navigation/native";

export default function ProfileScreen() {
  const { userData } = useAuth();
  const navigation = useNavigation<any>();

  const handleLogout = async () => {
    Alert.alert(
      "Cerrar sesión",
      "¿Estás seguro que quieres salir?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Salir",
          style: "destructive",
          onPress: async () => await logoutUser()
        }
      ]
    );
  };

  return (
    <View style={styles.container}>

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>← Volver</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Mi Perfil</Text>
      </View>

      <View style={styles.nicknameCard}>
        <Text style={styles.nicknameEmoji}>🎭</Text>
        <Text style={styles.nicknameLabel}>Tu apodo anónimo</Text>
        <Text style={styles.nickname}>{userData?.nickname || "Cargando..."}</Text>
        <Text style={styles.nicknameInfo}>
          Este apodo es lo único que ven los demás vecinos
        </Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{userData?.trustScore || 0}</Text>
          <Text style={styles.statLabel}>⭐ Puntaje de Confianza</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{userData?.reportsCount || 0}</Text>
          <Text style={styles.statLabel}>🚨 Alertas Enviadas</Text>
        </View>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoLabel}>📍 Tu sector</Text>
        <Text style={styles.infoValue}>{userData?.neighborhood || "No definido"}</Text>
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>Cerrar Sesión</Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#1a1a2e" },
  header: {
    padding: 20,
    paddingTop: 50,
    backgroundColor: "#16213e",
    flexDirection: "row",
    alignItems: "center",
    gap: 16
  },
  back: { color: "#E63946", fontSize: 16 },
  title: { color: "#fff", fontSize: 20, fontWeight: "bold" },
  nicknameCard: {
    backgroundColor: "#16213e",
    margin: 16,
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E63946"
  },
  nicknameEmoji: { fontSize: 48, marginBottom: 8 },
  nicknameLabel: { color: "#aaa", fontSize: 14, marginBottom: 4 },
  nickname: { color: "#E63946", fontSize: 28, fontWeight: "bold", marginBottom: 8 },
  nicknameInfo: { color: "#666", fontSize: 12, textAlign: "center" },
  statsContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 12
  },
  statCard: {
    flex: 1,
    backgroundColor: "#16213e",
    borderRadius: 12,
    padding: 16,
    alignItems: "center"
  },
  statNumber: { color: "#fff", fontSize: 32, fontWeight: "bold" },
  statLabel: { color: "#aaa", fontSize: 12, marginTop: 4, textAlign: "center" },
  infoCard: {
    backgroundColor: "#16213e",
    margin: 16,
    borderRadius: 12,
    padding: 16
  },
  infoLabel: { color: "#aaa", fontSize: 12, marginBottom: 4 },
  infoValue: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  logoutBtn: {
    backgroundColor: "#c0392b",
    borderRadius: 10,
    padding: 16,
    alignItems: "center",
    margin: 16
  },
  logoutText: { color: "#fff", fontWeight: "bold", fontSize: 16 }
});