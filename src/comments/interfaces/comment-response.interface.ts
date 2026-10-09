export interface AuthorView {
  username: string;
  bio: string;
  image: string;
  following: boolean;
}

export interface CommentView {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  body: string;
  author: AuthorView;
}

export interface SingleCommentResponse {
  comment: CommentView;
}

export interface MultipleCommentsResponse {
  comments: CommentView[];
}
