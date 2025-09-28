import { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, FlatList } from "react-native";
import api from "../services/api";
import { Meeting, NormalizedMeeting } from "../types/meeting";

// Normalize API response to ensure consistent field names and stable IDs
function normalizeMeetings(meetings: Meeting[]): NormalizedMeeting[] {
    return meetings.map((meeting, index) => ({
        id: meeting.Id || `idx-${index}`, // Fallback to index-based ID if Id is missing
        title: meeting.Title,
        audioUrl: meeting.AudioUrl,
        summary: meeting.Summary,
        transcript: meeting.Transcript,
        diarizedTranscript: meeting.DiarizedTranscript,
        createdUtc: meeting.CreatedUtc,
    }));
}

// Robust keyExtractor with multiple fallbacks
function keyExtractor(item: NormalizedMeeting, index: number): string {
    // Try multiple possible ID fields in order of preference
    if (item.id !== undefined && item.id !== null) {
        return String(item.id);
    }
    
    // Fallback to index-based key
    return `meeting-${index}`;
}

export default function Meetings({ navigation }: any) {
    const [items, setItems] = useState<NormalizedMeeting[]>([]);
    
    useEffect(() => {
        api.get("/api/meetings")
            .then(r => {
                console.log("📋 Raw API response:", r.data);
                
                // Check if response is valid JSON array
                if (!Array.isArray(r.data)) {
                    console.error("❌ API response is not an array:", typeof r.data, r.data);
                    setItems([]);
                    return;
                }
                
                const normalized = normalizeMeetings(r.data);
                console.log("🔧 Normalized meetings:", normalized);
                setItems(normalized);
            })
            .catch(err => {
                console.error("❌ Failed to fetch meetings:", err.response?.status, err.message);
                
                // If we get a 401, it means we're not authenticated
                if (err.response?.status === 401) {
                    console.error("🔐 Authentication required. Please login first.");
                    // Could redirect to login here if needed
                }
                
                setItems([]);
            });
    }, []);
    
    return (
        <View style={{ flex: 1 }}>
            {items.length === 0 ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
                    <Text style={{ fontSize: 18, textAlign: 'center', marginBottom: 10 }}>
                        No meetings found
                    </Text>
                    <Text style={{ fontSize: 14, textAlign: 'center', color: '#666', marginBottom: 20 }}>
                        Record a meeting to get started
                    </Text>
                    <TouchableOpacity 
                        onPress={() => navigation.navigate("Record")}
                        style={{ backgroundColor: '#007AFF', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 }}
                    >
                        <Text style={{ color: 'white', fontWeight: 'bold' }}>Record Meeting</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    data={items}
                    keyExtractor={keyExtractor}
                    renderItem={({ item }) => (
                        <TouchableOpacity onPress={() => navigation.navigate("MeetingDetail", { id: item.id })}>
                            <View style={{ padding: 16, borderBottomWidth: 1 }}>
                                <Text>{item.title ?? `Meeting #${item.id}`}</Text>
                                <Text numberOfLines={1}>{item.summary ?? "Processing…"}</Text>
                            </View>
                        </TouchableOpacity>
                    )}
                />
            )}
        </View>
    );
}
