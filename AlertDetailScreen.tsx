// ============================================================
// ARCHIVO: AlertDetailScreen.tsx
// SPRINT 2 - Pantalla de detalle y votación comunitaria
// ============================================================
// Esta pantalla muestra el detalle completo de una alerta
// y permite a los vecinos votar si la consideran verídica o falsa.
// Es el punto de entrada al motor de votación del Sprint 2.
// ============================================================

import React, { useState } from "react";
import {
  View, Text, Image, StyleSheet,
  TouchableOpacity, ScrollView, Alert
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { validateReport } from "../services/reportService";
import { useAuth } from "../context/AuthContext";
import { Report } from "../types";

export default function AlertDetailScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { userId } = useAuth(); // Obtenemos el ID del usuario actual para saber si es el autor
  const report: Report = route.params.report; // Recibimos el reporte completo desde HomeScreen
  const [voting, setVoting] = useState(false); // Evita que el usuario presione dos veces el botón

  // ------------------------------------------------------------
  // FUNCIONES DE APOYO VISUAL
  // Estas funciones traducen los valores de la base de datos
  // a emojis, colores y textos que el usuario puede entender
  // ------------------------------------------------------------

  // Convierte el tipo de incidente a un emoji representativo
  const getTypeEmoji = (type: string) => {
    switch (type) {
      case "robo": return "🚨";
      case "vehiculo_sospechoso": return "🚗";
      case "emergencia_medica": return "🏥";
      case "microtrafico": return "⚠️";
      default: return "📢";
    }
  };

  // Convierte el estado del reporte a un color
  // Amarillo = pendiente, Verde = confirmado, Rojo = falso
  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed": return "#2ecc71"; // Verde
      case "fake": return "#e74c3c";      // Rojo
      default: return "#f39c12";          // Amarillo (pendiente)
    }
  };

  // Convierte el estado del reporte a un texto legible para el usuario
  const getStatusLabel = (status: string) => {
    switch (status) {
      case "confirmed": return "Confirmado por la comunidad";
      case "fake": return "Marcado como falso";
      default: return "Pendiente de verificación";
    }
  };

  // ------------------------------------------------------------
  // SPRINT 2 - FUNCIÓN PRINCIPAL: handleVote
  // Esta función se ejecuta cuando un vecino presiona
  // "Confirmar alerta" o "Marcar como dudoso"
  // ------------------------------------------------------------
  const handleVote = async (vote: "confirmed" | "doubtful") => {
    if (!userId) return; // Si no hay sesión activa, no hace nada
    setVoting(true); // Bloquea el botón para evitar votos dobles accidentales

    try {
      // Llamamos al motor de votación (reportService.ts)
      // Este se encarga de:
      // 1. Verificar que el usuario no haya votado antes
      // 2. Guardar el voto en la base de datos
      // 3. Actualizar los contadores del reporte
      // 4. Actualizar la reputación del autor
      // 5. Cambiar el estado del reporte si llega al umbral
      await validateReport(report.id!, userId, vote);

      // Si todo salió bien, mostramos un mensaje de éxito
      Alert.alert(
        vote === "confirmed" ? "✅ Confirmado" : "❓ Marcado como dudoso",
        "Gracias por validar esta alerta"
      );

      // Volvemos a la pantalla anterior
      navigation.goBack();

    } catch (error: any) {
      // Si el usuario ya votó antes, reportService lanza un error
      // que capturamos aquí y mostramos al usuario
      Alert.alert("Aviso", error.message);
    } finally {
      setVoting(false); // Desbloqueamos el botón pase lo que pase
    }
  };

  // ------------------------------------------------------------
  // INTERFAZ VISUAL
  // Todo lo que el usuario ve en pantalla
  // ------------------------------------------------------------
  return (
    <ScrollView style={styles.container}>

      {/* Barra superior con botón de volver */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>← Volver</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Detalle de Alerta</Text>
      </View>

      {/* Foto del incidente (si el usuario adjuntó una al crear la alerta) */}
      {report.mediaUrl ? (
        <Image source={{ uri: report.mediaUrl }} style={styles.photo} />
      ) : (
        <View style={styles.noPhoto}>
          <Text style={styles.noPhotoText}>Sin foto adjunta</Text>
        </View>
      )}

      <View style={styles.content}>

        {/* Fila superior: tipo de incidente + badge de estado */}
        <View style={styles.topRow}>
          <Text style={styles.typeText}>
            {getTypeEmoji(report.type)} {report.type.replace("_", " ").toUpperCase()}
          </Text>

          {/* SPRINT 2 - Badge de estado del reporte
              Cambia de color automáticamente según los votos recibidos:
              Amarillo (pendiente) → Verde (3 confirmaciones) o Rojo (3 dudosos) */}
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(report.status) + "22" }]}>
            <View style={[styles.statusDot, { backgroundColor: getStatusColor(report.status) }]} />
            <Text style={[styles.statusText, { color: getStatusColor(report.status) }]}>
              {getStatusLabel(report.status)}
            </Text>
          </View>
        </View>

        {/* Autor anónimo — se muestra el apodo, nunca el nombre real */}
        <Text style={styles.author}>🎭 Reportado por {report.authorNickname}</Text>

        {/* Descripción del incidente */}
        <Text style={styles.sectionLabel}>Descripción</Text>
        <Text style={styles.description}>{report.description}</Text>

        {/* Dirección donde ocurrió el incidente */}
        <Text style={styles.sectionLabel}>Ubicación</Text>
        <Text style={styles.address}>📍 {report.location.address}</Text>

        {/* SPRINT 2 - Contadores de votos
            Muestran en tiempo real cuántos vecinos han votado
            y cuántos votos faltan para cambiar el estado del reporte */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{report.confirmations}</Text>
            <Text style={styles.statLabel}>✅ Confirmados</Text>
            {/* Le mostramos al usuario cuántos votos faltan para confirmar */}
            <Text style={styles.statMeta}>
              {report.confirmations >= 3
                ? "¡Alerta confirmada!"
                : `faltan ${3 - report.confirmations} para confirmar`}
            </Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{report.doubts}</Text>
            <Text style={styles.statLabel}>❓ Dudosos</Text>
            {/* Le mostramos al usuario cuántos votos faltan para marcar como falso */}
            <Text style={styles.statMeta}>
              {report.doubts >= 3
                ? "¡Marcada como falsa!"
                : `faltan ${3 - report.doubts} para marcar falso`}
            </Text>
          </View>
        </View>

        {/* SPRINT 2 - Botones de votación comunitaria
            REGLA IMPORTANTE: Solo aparecen si el usuario NO es el autor.
            Un vecino no puede votar su propia alerta para evitar manipulación. */}
        {report.authorId !== userId && (
          <View style={styles.voteButtons}>
            <Text style={styles.voteTitle}>¿Esta alerta es verídica?</Text>

            {/* Botón confirmar: suma 1 a confirmations y +10 puntos al autor */}
            <TouchableOpacity
              style={[styles.voteBtn, styles.confirmBtn]}
              onPress={() => handleVote("confirmed")}
              disabled={voting}
            >
              <Text style={styles.voteBtnText}>✅ Confirmar alerta</Text>
            </TouchableOpacity>

            {/* Botón dudoso: suma 1 a doubts y -5 puntos al autor */}
            <TouchableOpacity
              style={[styles.voteBtn, styles.doubtBtn]}
              onPress={() => handleVote("doubtful")}
              disabled={voting}
            >
              <Text style={styles.voteBtnText}>❓ Marcar como dudoso</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Mensaje informativo si el usuario ES el autor del reporte */}
        {report.authorId === userId && (
          <View style={styles.authorNote}>
            <Text style={styles.authorNoteText}>
              🎭 Esta es tu alerta. Los demás vecinos pueden validarla.
            </Text>
          </View>
        )}

      </View>

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
  title: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  photo: { width: "100%", height: 250 },
  noPhoto: {
    width: "100%",
    height: 120,
    backgroundColor: "#16213e",
    justifyContent: "center",
    alignItems: "center"
  },
  noPhotoText: { color: "#666", fontSize: 14 },
  content: { padding: 20 },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12
  },
  typeText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12
  },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { fontSize: 11, fontWeight: "bold" },
  author: { color: "#E63946", fontSize: 14, marginBottom: 20 },
  sectionLabel: { color: "#666", fontSize: 12, marginBottom: 6, marginTop: 12 },
  description: { color: "#ddd", fontSize: 15, lineHeight: 22 },
  address: { color: "#ddd", fontSize: 14 },
  statsRow: { flexDirection: "row", gap: 12, marginTop: 24, marginBottom: 24 },
  statBox: {
    flex: 1,
    backgroundColor: "#16213e",
    borderRadius: 10,
    padding: 16,
    alignItems: "center"
  },
  statNumber: { color: "#fff", fontSize: 28, fontWeight: "bold" },
  statLabel: { color: "#aaa", fontSize: 12, marginTop: 4 },
  statMeta: { color: "#555", fontSize: 10, marginTop: 4, textAlign: "center" },
  voteTitle: { color: "#aaa", fontSize: 13, textAlign: "center", marginBottom: 10 },
  voteButtons: { gap: 10 },
  voteBtn: {
    padding: 16,
    borderRadius: 10,
    alignItems: "center"
  },
  confirmBtn: { backgroundColor: "#1a472a" },
  doubtBtn: { backgroundColor: "#4a1515" },
  voteBtnText: { color: "#fff", fontSize: 15, fontWeight: "bold" },
  authorNote: {
    backgroundColor: "#16213e",
    borderRadius: 10,
    padding: 14,
    borderWidth: 0.5,
    borderColor: "#333"
  },
  authorNoteText: { color: "#aaa", fontSize: 13, textAlign: "center" }
});