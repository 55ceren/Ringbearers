export type User = {
    _id: string;
    username: string;
    password?: string; // alleen intern
    points: number;
};
