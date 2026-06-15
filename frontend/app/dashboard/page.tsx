"use client";

import { useEffect, useState } from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

type Snapshot = {
    id: number;
    channelTitle: string;
    subscribers: number;
    totalViews: number;
    videoCount: number;
    likes: number;
    comments: number;
    snapshotDate: string;
};

export default function Dashboard() {
    const [data, setData] = useState<Snapshot[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("http://localhost:3000/snapshots")
            .then((res) => res.json())
            .then((res) => {
                setData(res);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    // ✅ ENGAGEMENT CORREGIDO (SEGURO)
    const getEngagement = (s: Snapshot) => {
        if (!s.totalViews || s.totalViews <= 0) {
            return null;
        }

        const engagement =
            ((s.likes + s.comments) / s.totalViews) * 100;

        if (!isFinite(engagement)) {
            return null;
        }

        return engagement;
    };
    if (loading) {
        return (
            <div className="p-10 text-slate-500">
                Cargando dashboard...
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">

            {/* TITULO */}
            <h1 className="text-3xl font-bold text-slate-700 mb-6">
                YOUTUBE
            </h1>

            {/* TABLA */}
            <div className="bg-white rounded-2xl shadow-md overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-slate-100 text-slate-600">
                        <tr>
                            <th>Canal</th>
                            <th>Suscriptores</th>
                            <th>Vistas</th>
                            <th>Videos</th>
                            <th>Likes</th>
                            <th>Comentarios</th>
                            <th>Engagement</th>
                        </tr>
                    </thead>

                    <tbody>
                        {data.map((s) => {
                            const engagement = getEngagement(s);

                            return (
                                <tr
                                    key={s.id}
                                    className="border-t hover:bg-blue-50 transition"
                                >
                                    <td className="p-3 font-medium text-slate-700">
                                        {s.channelTitle}
                                    </td>

                                    <td className="p-3 text-blue-600 font-semibold">
                                        {s?.subscribers?.toLocaleString?.() ?? "0"}
                                    </td>

                                    <td className="p-3 text-emerald-600">
                                        {s?.totalViews?.toLocaleString?.() ?? "0"}
                                    </td>

                                    <td className="p-3">
                                        {s?.videoCount ?? 0}
                                    </td>

                                    <td className="p-3">
                                        {s.likes.toLocaleString()}
                                    </td>

                                    <td className="p-3">
                                        {s.comments.toLocaleString()}
                                    </td>

                                    <td className="p-3">
                                        {engagement === null ? (
                                            <span className="text-slate-400">
                                                Sin datos
                                            </span>
                                        ) : (
                                            <span className="text-pink-500 font-medium">
                                                {engagement.toFixed(1)}%
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* GRAFICO */}
            <div className="mt-10 bg-white p-6 rounded-2xl shadow-md">
                <h2 className="text-xl font-semibold text-slate-700 mb-4">
                    SUSCRIPTORES POR CANAL
                </h2>

                <div style={{ width: "100%", height: 300 }}>
                    <ResponsiveContainer>
                        <BarChart data={data}>
                            <XAxis dataKey="channelTitle" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="subscribers" fill="#60a5fa" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}