// src/screens/Record.web.tsx
import { useRef, useState } from "react";
import { View, Button, Alert } from "react-native";
import { Storage } from "../utils/storage";
import { API_BASE } from "../config/api";

export default function RecordWeb({ navigation }: any) {
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<BlobPart[]>([]);
  const [isRec, setRec] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  async function startRec() {
    if (__DEV__) {
      console.log("🎙️ Starting web recording...");
    }
    setFile(null);
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mr = new MediaRecorder(stream, { mimeType: "audio/webm;codecs=opus" });
    mr.ondataavailable = e => { if (e.data.size) chunks.current.push(e.data); };
    mr.onstop = () => {
      const blob = new Blob(chunks.current, { type: "audio/webm" });
      chunks.current = [];
      const recordedFile = new File([blob], "meeting.webm", { type: "audio/webm" });
      setFile(recordedFile);
    };
    mr.start();
    mediaRecorder.current = mr;
    setRec(true);
  }

  function stopRec() {
    mediaRecorder.current?.stop();
    mediaRecorder.current?.stream.getTracks().forEach(t => t.stop());
    setRec(false);
  }

  const uploadRec = async () => {
    if (!file) return;
    const form = new FormData();
    form.append("file", file);
    form.append("title", `Meeting ${new Date().toISOString()}`);

    const token = await Storage.getItem("jwt");
    const resp = await fetch(`${API_BASE}/api/meetings/upload`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: form
    });
    if (!resp.ok) return Alert.alert("Upload failed", await resp.text());
    Alert.alert("Uploaded", "Processing started");
    setFile(null);
    navigation.navigate("Meetings");
  };

  return (
    <View style={{ padding: 16, gap: 12 }}>
      <Button title={isRec ? "Stop Recording" : "Record"} onPress={isRec ? stopRec : startRec} />
      <Button title="Upload" onPress={uploadRec} disabled={!file} />
      <Button title="View Meetings" onPress={() => navigation.navigate("Meetings")} />
    </View>
  );
}
