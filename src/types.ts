export type AndroidApp =
  | 'home'
  | 'weather'
  | 'email'
  | 'spotify'
  | 'twitter'
  | 'maps'
  | 'settings'
  | 'smart_home'
  | 'messages';

export type AgentAction =
  | 'open_app'
  | 'tap'
  | 'type'
  | 'scroll'
  | 'wait'
  | 'read_content'
  | 'speak';

export interface AgentStep {
  id: string;
  action: AgentAction;
  target: string;
  value?: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
}

export interface AgentRun {
  id: string;
  command: string;
  timestamp: string;
  status: 'idle' | 'running' | 'completed' | 'failed';
  steps: AgentStep[];
  currentStepIndex: number;
}

export interface Email {
  id: string;
  sender: string;
  subject: string;
  body: string;
  date: string;
  read: boolean;
}

export interface Tweet {
  id: string;
  user: string;
  handle: string;
  avatar: string;
  text: string;
  likes: number;
  isLiked: boolean;
  repliesCount: number;
  replies: { user: string; text: string; date: string }[];
}

export interface Message {
  id: string;
  sender: 'user' | 'contact';
  text: string;
  timestamp: string;
}

export interface ChatThread {
  id: string;
  contactName: string;
  avatar: string;
  messages: Message[];
  unread: boolean;
}

export interface DeviceState {
  livingRoomLight: {
    on: boolean;
    brightness: number;
  };
  thermostat: {
    temp: number;
  };
  frontDoorLock: {
    locked: boolean;
  };
}

export interface SystemSettings {
  darkMode: boolean;
  wifi: boolean;
  bluetooth: boolean;
  dnd: boolean;
}
