import React from 'react';
import { View, StyleSheet, Text, Switch } from 'react-native';
import { themeStyles } from '@styles';
import { SelectListControl } from '@controls/selectList.control';
import * as SecureStore from 'expo-secure-store';
import { constants } from '@globals/constants';
import { globals } from '@globals/globals';
import { eventManager } from '@globals/injector';
import { EventType, ToggleCloutCastFeedEvent, ToggleHideNFTsEvent } from '@types';
import CloutFeedLoader from '@components/loader/cloutFeedLoader.component';

export enum HiddenNFTType {
    Posts = 'Post',
    Details = 'Details',
}

enum FeedType {
    Hot = 'Hot',
    Global = 'Global',
    Following = 'Following',
    Recent = 'Recent',
}

interface State {
    isLoading: boolean;
    isCloutCastEnabled: boolean;
    areNFTsHidden: boolean;
    hiddenNFTType: HiddenNFTType;
    feed: FeedType;
}

export class FeedSettingsScreen extends React.Component<Record<string, never>, State>{

    private _isMounted = false;

    constructor(props: Record<string, never>) {
        super(props);

        this.state = {
            isLoading: true,
            isCloutCastEnabled: true,
            feed: FeedType.Global,
            areNFTsHidden: false,
            hiddenNFTType: HiddenNFTType.Details
        };

        this.toggleCloutCastFeed = this.toggleCloutCastFeed.bind(this);
        this.onFeedTypeChange = this.onFeedTypeChange.bind(this);
        this.initScreen();
    }

    componentDidMount(): void {
        this._isMounted = true;
    }

    componentWillUnmount(): void {
        this._isMounted = false;
    }

    private toggleCloutCastFeed(): void {
        const newValue = !this.state.isCloutCastEnabled;
        this.setState({ isCloutCastEnabled: newValue });

        const event: ToggleCloutCastFeedEvent = { active: newValue };
        eventManager.dispatchEvent(EventType.ToggleCloutCastFeed, event);
        const key = globals.user.publicKey + constants.localStorage_cloutCastFeedEnabled;
        SecureStore.setItemAsync(key, String(newValue)).catch(() => undefined);
    }

    private toggleHideNFTOption(): void {
        const newValue = !this.state.areNFTsHidden;
        this.setState({ areNFTsHidden: newValue });

        const event: ToggleHideNFTsEvent = { hidden: newValue };
        eventManager.dispatchEvent(EventType.ToggleHideNFTs, event);
        const key = globals.user.publicKey + constants.localStorage_nftsHidden;
        SecureStore.setItemAsync(key, String(newValue)).catch(() => undefined);
    }

    private onFeedTypeChange(type: FeedType): void {
        this.setState({ feed: type });

        const key = globals.user.publicKey + constants.localStorage_defaultFeed;
        SecureStore.setItemAsync(key, String(type)).catch(() => undefined);
    }

    private onHiddenNFTTypeChange(type: HiddenNFTType): void {
        this.setState({ hiddenNFTType: type });

        const key = globals.user.publicKey + constants.localStorage_hiddenNFTType;
        SecureStore.setItemAsync(key, String(type)).catch(() => undefined);
    }

    private async initScreen(): Promise<void> {
        const feedKey = globals.user.publicKey + constants.localStorage_defaultFeed;
        const feed = await SecureStore.getItemAsync(feedKey).catch(() => undefined) as FeedType;

        const nftTypeKey = globals.user.publicKey + constants.localStorage_hiddenNFTType;
        const hiddenNFTType = await SecureStore.getItemAsync(nftTypeKey).catch(() => undefined) as HiddenNFTType;

        const key = globals.user.publicKey + constants.localStorage_cloutCastFeedEnabled;
        const isCloutCastEnabledString = await SecureStore.getItemAsync(key).catch(() => undefined);

        const nftKey = globals.user.publicKey + constants.localStorage_nftsHidden;
        const areNFTsHidden = await SecureStore.getItemAsync(nftKey).catch(() => undefined);

        if (this._isMounted) {
            this.setState(
                {
                    isCloutCastEnabled: isCloutCastEnabledString === 'true',
                    areNFTsHidden: areNFTsHidden === 'true',
                    feed: feed ? feed : FeedType.Global,
                    hiddenNFTType: hiddenNFTType ? hiddenNFTType : HiddenNFTType.Details,
                    isLoading: false,
                }
            );
        }
    }

    render(): JSX.Element {

        if (this.state.isLoading) {
            return <CloutFeedLoader />;
        }

        return <View style={[styles.container, themeStyles.containerColorMain]} >
            <View style={themeStyles.containerColorMain}>
                {
                    globals.readonly ? undefined :
                        <View style={[styles.cloutCastFeedSettingsContainer, themeStyles.borderColor]}>
                            <Text style={[styles.cloutCastFeedSettingsText, themeStyles.fontColorMain]}>CloutCast Feed</Text>
                            <Switch
                                trackColor={{ false: themeStyles.switchColor.color, true: '#007ef5' }}
                                thumbColor={'white'}
                                ios_backgroundColor={themeStyles.switchColor.color}
                                onValueChange={() => this.toggleCloutCastFeed()}
                                value={this.state.isCloutCastEnabled}
                            />
                        </View>
                }
                {
                    globals.readonly ? undefined :
                        <View style={[styles.cloutCastFeedSettingsContainer, themeStyles.borderColor]}>
                            <Text style={[styles.cloutCastFeedSettingsText, themeStyles.fontColorMain]}>Hide NFTs</Text>
                            <Switch
                                trackColor={{ false: themeStyles.switchColor.color, true: '#007ef5' }}
                                thumbColor={'white'}
                                ios_backgroundColor={themeStyles.switchColor.color}
                                onValueChange={() => this.toggleHideNFTOption()}
                                value={this.state.areNFTsHidden}
                            />
                        </View>
                }
                {
                    this.state.areNFTsHidden &&
                    <SelectListControl
                        style={[styles.selectList, themeStyles.borderColor]}
                        options={[
                            {
                                name: 'Only hide NFT details',
                                value: HiddenNFTType.Details
                            },
                            {

                                name: 'Hide posts completely',
                                value: HiddenNFTType.Posts
                            },
                        ]}
                        value={this.state.hiddenNFTType}
                        onValueChange={(value: string | string[]) => this.onHiddenNFTTypeChange(value as HiddenNFTType)}
                    />
                }
                <View>
                    <Text style={[styles.defaultFeedTitle, themeStyles.fontColorMain]}>Default Feed</Text>
                </View>
                <SelectListControl
                    style={[styles.selectList, themeStyles.borderColor]}
                    options={[
                        {
                            name: 'Hot',
                            value: FeedType.Hot
                        },
                        {
                            name: 'Global',
                            value: FeedType.Global
                        },
                        {
                            name: 'Following',
                            value: FeedType.Following
                        },
                        {
                            name: 'Recent',
                            value: FeedType.Recent
                        }
                    ]}
                    value={this.state.feed}
                    onValueChange={(value: string | string[]) => this.onFeedTypeChange(value as FeedType)}
                />
            </View>
        </View>;
    }
}

const styles = StyleSheet.create(
    {
        container: {
            flex: 1,
        },
        cloutCastFeedSettingsContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 15,
            borderBottomWidth: 1
        },
        cloutCastFeedSettingsText: {
            fontWeight: '600',
            fontSize: 16
        },
        selectList: {
            borderBottomWidth: 1
        },
        defaultFeedTitle: {
            marginTop: 15,
            marginBottom: 5,
            fontSize: 18,
            paddingLeft: 15,
            fontWeight: '700'
        }
    }
);
