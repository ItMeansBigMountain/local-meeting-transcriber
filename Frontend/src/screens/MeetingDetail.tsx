import { useEffect, useState } from "react";
import { View, Text, ScrollView } from "react-native";
import api from "../services/api";
import { Meeting } from "../types/meeting";

export default function MeetingDetail({ route }: any) {
    const { id } = route.params;
    const [m, setM] = useState<Meeting | null>(null);
    useEffect(() => { 
        api.get(`/api/meetings/${id}`)
            .then(r => setM(r.data))
            .catch(err => {
                console.error("❌ Failed to fetch meeting details:", err);
                setM(null);
            });
    }, [id]);
    
    if (!m) return (
        <View style={{ padding: 16 }}>
            <Text>Loading...</Text>
        </View>
    );
    
    return (
        <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
            <Text style={{ fontWeight: "700" }}>Summary</Text>
            <Text>{m.Summary ?? "Processing…"}</Text>
            <Text style={{ fontWeight: "700", marginTop: 12 }}>Transcript (speaker-labeled)</Text>
            <Text>{m.DiarizedTranscript ?? m.Transcript ?? ""}</Text>
        </ScrollView>
    );
}
