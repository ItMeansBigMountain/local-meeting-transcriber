import React, { useState } from "react";
import { View, TextInput, Button, Alert, Text, StyleSheet } from "react-native";
import { Storage } from "../utils/storage";
import { API_BASE } from "../config/api";

export default function Login({ navigation }: any) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert("Error", "Please enter both email and password");
            return;
        }

        setIsLoading(true);
        try {
            // For now, we'll use a simple mock authentication
            // In a real app, you'd call your backend auth endpoint
            const response = await fetch(`${API_BASE}/api/auth/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
            });

            if (response.ok) {
                const data = await response.json();
                await Storage.setItem("jwt", data.token);
                navigation.replace("Record");
            } else {
                // For demo purposes, allow any email/password combination
                const mockToken = "mock-jwt-token-" + Date.now();
                await Storage.setItem("jwt", mockToken);
                Alert.alert("Success", "Logged in successfully (demo mode)");
                navigation.replace("Record");
            }
        } catch (error) {
            // For demo purposes, allow any email/password combination
            const mockToken = "mock-jwt-token-" + Date.now();
            await Storage.setItem("jwt", mockToken);
            Alert.alert("Success", "Logged in successfully (demo mode)");
            navigation.replace("Record");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Local Meeting Transcriber</Text>
            <Text style={styles.subtitle}>Sign in to continue</Text>
            
            <View style={styles.inputContainer}>
                <TextInput 
                    style={styles.input}
                    placeholder="Email" 
                    autoCapitalize="none" 
                    value={email} 
                    onChangeText={setEmail}
                    keyboardType="email-address"
                />
            </View>
            
            <View style={styles.inputContainer}>
                <TextInput 
                    style={styles.input}
                    placeholder="Password" 
                    secureTextEntry 
                    value={password} 
                    onChangeText={setPassword}
                />
            </View>
            
            <View style={styles.buttonContainer}>
                <Button 
                    title={isLoading ? "Signing in..." : "Sign In"} 
                    onPress={handleLogin}
                    disabled={isLoading}
                />
            </View>
            
            <Text style={styles.demoText}>
                Demo: Enter any email and password to continue
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        justifyContent: 'center',
        backgroundColor: '#f5f5f5',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 8,
        color: '#333',
    },
    subtitle: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 40,
        color: '#666',
    },
    inputContainer: {
        marginBottom: 16,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        backgroundColor: 'white',
    },
    buttonContainer: {
        marginTop: 20,
    },
    demoText: {
        textAlign: 'center',
        marginTop: 20,
        fontSize: 12,
        color: '#888',
        fontStyle: 'italic',
    },
});
