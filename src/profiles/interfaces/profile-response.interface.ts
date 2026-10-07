export interface ProfileResponse {
  profile: {
    username: string;
    bio: string;
    image: string;
    following: boolean;
  };
}
