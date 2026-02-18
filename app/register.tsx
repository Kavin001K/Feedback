import React, { useState, useRef } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  Pressable,
  Platform,
  ScrollView,
  KeyboardAvoidingView,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown, FadeIn } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import { useScrollLab } from "@/context/ScrollLabContext";

export default function RegisterScreen() {
  const insets = useSafeAreaInsets();
  const { registerUser } = useScrollLab();
  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomInset = Platform.OS === "web" ? 34 : insets.bottom;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [dob, setDob] = useState("");
  const [consentData, setConsentData] = useState(false);
  const [consentTerms, setConsentTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const emailRef = useRef<TextInput>(null);
  const phoneRef = useRef<TextInput>(null);
  const dobRef = useRef<TextInput>(null);

  const formatDob = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, "");
    if (cleaned.length <= 2) return cleaned;
    if (cleaned.length <= 4) return `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
    return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}/${cleaned.slice(4, 8)}`;
  };

  const handleDobChange = (text: string) => {
    setDob(formatDob(text));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) newErrors.name = "Name is required";
    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = "Please enter a valid email";
    }
    if (!phone.trim()) newErrors.phone = "Phone number is required";
    if (!dob.trim()) {
      newErrors.dob = "Date of birth is required";
    } else if (dob.length < 10) {
      newErrors.dob = "Please use MM/DD/YYYY format";
    }
    if (!consentData) newErrors.consentData = "You must consent to data collection";
    if (!consentTerms) newErrors.consentTerms = "You must accept the terms";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    setIsSubmitting(true);
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const parts = dob.split("/");
      const isoDate = parts.length === 3 ? `${parts[2]}-${parts[0]}-${parts[1]}` : "";

      await registerUser({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        dateOfBirth: isoDate,
      });
      router.push("/topics");
    } catch (err) {
      Alert.alert("Error", "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#0A0A0F", "#12122A", "#0A0A0F"]}
        style={StyleSheet.absoluteFill}
      />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: topInset + 16, paddingBottom: bottomInset + 20 },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          bounces={false}
        >
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [styles.backBtn, { opacity: pressed ? 0.6 : 1 }]}
          >
            <Ionicons name="chevron-back" size={24} color={Colors.dark.text} />
          </Pressable>

          <Animated.View entering={FadeIn.delay(100).duration(500)}>
            <Text style={styles.step}>PARTICIPANT REGISTRATION</Text>
            <Text style={styles.title}>About You</Text>
            <Text style={styles.subtitle}>
              We need a few details before you begin the experiment.
            </Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(200).duration(400)} style={styles.form}>
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Full Name</Text>
              <View style={[styles.inputWrap, errors.name ? styles.inputError : null]}>
                <Ionicons name="person-outline" size={20} color={Colors.dark.textMuted} />
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  placeholder="Enter your full name"
                  placeholderTextColor={Colors.dark.textMuted}
                  returnKeyType="next"
                  onSubmitEditing={() => emailRef.current?.focus()}
                  autoCapitalize="words"
                />
              </View>
              {errors.name ? <Text style={styles.errorText}>{errors.name}</Text> : null}
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Email Address</Text>
              <View style={[styles.inputWrap, errors.email ? styles.inputError : null]}>
                <Ionicons name="mail-outline" size={20} color={Colors.dark.textMuted} />
                <TextInput
                  ref={emailRef}
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="you@example.com"
                  placeholderTextColor={Colors.dark.textMuted}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="next"
                  onSubmitEditing={() => phoneRef.current?.focus()}
                />
              </View>
              {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Phone Number</Text>
              <View style={[styles.inputWrap, errors.phone ? styles.inputError : null]}>
                <Ionicons name="call-outline" size={20} color={Colors.dark.textMuted} />
                <TextInput
                  ref={phoneRef}
                  style={styles.input}
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="+1 (555) 000-0000"
                  placeholderTextColor={Colors.dark.textMuted}
                  keyboardType="phone-pad"
                  returnKeyType="next"
                  onSubmitEditing={() => dobRef.current?.focus()}
                />
              </View>
              {errors.phone ? <Text style={styles.errorText}>{errors.phone}</Text> : null}
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Date of Birth</Text>
              <View style={[styles.inputWrap, errors.dob ? styles.inputError : null]}>
                <Ionicons name="calendar-outline" size={20} color={Colors.dark.textMuted} />
                <TextInput
                  ref={dobRef}
                  style={styles.input}
                  value={dob}
                  onChangeText={handleDobChange}
                  placeholder="MM/DD/YYYY"
                  placeholderTextColor={Colors.dark.textMuted}
                  keyboardType="number-pad"
                  maxLength={10}
                  returnKeyType="done"
                />
              </View>
              {errors.dob ? <Text style={styles.errorText}>{errors.dob}</Text> : null}
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(400).duration(400)} style={styles.consentSection}>
            <Text style={styles.consentTitle}>Consent & Permissions</Text>

            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setConsentData(!consentData);
              }}
              style={styles.checkboxRow}
            >
              <View style={[styles.checkbox, consentData && styles.checkboxChecked]}>
                {consentData && <Ionicons name="checkmark" size={14} color="#FFF" />}
              </View>
              <Text style={styles.checkboxLabel}>
                I consent to the collection and analysis of my behavioral data (scroll patterns, dwell time, and ad interactions) for academic research purposes.
              </Text>
            </Pressable>
            {errors.consentData ? <Text style={styles.errorText}>{errors.consentData}</Text> : null}

            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setConsentTerms(!consentTerms);
              }}
              style={styles.checkboxRow}
            >
              <View style={[styles.checkbox, consentTerms && styles.checkboxChecked]}>
                {consentTerms && <Ionicons name="checkmark" size={14} color="#FFF" />}
              </View>
              <Text style={styles.checkboxLabel}>
                I accept the Terms and Conditions and Privacy Policy. I understand my data will be used solely for research and may be withdrawn at any time.
              </Text>
            </Pressable>
            {errors.consentTerms ? <Text style={styles.errorText}>{errors.consentTerms}</Text> : null}
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(500).duration(400)} style={styles.legalBox}>
            <Ionicons name="information-circle-outline" size={18} color={Colors.dark.textMuted} />
            <Text style={styles.legalText}>
              Your personal information is encrypted and stored securely. We do not share your data with third parties. All research findings are reported in aggregate form only. You may request data deletion by contacting the research team.
            </Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(600).duration(400)} style={styles.submitWrap}>
            <Pressable
              onPress={handleSubmit}
              disabled={isSubmitting}
              style={({ pressed }) => [
                styles.submitBtn,
                { opacity: pressed ? 0.85 : 1, transform: [{ scale: pressed ? 0.97 : 1 }] },
                isSubmitting && { opacity: 0.6 },
              ]}
            >
              <LinearGradient
                colors={[Colors.dark.primary, "#5A4BD6"]}
                style={styles.submitGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.submitText}>
                  {isSubmitting ? "Registering..." : "Continue"}
                </Text>
                <Ionicons name="arrow-forward" size={18} color="#FFF" />
              </LinearGradient>
            </Pressable>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  step: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    color: Colors.dark.primary,
    letterSpacing: 2,
    marginBottom: 6,
  },
  title: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    color: Colors.dark.text,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: Colors.dark.textSecondary,
    marginTop: 6,
    lineHeight: 20,
  },
  form: {
    marginTop: 24,
    gap: 18,
  },
  fieldGroup: {
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: Colors.dark.textSecondary,
    marginLeft: 4,
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.dark.surface,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.dark.border,
    paddingHorizontal: 16,
    gap: 12,
    height: 52,
  },
  inputError: {
    borderColor: Colors.dark.error,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: Colors.dark.text,
    height: "100%",
  },
  errorText: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: Colors.dark.error,
    marginLeft: 4,
    marginTop: 2,
  },
  consentSection: {
    marginTop: 28,
    gap: 16,
  },
  consentTitle: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    color: Colors.dark.text,
  },
  checkboxRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: Colors.dark.border,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
    flexShrink: 0,
  },
  checkboxChecked: {
    backgroundColor: Colors.dark.primary,
    borderColor: Colors.dark.primary,
  },
  checkboxLabel: {
    flex: 1,
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: Colors.dark.textSecondary,
    lineHeight: 19,
  },
  legalBox: {
    flexDirection: "row",
    gap: 10,
    backgroundColor: Colors.dark.surface,
    borderRadius: 12,
    padding: 14,
    marginTop: 20,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    alignItems: "flex-start",
  },
  legalText: {
    flex: 1,
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: Colors.dark.textMuted,
    lineHeight: 17,
  },
  submitWrap: {
    marginTop: 24,
  },
  submitBtn: {
    borderRadius: 16,
    overflow: "hidden",
  },
  submitGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    gap: 10,
  },
  submitText: {
    fontSize: 17,
    fontFamily: "Inter_600SemiBold",
    color: "#FFF",
  },
});
