import { ParamListBase, useNavigation } from '@react-navigation/core';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useEffect, useRef, useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { authenticateWithDeSoIdentity } from '@services/authorization/deSoAuthentication';

interface Props {
    onLoginWithUsername: () => void;
}

export function LoginOptions(props: Props): JSX.Element {

    const navigation = useNavigation<StackNavigationProp<ParamListBase>>();

    const [isWorking, setIsWorking] = useState(false);
    const isMounted = useRef(false);

    useEffect(
        () => {
            isMounted.current = true;

            return () => {
                isMounted.current = false;
            };
        },
        []
    );

    const loginWithDeSoIdentity = async () => {
        if (isMounted.current) {
            setIsWorking(true);
        }

        await authenticateWithDeSoIdentity();

        if (isMounted.current) {
            setIsWorking(false);
        }
    };

    if (isWorking) {
        return <ActivityIndicator
            style={styles.indicator}
            size={'large'}
            color={'#ebebeb'} />;
    }

    return <View style={styles.loginOptionsContainer}>
        <Text style={styles.modeText}>Read-Only Mode</Text>
        <TouchableOpacity
            style={[styles.loginButton]}
            onPress={() => props.onLoginWithUsername()}
            activeOpacity={1}
        >
            <Text style={styles.loginButtonText}>Login with Username</Text>
        </TouchableOpacity>

        <Text style={styles.modeText}>Full Access Mode</Text>
        <TouchableOpacity
            style={[styles.loginButton, { marginBottom: 10 }]}
            onPress={() => loginWithDeSoIdentity()}
            activeOpacity={1}
        >
            <Text style={styles.loginButtonText}>Login with DeSo Identity</Text>
        </TouchableOpacity>

        <Text style={styles.modeText}>Full Access Mode</Text>
        <TouchableOpacity
            style={[styles.loginButton, { marginBottom: 10 }]}
            onPress={() => navigation.navigate('Identity')}
            activeOpacity={1}
        >
            <Text style={styles.loginButtonText}>Login with CloutFeed Identity</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('IdentityInfo')}>
            <Text style={styles.modeText}>Read more</Text>
        </TouchableOpacity>
    </View>;
}

const styles = StyleSheet.create(
    {
        indicator: {
            marginTop: 50,
        },
        loginButton: {
            backgroundColor: 'black',
            color: 'white',
            alignSelf: 'stretch',
            marginRight: 16,
            marginLeft: 16,
            height: 44,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 50,
            marginBottom: 20,
            borderWidth: 1,
            borderColor: '#404040'
        },
        loginButtonText: {
            color: 'white',
            fontSize: 18,
            fontWeight: '500'
        },
        loginOptionsContainer: {
            marginTop: 20,
            width: '100%',
            justifyContent: 'center',
            alignItems: 'center'
        },
        modeText: {
            color: '#b0b3b8',
            marginBottom: 5,
            fontSize: 12
        },
        backButton: {
            paddingLeft: 20,
            paddingRight: 20
        }
    }
);
