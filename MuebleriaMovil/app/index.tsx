import { Redirect } from "expo-router";
import { useAuth } from "../store/authStore";

export default function Index() {
  const { user } = useAuth();
  if (!user) return <Redirect href="/login" />;
  if (user.rol === "Admin" || user.rol === "Administrador") return <Redirect href="/(admin)/" />;
  return <Redirect href="/(portal)/" />;
}
