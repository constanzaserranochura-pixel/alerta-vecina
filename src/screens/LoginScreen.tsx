// src/screens/LoginScreen.tsx

import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator
} from "react-native";
import { registerUser, loginUser } from "../services/authService";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Por favor completa todos los campos");
      return;
    }

    setLoading(true);
    try {
      if (isRegistering) {
        if (!neighborhood) {
          Alert.alert("Error", "Ingresa tu barrio o sector");
          setLoading(false);
          return;
        }
        const { nickname } = await registerUser(email, password, neighborhood);
        Alert.alert("¡Bienvenido!", `Tu apodo anónimo es: ${nickname}`);
      } else {
        await loginUser(email, password);
      }
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>🚨 Alerta Vecina</Text>
      <Text style={styles.subtitle}>Seguridad comunitaria anónima</Text>

      <TextInput
        style={styles.input}
        placeholder="Correo electrónico"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      {isRegistering && (
        <TextInput
          style={styles.input}
          placeholder="Tu barrio o sector (ej: Ñuñoa)"
          value={neighborhood}
          onChangeText={setNeighborhood}
        />
      )}

      <TouchableOpacity style={styles.button} onPress={handleAuth} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>
            {isRegistering ? "Registrarme" : "Iniciar Sesión"}
          </Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => setIsRegistering(!isRegistering)}>
        <Text style={styles.switchText}>
          {isRegistering
            ? "¿Ya tienes cuenta? Inicia sesión"
            : "¿No tienes cuenta? Regístrate"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a1a2e",
    justifyContent: "center",
    padding: 24
  },
  logo: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#E63946",
    textAlign: "center",
    marginBottom: 8
  },
  subtitle: {
    fontSize: 14,
    color: "#aaa",
    textAlign: "center",
    marginBottom: 40
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
    fontSize: 16
  },
  button: {
    backgroundColor: "#E63946",
    borderRadius: 10,
    padding: 16,
    alignItems: "center",
    marginBottom: 16
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16
  },
  switchText: {
    color: "#aaa",
    textAlign: "center",
    fontSize: 14
  }
});