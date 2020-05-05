import type { Option } from '@cometjs/core';
import { mapUnion, mapUnionWithDefault } from '../src/abstract';

type Scalars = {
  ID: string,
  String: string,
  Boolean: boolean,
  Int: number,
  Float: number,
  Date: any,
};

type Node = {
  id: Scalars['ID'],
};

enum Role {
  User = 'USER',
  Admin = 'ADMIN'
}

type User = Node & {
  __typename?: 'User',
  id: Scalars['ID'],
  username: Scalars['String'],
  email: Scalars['String'],
  role: Role,
  nickname?: Scalars['String'] | undefined,
};

type Chat = Node & {
  __typename?: 'Chat',
  id: Scalars['ID'],
  users: User[],
  messages: ChatMessage[],
};

type ChatMessage = Node & {
  __typename?: 'ChatMessage',
  id: Scalars['ID'],
  content: Scalars['String'],
  time: Scalars['Date'],
  user: User,
};

type SearchResult = User | Chat | ChatMessage;

const result = {} as SearchResult;
const optionalResult = null as Option<SearchResult>;

// $ExpectType ChatMessage[]
const a = mapUnion(result, {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
  User: [] as ChatMessage[],
  Chat: result => result.messages,
  ChatMessage: result => [result],
});

// $ExpectType Role
const b = mapUnionWithDefault(result, {
  User: result => result.role,
  _: Role.User,
});

// $ExpectType string
const c = mapUnionWithDefault(result, {
  User: result => result.nickname ?? 'Anonymous',
  _: 'Anonymous',
});

// $ExpectType string | null
const d = mapUnionWithDefault(optionalResult, {
  User: user => user.id,
  Chat: chat => chat.id,
  ChatMessage: message => message.id,
  _: () => null,
});

// $ExpectType "User" | "Chat" | "ChatMessage"
const e = mapUnion(result, {
  User: user => user.__typename,
  Chat: chat => chat.__typename,
  ChatMessage: message => message.__typename,
});

// $ExpectType "User" | "NonUser"
const f = mapUnionWithDefault(optionalResult, {
  User: user => user.__typename,
  _: 'NonUser' as const,
});
