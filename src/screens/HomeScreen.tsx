// src/screens/HomeScreen.tsx

import React, { useEffect, useState } from "react";
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, RefreshControl
} from "react-native";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "../services/firebase";
import { Report } from "../types";
import { useNavigation } from "@react-navigation/native";

export default function HomeScreen() {
  const [reports, setReports] = useState<Report[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation<any>();

  useEffect(() => {
    const q = query(collection(db, "reports"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      })) as Report[];
      setReports(data);
    });
    return unsubscribe;
  }, []);

  const getTypeEmoji = (type: string) => {
    switch (type) {
      case "robo": return "🚨";
      case "vehiculo_sospechoso": return "🚗";
      case "emergencia_medica": return "🏥";
      case "microtrafico": return "⚠️";
      default: return "📢";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed": return "#2ecc71";
      case "fake": return "#e74c3c";
      default: return "#f39c12";
    }
  };

  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>🚨 Alerta Vecina</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity onPress={() => navigation.navigate("Map")}>
            <Text style={styles.headerBtn}>🗺️</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate("Profile")}>
            <Text style={styles.headerBtn}>👤</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Lista de reportes */}
      <FlatList
        data={reports}
        keyExtractor={(item) => item.id || ""}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => setRefreshing(false)} />
        }
        ListEmptyComponent={
          <Text style={styles.empty}>No hay alertas en tu zona aún</Text>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardEmoji}>{getTypeEmoji(item.type)}</Text>
              <View style={styles.cardInfo}>
                <Text style={styles.cardType}>{item.type.replace("_", " ").toUpperCase()}</Text>
                <Text style={styles.cardAuthor}>por {item.authorNickname}</Text>
              </View>
              <View style={[styles.statusDot, { backgroundColor: getStatusColor(item.status) }]} />
            </View>
            <Text style={styles.cardDesc}>{item.description}</Text>
            <Text style={styles.cardAddress}>📍 {item.location.address}</Text>
            <View style={styles.cardFooter}>
              <Text style={styles.votes}>✅ {item.confirmations} confirmados</Text>
              <Text style={styles.votes}>❓ {item.doubts} dudosos</Text>
            </View>
          </View>
        )}
      />

      {/* Botón nueva alerta */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate("Report")}
      >
        <Text style={styles.fabText}>+ Nueva Alerta</Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#1a1a2e" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    paddingTop: 50,
    backgroundColor: "#16213e"
  },
  title: { fontSize: 20, fontWeight: "bold", color: "#E63946" },
  headerButtons: { flexDirection: "row", gap: 12 },
  headerBtn: { fontSize: 24 },
  empty: { color: "#aaa", textAlign: "center", marginTop: 40, fontSize: 16 },
  card: {
    backgroundColor: "#16213e",
    margin: 10,
    borderRadius: 12,
    padding: 16
  },
  cardHeader: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  cardEmoji: { fontSize: 28, marginRight: 10 },
  cardInfo: { flex: 1 },
  cardType: { color: "#fff", fontWeight: "bold", fontSize: 14 },
  cardAuthor: { color: "#aaa", fontSize: 12 },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  cardDesc: { color: "#ddd", fontSize: 14, marginBottom: 6 },
  cardAddress: { color: "#aaa", fontSize: 12, marginBottom: 8 },
  cardFooter: { flexDirection: "row", gap: 16 },
  votes: { color: "#aaa", fontSize: 12 },
  fab: {
    position: "absolute",
    bottom: 24,
    right: 24,
    backgroundColor: "#E63946",
    borderRadius: 30,
    paddingVertical: 14,
    paddingHorizontal: 24,
    elevation: 5
  },
  fabText: { color: "#fff", fontWeight: "bold", fontSize: 16 }
});