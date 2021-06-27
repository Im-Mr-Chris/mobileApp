import React from 'react';
import { Text, View, StyleSheet, FlatList, Linking } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { AntDesign } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { themeStyles } from '@styles';
import { globals } from '@globals';
import { Entypo, Ionicons, Feather, SimpleLineIcons } from '@expo/vector-icons';

interface Settings {
    title: string;
    icon: any;
    action: () => void;
}

export function SettingsScreen({ navigation }: any) {
    const settings: Settings[] = [
        {
            title: 'Feed',
            icon: <MaterialCommunityIcons style={{ marginRight: -4 }} name="lightning-bolt-outline" size={28} color={themeStyles.fontColorMain.color} />,
            action: () => navigation.navigate('FeedSettings')
        },
        {
            title: 'Saved Posts',
            icon: <Feather name="bookmark" size={22} color={themeStyles.fontColorMain.color} />,
            action: () => navigation.navigate('SavedPosts')
        },
        {
            title: 'Blocked Users',
            icon: <Entypo name="block" size={22} color={themeStyles.fontColorMain.color} />,
            action: () => navigation.navigate('BlockedUsers')
        },
        {
            title: 'Privacy Policy',
            icon: <Feather name="lock" size={24} color={themeStyles.fontColorMain.color} />,
            action: () => Linking.openURL('https://clouttechnologies.com/privacy-policy')
        },
        {
            title: 'Terms & Conditions',
            icon: <MaterialCommunityIcons name="text-box-check-outline" size={24} color={themeStyles.fontColorMain.color} />,
            action: () => Linking.openURL('https://clouttechnologies.com/terms-%26-conditions')
        },
        {
            title: 'Contact Us',
            icon: <Ionicons name="mail-unread-outline" size={24} color={themeStyles.fontColorMain.color} />,
            action: () => Linking.openURL('https://clouttechnologies.com/home')
        },
        {
            title: 'Logout',
            icon: <SimpleLineIcons name="logout" size={24} color={themeStyles.fontColorMain.color} />,
            action: () => globals.onLogout()
        },
        {
            title: 'CloutFeed v 1.4.3',
            icon: <AntDesign name="copyright" style={{ marginLeft: 6 }} size={18} color={themeStyles.fontColorMain.color} />,
            action: () => { }
        },
    ];

    const keyExtractor = (item: any, index: number) => item.toString() + index.toString();

    const renderItem = (p_item: Settings) => {
        return <TouchableOpacity
            style={[styles.buttonContainer, themeStyles.containerColorMain, themeStyles.borderColor]}
            onPress={p_item.action}
            activeOpacity={1}>
            {p_item.icon}
            <Text style={[styles.buttonText, themeStyles.fontColorMain]}>{p_item.title}</Text>
        </TouchableOpacity>
    };

    return (
        <View style={[styles.container, themeStyles.containerColorSub]}>
            {
                globals.followerFeatures &&
                <TouchableOpacity
                    style={[styles.buttonContainer, themeStyles.containerColorMain, themeStyles.borderColor]}
                    onPress={() => navigation.navigate('Appearance')}
                    activeOpacity={1}>
                    <Ionicons name="ios-color-palette" size={24} color={themeStyles.fontColorMain.color} />
                    <Text style={[styles.buttonText, themeStyles.fontColorMain]}>Appearance</Text>
                </TouchableOpacity>
            }
            <FlatList
                data={settings}
                renderItem={({ item }) => renderItem(item)}
                keyExtractor={keyExtractor}
            />
        </View>
    );
}

const styles = StyleSheet.create(
    {
        container: {
            flex: 1
        },
        buttonContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: 16,
            borderBottomWidth: 1
        },
        buttonText: {
            marginLeft: 12,
            fontWeight: '600'
        }
    }
);