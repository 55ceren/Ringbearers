export type User = {
    _id: string;
    username: string;
    password?: string;
    points: number;
    profilePhoto?: string;
    ownedAvatars?: string[];
    ownedBackgrounds?: string[];
    selectedAvatar?: string;
    selectedBackground?: string;
    favoriteQuotes?: string[];
    blacklistedQuotes?: { quoteId: string; reason: string }[];
};