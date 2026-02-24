import { useSSO, useSignUp } from '@clerk/clerk-expo';
import * as AuthSession from 'expo-auth-session';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { PanelCard } from '@/components/panel-card';
import { ScreenShell } from '@/components/screen-shell';
import {
  getMessageFromUnknownSignUpError,
  getSignUpStatusErrorMessage,
  validateSignUpFields,
} from '@/lib/auth/sign-up';
import { PrimaPalette, PrimaRadius, PrimaSpacing } from '@/lib/theme/tokens';

export default function SignUpScreen() {
  const { isLoaded, setActive, signUp } = useSignUp();
  const { startSSOFlow } = useSSO();
  const router = useRouter();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmittingGoogle, setIsSubmittingGoogle] = useState(false);

  const clearError = () => {
    if (errorMessage) {
      setErrorMessage(null);
    }
  };

  const handleSignUp = async () => {
    if (!isLoaded || isSubmitting || isSubmittingGoogle) {
      return;
    }

    const fieldValidationError = validateSignUpFields(firstName, lastName, username, password);
    if (fieldValidationError) {
      setErrorMessage(fieldValidationError);
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const result = await signUp.create({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        username: username.trim(),
        password,
      });

      if (result.createdSessionId) {
        await setActive({ session: result.createdSessionId });
        router.replace('/(tabs)');
        return;
      }

      const statusError = getSignUpStatusErrorMessage(result.status);
      if (statusError) {
        setErrorMessage(statusError);
        return;
      }

      setErrorMessage('Sign-up succeeded, but no session was created. Please try signing up again.');
    } catch (error) {
      setErrorMessage(getMessageFromUnknownSignUpError(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignUp = async () => {
    if (!isLoaded || isSubmitting || isSubmittingGoogle) {
      return;
    }

    setIsSubmittingGoogle(true);
    setErrorMessage(null);

    try {
      const result = await startSSOFlow({
        strategy: 'oauth_google',
        redirectUrl: AuthSession.makeRedirectUri(),
      });

      if (result.createdSessionId) {
        if (result.setActive) {
          await result.setActive({ session: result.createdSessionId });
        } else {
          await setActive({ session: result.createdSessionId });
        }

        router.replace('/(tabs)');
        return;
      }

      if (result.signUp) {
        const updatePayload: { firstName?: string; lastName?: string; username?: string } = {};
        const trimmedFirstName = firstName.trim();
        const trimmedLastName = lastName.trim();
        const trimmedUsername = username.trim();

        if (trimmedFirstName.length > 0) {
          updatePayload.firstName = trimmedFirstName;
        }

        if (trimmedLastName.length > 0) {
          updatePayload.lastName = trimmedLastName;
        }

        if (trimmedUsername.length > 0) {
          updatePayload.username = trimmedUsername;
        }

        if (Object.keys(updatePayload).length > 0) {
          const updatedSignUp = await result.signUp.update(updatePayload);
          if (updatedSignUp.createdSessionId) {
            if (result.setActive) {
              await result.setActive({ session: updatedSignUp.createdSessionId });
            } else {
              await setActive({ session: updatedSignUp.createdSessionId });
            }

            router.replace('/(tabs)');
            return;
          }

          const updatedStatusError = getSignUpStatusErrorMessage(updatedSignUp.status);
          if (updatedStatusError) {
            setErrorMessage(updatedStatusError);
            return;
          }
        }

        const statusError = getSignUpStatusErrorMessage(result.signUp.status);
        if (statusError) {
          setErrorMessage(statusError);
          return;
        }
      }

      setErrorMessage('Google sign-up could not be completed. Please try again.');
    } catch (error) {
      setErrorMessage(getMessageFromUnknownSignUpError(error));
    } finally {
      setIsSubmittingGoogle(false);
    }
  };

  return (
    <ScreenShell contentStyle={styles.content}>
      <PanelCard style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.title}>Create your Prima account</Text>
          <Text style={styles.subtitle}>Sign up with your profile details or continue with Google.</Text>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>First name</Text>
          <TextInput
            autoCapitalize="words"
            onChangeText={(value) => {
              clearError();
              setFirstName(value);
            }}
            placeholder="Jane"
            placeholderTextColor={PrimaPalette.textMuted}
            style={styles.input}
            textContentType="givenName"
            value={firstName}
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Last name</Text>
          <TextInput
            autoCapitalize="words"
            onChangeText={(value) => {
              clearError();
              setLastName(value);
            }}
            placeholder="Doe"
            placeholderTextColor={PrimaPalette.textMuted}
            style={styles.input}
            textContentType="familyName"
            value={lastName}
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Username</Text>
          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            onChangeText={(value) => {
              clearError();
              setUsername(value);
            }}
            placeholder="your-username"
            placeholderTextColor={PrimaPalette.textMuted}
            style={styles.input}
            textContentType="username"
            value={username}
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            onChangeText={(value) => {
              clearError();
              setPassword(value);
            }}
            placeholder="Create a password"
            placeholderTextColor={PrimaPalette.textMuted}
            secureTextEntry
            style={styles.input}
            textContentType="newPassword"
            value={password}
          />
        </View>

        {errorMessage ? <Text style={styles.errorMessage}>{errorMessage}</Text> : null}

        <View style={styles.buttonGroup}>
          <Pressable
            accessibilityRole="button"
            disabled={!isLoaded || isSubmitting || isSubmittingGoogle}
            onPress={handleSignUp}
            style={({ pressed }) => [
              styles.submitButton,
              (!isLoaded || isSubmitting || isSubmittingGoogle) && styles.submitButtonDisabled,
              pressed && !isSubmitting && !isSubmittingGoogle && styles.submitButtonPressed,
            ]}>
            {isSubmitting ? (
              <ActivityIndicator color={PrimaPalette.surface} />
            ) : (
              <Text style={styles.submitButtonText}>Sign up</Text>
            )}
          </Pressable>

          <Pressable
            accessibilityRole="button"
            disabled={!isLoaded || isSubmitting || isSubmittingGoogle}
            onPress={handleGoogleSignUp}
            style={({ pressed }) => [
              styles.secondaryButton,
              (!isLoaded || isSubmitting || isSubmittingGoogle) && styles.submitButtonDisabled,
              pressed && !isSubmitting && !isSubmittingGoogle && styles.submitButtonPressed,
            ]}>
            {isSubmittingGoogle ? (
              <ActivityIndicator color={PrimaPalette.primaryEnd} />
            ) : (
              <Text style={styles.secondaryButtonText}>Continue with Google</Text>
            )}
          </Pressable>
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={() => router.replace('/sign-in')}
          style={styles.inlineLink}>
          <Text style={styles.inlineLinkText}>Already have an account? Sign in</Text>
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
    fontSize: 24,
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
  buttonGroup: {
    gap: 10,
  },
  submitButton: {
    alignItems: 'center',
    backgroundColor: PrimaPalette.primaryEnd,
    borderRadius: PrimaRadius.card,
    minHeight: 48,
    justifyContent: 'center',
  },
  secondaryButton: {
    alignItems: 'center',
    backgroundColor: PrimaPalette.surface,
    borderColor: PrimaPalette.border,
    borderRadius: PrimaRadius.card,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 48,
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
  secondaryButtonText: {
    color: PrimaPalette.primaryEnd,
    fontSize: 15,
    fontWeight: '700',
  },
  inlineLink: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 36,
  },
  inlineLinkText: {
    color: PrimaPalette.primaryEnd,
    fontSize: 14,
    fontWeight: '600',
  },
});
