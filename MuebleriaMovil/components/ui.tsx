import React from "react";
import {
  TouchableOpacity, Text, ActivityIndicator, TextInput,
  View, StyleSheet, Modal, ScrollView, Pressable,
} from "react-native";

export const C = {
  bg: "#f7f3ec", bg2: "#faf7f2", bg3: "#ffffff",
  dark: "#1a1714", olive: "#4a5240", gold: "#8c7245",
  sand: "#e0d5c2", sandDark: "#c8baa2",
  txt: "#1a1714", txtMid: "#4a4540", txtMuted: "#8a8278",
  danger: "#b83232", success: "#2e6b4f",
};

// ── Button ────────────────────────────────────────────────────
type BtnVariant = "primary" | "ghost" | "danger" | "gold";
export function Button({
  onPress, children, variant = "primary", loading = false, disabled = false, style,
}: {
  onPress: () => void; children: React.ReactNode;
  variant?: BtnVariant; loading?: boolean; disabled?: boolean; style?: any;
}) {
  const bg: Record<BtnVariant, string> = {
    primary: C.olive, ghost: "transparent", danger: C.danger, gold: C.gold,
  };
  const color: Record<BtnVariant, string> = {
    primary: "#fff", ghost: C.txtMid, danger: "#fff", gold: "#fff",
  };
  const border: Record<BtnVariant, string> = {
    primary: C.olive, ghost: C.sand, danger: C.danger, gold: C.gold,
  };
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[{
        backgroundColor: bg[variant],
        borderColor: border[variant],
        borderWidth: 1,
        borderRadius: 8,
        paddingVertical: 10,
        paddingHorizontal: 16,
        alignItems: "center",
        justifyContent: "center",
        opacity: disabled || loading ? 0.6 : 1,
      }, style]}
    >
      {loading
        ? <ActivityIndicator color={color[variant]} size="small" />
        : <Text style={{ color: color[variant], fontSize: 14, fontWeight: "500" }}>{children}</Text>
      }
    </TouchableOpacity>
  );
}

// ── Input ─────────────────────────────────────────────────────
export function Input({
  label, value, onChangeText, placeholder, secureTextEntry = false,
  keyboardType = "default", error, multiline = false,
}: {
  label?: string; value: string; onChangeText: (v: string) => void;
  placeholder?: string; secureTextEntry?: boolean;
  keyboardType?: any; error?: string; multiline?: boolean;
}) {
  return (
    <View style={{ marginBottom: 12 }}>
      {label && <Text style={{ fontSize: 12, color: C.txtMuted, marginBottom: 4 }}>{label}</Text>}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={C.txtMuted}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        multiline={multiline}
        style={{
          backgroundColor: C.bg3,
          borderColor: error ? C.danger : C.sand,
          borderWidth: 1,
          borderRadius: 8,
          paddingHorizontal: 12,
          paddingVertical: 10,
          fontSize: 14,
          color: C.txt,
          minHeight: multiline ? 80 : undefined,
        }}
      />
      {error && <Text style={{ fontSize: 11, color: C.danger, marginTop: 3 }}>{error}</Text>}
    </View>
  );
}

// ── Select (Modal-based picker) ───────────────────────────────
export function Select({
  label, value, onChange, options, placeholder,
}: {
  label?: string; value: string;
  onChange: (v: string) => void;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const selected = options.find(o => o.value === value);
  return (
    <View style={{ marginBottom: 12 }}>
      {label && <Text style={{ fontSize: 12, color: C.txtMuted, marginBottom: 4 }}>{label}</Text>}
      <TouchableOpacity
        onPress={() => setOpen(true)}
        style={{
          backgroundColor: C.bg3, borderColor: C.sand, borderWidth: 1,
          borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10,
          flexDirection: "row", justifyContent: "space-between", alignItems: "center",
        }}
      >
        <Text style={{ fontSize: 14, color: selected ? C.txt : C.txtMuted }}>
          {selected ? selected.label : (placeholder ?? "Seleccionar")}
        </Text>
        <Text style={{ color: C.txtMuted }}>▾</Text>
      </TouchableOpacity>
      <Modal visible={open} transparent animationType="fade">
        <Pressable style={S.overlay} onPress={() => setOpen(false)}>
          <View style={S.picker}>
            <Text style={S.pickerTitle}>{label ?? "Seleccionar"}</Text>
            <ScrollView>
              {options.map(o => (
                <TouchableOpacity
                  key={o.value}
                  onPress={() => { onChange(o.value); setOpen(false); }}
                  style={[S.pickerItem, o.value === value && { backgroundColor: "#f0ede6" }]}
                >
                  <Text style={{ fontSize: 14, color: C.txt }}>{o.label}</Text>
                  {o.value === value && <Text style={{ color: C.olive }}>✓</Text>}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

// ── AppModal ──────────────────────────────────────────────────
export function AppModal({
  visible, onClose, title, children,
}: {
  visible: boolean; onClose: () => void; title?: string; children: React.ReactNode;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <Pressable style={S.overlay} onPress={onClose}>
        <Pressable style={S.modalCard} onPress={() => {}}>
          {title && (
            <View style={S.modalHeader}>
              <Text style={S.modalTitle}>{title}</Text>
              <TouchableOpacity onPress={onClose}>
                <Text style={{ fontSize: 20, color: C.txtMuted, lineHeight: 22 }}>✕</Text>
              </TouchableOpacity>
            </View>
          )}
          <ScrollView style={{ maxHeight: 500 }} keyboardShouldPersistTaps="handled">
            <View style={{ padding: 16 }}>{children}</View>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ── Badge ─────────────────────────────────────────────────────
export function StatusBadge({ status }: { status: string }) {
  const cfg: Record<string, { bg: string; color: string; label: string }> = {
    A: { bg: "rgba(46,107,79,.12)", color: C.success, label: "Activo" },
    I: { bg: "rgba(184,50,50,.12)", color: C.danger,  label: "Inactivo" },
    P: { bg: "rgba(140,114,69,.12)", color: C.gold,   label: "Pendiente" },
    D: { bg: "rgba(30,79,160,.12)", color: "#1e4fa0",  label: "Despachado" },
    F: { bg: "rgba(46,107,79,.12)", color: C.success,  label: "Finalizado" },
    C: { bg: "rgba(184,50,50,.12)", color: C.danger,   label: "Cancelado" },
    E: { bg: "rgba(30,79,160,.12)", color: "#1e4fa0",  label: "En proceso" },
    R: { bg: "rgba(184,50,50,.12)", color: C.danger,   label: "Rechazado" },
  };
  const s = cfg[status] ?? { bg: "#eee", color: C.txtMuted, label: status };
  return (
    <View style={{ backgroundColor: s.bg, borderRadius: 99, paddingHorizontal: 8, paddingVertical: 2, alignSelf: "flex-start" }}>
      <Text style={{ fontSize: 11, color: s.color, fontWeight: "500" }}>{s.label}</Text>
    </View>
  );
}

// ── ConfirmDialog ─────────────────────────────────────────────
export function ConfirmDialog({
  visible, onClose, onConfirm, title = "Confirmar", message,
}: {
  visible: boolean; onClose: () => void; onConfirm: () => void;
  title?: string; message?: string;
}) {
  return (
    <AppModal visible={visible} onClose={onClose} title={title}>
      <Text style={{ color: C.txtMid, marginBottom: 16, lineHeight: 22 }}>
        {message ?? "¿Está seguro de esta acción?"}
      </Text>
      <View style={{ flexDirection: "row", gap: 10, justifyContent: "flex-end" }}>
        <Button variant="ghost" onPress={onClose}>Cancelar</Button>
        <Button variant="danger" onPress={onConfirm}>Eliminar</Button>
      </View>
    </AppModal>
  );
}

const S = StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: "rgba(26,23,20,0.55)",
    justifyContent: "center", alignItems: "center", padding: 16,
  },
  picker: {
    backgroundColor: C.bg3, borderRadius: 14, width: "100%",
    maxHeight: 400, overflow: "hidden",
  },
  pickerTitle: {
    fontSize: 14, fontWeight: "600", color: C.txt,
    padding: 14, borderBottomWidth: 1, borderBottomColor: C.sand,
  },
  pickerItem: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: "#f0ede6",
  },
  modalCard: {
    backgroundColor: C.bg3, borderRadius: 14, width: "100%",
    maxWidth: 500, overflow: "hidden",
  },
  modalHeader: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    padding: 14, borderBottomWidth: 1, borderBottomColor: C.sand,
  },
  modalTitle: { fontSize: 15, fontWeight: "600", color: C.txt },
});
