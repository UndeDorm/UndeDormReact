import { onAuthStateChanged } from '@firebase/auth';
import React, {
  createContext,
  PropsWithChildren,
  useEffect,
  useMemo,
  useReducer,
} from 'react';
import { getUser } from '../../firebase/database';
import { auth } from '../../firebase/firebase';
import { BasicUser } from '../../utils/types';
import {
  AuthContextType,
  AuthProviderAction,
  AuthProviderReducer,
  AuthProviderStateType,
} from './AuthProviderTypes';
import Cookies from 'js-cookie';

interface AuthProviderProps {
  isLogged: boolean;
  user?: BasicUser;
}

export const INITIAL_STATE: AuthProviderStateType = {
  isUserLoggedIn: false,
  user: undefined,
};

export const AuthContext = createContext({
  state: INITIAL_STATE,
  dispatch: () => {},
} as AuthContextType);

const authReducer = (state = INITIAL_STATE, action: AuthProviderAction) => {
  switch (action.type) {
    case 'sign-in': {
      Cookies.set('uuid', action?.payload?.uuid);
      return {
        ...state,
        isUserLoggedIn: true,
      };
    }
    case 'logout': {
      Cookies.remove('uuid');
      return {
        ...state,
        isUserLoggedIn: false,
        user: undefined,
      };
    }
    case 'set-user': {
      return { ...state, user: action.payload.user };
    }
  }
};

const AuthProvider: React.FC<PropsWithChildren<AuthProviderProps>> = ({
  isLogged,
  user,
  children,
}) => {
  const initialReducerState = useMemo(
    () => ({
      isUserLoggedIn: isLogged,
      user: user,
    }),
    [isLogged, user]
  );

  const [state, dispatch] = useReducer<AuthProviderReducer>(
    authReducer,
    initialReducerState
  );

  console.log('ap', isLogged);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        dispatch({ type: 'sign-in', payload: { uuid: user.uid } });
      }
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (state.isUserLoggedIn) {
      getUser(Cookies.get('uuid')).then((data) => {
        if (data) {
          dispatch({ type: 'set-user', payload: { user: data } });
        }
      });
    }
  }, [state.isUserLoggedIn]);

  const contextValue = useMemo(() => ({ state, dispatch }), [state, dispatch]);

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export default AuthProvider;
