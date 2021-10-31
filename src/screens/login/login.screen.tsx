import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, Image, Keyboard, Linking, ScrollView } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { constants } from '@globals';
import { LoginOptions } from './components/loginOptions.component';
import { LoginWithUsername } from './components/loginWithUsername.component';

export function LoginScreen({ navigation }: any) {
    const [isLogoVisible, setLogoVisible] = useState(true);
    const [loginWithUsername, setLoginWithUsername] = useState(false);

    useEffect(
        () => {
            checkCloutFeedIdentity();
            Keyboard.addListener('keyboardDidShow', keyboardDidShow);
            Keyboard.addListener('keyboardDidHide', keyboardDidHide);

            return () => {
                Keyboard.removeListener('keyboardDidShow', keyboardDidShow);
                Keyboard.removeListener('keyboardDidHide', keyboardDidHide);
            };
        },
        []
    );

    async function checkCloutFeedIdentity() {
        const cloutFeedIdentity = await SecureStore.getItemAsync(constants.localStorage_cloutFeedIdentity);

        if (!cloutFeedIdentity) {
            navigation.navigate('IdentityInfo');
            await SecureStore.setItemAsync(constants.localStorage_cloutFeedIdentity, 'true');
        }
    }

    const keyboardDidShow = () => setLogoVisible(false);
    const keyboardDidHide = () => setLogoVisible(true);

    function goToSignUp(): void {
        Linking.openURL('https://diamondapp.com/');
    }

    return <ScrollView
        bounces={false}
        contentContainerStyle={styles.contentContainerStyle}>
        <View style={styles.container}>
            <Image style={[styles.logo, { height: isLogoVisible ? 120 : 0 }]} source={require('../../../assets/icon-black.png')}></Image>
            <Text style={styles.title}>CloutFeed</Text>
            <Text style={styles.subtitle}>Powered by DeSo</Text>
            {
                loginWithUsername ?
                    <LoginWithUsername
                        onBack={() => setLoginWithUsername(false)}
                    />
                    :
                    <LoginOptions
                        onLoginWithUsername={() => setLoginWithUsername(true)} />
            }
            <Text style={[styles.modeText, styles.linkText]}>
                New to DeSo?
                <Text style={styles.signUpText} onPress={goToSignUp}> Sign up</Text>
            </Text>
        </View>
    </ScrollView>;
}

const styles = StyleSheet.create(
    {
        container: {
            flex: 1,
            backgroundColor: '#121212',
            alignItems: 'center'
        },
        contentContainerStyle: {
            flexGrow: 1,
            backgroundColor: '#121212',
            paddingBottom: 20,
        },
        title: {
            fontSize: 36,
            fontWeight: 'bold',
            color: 'white'
        },
        subtitle: {
            fontSize: 13,
            marginBottom: 16,
            color: 'white'
        },
        logo: {
            marginTop: 30,
            height: 150,
            width: 200
        },
        modeText: {
            color: '#b0b3b8',
            marginBottom: 5,
            fontSize: 12
        },
        linkText: {
            marginTop: 'auto',
            height: 100,
            fontSize: 16,
            textAlignVertical: 'center'
        },
        signUpText: {
            alignSelf: 'flex-end',
            fontWeight: 'bold',
            color: 'white'
        }
    }
);
