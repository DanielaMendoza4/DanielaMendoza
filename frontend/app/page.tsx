import Link from "next/link";

export default function Home() {
  return (
    <div style={{ padding: 20 }}>
      <h1>Sistema de Snapshots</h1>

      <Link href="/dashboard">
        Ir al Dashboard
      </Link>
    </div>
  );
}