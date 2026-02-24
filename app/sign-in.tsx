import { useSignIn } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { PanelCard } from '@/components/panel-card';
import { ScreenShell } from '@/components/screen-shell';
import {
  getMessageFromUnknownError,
  getSignInStatusErrorMessage,
  validateSignInFields,
} from '@/lib/auth/sign-in';
import { PrimaPalette, PrimaRadius, PrimaSpacing } from '@/lib/theme/tokens';

export default function SignInScreen() {
  const { isLoaded, setActive, signIn } = useSignIn();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleEmailChange = (value: string) => {
    if (errorMessage) {
      setErrorMessage(null);
    }

    setEmailAddress(value);
  };

  const handlePasswordChange = (value: string) => {
    if (errorMessage) {
      setErrorMessage(null);
    }

    setPassword(value);
  };

  const handleSignIn = async () => {
    if (!isLoaded || isSubmitting) {
      return;
    }

    const fieldValidationError = validateSignInFields(emailAddress, password);
    if (fieldValidationError) {
      setErrorMessage(fieldValidationError);
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const result = await signIn.create({
        identifier: emailAddress.trim(),
        password,
      });

      const statusError = getSignInStatusErrorMessage(result.status);
      if (statusError) {
        setErrorMessage(statusError);
        return;
      }

      if (!result.createdSessionId) {
        setErrorMessage('Sign-in succeeded, but no session was created. Please try signing in again.');
        return;
      }

      await setActive({ session: result.createdSessionId });
      router.replace('/(tabs)');
    } catch (error) {
      setErrorMessage(getMessageFromUnknownError(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScreenShell contentStyle={styles.content}>
      <PanelCard style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.title}>Sign in to Prima</Text>
          <Text style={styles.subtitle}>Use your account credentials to continue.</Text>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            onChangeText={handleEmailChange}
            placeholder="name@example.com"
            placeholderTextColor={PrimaPalette.textMuted}
            style={styles.input}
            textContentType="username"
            value={emailAddress}
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            autoCapitalize="none"
            onChangeText={handlePasswordChange}
            placeholder="Your password"
            placeholderTextColor={PrimaPalette.textMuted}
            secureTextEntry
            style={styles.input}
            textContentType="password"
            value={password}
          />
        </View>

        {errorMessage ? <Text style={styles.errorMessage}>{errorMessage}</Text> : null}

        <Pressable
          accessibilityRole="button"
          disabled={!isLoaded || isSubmitting}
          onPress={handleSignIn}
          style={({ pressed }) => [
            styles.submitButton,
            (!isLoaded || isSubmitting) && styles.submitButtonDisabled,
            pressed && !isSubmitting && styles.submitButtonPressed,
          ]}>
          {isSubmitting ? (
            <ActivityIndicator color={PrimaPalette.surface} />
          ) : (
            <Text style={styles.submitButtonText}>Sign in</Text>
          )}
        </Pressable>
      </PanelCard>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  content: {
    justifyContent: 'center',
  },
  card: {
    gap: 16,
  },
  header: {
    gap: 4,
  },
  title: {
    color: PrimaPalette.textPrimary,
    fontSize: 26,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  subtitle: {
    color: PrimaPalette.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
  fieldGroup: {
    gap: 8,
  },
  label: {
    color: PrimaPalette.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  input: {
    backgroundColor: PrimaPalette.surface,
    borderColor: PrimaPalette.border,
    borderRadius: PrimaRadius.card,
    borderWidth: 1,
    color: PrimaPalette.textPrimary,
    fontSize: 15,
    paddingHorizontal: PrimaSpacing.cardPadding,
    paddingVertical: 12,
  },
  errorMessage: {
    color: PrimaPalette.danger,
    fontSize: 13,
    lineHeight: 18,
  },
  submitButton: {
    alignItems: 'center',
    backgroundColor: PrimaPalette.primaryEnd,
    borderRadius: PrimaRadius.card,
    minHeight: 48,
    justifyContent: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.65,
  },
  submitButtonPressed: {
    opacity: 0.9,
  },
  submitButtonText: {
    color: PrimaPalette.surface,
    fontSize: 15,
    fontWeight: '700',
  },
});
