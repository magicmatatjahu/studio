import React from 'react'
import App from 'next/app'
import AppContext from '../contexts/AppContext'
import clientEvents from '../lib/client-events';
import '../css/tailwind.css'

class AsyncApiStudio extends App {
  static async getInitialProps({ ctx }) {
    if (!ctx || !ctx.req) return {}

    let user;

    if (ctx.req.user && ctx.req.user.id) {
      user = await ctx.req.studio.users.getUserPublicInfo(ctx.req.user.id)
    }

    return {
      context: {
        user,
        url: {
          full: ctx.req.url,
          query: ctx.req.query,
          path: ctx.req.path,
        },
        ui: ctx.req.studio.ui,
      },
    }
  }

  render() {
    if (typeof window !== 'undefined') {
      console.log('\n\n\nlol\n\n\n\n')
      clientEvents.emit('page:render');
    }

    const { Component, pageProps, context } = this.props

    return (
      <AppContext.Provider value={context || {}}>
        <Component {...pageProps} />
      </AppContext.Provider>
    )
  }
}

export default AsyncApiStudio
