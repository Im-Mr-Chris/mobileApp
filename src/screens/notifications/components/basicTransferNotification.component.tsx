import { themeStyles } from "@styles/globalColors";
import React from "react";
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { Profile, Notification } from '@types';
import { globalStyles } from "@styles/globalStyles";

interface Props {
    profile: Profile;
    goToProfile: (p_userKey: string, p_username: string) => void;
    styles: any;
    notification: Notification;
}

export class BasicTransferNotificationComponent extends React.Component<Props> {
    constructor(props: Props) {
        super(props);
    }

    shouldComponentUpdate(p_nextProps: Props) {
        return p_nextProps.notification?.Index !== this.props.notification?.Index;
    }

    render() {
        return (
            <TouchableOpacity
                style={[this.props.styles.notificationContainer, this.props.styles.centerTextVertically, themeStyles.containerColorMain, themeStyles.borderColor]}
                onPress={() => this.props.goToProfile(this.props.profile.PublicKeyBase58Check, this.props.profile.Username)}
                activeOpacity={1}>
                <TouchableOpacity
                    style={this.props.styles.centerTextVertically}
                    onPress={() => this.props.goToProfile(this.props.profile.PublicKeyBase58Check, this.props.profile.Username)}
                    activeOpacity={1}>
                    <Image style={this.props.styles.profilePic} source={{ uri: this.props.profile.ProfilePic }} />
                </TouchableOpacity>

                <View style={[this.props.styles.iconContainer, { backgroundColor: '#00803c' }]}>
                    <FontAwesome style={[{ marginLeft: 1 }]} name="dollar" size={14} color="white" />
                </View>

                <View style={this.props.styles.textContainer}>
                    <TouchableOpacity
                        style={this.props.styles.centerTextVertically}
                        onPress={() => this.props.goToProfile(this.props.profile.PublicKeyBase58Check, this.props.profile.Username)}
                        activeOpacity={1}>
                        <Text style={[this.props.styles.usernameText, themeStyles.fontColorMain]}>{this.props.profile.Username} </Text>
                    </TouchableOpacity>

                    <Text style={[globalStyles.fontWeight500, themeStyles.fontColorMain]}>sent you BitClout</Text>
                </View>
            </TouchableOpacity>
        )
    }

};