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
import {
  AuthContextType,
  AuthProviderAction,
  AuthProviderReducer,
  AuthProviderStateType,
} from './AuthProviderTypes';

interface AuthProviderProps {}

export const INITIAL_STATE: AuthProviderStateType = {
  isUserLoaded: true,
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
      return {
        ...state,
        isUserLoggedIn: true,
        isUserLoaded: false,
      };
    }
    case 'logout': {
      return {
        ...state,
        isUserLoggedIn: false,
        user: undefined,
        isUserLoaded: true,
      };
    }
    case 'set-user': {
      return { ...state, user: action.payload.user, isUserLoaded: true };
    }
  }
};

const AuthProvider: React.FC<PropsWithChildren<AuthProviderProps>> = ({
  children,
}) => {
  const initialReducerState = useMemo(
    () => ({
      isUserLoaded: true,
      isUserLoggedIn: false,
      user: undefined,
    }),
    []
  );

  const [uuid, setUuid] = React.useState('Guest');
  const [state, dispatch] = useReducer<AuthProviderReducer>(
    authReducer,
    initialReducerState
  );

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        dispatch({ type: 'sign-in' });
        setUuid(user.uid);
      }
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (state.isUserLoggedIn) {
      getUser(uuid).then((data) => {
        if (data) {
          dispatch({ type: 'set-user', payload: { user: data } });
        } else {
          dispatch({ type: 'logout' });
        }
      });
    }
  }, [state.isUserLoggedIn, uuid]);

  const contextValue = useMemo(() => ({ state, dispatch }), [state, dispatch]);

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export default AuthProvider;
