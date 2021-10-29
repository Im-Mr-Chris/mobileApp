import { ParamListBase, useNavigation } from '@react-navigation/core';
import { StackNavigationProp } from '@react-navigation/stack';
import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';

interface Props {
    onLoginWithUsername: () => void;
}

export function LoginOptions(props: Props): JSX.Element {

    const navigation = useNavigation<StackNavigationProp<ParamListBase>>();

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
