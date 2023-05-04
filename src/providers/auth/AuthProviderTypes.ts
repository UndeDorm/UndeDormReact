import { Reducer } from 'react';

export type AuthProviderStateType = {
  isUserLoaded: boolean;
  isUserLoggedIn: boolean;
  user: any;
};

export type AuthContextType = {
  state: AuthProviderStateType;
  dispatch: (action: AuthProviderAction) => void;
};

export type AuthProviderAction =
  | {
      type: 'sign-in';
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
