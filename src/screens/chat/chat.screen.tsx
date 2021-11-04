import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Text, SectionList, Dimensions, KeyboardAvoidingView, Platform, Keyboard, TextInput, KeyboardEvent, ActivityIndicator } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { ContactWithMessages, Message } from '@types';
import { MessageComponent } from '@components/messageComponent';
import { globals, settingsGlobals } from '@globals';
import { api, getMessageText } from '@services';
import { themeStyles } from '@styles';
import { signing } from '@services/authorization/signing';
import CloutFeedLoader from '@components/loader/cloutFeedLoader.component';
import { RouteProp } from '@react-navigation/native';

interface Section {
    date: string;
    data: Message[];
}

type RouteParams = {
    Chat: {
        loadMessages: boolean;
        contactWithMessages: ContactWithMessages;
    }
};

interface Props {
    route: RouteProp<RouteParams, 'Chat'>
}

export function ChatScreen({ route }: Props) {

    const [isLoading, setLoading] = useState<boolean>(true);
    const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
    const [noMoreMessages, setNoMoreMessages] = useState(false);
    const [contactWithMessagesState, setContactWithMessagesState] = useState<ContactWithMessages>({} as ContactWithMessages);
    const [sections, setSections] = useState<Section[]>([]);
    const [textInputHeight, setTextInputHeight] = useState<number>(35);
    const [messageText, setMessageText] = useState<string>('');
    const [paddingTop, setPaddingTop] = useState<number>(0);
    const [isKeyboardAvoidingViewEnabled, setIsKeyboardAvoidingViewEnabled] = useState<boolean>(true);

    const sectionListRef: React.RefObject<SectionList> = useRef(null);
    const lastVisitedIndex = useRef<number>(15);
    const isMounted = useRef<boolean>(true);
    const contactWithMessagesRef = useRef<ContactWithMessages>({} as ContactWithMessages);

    useEffect(
        () => {
            const loadMessages = route.params?.loadMessages;
            let contactWithMessages = route.params?.contactWithMessages;
            if (loadMessages) {
                api.getMessages(
                    globals.user.publicKey,
                    false,
                    false,
                    false,
                    false,
                    25,
                    'time',
                    ''
                ).then(
                    response => {
                        const messages: ContactWithMessages[] = response?.OrderedContactsWithMessages ? response.OrderedContactsWithMessages : [];
                        const newContactWithMessages = messages.find(
                            message => message?.PublicKeyBase58Check === contactWithMessages.PublicKeyBase58Check
                        );
                        if (newContactWithMessages) {
                            contactWithMessages = newContactWithMessages;
                        }
                        renderMessages(contactWithMessages);
                    }
                ).catch(error => globals.defaultHandleError(error));
            } else {
                renderMessages(contactWithMessages);
            }
            const unsubscribeShowKeyboard = Keyboard.addListener('keyboardWillShow', keyboardWillShow);
            const unsubscribeHideKeyboard = Keyboard.addListener('keyboardWillHide', keyboardWillHide);
            return () => {
                isMounted.current = false;
                unsubscribeShowKeyboard.remove();
                unsubscribeHideKeyboard.remove();
            };
        },
        []
    );

    useEffect(
        () => {
            if (paddingTop !== 0) {
                scrollToBottom(false);
            }

            return () => {
                isMounted.current = false;
            };
        },
        [paddingTop]
    );

    const keyboardWillShow = (event: KeyboardEvent): void => {
        setPaddingTop(event.endCoordinates.height - 25);
    };

    const keyboardWillHide = () => {
        setPaddingTop(0);
    };

    function initializeSections(contactWithMessages: ContactWithMessages): void {
        const groupedMessages = groupMessagesByDay(contactWithMessages);
        const keys = Object.keys(groupedMessages);
        const newSections: Section[] = [];

        for (const key of keys) {
            const messages = groupedMessages[key];

            const section = {
                date: key,
                data: messages
            };

            for (let i = 0; i < messages.length; i++) {
                if (i === messages.length - 1 || messages[i].IsSender !== messages[i + 1].IsSender) {
                    messages[i].LastOfGroup = true;
                }
            }
            newSections.push(section);
        }
        handleMessagesDecryption(newSections);
    }

    function renderMessages(contactWithMessages: ContactWithMessages): void {
        const contactWithMessagesCopy = JSON.parse(JSON.stringify(contactWithMessages));
        contactWithMessagesRef.current = contactWithMessages;
        const batchSize = 15;
        const messagesCount = contactWithMessages.Messages.length;
        lastVisitedIndex.current = messagesCount - batchSize;
        let slicedMessages = contactWithMessagesCopy.Messages.slice(lastVisitedIndex.current);
        if (batchSize > messagesCount) {
            slicedMessages = contactWithMessagesCopy.Messages;
            setIsKeyboardAvoidingViewEnabled(false);
            setNoMoreMessages(true);
        }
        contactWithMessagesCopy.Messages = slicedMessages;
        setContactWithMessagesState(contactWithMessagesCopy);
        initializeSections(contactWithMessagesCopy);
    }

    function loadMoreMessages() {
        if (noMoreMessages || isLoadingMore) {
            return;
        }
        if (isMounted) {
            setIsLoadingMore(true);
        }
        const contactWithMessages = JSON.parse(JSON.stringify(contactWithMessagesState));
        const batchSize = 15;
        const startIndex = Math.max(lastVisitedIndex.current - batchSize, 0);
        const slicedMessages = contactWithMessagesRef.current.Messages.slice(startIndex, lastVisitedIndex.current);
        if (startIndex === 0) {
            setNoMoreMessages(true);
        }
        lastVisitedIndex.current = startIndex;
        contactWithMessages.Messages = slicedMessages.concat(contactWithMessages.Messages);
        setContactWithMessagesState(contactWithMessages);
        initializeSections(contactWithMessages);
    }

    async function handleMessagesDecryption(sections: Section[]): Promise<void> {
        let decryptedMessages: string[] = [];
        const promises: Promise<Message | undefined>[] = [];
        for (const section of sections) {
            for (const message of section.data) {
                const promise = new Promise<Message | undefined>(
                    (p_resolve) => {
                        getMessageText(message).then(
                            (response: any) => {
                                p_resolve(response);
                            }
                        ).catch(() => p_resolve(undefined));
                    }
                );
                promises.push(promise);
            }
        }
        decryptedMessages = await Promise.all(promises) as any;
        let i, j, k = 0;
        for (i = 0; i < sections.length; i++) {
            for (j = 0; j < sections[i].data.length; j++) {
                sections[i].data[j].DecryptedText = decryptedMessages[k];
                k++;
            }
        }
        setSections(sections);
        setLoading(false);
        setIsLoadingMore(false);
    }

    function groupMessagesByDay(contactWithMessages: ContactWithMessages): { [key: string]: Message[] } {
        const dayMessagesMap: { [key: string]: Message[] } = {};
        if (contactWithMessages.Messages?.length > 0) {
            for (let i = contactWithMessages.Messages.length - 1; i >= 0; i--) {
                const messageDate = new Date(contactWithMessages.Messages[i].TstampNanos / 1000000);
                const formattedMessageDate = isToday(messageDate) ?
                    'Today' :
                    messageDate.toLocaleDateString(
                        'en-US',
                        { weekday: 'short', month: 'short', day: 'numeric' }
                    );

                if (!dayMessagesMap[formattedMessageDate]) {
                    dayMessagesMap[formattedMessageDate] = [];
                }
                dayMessagesMap[formattedMessageDate].push(contactWithMessages.Messages[i]);
            }
        }
        return dayMessagesMap;
    }

    function isToday(date: Date): boolean {
        const today = new Date();
        return date.getDate() == today.getDate() &&
            date.getMonth() == today.getMonth() &&
            date.getFullYear() == today.getFullYear();
    }

    async function onSendMessage(): Promise<void> {
        const contactWithMessages = route.params?.contactWithMessages;
        const timeStampNanos = new Date().getTime() * 1000000;

        const message: Message = {
            DecryptedText: messageText,
            EncryptedText: '',
            IsSender: true,
            RecipientPublicKeyBase58Check: contactWithMessages.PublicKeyBase58Check,
            SenderPublicKeyBase58Check: globals.user.publicKey,
            TstampNanos: timeStampNanos,
            LastOfGroup: true,
            V2: true
        };

        let todaySection: Section = {
            date: 'Today',
            data: []
        };

        if (sections.length > 0 && sections[0].date === 'Today') {
            todaySection = sections[0];
        }

        if (todaySection.data.length > 0) {
            const lastMessage: Message = todaySection.data[todaySection.data.length - 1];
            if (lastMessage.IsSender) {
                lastMessage.LastOfGroup = false;
            }
        } else {
            sections.unshift(todaySection);
        }

        todaySection.data.unshift(message);
        const Messages = [...contactWithMessagesState.Messages, message];
        setContactWithMessagesState((prevState) => ({ ...prevState, Messages }));

        if (sections.length === 0) {
            const newSection = [
                {
                    date: 'Today',
                    data: [message]
                }
            ];
            setSections(newSection);
        } else {
            setSections(sections);
        }

        try {
            const encryptedMessage = await signing.encryptShared(contactWithMessages.PublicKeyBase58Check, messageText);
            setMessageText('');
            const response = await api.sendMessage(globals.user.publicKey, contactWithMessages.PublicKeyBase58Check, encryptedMessage);
            const transactionHex = response.TransactionHex;
            const signedTransactionHex = await signing.signTransaction(transactionHex);
            await api.submitTransaction(signedTransactionHex);
        } catch (exception) {
            globals.defaultHandleError(exception);
        }
    }

    function scrollToBottom(animated: boolean): void {
        if (sectionListRef?.current && sections?.length > 0 && isKeyboardAvoidingViewEnabled) {
            sectionListRef.current.scrollToLocation({ itemIndex: 0, sectionIndex: 0, animated });
        }
    }

    const keyExtractor = (item: Message, index: number) => `${item.SenderPublicKeyBase58Check}_${item.TstampNanos}_${index.toString()}`;
    const renderItem = ({ item }: { item: Message }) => <View style={{ flexDirection: 'row' }}>
        <MessageComponent message={item} />
    </View>;

    const renderSectionDate = ({ section: { date } }: any): JSX.Element => <View style={[styles.dateContainer, themeStyles.chipColor]}>
        <Text style={[styles.dateText, themeStyles.fontColorMain]}>{date}</Text>
    </View>;

    const renderFooter = isLoadingMore ? <ActivityIndicator color={themeStyles.fontColorMain.color} /> : <></>;
    const keyboardBehavior = Platform.OS === 'ios' ? 'position' : 'height';

    return isLoading ?
        <CloutFeedLoader />
        :
        <KeyboardAvoidingView
            behavior={keyboardBehavior}
            keyboardVerticalOffset={65}
        >
            <View style={[styles.container, { paddingTop: paddingTop }]}>
                <SectionList
                    inverted
                    style={{ transform: [{ scaleY: -1 }] }}
                    contentContainerStyle={styles.flatListStyle}
                    ref={sectionListRef}
                    onScrollToIndexFailed={() => { undefined; }}
                    showsVerticalScrollIndicator={false}
                    initialNumToRender={5}
                    invertStickyHeaders={false}
                    onEndReachedThreshold={0.01}
                    onEndReached={loadMoreMessages}
                    ListFooterComponent={renderFooter}
                    sections={sections}
                    keyExtractor={keyExtractor}
                    renderItem={renderItem}
                    renderSectionFooter={renderSectionDate}
                />
                <View style={[styles.textInputContainer, { height: textInputHeight + 45 }]}>
                    <TextInput
                        style={[styles.textInput, { height: textInputHeight }]}
                        onContentSizeChange={(event) => {
                            if (isMounted) {
                                setTextInputHeight(
                                    Math.max(Math.min(event.nativeEvent.contentSize.height, 100), 35)
                                );
                            }
                        }}
                        onFocus={() => scrollToBottom(true)}
                        onChangeText={setMessageText}
                        value={messageText}
                        blurOnSubmit={false}
                        multiline={true}
                        maxLength={1000}
                        placeholder={'Type a message'}
                        placeholderTextColor={'rgba(241,241,242,0.43)'}
                        keyboardAppearance={settingsGlobals.darkMode ? 'dark' : 'light'}
                    >
                    </TextInput>

                    <TouchableOpacity style={styles.sendButton} onPress={onSendMessage}>
                        <Ionicons name="send" size={32} color="rgba(241,241,242,0.43)" />
                    </TouchableOpacity>
                </View>
            </View>
        </KeyboardAvoidingView>;
}

const styles = StyleSheet.create(
    {
        container: {
            marginTop: 1,
            width: Dimensions.get('window').width,
            height: '100%'
        },
        flatListStyle: {
            flexGrow: 1,
            justifyContent: 'flex-end',
            paddingTop: 5,
            paddingBottom: 10,
        },
        dateContainer: {
            alignSelf: 'center',
            borderRadius: 8,
            paddingVertical: 2,
            paddingHorizontal: 6,
            marginVertical: 4,
            borderWidth: 1,
            borderColor: 'black'
        },
        dateText: {
            fontSize: 10,
            fontWeight: '700'
        },
        textInputContainer: {
            flexDirection: 'row',
            alignItems: 'flex-end',
            paddingBottom: 36,
            paddingTop: 8,
            backgroundColor: settingsGlobals.darkMode ?
                themeStyles.containerColorMain.backgroundColor : '#1e2428'
        },
        textInput: {
            minHeight: 35,
            borderRadius: 25,
            marginLeft: 6,
            marginRight: 12,
            paddingHorizontal: 10,
            color: 'white',
            flex: 1,
            fontSize: 16,
            backgroundColor: settingsGlobals.darkMode ?
                themeStyles.containerColorSub.backgroundColor : '#33383b'
        },
        sendButton: {
            marginRight: 5
        },
    }
);
