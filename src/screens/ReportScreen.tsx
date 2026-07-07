// src/screens/ReportScreen.tsx

import React, { useState, useEffect } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator, ScrollView
} from "react-native";
import { collection, addDoc } from "firebase/firestore";
import * as Location from "expo-location";
import { db } from "../services/firebase";
import { useAuth } from "../context/AuthContext";
import { useNavigation } from "@react-navigation/native";
import { ReportType } from "../types";

const REPORT_TYPES: { label: string; value: ReportType; emoji: string }[] = [
  { label: "Robo", value: "robo", emoji: "🚨" },
  { label: "Vehículo Sospechoso", value: "vehiculo_sospechoso", emoji: "🚗" },
  { label: "Emergencia Médica", value: "emergencia_medica", emoji: "🏥" },
  { label: "Microtráfico", value: "microtrafico", emoji: "⚠️" },
  { label: "Otro", value: "otro", emoji: "📢" },
];

export default function ReportScreen() {
  const { userId, userData } = useAuth();
  const navigation = useNavigation<any>();
  const [selectedType, setSelectedType] = useState<ReportType | null>(null);
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    getLocation();
  }, []);

  const getLocation = async () => {
    setLocationLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permiso denegado", "Necesitamos acceso a tu ubicación para publicar la alerta");
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      // Obtener dirección desde coordenadas
      const geocode = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (geocode.length > 0) {
        const place = geocode[0];
        const fullAddress = `${place.street || ""} ${place.streetNumber || ""}, ${place.city || place.district || ""}`.trim();
        setAddress(fullAddress);
      }

      setCoords({ lat: latitude, lng: longitude });
    } catch (error) {
      Alert.alert("Error", "No pudimos obtener tu ubicación");
    } finally {
      setLocationLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedType) {
      Alert.alert("Error", "Selecciona el tipo de alerta");
      return;
    }
    if (!description) {
      Alert.alert("Error", "Escribe una descripción");
      return;
    }
    if (!address) {
      Alert.alert("Error", "Ingresa la dirección del incidente");
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, "reports"), {
        type: selectedType,
        description: description,
        status: "pending",
        authorId: userId,
        authorNickname: userData?.nickname || "Anónimo",
        location: {
          lat: coords?.lat || 0,
          lng: coords?.lng || 0,
          address: address
        },
        confirmations: 0,
        doubts: 0,
        createdAt: new Date()
      });

      Alert.alert("✅ Alerta publicada", "Tu reporte fue enviado a la comunidad");
      navigation.goBack();
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>← Volver</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Nueva Alerta</Text>
      </View>

      {/* Apodo anónimo */}
      <View style={styles.anonBadge}>
        <Text style={styles.anonText}>🎭 Publicando como </Text>
        <Text style={styles.anonNick}>{userData?.nickname || "Anónimo"}</Text>
      </View>

      <Text style={styles.label}>Tipo de incidente</Text>
      <View style={styles.typesGrid}>
        {REPORT_TYPES.map((type) => (
          <TouchableOpacity
            key={type.value}
            style={[
              styles.typeBtn,
              selectedType === type.value && styles.typeBtnSelected
            ]}
            onPress={() => setSelectedType(type.value)}
          >
            <Text style={styles.typeEmoji}>{type.emoji}</Text>
            <Text style={styles.typeLabel}>{type.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Descripción</Text>
      <TextInput
        style={styles.textArea}
        placeholder="Describe lo que está ocurriendo..."
        placeholderTextColor="#666"
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={4}
      />

      <Text style={styles.label}>Ubicación detectada</Text>
      {locationLoading ? (
        <View style={styles.locationBox}>
          <ActivityIndicator size="small" color="#E63946" />
          <Text style={styles.locationText}>Obteniendo ubicación...</Text>
        </View>
      ) : (
        <View style={styles.locationBox}>
          <Text style={styles.locationIcon}>📍</Text>
          <TextInput
            style={styles.locationInput}
            value={address}
            onChangeText={setAddress}
            placeholderTextColor="#666"
            placeholder="Dirección del incidente"
          />
          <TouchableOpacity onPress={getLocation}>
            <Text style={styles.refreshBtn}>🔄</Text>
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity
        style={styles.button}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>🚨 Publicar Alerta</Text>
        )}
      </TouchableOpacity>

    </ScrollView>
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
  anonBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#16213e",
    margin: 16,
    borderRadius: 8,
    padding: 10,
    borderWidth: 0.5,
    borderColor: "#333"
  },
  anonText: { color: "#aaa", fontSize: 13 },
  anonNick: { color: "#E63946", fontSize: 13, fontWeight: "bold" },
  label: { color: "#aaa", fontSize: 14, marginLeft: 16, marginTop: 16, marginBottom: 8 },
  typesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 12,
    gap: 8
  },
  typeBtn: {
    backgroundColor: "#16213e",
    borderRadius: 10,
    padding: 12,
    alignItems: "center",
    width: "30%",
    borderWidth: 2,
    borderColor: "transparent"
  },
  typeBtnSelected: { borderColor: "#E63946" },
  typeEmoji: { fontSize: 24 },
  typeLabel: { color: "#fff", fontSize: 11, marginTop: 4, textAlign: "center" },
  textArea: {
    backgroundColor: "#16213e",
    borderRadius: 10,
    padding: 14,
    marginHorizontal: 16,
    color: "#fff",
    fontSize: 16,
    textAlignVertical: "top",
    minHeight: 100
  },
  locationBox: {
    backgroundColor: "#16213e",
    borderRadius: 10,
    padding: 12,
    marginHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  locationIcon: { fontSize: 16 },
  locationInput: { flex: 1, color: "#fff", fontSize: 13 },
  locationText: { color: "#aaa", fontSize: 13, marginLeft: 8 },
  refreshBtn: { fontSize: 18 },
  button: {
    backgroundColor: "#E63946",
    borderRadius: 10,
    padding: 16,
    alignItems: "center",
    margin: 16,
    marginTop: 24,
    marginBottom: 40
  },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 }
});