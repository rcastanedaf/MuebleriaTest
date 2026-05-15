import React, { useState } from "react";
import {
  View, Text, ScrollView, KeyboardAvoidingView, Platform,
  TouchableOpacity, Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../store/authStore";
import { apiClient } from "../core/api/apiClient";
import { Button, Input, C } from "../components/ui";
import type { AuthUser } from "../core/types";
import { SafeAreaView } from "react-native-safe-area-context";

type Mode = "login" | "register";

export default function LoginScreen() {
  const router = useRouter();
  const { setUser } = useAuth();
  const [mode, setMode] = useState<Mode>("login");
  const [loading, setLoading] = useState(false);

  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [name, setName]         = useState("");
  const [nit, setNit]           = useState("");
  const [phone, setPhone]       = useState("");

  const handleSubmit = async () => {
    if (!email || !password) { Alert.alert("Error", "Email y contraseña son requeridos"); return; }
    setLoading(true);
    try {
      if (mode === "login") {
        const res = await apiClient.post<AuthUser>("/auth/login", { email, password }, false);
        await setUser(res);
        if (res.rol === "Admin" || res.rol === "Administrador") {
          router.replace("/(admin)/");
        } else {
          router.replace("/(portal)/");
        }
      } else {
        await apiClient.post("/auth/register", { nombre: name, nit, email, password, telefono: phone }, false);
        Alert.alert("Éxito", "Cuenta creada. Inicia sesión.");
        setMode("login");
      }
    } catch (e: any) {
      Alert.alert("Error", e.message ?? "Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: "center", padding: 24 }}>
          <Text style={{ fontSize: 32, fontWeight: "300", color: C.dark, marginBottom: 4, textAlign: "center" }}>
            Muebles Los Alpes
          </Text>
          <Text style={{ fontSize: 14, color: C.txtMuted, textAlign: "center", marginBottom: 40 }}>
            {mode === "login" ? "Inicia sesión en tu cuenta" : "Crear cuenta nueva"}
          </Text>

          <View style={{
            backgroundColor: C.bg3, borderRadius: 14, padding: 20,
            borderWidth: 1, borderColor: C.sand,
          }}>
            {mode === "register" && (
              <>
                <Input label="Nombre completo" value={name} onChangeText={setName} placeholder="Tu nombre" />
                <Input label="NIT" value={nit} onChangeText={setNit} placeholder="12345678-9" />
              </>
            )}
            <Input label="Email" value={email} onChangeText={setEmail} placeholder="correo@ejemplo.com" keyboardType="email-address" />
            <Input label="Contraseña" value={password} onChangeText={setPassword} placeholder="••••••••" secureTextEntry />
            {mode === "register" && (
              <Input label="Teléfono (opcional)" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
            )}

            <Button onPress={handleSubmit} loading={loading} style={{ marginTop: 8 }}>
              {mode === "login" ? "Iniciar sesión" : "Crear cuenta"}
            </Button>

            <TouchableOpacity onPress={() => setMode(mode === "login" ? "register" : "login")} style={{ marginTop: 16, alignItems: "center" }}>
              <Text style={{ fontSize: 13, color: C.olive }}>
                {mode === "login" ? "¿No tienes cuenta? Regístrate" : "¿Ya tienes cuenta? Inicia sesión"}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
