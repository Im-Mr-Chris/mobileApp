import React from 'react';
import { Text, StyleSheet, View, TouchableOpacity } from 'react-native';
import { RouteProp } from '@react-navigation/core';
import { ParamListBase } from '@react-navigation/routers';
import { StackNavigationProp } from '@react-navigation/stack';
import { Post } from '@types';
import { themeStyles } from '@styles/globalColors';
import { PostComponent } from '@components/post/post.component';
import { AntDesign, Feather } from '@expo/vector-icons';

interface Props {
    navigation: StackNavigationProp<ParamListBase>;
    route: RouteProp<ParamListBase, 'Draft'>;
    draftPost: Post;
    handleDeletePost: (postHashHex: string) => void;
    draftPosts: Post[];
}

interface State {
    isLoading: boolean;
    draftPost: Post;
}

export default class DraftPostComponentComponent extends React.Component<Props, State> {

    private _isMounted = false;

    constructor(props: Props) {
        super(props);

        this.state = {
            draftPost: this.props.draftPost,
            isLoading: false,
        };

        this.goToEditPost = this.goToEditPost.bind(this);
        this.handleDeletePost = this.handleDeletePost.bind(this);
    }

    componentDidMount(): void {
        this._isMounted = true;
    }

    componentWillUnmount(): void {
        this._isMounted = false;
    }

    private goToEditPost(): void {
        this.props.navigation.push(
            'CreatePost',
            {
                newPost: false,
                editPost: true,
                editedPost: this.props.draftPost,
                isDraftPost: true,
                draftPosts: this.props.draftPosts
            }
        );
    }

    private handleDeletePost(): void {
        this.props.handleDeletePost(this.props.draftPost.PostHashHex);
    }

    render(): JSX.Element {
        return <View style={[styles.container, themeStyles.containerColorMain]}>
            <PostComponent
                actionsDisabled={true}
                isDraftPost={true}
                route={this.props.route}
                navigation={this.props.navigation}
                post={this.props.draftPost}
            />
            <View style={styles.row}>
                <TouchableOpacity
                    onPress={this.goToEditPost}
                    style={[styles.nftButtonContainer, themeStyles.verificationBadgeBackgroundColor]}
                >
                    <Feather name="edit" size={17} color="white" />
                    <Text style={styles.buttonText}>Edit Post</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={this.handleDeletePost}
                    style={[styles.nftButtonContainer, themeStyles.likeHeartBackgroundColor]}
                >
                    <AntDesign name="delete" size={18} color="white" />
                    <Text style={styles.buttonText}>Delete</Text>
                </TouchableOpacity>
            </View>
        </View>;
    }
}

const styles = StyleSheet.create(
    {
        container: {
            flex: 1
        },
        nftButtonContainer: {
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            width: '40%',
            height: 35,
            borderRadius: 6,
            marginVertical: 10,
            alignSelf: 'center',
        },
        buttonText: {
            color: 'white',
            marginLeft: 8,
            fontSize: 15
        },
        row: {
            flexDirection: 'row',
            justifyContent: 'space-around',
            alignItems: 'center',
            marginHorizontal: 15
        }
    }
);
