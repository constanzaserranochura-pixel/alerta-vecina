// src/screens/MapScreen.tsx

import React, { useEffect, useState } from "react";
import { View, StyleSheet, ActivityIndicator, Text, TouchableOpacity } from "react-native";
import MapView, { Marker, Heatmap, PROVIDER_GOOGLE } from "react-native-maps";
import * as Location from "expo-location";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "../services/firebase";
import { Report } from "../types";
import { useNavigation } from "@react-navigation/native";

export default function MapScreen() {
  const navigation = useNavigation<any>();
  const [reports, setReports] = useState<Report[]>([]);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLocation();
    loadReports();
  }, []);

  const getLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;
      const loc = await Location.getCurrentPositionAsync({});
      setLocation({ lat: loc.coords.latitude, lng: loc.coords.longitude });
    } catch (error) {
      console.log("Error obteniendo ubicación", error);
    } finally {
      setLoading(false);
    }
  };

  const loadReports = () => {
    const q = query(collection(db, "reports"), orderBy("createdAt", "desc"));
    onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      })) as Report[];
      setReports(data);
    });
  };

  const getMarkerColor = (type: string) => {
    switch (type) {
      case "robo": return "#E63946";
      case "vehiculo_sospechoso": return "#f39c12";
      case "emergencia_medica": return "#2ecc71";
      case "microtrafico": return "#9b59b6";
      default: return "#3498db";
    }
  };

  const getTypeEmoji = (type: string) => {
    switch (type) {
      case "robo": return "🚨";
      case "vehiculo_sospechoso": return "🚗";
      case "emergencia_medica": return "🏥";
      case "microtrafico": return "⚠️";
      default: return "📢";
    }
  };

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#E63946" />
        <Text style={styles.loadingText}>Cargando mapa...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>← Volver</Text>
        </TouchableOpacity>
        <Text style={styles.title}>🗺️ Mapa de Incidentes</Text>
      </View>

      {/* Mapa */}
      <MapView
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={{
          latitude: location?.lat || -18.4783,
          longitude: location?.lng || -70.3126,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02
        }}
        showsUserLocation={true}
        showsMyLocationButton={true}
      >
        {/* Marcadores de incidentes */}
        {reports.map((report) => (
          report.location.lat !== 0 && (
            <Marker
              key={report.id}
              coordinate={{
                latitude: report.location.lat,
                longitude: report.location.lng
              }}
              title={`${getTypeEmoji(report.type)} ${report.type.replace("_", " ").toUpperCase()}`}
              description={report.description}
              pinColor={getMarkerColor(report.type)}
            />
          )
        ))}
      </MapView>

      {/* Leyenda */}
      <View style={styles.legend}>
        <Text style={styles.legendTitle}>Leyenda</Text>
        <View style={styles.legendRow}>
          <View style={[styles.legendDot, { backgroundColor: "#E63946" }]} />
          <Text style={styles.legendText}>Robo</Text>
          <View style={[styles.legendDot, { backgroundColor: "#f39c12" }]} />
          <Text style={styles.legendText}>Vehículo</Text>
          <View style={[styles.legendDot, { backgroundColor: "#2ecc71" }]} />
          <Text style={styles.legendText}>Emergencia</Text>
        </View>
      </View>

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
  loading: { flex: 1, backgroundColor: "#1a1a2e", justifyContent: "center", alignItems: "center" },
  loadingText: { color: "#aaa", marginTop: 12, fontSize: 16 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    padding: 20,
    paddingTop: 50,
    backgroundColor: "#16213e"
  },
  back: { color: "#E63946", fontSize: 16 },
  title: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  map: { flex: 1 },
  legend: {
    backgroundColor: "#16213e",
    padding: 12,
    borderTopWidth: 0.5,
    borderTopColor: "#333"
  },
  legendTitle: { color: "#aaa", fontSize: 11, marginBottom: 6 },
  legendRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { color: "#fff", fontSize: 11 },
  fab: {
    position: "absolute",
    bottom: 80,
    right: 24,
    backgroundColor: "#E63946",
    borderRadius: 30,
    paddingVertical: 14,
    paddingHorizontal: 24,
    elevation: 5
  },
  fabText: { color: "#fff", fontWeight: "bold", fontSize: 16 }
});