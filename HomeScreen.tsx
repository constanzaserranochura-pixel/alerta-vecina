
// ARCHIVO: HomeScreen.tsx
// SPRINT 2 - Pantalla principal con filtros y alertas recientes

// Esta pantalla es lo primero que ve el usuario al entrar a la app.
// Tiene 3 responsabilidades principales:
// 1. Mostrar todas las alertas de las últimas 24 horas en tiempo real
// 2. Permitir filtrar las alertas por tipo de incidente
// 3. Mostrar el estado de cada alerta (pendiente, confirmado, falso)
//    que es actualizado por el motor de votación del Sprint 2


import React, { useEffect, useState } from "react";
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, RefreshControl, ScrollView
} from "react-native";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "../services/firebase";
import { Report, ReportType } from "../types";
import { useNavigation } from "@react-navigation/native";


// FILTROS DISPONIBLES
// Cada filtro tiene un label visible, un valor interno
// y un emoji. "todos" es el filtro por defecto que muestra todo.

const FILTERS: { label: string; value: ReportType | "todos"; emoji: string }[] = [
  { label: "Todos", value: "todos", emoji: "📋" },
  { label: "Robo", value: "robo", emoji: "🚨" },
  { label: "Vehículo", value: "vehiculo_sospechoso", emoji: "🚗" },
  { label: "Emergencia", value: "emergencia_medica", emoji: "🏥" },
  { label: "Microtráfico", value: "microtrafico", emoji: "⚠️" },
  { label: "Otro", value: "otro", emoji: "📢" },
];

export default function HomeScreen() {

  // ESTADOS DE LA PANTALLA
 
  const [reports, setReports] = useState<Report[]>([]); // Todas las alertas desde Firestore
  const [refreshing, setRefreshing] = useState(false);  // Control del pull-to-refresh
  const [activeFilter, setActiveFilter] = useState<ReportType | "todos">("todos"); // Filtro activo
  const navigation = useNavigation<any>();

 
  // useEffect: Escucha en tiempo real la colección "reports"
  // Esto significa que cada vez que alguien publica una alerta
  // o cuando los votos cambian el estado de una alerta,
  // esta pantalla se actualiza automáticamente sin recargar.
  // onSnapshot() mantiene una conexión abierta con Firestore
  // y ejecuta el callback cada vez que hay cambios.

  useEffect(() => {
    const q = query(
      collection(db, "reports"),
      orderBy("createdAt", "desc") // Las alertas más recientes aparecen primero
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      // Convertimos los documentos de Firestore en objetos JavaScript
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      })) as Report[];
      setReports(data); // Actualizamos el estado con los nuevos datos
    });

    // Cuando el usuario sale de esta pantalla, cerramos la conexión
    // para no desperdiciar recursos del celular
    return unsubscribe;
  }, []);

 
  // SPRINT 2 - FILTRO DE 24 HORAS
  // Para evitar la saturación de alertas (objetivo principal del Sprint 2),
  // solo mostramos alertas publicadas en las últimas 24 horas.
  // Las alertas más antiguas siguen en la base de datos (no se borran)
  // pero no se muestran al usuario.
  //
  // Nota técnica: Firestore guarda las fechas como un objeto especial
  // llamado "Timestamp", por eso necesitamos convertirlo a Date
  // antes de compararlo. Si ya es un Date lo usamos directo.

  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const recentReports = reports.filter((r) => {
    const createdAt = r.createdAt instanceof Date
      ? r.createdAt
      : new Date((r.createdAt as any).seconds * 1000); // Convertir Timestamp de Firestore a Date
    return createdAt > oneDayAgo; // Solo mostramos alertas de las últimas 24 horas
  });


  // SPRINT 2 - FILTRO POR TIPO DE INCIDENTE
  // Si el usuario seleccionó un filtro específico (robo, vehículo, etc.)
  // mostramos solo las alertas de ese tipo.
  // Si el filtro es "todos", mostramos todas las alertas recientes.
  // Este filtro NO consulta Firestore de nuevo, solo filtra
  // los datos que ya tenemos en memoria (más eficiente).

  const filteredReports = activeFilter === "todos"
    ? recentReports
    : recentReports.filter((r) => r.type === activeFilter);


  // FUNCIONES DE APOYO VISUAL
  // Traducen los valores de la base de datos a emojis, colores y textos
 
  // Convierte el tipo de incidente a un emoji
  const getTypeEmoji = (type: string) => {
    switch (type) {
      case "robo": return "🚨";
      case "vehiculo_sospechoso": return "🚗";
      case "emergencia_medica": return "🏥";
      case "microtrafico": return "⚠️";
      default: return "📢";
    }
  };

  // SPRINT 2 - Convierte el estado del reporte a un color
  // Este color cambia automáticamente según los votos recibidos
  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed": return "#2ecc71"; // Verde: confirmado por la comunidad
      case "fake": return "#e74c3c";      // Rojo: marcado como falso
      default: return "#f39c12";          // Amarillo: pendiente de validación
    }
  };

  // SPRINT 2 - Convierte el estado del reporte a un texto corto
  const getStatusLabel = (status: string) => {
    switch (status) {
      case "confirmed": return "Confirmado";
      case "fake": return "Falso";
      default: return "Pendiente";
    }
  };

  // ------------------------------------------------------------
  // INTERFAZ VISUAL
  // ------------------------------------------------------------
  return (
    <View style={styles.container}>

      {/* Barra superior con título y botones de navegación */}
      <View style={styles.header}>
        <Text style={styles.title}>🚨 Alerta Vecina</Text>
        <View style={styles.headerButtons}>
          {/* Botón para ir al mapa de incidentes */}
          <TouchableOpacity onPress={() => navigation.navigate("Map")}>
            <Text style={styles.headerBtn}>🗺️</Text>
          </TouchableOpacity>
          {/* Botón para ir al perfil del usuario */}
          <TouchableOpacity onPress={() => navigation.navigate("Profile")}>
            <Text style={styles.headerBtn}>👤</Text>
          </TouchableOpacity>
        </View>
      </View>

  

      {/* Contador de resultados — muestra cuántas alertas hay con el filtro actual */}
      <Text style={styles.resultCount}>
        {filteredReports.length} {filteredReports.length === 1 ? "alerta" : "alertas"}
        {activeFilter !== "todos"
          ? ` en "${FILTERS.find(f => f.value === activeFilter)?.label}"`
          : " en las últimas 24 horas"}
      </Text>

      {/* Lista de alertas
          Cada tarjeta muestra un resumen de la alerta y su estado actual.
          Al tocar una tarjeta, el usuario va a AlertDetailScreen
          donde puede ver el detalle completo y votar. */}
      <FlatList
        data={filteredReports}
        keyExtractor={(item) => item.id || ""}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => setRefreshing(false)} />
        }
        ListEmptyComponent={
          <Text style={styles.empty}>
            {activeFilter === "todos"
              ? "No hay alertas en las últimas 24 horas"
              : "No hay alertas de este tipo en las últimas 24 horas"}
          </Text>
        }
        renderItem={({ item }) => (
          // Al tocar la tarjeta, navegamos a AlertDetailScreen
          // y le pasamos el objeto completo del reporte como parámetro
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate("AlertDetail", { report: item })}
            activeOpacity={0.7}
          >
            {/* Cabecera de la tarjeta: emoji + tipo + autor + estado */}
            <View style={styles.cardHeader}>
              <Text style={styles.cardEmoji}>{getTypeEmoji(item.type)}</Text>
              <View style={styles.cardInfo}>
                <Text style={styles.cardType}>
                  {item.type.replace("_", " ").toUpperCase()}
                </Text>
                {/* SPRINT 2 - Apodo anónimo: nunca se muestra el nombre real */}
                <Text style={styles.cardAuthor}>por {item.authorNickname}</Text>
              </View>
              {/* SPRINT 2 - Badge de estado: cambia de color según los votos
                  Amarillo=Pendiente, Verde=Confirmado, Rojo=Falso */}
              <View style={styles.statusBadge}>
                <View style={[styles.statusDot, { backgroundColor: getStatusColor(item.status) }]} />
                <Text style={[styles.statusLabel, { color: getStatusColor(item.status) }]}>
                  {getStatusLabel(item.status)}
                </Text>
              </View>
            </View>

            {/* Descripción corta del incidente */}
            <Text style={styles.cardDesc}>{item.description}</Text>

            {/* Dirección donde ocurrió el incidente */}
            <Text style={styles.cardAddress}>📍 {item.location.address}</Text>

            {/* SPRINT 2 - Contadores de votos comunitarios
                Muestran cuántos vecinos han confirmado o marcado como dudosa la alerta */}
            <View style={styles.cardFooter}>
              <Text style={styles.votes}>✅ {item.confirmations} confirmados</Text>
              <Text style={styles.votes}>❓ {item.doubts} dudosos</Text>
              {/* Indicador visual si el reporte tiene foto adjunta */}
              {item.mediaUrl ? <Text style={styles.votes}>📷 Con foto</Text> : null}
            </View>

            {/* Indicación de que se puede tocar para ver más detalles */}
            <Text style={styles.tapHint}>Toca para ver detalles →</Text>

          </TouchableOpacity>
        )}
      />

      {/* Botón flotante para crear una nueva alerta */}
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
  filtersContainer: {
    backgroundColor: "#16213e",
    paddingBottom: 12
  },
  filtersContent: {
    paddingHorizontal: 12,
    gap: 8
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#1a1a2e",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "#333"
  },
  filterChipActive: {
    backgroundColor: "#E63946",
    borderColor: "#E63946"
  },
  filterEmoji: { fontSize: 14 },
  filterLabel: { color: "#aaa", fontSize: 13, fontWeight: "500" },
  filterLabelActive: { color: "#fff" },
  resultCount: {
    color: "#666",
    fontSize: 12,
    marginLeft: 16,
    marginTop: 10,
    marginBottom: 4
  },
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
  statusBadge: { flexDirection: "row", alignItems: "center", gap: 4 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusLabel: { fontSize: 10, fontWeight: "bold" },
  cardDesc: { color: "#ddd", fontSize: 14, marginBottom: 6 },
  cardAddress: { color: "#aaa", fontSize: 12, marginBottom: 8 },
  cardFooter: { flexDirection: "row", gap: 16, marginBottom: 8 },
  votes: { color: "#aaa", fontSize: 12 },
  tapHint: { color: "#555", fontSize: 11, textAlign: "right" },
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