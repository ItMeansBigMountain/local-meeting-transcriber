// src/screens/Record.native.tsx   (use .native.tsx for iOS+Android)
import { useState } from "react";
import { View, Button, Alert, Platform, StyleSheet, Text } from "react-native";
import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system";
import { Storage } from "../utils/storage";
import { API_BASE } from "../config/api";

export default function Record({ navigation }: any) {
    async function clearRecordings() {
        try {
            console.log("🗑️ Starting clear recordings process...");
            
            // Use cache directory instead of document directory for recordings
            const cacheDir = FileSystem.cacheDirectory;
            console.log("📁 Cache directory:", cacheDir);
            
            if (!cacheDir) {
                console.error("❌ Cache directory not available");
                Alert.alert("Error", "Cache directory not available");
                return;
            }
            
            const files = await FileSystem.readDirectoryAsync(cacheDir);
            console.log("📋 All files:", files);
            
            // Filter for meeting audio files (e.g., .m4a, .wav, .mp3)
            const meetingFiles = files.filter(f => 
                f.endsWith(".m4a") || f.endsWith(".wav") || f.endsWith(".mp3") || f.startsWith("meeting") || f.includes("recording")
            );
            
            console.log("🎵 Meeting files found:", meetingFiles);
            
            if (meetingFiles.length === 0) {
                console.log("ℹ️ No recordings found to clear");
                Alert.alert("Info", "No recordings found to clear.");
                return;
            }
            
            for (const file of meetingFiles) {
                console.log("🗑️ Deleting file:", file);
                await FileSystem.deleteAsync(cacheDir + file, { idempotent: true });
            }
            
            console.log("✅ Cleared", meetingFiles.length, "recording(s)");
            Alert.alert("Success", `Cleared ${meetingFiles.length} recording(s).`);
            
        } catch (err) {
            console.error("❌ Clear Recordings Error:", err);
            Alert.alert("Error", `Failed to clear recordings: ${err?.message || String(err)}`);
        }
    }
    const [recording, setRecording] = useState<Audio.Recording | null>(null);
    const [recordingUri, setRecordingUri] = useState<string | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [sound, setSound] = useState<Audio.Sound | null>(null);
    const [isRecording, setIsRecording] = useState(false);

    async function startRec() {
        try {
            console.log("🎙️ Starting recording process...");
            
            // Request permissions
            const { status } = await Audio.requestPermissionsAsync();
            console.log("📱 Permission status:", status);
            
            if (status !== "granted") {
                console.error("❌ Permission denied");
                Alert.alert("Permission required", "Microphone access is needed to record audio.");
                return;
            }

            // Set audio mode for iOS
            if (Platform.OS === 'ios') {
                await Audio.setAudioModeAsync({
                    allowsRecordingIOS: true,
                    playsInSilentModeIOS: true,
                });
                console.log("🍎 iOS audio mode set");
            }

            // Create and start recording
            const recording = new Audio.Recording();
            console.log("🎵 Created recording instance");
            
            await recording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
            console.log("🎯 Recording prepared");
            
            await recording.startAsync();
            console.log("▶️ Recording started successfully");
            
            setRecording(recording);
            setIsRecording(true);
            setRecordingUri(null);
            
        } catch (err) {
            console.error("❌ Recording Error:", err);
            Alert.alert("Recording Error", `Failed to start recording: ${err?.message || String(err)}`);
        }
    }

    async function stopRecAndUpload() {
        if (!recording) {
            console.warn("⚠️ No recording to stop");
            return;
        }
        
        try {
            console.log("⏹️ Stopping recording and uploading...");
            
            await recording.stopAndUnloadAsync();
            console.log("🛑 Recording stopped");
            
            const uri = recording.getURI();
            console.log("📁 Recording URI:", uri);
            
            setRecording(null);
            setIsRecording(false);
            setRecordingUri(uri);

            // Upload after stopping
            if (uri) {
                console.log("📤 Starting upload process...");
                
                const form = new FormData();
                form.append("file", { 
                    uri: uri, 
                    name: "meeting.m4a", 
                    type: "audio/m4a" 
                } as any);
                form.append("title", `Meeting ${new Date().toISOString()}`);

                const token = await Storage.getItem("jwt");
                console.log("🔑 Token retrieved:", token ? "Yes" : "No");
                
                console.log("🌐 Uploading to:", `${API_BASE}/api/meetings/upload`);
                
                const resp = await fetch(`${API_BASE}/api/meetings/upload`, {
                    method: "POST",
                    headers: { Authorization: `Bearer ${token}` },
                    body: form
                });

                console.log("📡 Upload response status:", resp.status);

                if (!resp.ok) {
                    const errorText = await resp.text();
                    console.error("❌ Upload failed:", errorText);
                    return Alert.alert("Upload failed", errorText);
                }
                
                console.log("✅ Upload successful");
                Alert.alert("Uploaded", "Processing started");
                setRecordingUri(null);
                navigation.navigate("Meetings");
            } else {
                console.error("❌ No recording URI available");
                Alert.alert("Error", "No recording file found");
            }
        } catch (err) {
            console.error("❌ Stop Recording Error:", err);
            Alert.alert("Stop Recording Error", `Failed to stop recording: ${err?.message || String(err)}`);
        }
    }

    async function playRecording() {
        if (!recordingUri) {
            console.warn("⚠️ No recording URI to play");
            return;
        }
        
        try {
            console.log("▶️ Starting playback...");
            
            if (sound) {
                await sound.unloadAsync();
                setSound(null);
                console.log("🔄 Previous sound unloaded");
            }
            
            const playback = new Audio.Sound();
            await playback.loadAsync({ uri: recordingUri });
            console.log("🎵 Sound loaded successfully");
            
            setSound(playback);
            setIsPlaying(true);
            
            playback.setOnPlaybackStatusUpdate((status) => {
                if (status.isLoaded) {
                    console.log("🎶 Playback status:", status.isPlaying ? "Playing" : "Stopped");
                    if (!status.isPlaying) {
                        setIsPlaying(false);
                    }
                }
            });
            
            await playback.playAsync();
            console.log("▶️ Playback started");
            
        } catch (err) {
            console.error("❌ Playback Error:", err);
            Alert.alert("Playback Error", `Failed to play recording: ${err?.message || String(err)}`);
        }
    }
    async function stopRec() {
        if (!recording) {
            console.warn("⚠️ No recording to stop");
            return;
        }
        
        try {
            console.log("⏹️ Stopping recording only...");
            
            await recording.stopAndUnloadAsync();
            console.log("🛑 Recording stopped");
            
            const uri = recording.getURI();
            console.log("📁 Recording URI:", uri);
            
            setRecording(null);
            setIsRecording(false);
            setRecordingUri(uri);
            
            console.log("✅ Recording stopped successfully");
            
        } catch (err) {
            console.error("❌ Stop Recording Error:", err);
            Alert.alert("Stop Recording Error", `Failed to stop recording: ${err?.message || String(err)}`);
        }
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Record Meeting</Text>
            
            <View style={styles.buttonContainer}>
                <Button 
                    title={isRecording ? "Stop & Upload" : "Start Recording"} 
                    onPress={isRecording ? stopRecAndUpload : startRec} 
                />
            </View>
            
            <View style={styles.buttonContainer}>
                <Button 
                    title="Play Recording" 
                    onPress={playRecording} 
                    disabled={!recordingUri || isPlaying} 
                />
            </View>
            
            <View style={styles.buttonContainer}>
                <Button 
                    title="Stop Recording Only" 
                    onPress={stopRec} 
                    disabled={!isRecording}
                />
            </View>
            
            <View style={styles.buttonContainer}>
                <Button title="Clear Recordings" onPress={clearRecordings} />
            </View>
            
            <View style={styles.buttonContainer}>
                <Button title="View Meetings" onPress={() => navigation.navigate("Meetings")} />
            </View>
            
            {recordingUri && (
                <Text style={styles.statusText}>Recording saved: {recordingUri}</Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#f5f5f5',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
        color: '#333',
    },
    buttonContainer: {
        marginVertical: 8,
    },
    statusText: {
        marginTop: 20,
        padding: 10,
        backgroundColor: '#e8f5e8',
        borderRadius: 5,
        color: '#2e7d32',
        fontSize: 12,
    },
});