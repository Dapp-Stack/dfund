import Vue from 'vue';
import Router from 'vue-router';
import Funds from './views/Funds.vue';

Vue.use(Router);

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'funds',
      component: Funds,
    },
    {
      path: '/funds/:address',
      name: 'fund',
      component: () => import(/* webpackChunkName: "wallet" */ './views/ShowFund.vue'),
    },
    {
      path: '/connect',
      name: 'connect',
      component: () => import(/* webpackChunkName: "connect" */ './views/Connect.vue'),
    },
    {
      path: '/wallet',
      name: 'wallet',
      component: () => import(/* webpackChunkName: "wallet" */ './views/Wallet.vue'),
    },
  ],
});
