import '../styles/globals.css';
import type { AppProps } from 'next/app';
import AuthProvider from '../src/providers/auth/AuthProvider';
import React from 'react';
import { getUser } from '../src/firebase/database';
import cookie from 'cookie';
import Topbar from '../src/components/Topbar/Topbar';

const App = ({
  Component,
  pageProps,
  uuid,
  profile,
}: AppProps & {
  uuid: string | undefined;
  profile: any;
}) => {
  return (
    <AuthProvider user={profile} isLogged={!!uuid}>
      <Topbar />
      <Component {...pageProps} />
    </AuthProvider>
  );
};

App.getInitialProps = async ({
  Component,
  ctx,
}: {
  Component: any;
  ctx: any;
}) => {
  let uuid;
  let profile;
  let cookies: any = {};

  try {
    if (ctx.req) {
      if (typeof window === 'undefined' && ctx.req.headers.cookie) {
        cookies = cookie.parse(ctx.req.headers.cookie);
      }
    }

    uuid = cookies.uuid ?? undefined;

    profile = uuid ? await getUser(uuid) : undefined;
  } catch (error) {
    console.log(error);

    uuid = undefined;
    profile = undefined;
  }

  return {
    pageProps: {
      ...(Component.getInitialProps
        ? await Component.getInitialProps(ctx)
        : {}),
    },
    uuid: uuid,
    profile: profile,
  };
};

export default App;
