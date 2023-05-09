import { Reducer } from 'react';
import { BasicUser } from '../../utils/types';

export type AuthProviderStateType = {
  isUserLoggedIn: boolean;
  user: BasicUser | undefined;
};

export type RequestStatusType = 'initial-loading' | 'loading' | 'success';

export type AuthContextType = {
  state: AuthProviderStateType;
  dispatch: (action: AuthProviderAction) => void;
};

export type AuthProviderAction =
  | {
      type: 'sign-in';
      payload: {
        uuid?: string;
      };
    }
  | {
      type: 'logout';
    }
  | {
      type: 'set-user';
      payload: {
        user: any;
      };
    };

export type AuthProviderReducer = Reducer<
  AuthProviderStateType,
  AuthProviderAction
>;
