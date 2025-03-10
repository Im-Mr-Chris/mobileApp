import { globals } from '../../globals';

const headers = {
    'content-type': 'application/json',
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.1 Safari/605.1.15'
};

const host = 'https://bitclout.com/api/v0/';

async function handleResponse(p_response: Response) {
    if (p_response.ok) {
        return p_response.json().catch(() => { });
    } else {
        let json = undefined;
        try {
            json = await p_response.json();
        } catch {
        }
        const error = new Error();
        (error as any).response = p_response;
        (error as any).json = json;
        (error as any).status = p_response.status;
        throw error;
    }
}

const get = (p_route: string, p_useHost = true, noCache = false) => {
    const newHeaders: any = headers;

    if (noCache) {
        newHeaders['cache-control'] = 'no-cache';
    }

    return fetch(
        p_useHost ? host + p_route : p_route,
        { headers: newHeaders }
    ).then(p_response => handleResponse(p_response));
};

const post = (p_route: string, p_body: any) => {
    return fetch(
        host + p_route,
        {
            headers: headers,
            method: 'POST',
            body: JSON.stringify(p_body)
        }
    ).then(async p_response => await handleResponse(p_response));
};

function getGlobalPosts(p_userKey: string, p_count: number, p_lastPostHash = '') {
    const route = 'get-posts-stateless';
    return post(
        route,
        {
            PostHashHex: p_lastPostHash,
            ReaderPublicKeyBase58Check: p_userKey,
            OrderBy: '',
            StartTstampSecs: null,
            PostContent: '',
            NumToFetch: p_count,
            FetchSubcomments: false,
            GetPostsForFollowFeed: false,
            GetPostsForGlobalWhitelist: true,
            AddGlobalFeedBool: false
        }
    );
}

function getFollowingPosts(p_userKey: string, p_count: number, p_lastPostHash = '') {
    const route = 'get-posts-stateless';
    return post(
        route,
        {
            PostHashHex: p_lastPostHash,
            ReaderPublicKeyBase58Check: p_userKey,
            OrderBy: '',
            StartTstampSecs: null,
            PostContent: '',
            NumToFetch: p_count,
            FetchSubcomments: false,
            GetPostsForFollowFeed: true,
            GetPostsForGlobalWhitelist: false,
            AddGlobalFeedBool: false
        }
    );
}

function getRecentPosts(p_userKey: string, p_count: number, p_lastPostHash = '') {
    const route = 'get-posts-stateless';
    return post(
        route,
        {
            PostHashHex: p_lastPostHash,
            ReaderPublicKeyBase58Check: p_userKey,
            OrderBy: '',
            StartTstampSecs: null,
            PostContent: '',
            NumToFetch: p_count,
            FetchSubcomments: false,
            GetPostsForFollowFeed: false,
            GetPostsForGlobalWhitelist: false,
            AddGlobalFeedBool: false
        }
    );
}

function likePost(p_userKey: string, p_postHash: string, isUnlike: boolean) {
    const route = 'create-like-stateless';

    return post(
        route,
        {
            ReaderPublicKeyBase58Check: p_userKey,
            LikedPostHashHex: p_postHash,
            IsUnlike: isUnlike,
            MinFeeRateNanosPerKB: getMinFeeRateNanosPerKB(),
            SeedInfo: null,
            Password: '',
            Sign: true,
            Validate: true,
            Broadcast: true
        }
    );
}

function sendDiamonds(p_userPublicKey: string, p_receiverPublicKey: string, p_postHashHex: string, p_diamondLevel: number) {
    const route = 'send-diamonds';

    return post(
        route,
        {
            DiamondLevel: p_diamondLevel,
            DiamondPostHashHex: p_postHashHex,
            MinFeeRateNanosPerKB: getMinFeeRateNanosPerKB(),
            ReceiverPublicKeyBase58Check: p_receiverPublicKey,
            SenderPublicKeyBase58Check: p_userPublicKey
        }
    );
}

function getProfile(p_userKeys: string[]) {
    const route = 'get-users-stateless';

    return post(
        route,
        {
            PublicKeysBase58Check: p_userKeys
        }
    );
}

function getProfileFollowers(p_userKey: string, p_userName: string, p_lastPublicKey: string, p_numToFetch: number) {
    const route = 'get-follows-stateless';
    return post(
        route,
        {
            PublicKeyBase58Check: p_userKey,
            GetEntriesFollowingUsername: true,
            username: p_userName,
            LastPublicKeyBase58Check: p_lastPublicKey,
            NumToFetch: p_numToFetch
        }
    );
}

function getProfileFollowing(p_userKey: string, p_userName: string, p_lastPublicKey: string, p_numToFetch: number) {
    const route = 'get-follows-stateless';
    return post(
        route,
        {
            PublicKeyBase58Check: p_userKey,
            GetEntriesFollowingUsername: false,
            username: p_userName,
            LastPublicKeyBase58Check: p_lastPublicKey,
            NumToFetch: p_numToFetch
        }
    );
}

function createPost(
    p_userKey: string,
    p_postText: string,
    p_imageUrls: string[],
    p_parentPostStakeId = '',
    p_recloutedPostHashHex = '',
    p_postHashHexToModify = '',
    p_videoLink = ''
) {
    const route = 'submit-post';

    return post(
        route,
        {
            UpdaterPublicKeyBase58Check: p_userKey,
            PostHashHexToModify: p_postHashHexToModify,
            ParentStakeID: p_parentPostStakeId,
            RepostedPostHashHex: p_recloutedPostHashHex,
            Title: '',
            BodyObj:
            {
                Body: p_postText,
                ImageURLs: p_imageUrls ? p_imageUrls : []
            },
            PostExtraData: {
                EmbedVideoURL: p_videoLink
            },
            Sub: '',
            CreatorBasisPoints: 0,
            StakeMultipleBasisPoints: 12500,
            IsHidden: false,
            MinFeeRateNanosPerKB: getMinFeeRateNanosPerKB(),
            SeedInfo: null,
            Password: '',
            Sign: true,
            Validate: true,
            Broadcast: true
        }
    );
}

function hidePost(p_userKey: string, p_postHashHex: string, p_bodyText: string, p_imageUrls: string[], p_recloutedPostHashHex: string) {
    const route = 'submit-post';

    return post(
        route,
        {
            UpdaterPublicKeyBase58Check: p_userKey,
            PostHashHexToModify: p_postHashHex,
            ParentStakeID: '',
            Title: '',
            BodyObj: {
                Body: p_bodyText,
                ImageURLs: p_imageUrls
            },
            Sub: '',
            CreatorBasisPoints: 0,
            StakeMultipleBasisPoints: 0,
            IsHidden: true,
            MinFeeRateNanosPerKB: getMinFeeRateNanosPerKB(),
            SeedInfo: null,
            Password: '',
            Sign: true,
            Validate: true,
            Broadcast: true,
            RepostedPostHashHex: p_recloutedPostHashHex
        }
    );
}

function submitTransaction(p_transactionHex: string) {
    const route = 'submit-transaction';

    return post(
        route,
        {
            TransactionHex: p_transactionHex
        }
    );
}

function getSingleProfile(p_username: string, publicKey?: string) {
    const route = 'get-single-profile';

    return post(
        route,
        {
            PublicKeyBase58Check: publicKey,
            Username: p_username
        }
    );
}

function getSingleProfileImage(publicKey: string) {
    const route = 'https://bitclout.com/api/v0/get-single-profile-picture/';
    return route + publicKey;
}

function getProfilePostsBatch(p_userPublicKey: string, p_username: string, p_numToFetch: number, p_lastPostHashHex = '') {
    const route = 'get-posts-for-public-key';

    return post(
        route,
        {
            LastPostHashHex: p_lastPostHashHex,
            NumToFetch: p_numToFetch,
            PublicKeyBase58Check: '',
            ReaderPublicKeyBase58Check: p_userPublicKey,
            Username: p_username
        }
    );
}

function getProfilePosts(p_userPublicKey: string, p_username: string, p_fetchUsersThatHODL: boolean) {
    const route = 'get-profiles';

    return post(
        route,
        {
            AddGlobalFeedBool: false,
            Description: '',
            FetchUsersThatHODL: p_fetchUsersThatHODL,
            ModerationType: '',
            NumToFetch: 1,
            OrderBy: 'newest_last_post',
            PublicKeyBase58Check: '',
            ReaderPublicKeyBase58Check: p_userPublicKey,
            Username: p_username,
            UsernamePrefix: ''
        }
    );
}

function getProfileHolders(p_username: string, p_numToFetch: number, p_lastPublicKey = '', p_fetchAll = false) {
    const route = 'get-hodlers-for-public-key';

    return post(
        route,
        {
            FetchAll: p_fetchAll,
            FetchHodlings: false,
            LastPublicKeyBase58Check: p_lastPublicKey,
            NumToFetch: p_numToFetch,
            PublicKeyBase58Check: '',
            Username: p_username
        }
    );
}

function getProfileDiamonds(p_publicKey: string) {
    const route = 'get-diamonds-for-public-key';

    return post(
        route,
        {
            PublicKeyBase58Check: p_publicKey
        }
    );
}

function searchProfiles(p_userKey: string, p_usernamePrefix: string, p_numToFetch = 20) {
    const route = 'get-profiles';

    return post(
        route,
        {
            AddGlobalFeedBool: false,
            Description: '',
            FetchUsersThatHODL: false,
            ModerationType: '',
            NumToFetch: p_numToFetch,
            OrderBy: '',
            PublicKeyBase58Check: '',
            ReaderPublicKeyBase58Check: p_userKey,
            Username: '',
            UsernamePrefix: p_usernamePrefix
        }
    );
}

function getLeaderBoard(p_userKey: string, p_numToFetch = 10) {
    const route = 'get-profiles';

    return post(
        route,
        {
            AddGlobalFeedBool: false,
            Description: '',
            FetchUsersThatHODL: false,
            ModerationType: 'leaderboard',
            NumToFetch: p_numToFetch,
            OrderBy: 'influencer_coin_price',
            PublicKeyBase58Check: '',
            ReaderPublicKeyBase58Check: p_userKey,
            Username: null,
            UsernamePrefix: null
        }
    );
}

function getNotifications(p_userKey: string, p_startIndex: number, p_count: number) {
    const route = 'get-notifications';

    return post(
        route,
        {
            FetchStartIndex: p_startIndex,
            NumToFetch: p_count,
            PublicKeyBase58Check: p_userKey
        }
    );
}

function getMessages(
    p_userKey: string,
    p_followersOnly: boolean,
    p_followingOnly: boolean,
    p_holdersOnly: boolean,
    p_holdingsOnly: boolean,
    p_numToFetch: number,
    p_sortAlgorithm: 'time' | 'holders' | 'clout' | 'followers',
    p_lastPublicKey: string) {
    const route = 'get-messages-stateless';

    return post(
        route,
        {
            FetchAfterPublicKeyBase58Check: p_lastPublicKey,
            FollowersOnly: p_followersOnly,
            FollowingOnly: p_followingOnly,
            HoldersOnly: p_holdersOnly,
            HoldingsOnly: p_holdingsOnly,
            NumToFetch: p_numToFetch,
            PublicKeyBase58Check: p_userKey,
            SortAlgorithm: p_sortAlgorithm
        }
    );
}

function sendMessage(p_senderPublicKey: string, p_recipientPublicKey: string, p_message: string) {
    const route = 'send-message-stateless';

    return post(
        route,
        {
            EncryptedMessageText: p_message,
            MinFeeRateNanosPerKB: getMinFeeRateNanosPerKB(),
            RecipientPublicKeyBase58Check: p_recipientPublicKey,
            SenderPublicKeyBase58Check: p_senderPublicKey,
        }
    );
}

function getExchangeRate() {
    const route = 'get-exchange-rate';
    return get(route, true, true);
}

function getSinglePost(p_userKey: string, p_postHash: string, p_fetchParents: boolean, p_commentOffset: number, commentLimit: number) {
    const route = 'get-single-post';
    return post(
        route,
        {
            PostHashHex: p_postHash,
            ReaderPublicKeyBase58Check: p_userKey,
            FetchParents: p_fetchParents,
            CommentOffset: p_commentOffset,
            CommentLimit: commentLimit,
            AddGlobalFeedBool: false
        }
    );
}

function getLikesForPost(p_userKey: string, p_postHash: string, limit: number, offset: number) {
    const route = 'get-likes-for-post';
    return post(
        route,
        {
            PostHashHex: p_postHash,
            ReaderPublicKeyBase58Check: p_userKey,
            Limit: limit,
            Offset: offset
        }
    );
}

function getRecloutersForPost(p_userKey: string, p_postHash: string, limit: number, offset: number) {
    const route = 'get-reposts-for-post';
    return post(
        route,
        {
            PostHashHex: p_postHash,
            ReaderPublicKeyBase58Check: p_userKey,
            Limit: limit,
            Offset: offset
        }
    );
}

function getQuotesForPost(p_userKey: string, p_postHash: string, limit: number, offset: number) {
    const route = 'get-quote-reposts-for-post';
    return post(
        route,
        {
            PostHashHex: p_postHash,
            ReaderPublicKeyBase58Check: p_userKey,
            Limit: limit,
            Offset: offset
        }
    );
}

function getDiamondSendersForPost(p_userKey: string, p_postHash: string, limit: number, offset: number) {
    const route = 'get-diamonds-for-post';
    return post(
        route,
        {
            PostHashHex: p_postHash,
            ReaderPublicKeyBase58Check: p_userKey,
            Limit: limit,
            Offset: offset
        }
    );
}

function createFollow(p_userKey: string, p_followedUserKey: string, p_isUnFollow: boolean) {
    const route = 'create-follow-txn-stateless';
    return post(
        route,
        {
            FollowedPublicKeyBase58Check: p_followedUserKey,
            FollowerPublicKeyBase58Check: p_userKey,
            MinFeeRateNanosPerKB: getMinFeeRateNanosPerKB(),
            IsUnfollow: p_isUnFollow
        }
    );
}

function blockUser(p_userKey: string, p_blockedUserKey: string, p_jwt: string, p_unblock: boolean) {
    const route = 'block-public-key';

    return post(
        route,
        {
            BlockPublicKeyBase58Check: p_blockedUserKey,
            PublicKeyBase58Check: p_userKey,
            JWT: p_jwt,
            Unblock: p_unblock
        }
    );
}

function markContactMessagesRead(p_publicKey: string, p_contactPublicKey: string, p_jwt: string) {
    const route = 'mark-contact-messages-read';

    return post(
        route,
        {
            UserPublicKeyBase58Check: p_publicKey,
            JWT: p_jwt,
            ContactPublicKeyBase58Check: p_contactPublicKey
        }
    );
}

function getAppState() {
    const route = 'get-app-state';

    return post(route, {});
}

async function uploadImage(p_publicKey: string, p_jwt: string, p_image: any) {
    const route = 'https://bitclout.com/api/v0/upload-image';

    const formData = new FormData();
    formData.append('file', p_image);
    formData.append('JWT', p_jwt);
    formData.append('UserPublicKeyBase58Check', p_publicKey);

    return fetch(
        route,
        {
            method: 'POST',
            body: formData,
            headers: {
                'accept': 'application/json',
                'Content-Type': 'multipart/form-data;',
            }
        }
    ).then(p_response => handleResponse(p_response));
}

async function uploadImageAndroid(p_publicKey: string, p_jwt: string, p_image: any) {
    const route = 'https://bitclout.com/api/v0/upload-image';
    const xhr = new XMLHttpRequest();
    xhr.open('POST', route);
    const formData = new FormData();
    formData.append('file', p_image);
    formData.append('JWT', p_jwt);
    formData.append('UserPublicKeyBase58Check', p_publicKey);

    xhr.send(formData);
    const promise = new Promise(
        (p_resolve, p_error) => {
            xhr.onreadystatechange = () => {
                if (xhr.readyState !== 4) {
                    return;
                }
                if (xhr.status === 200) {
                    p_resolve(JSON.parse(xhr.responseText));
                } else {
                    p_error({ error: xhr.responseText });
                }
            };
        }
    );

    return promise;
}

function getTikTokFullVideoId(p_videoId: string) {
    const route = 'get-full-tiktok-url';

    return post(
        route,
        {
            TikTokShortVideoID: p_videoId
        }
    );
}

function updateProfile(
    p_userKey: string,
    p_username = '',
    p_description = '',
    p_profilePic = '',
    p_founderRewards = 0
) {
    const route = 'update-profile';

    return post(
        route,
        {
            UpdaterPublicKeyBase58Check: p_userKey,
            ProfilePublicKeyBase58Check: '',
            NewUsername: p_username,
            NewDescription: p_description,
            NewProfilePic: p_profilePic,
            NewCreatorBasisPoints: p_founderRewards,
            NewStakeMultipleBasisPoints: 12500,
            IsHidden: false,
            MinFeeRateNanosPerKB: getMinFeeRateNanosPerKB()
        }
    );
}

function authorizeDerivedKey(
    publicKey: string,
    derivedPublicKey: string,
    accessSignature: string,
    expirationBlock: number,
    deleteKey: boolean
) {
    const route = 'authorize-derived-key';

    return post(
        route,
        {
            OwnerPublicKeyBase58Check: publicKey,
            DerivedPublicKeyBase58Check: derivedPublicKey,
            ExpirationBlock: expirationBlock,
            AccessSignature: accessSignature,
            DeleteKey: deleteKey,
            MinFeeRateNanosPerKB: 10000
        }
    );
}

function appendExtraDataToTransaction(
    transactionHex: string,
    derivedPublicKey: string
) {
    const route = 'append-extra-data';

    return post(
        route,
        {
            TransactionHex: transactionHex,
            ExtraData: {
                DerivedPublicKey: derivedPublicKey
            }
        }
    );
}

function getUsersDerivedKeys(
    publicKey: string
) {
    const route = 'get-user-derived-keys';

    return post(
        route,
        {
            PublicKeyBase58Check: publicKey
        }
    );
}

function checkFollowBack(publicKey: string, isFollowingPublicKey: string) {
    const route = 'is-following-public-key';

    return post(
        route,
        {
            PublicKeyBase58Check: publicKey,
            IsFollowingPublicKeyBase58Check: isFollowingPublicKey
        }
    );
}

function getMinFeeRateNanosPerKB() {
    return globals.derived ? 10000 : 1000;
}

export const api = {
    getGlobalPosts,
    getFollowingPosts,
    likePost,
    getProfile,
    getProfileFollowers,
    getProfileFollowing,
    createPost,
    hidePost,
    getProfilePosts,
    searchProfiles,
    getLeaderBoard,
    getNotifications,
    getMessages,
    sendMessage,
    getExchangeRate,
    getSinglePost,
    createFollow,
    blockUser,
    getAppState,
    submitTransaction,
    getSingleProfile,
    getSingleProfileImage,
    getProfilePostsBatch,
    getProfileHolders,
    sendDiamonds,
    getRecentPosts,
    getProfileDiamonds,
    uploadImage,
    uploadImageAndroid,
    getTikTokFullVideoId,
    updateProfile,
    markContactMessagesRead,
    getLikesForPost,
    getRecloutersForPost,
    getDiamondSendersForPost,
    getQuotesForPost,
    checkFollowBack,
    authorizeDerivedKey,
    appendExtraDataToTransaction,
    getUsersDerivedKeys
};
