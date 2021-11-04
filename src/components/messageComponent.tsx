import React from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import { settingsGlobals } from '@globals';
import { Message } from '@types';
import { TextWithLinks } from './textWithLinks.component';
import { ParamListBase, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

export function MessageComponent(
    { message }: { message: Message }
): JSX.Element {

    const navigation = useNavigation<StackNavigationProp<ParamListBase>>();
    return <View style={
        [
            styles.messageContainer,
            { backgroundColor: settingsGlobals.darkMode ? '#333333' : '#4d4d4d' },
            message.IsSender ? styles.sentMessage : styles.receivedMessage,
            message.LastOfGroup ? styles.lastOfGroup : {}
        ]
    }
    >
        <TextWithLinks style={[styles.messageText]} navigation={navigation} text={message.DecryptedText as string} />
    </View>;
}

const styles = StyleSheet.create(
    {
        messageContainer: {
            padding: 8,
            marginTop: 1,
            marginBottom: 2,
            borderRadius: 10
        },
        sentMessage: {
            marginRight: 4,
            maxWidth: Dimensions.get('window').width * 0.8,
            backgroundColor: 'black',
            marginLeft: 'auto',
            borderWidth: 1,
            borderColor: '#4a4a4a'
        },
        receivedMessage: {
            maxWidth: Dimensions.get('window').width * 0.8,
            marginLeft: 4,
            borderWidth: 1,
            borderColor: '#4a4a4a'
        },
        lastOfGroup: {
            marginBottom: 8
        },
        messageText: {
            color: 'white',
            lineHeight: 20
        }
    }
);
