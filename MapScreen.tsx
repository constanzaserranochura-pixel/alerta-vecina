
// ARCHIVO: MapScreen.tsx
// SPRINT 2 - Mapa de incidentes de las últimas 24 horas

// Esta pantalla muestra un mapa interactivo con todas las alertas
// activas de las últimas 24 horas representadas como marcadores.
// Tiene 3 responsabilidades principales:
// 1. Obtener la ubicación actual del usuario para centrar el mapa
// 2. Escuchar en tiempo real las alertas de Firestore
// 3. Filtrar las alertas para mostrar solo las últimas 24 horas
//    (mismo criterio que HomeScreen para evitar saturación)


import React, { useEffect, useState } from "react";
import {
  View, StyleSheet, ActivityIndicator,
  Text, TouchableOpacity
} from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import * as Location from "expo-location";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "../services/firebase";
import { Report } from "../types";
import { useNavigation } from "@react-navigation/native";

export default function MapScreen() {
  const navigation = useNavigation<any>();

 
  // ESTADOS DE LA PANTALLA
 
  const [reports, setReports] = useState<Report[]>([]); // Alertas filtradas por 24 horas
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null); // Ubicación del usuario
  const [loading, setLoading] = useState(true); // True mientras carga el GPS

 
  // useEffect: Se ejecuta UNA SOLA VEZ cuando se abre la pantalla
  // Inicia dos procesos en paralelo:
  // 1. Obtener la ubicación del usuario (para centrar el mapa)
  // 2. Cargar las alertas de Firestore (para mostrar los marcadores)
 
  useEffect(() => {
    getLocation();
    loadReports();
  }, []);

  // FUNCIÓN: getLocation
  // Obtiene las coordenadas GPS actuales del usuario.
  // Estas coordenadas se usan SOLO para centrar el mapa en su posición.
  // NO se usan para los marcadores de alertas (esos vienen de Firestore).
  
  const getLocation = async () => {
    try {
      // Pedir permiso al sistema operativo para usar el GPS
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return; // Si el usuario niega el permiso, usamos la ubicación por defecto

      // Obtener las coordenadas actuales del GPS del celular
      const loc = await Location.getCurrentPositionAsync({});
      setLocation({
        lat: loc.coords.latitude,
        lng: loc.coords.longitude
      });
    } catch (error) {
      console.log("Error obteniendo ubicación", error);
      // Si falla el GPS, el mapa igual carga con la ubicación por defecto
    } finally {
      setLoading(false); // Ocultar el indicador de carga pase lo que pase
    }
  };

 
  // FUNCIÓN: loadReports
  // Escucha en tiempo real la colección "reports" de Firestore.
  // Igual que HomeScreen, usa onSnapshot() para recibir
  // actualizaciones automáticas sin necesidad de recargar la pantalla.
  //
  // SPRINT 2 - Filtro de 24 horas:
  // Después de recibir los datos, filtramos para mostrar solo
  // las alertas de las últimas 24 horas en el mapa.
  // Esto evita que el mapa se llene de marcadores de incidentes viejos
  // que ya no son relevantes para la seguridad actual del sector.
 
  const loadReports = () => {
    const q = query(
      collection(db, "reports"),
      orderBy("createdAt", "desc")
    );

    onSnapshot(q, (snapshot) => {
      // Calculamos el límite de tiempo: hace exactamente 24 horas
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

      // Convertimos los documentos de Firestore en objetos JavaScript
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      })) as Report[];

      // SPRINT 2 - Filtramos para mostrar solo las alertas de las últimas 24 horas
      // Nota: Firestore guarda las fechas como Timestamp, por eso necesitamos
      // convertirlo a Date antes de comparar con oneDayAgo
      const recentData = data.filter((r) => {
        const createdAt = r.createdAt instanceof Date
          ? r.createdAt
          : new Date((r.createdAt as any).seconds * 1000); // Convertir Timestamp a Date
        return createdAt > oneDayAgo; // Solo alertas de las últimas 24 horas
      });

      setReports(recentData); // Actualizar el mapa con las alertas filtradas
    });
  };

  // ------------------------------------------------------------
  // FUNCIONES DE APOYO VISUAL
  // Traducen el tipo de incidente a colores y emojis para los marcadores
  // ------------------------------------------------------------

  // SPRINT 2 - Cada tipo de incidente tiene un color distinto en el mapa
  // Esto permite identificar visualmente patrones de inseguridad por tipo
  const getMarkerColor = (type: string) => {
    switch (type) {
      case "robo": return "#E63946";            // Rojo
      case "vehiculo_sospechoso": return "#f39c12"; // Naranja
      case "emergencia_medica": return "#2ecc71";   // Verde
      case "microtrafico": return "#9b59b6";        // Morado
      default: return "#3498db";                    // Azul
    }
  };

  // Emoji representativo para el popup que aparece al tocar un marcador
  const getTypeEmoji = (type: string) => {
    switch (type) {
      case "robo": return "🚨";
      case "vehiculo_sospechoso": return "🚗";
      case "emergencia_medica": return "🏥";
      case "microtrafico": return "⚠️";
      default: return "📢";
    }
  };


  // PANTALLA DE CARGA
  // Se muestra mientras el GPS está obteniendo la ubicación

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#E63946" />
        <Text style={styles.loadingText}>Cargando mapa...</Text>
      </View>
    );
  }

  // ------------------------------------------------------------
  // INTERFAZ VISUAL
  // ------------------------------------------------------------
  return (
    <View style={styles.container}>

      {/* Barra superior con botón de volver */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>← Volver</Text>
        </TouchableOpacity>
        <Text style={styles.title}>🗺️ Mapa de Incidentes</Text>
      </View>

      {/* Mapa principal
          PROVIDER_GOOGLE: usamos Google Maps como proveedor del mapa
          showsUserLocation: muestra un punto azul en la posición del usuario
          initialRegion: centra el mapa en la ubicación del usuario
          Si el GPS falló, usamos coordenadas de Arica como respaldo */}
      <MapView
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={{
          latitude: location?.lat || -18.4783,   // Latitud del usuario (o Arica por defecto)
          longitude: location?.lng || -70.3126,  // Longitud del usuario (o Arica por defecto)
          latitudeDelta: 0.02,   // Nivel de zoom vertical (menor = más zoom)
          longitudeDelta: 0.02   // Nivel de zoom horizontal
        }}
        showsUserLocation={true}      // Punto azul = "tú estás aquí"
        showsMyLocationButton={true}  // Botón para centrar el mapa en el usuario
      >

        {/* SPRINT 2 - Marcadores de alertas
            Por cada alerta en las últimas 24 horas, dibujamos un pin en el mapa.
            Las coordenadas vienen de Firestore (no del GPS actual),
            porque fueron guardadas cuando el vecino creó la alerta.
            Solo mostramos alertas con coordenadas válidas (lat !== 0) */}
        {reports.map((report) => (
          report.location.lat !== 0 && (
            <Marker
              key={report.id}
              coordinate={{
                latitude: report.location.lat,   // Coordenada guardada en Firestore
                longitude: report.location.lng   // Coordenada guardada en Firestore
              }}
              // Al tocar el marcador, aparece un popup con esta información
              title={`${getTypeEmoji(report.type)} ${report.type.replace("_", " ").toUpperCase()}`}
              description={report.description}
              pinColor={getMarkerColor(report.type)} // Color según tipo de incidente
            />
          )
        ))}

      </MapView>

      {/* SPRINT 2 - Leyenda del mapa
          Explica qué significa cada color de marcador
          y aclara que solo se muestran las últimas 24 horas */}
      <View style={styles.legend}>
        <Text style={styles.legendTitle}>⏱ Solo alertas de las últimas 24 horas</Text>
        <View style={styles.legendRow}>
          <View style={[styles.legendDot, { backgroundColor: "#E63946" }]} />
          <Text style={styles.legendText}>Robo</Text>
          <View style={[styles.legendDot, { backgroundColor: "#f39c12" }]} />
          <Text style={styles.legendText}>Vehículo</Text>
          <View style={[styles.legendDot, { backgroundColor: "#2ecc71" }]} />
          <Text style={styles.legendText}>Emergencia</Text>
          <View style={[styles.legendDot, { backgroundColor: "#9b59b6" }]} />
          <Text style={styles.legendText}>Microtráfico</Text>
        </View>
      </View>

      {/* Botón flotante para crear una nueva alerta directamente desde el mapa */}
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
  loading: {
    flex: 1,
    backgroundColor: "#1a1a2e",
    justifyContent: "center",
    alignItems: "center"
  },
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
  legendRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap"
  },
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