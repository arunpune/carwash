import { NavigationProp, useNavigation } from '@react-navigation/native';
import Input from '@shared/Input';
import { FC, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text } from 'react-native';
import { AuthStackParamList } from 'src/features/auth/AuthNavigator';
import { useDispatch } from 'react-redux';
import { AppDispatch } from 'src/app/store';
import { colors, globalTextStyles } from '@globals/globalStyles';
import Toast from 'react-native-toast-message';
import { Button } from '@shared/Button';
import { InputField } from '@models/InputField';
import { signUp } from '../authSlice';

type Props = {};

export const SignupScreen: FC<Props> = () => {
  const navigation = useNavigation<NavigationProp<AuthStackParamList, 'signup'>>();
  const dispatch = useDispatch<AppDispatch>();
  const [isLoading, setIsLoading] = useState(false);

  const [email, setEmail] = useState<InputField>({ value: '', valid: false, blurred: false });
  const [password, setPassword] = useState<InputField>({ value: '', valid: false, blurred: false });
  const [confirmPassword, setConfirmPassword] = useState<InputField>({ value: '', valid: false, blurred: false });
  const [firstName, setFirstName] = useState<InputField>({ value: '', valid: false, blurred: false });
  const [lastName, setLastName] = useState<InputField>({ value: '', valid: false, blurred: false });

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  const handler = {
    emailChange: (text: string) => {
      setEmail({ value: text, valid: emailRegex.test(text), blurred: false });
    },
    emailBlur: () => setEmail(prev => ({ ...prev, blurred: true })),
    
    passwordChange: (text: string) => {
      setPassword({ value: text, valid: text.length > 0, blurred: false });
    },
    passwordBlur: () => setPassword(prev => ({ ...prev, blurred: true })),

    confirmPasswordChange: (text: string) => {
      setConfirmPassword({ value: text, valid: text === password.value, blurred: false });
    },
    confirmPasswordBlur: () => setConfirmPassword(prev => ({ ...prev, blurred: true })),

    firstNameChange: (text: string) => {
      setFirstName({ value: text, valid: text.length > 2, blurred: false });
    },
    firstNameBlur: () => setFirstName(prev => ({ ...prev, blurred: true })),

    lastNameChange: (text: string) => {
      setLastName({ value: text, valid: text.length > 2, blurred: false });
    },
    lastNameBlur: () => setLastName(prev => ({ ...prev, blurred: true })),

    signUpHandler: async () => {
      setIsLoading(true);
      try {
        const res = await dispatch(signUp({
          firstName: firstName.value,
          lastName: lastName.value,
          email: email.value.toLowerCase(),
          password: password.value
        }));
    
        // // Assuming the response is inside res.payload
        // console.log(res);
        
        if (res) {
          Toast.show({
            type: 'success',
            text1: 'User created successfully. Navigating to login.',
          });
    
          setTimeout(() => {
            navigateToSignin();
          }, 2000);
        } else {
          Toast.show({ type: 'error', text1: 'User creation failed.' });
        }
      } catch (error) {
        Toast.show({ type: 'error', text1: 'An error occurred during signup.' });
      } finally {
        setIsLoading(false);
      }
    }
    
  };

  function navigateToSignin() {
    navigation.navigate('login', {
      email: email.value,
      password: password.value,
    });
  }

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
      automaticallyAdjustKeyboardInsets
    >
      <Text style={textStyles.heading}>Sign up</Text>

      <Input
        keyboardType="default"
        placeholder="First name"
        isValid={!firstName.blurred || firstName.valid}
        errorMessage="First name must be at least 3 characters"
        onChangeText={handler.firstNameChange}
        onBlur={handler.firstNameBlur}
      />
      
      <Input
        keyboardType="default"
        placeholder="Last name"
        isValid={!lastName.blurred || lastName.valid}
        errorMessage="Last name must be at least 3 characters"
        onChangeText={handler.lastNameChange}
        onBlur={handler.lastNameBlur}
      />
      
      <Input
        keyboardType="email-address"
        placeholder="Email"
        isValid={!email.blurred || email.valid}
        errorMessage="Invalid email format"
        onChangeText={handler.emailChange}
        onBlur={handler.emailBlur}
      />
      
      <Input
        secureTextEntry
        placeholder="Password"
        isValid={!password.blurred || password.valid}
        errorMessage="Password is required"
        onChangeText={handler.passwordChange}
        onBlur={handler.passwordBlur}
      />
      
      <Input
        secureTextEntry
        placeholder="Confirm password"
        isValid={!confirmPassword.blurred || confirmPassword.valid}
        errorMessage="Passwords must match"
        onChangeText={handler.confirmPasswordChange}
        onBlur={handler.confirmPasswordBlur}
      />

      {isLoading ? (
        <ActivityIndicator size="large" color={colors.primary.base} />
      ) : (
        <Button
          text="Sign Up"
          primary
          onPress={handler.signUpHandler}
          disabled={
            !email.valid || !password.valid || !firstName.valid || !lastName.valid || !confirmPassword.valid
          }
          style={{ width: '100%' }}
        />
      )}

      <Text onPress={navigateToSignin} style={[textStyles.default, styles.signUpMessage]}>
        Already have an account? <Text style={textStyles.link}>Sign in.</Text>
      </Text>

      <Toast />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 40,
    paddingHorizontal: 24,
  },
  signUpMessage: {
    marginTop: 24,
  },
});

const textStyles = StyleSheet.create({
  heading: {
    ...globalTextStyles.headingLarge,
    color: colors.black.base,
    paddingTop: 0,
    paddingBottom: 24,
  },
  link: {
    color: colors.primary.base,
  },
  default: {
    fontSize: 18,
    color: colors.grey[60],
  },
});
