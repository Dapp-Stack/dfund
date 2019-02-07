<template>
  <div>
    <v-snackbar v-model="addFundSnackbar" bottom multi-line>
      Fund Created
      <v-btn color="pink" flat @click="addFundSnackbar = false">
        Close
      </v-btn>
    </v-snackbar>
    <v-toolbar app>
      <v-toolbar-title class="headline text-uppercase">
        <span>DFund</span>
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn flat to="/">
        <v-icon class="mr-2">fa-archive</v-icon>
        <span>List Funds</span>
      </v-btn>
      <v-dialog
        v-if="address"
        v-model="addFundDialog"
        fullscreen
        hide-overlay
        transition="dialog-bottom-transition"
      >
        <v-btn slot="activator" color="primary">
          <v-icon class="mr-2">fa-plus</v-icon>
          <span>Add Fund</span>
        </v-btn>
        <AddFund @close="addFundDialog=false" @showSuccess="addFundSnackbar=true"/>
      </v-dialog>
      <v-menu v-if="address" :close-on-content-click="false" :nudge-bottom="50" bottom>
        <v-btn slot="activator" fab small color="indigo" dark>
          <v-icon>fa-user</v-icon>
        </v-btn>
        <v-card>
          <v-list>
            <v-list-tile avatar>
              <v-list-tile-avatar>
                <Blockies :address="address"/>
              </v-list-tile-avatar>

              <v-list-tile-content>
                <v-list-tile-title>{{ensName}}</v-list-tile-title>
              </v-list-tile-content>
            </v-list-tile>
          </v-list>

          <v-divider></v-divider>
          <v-list>
            <v-list-tile>
              <v-list-tile-title>{{address}}</v-list-tile-title>
            </v-list-tile>
          </v-list>
          
          <v-divider></v-divider>
          
          <v-layout column>
            <v-flex class="mb-2" v-for="(value, key) in balances" :key="key">
              <v-list-tile>
                <v-list-tile-content>
                  <v-list-tile-title class="text-xs-center">{{value}} {{key}}</v-list-tile-title>
                  <v-list-tile-sub-title class="text-xs-center">${{prices[key] * value}}</v-list-tile-sub-title>
                </v-list-tile-content>
              </v-list-tile>
            </v-flex>
          </v-layout>

          <v-divider></v-divider>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="success" flat to="/wallet">
              <v-icon class="mr-2">fa-money</v-icon>
              Buy Token
            </v-btn>
            <v-btn color="error" flat @click="logout">
              <v-icon class="mr-2">fa-sign-out</v-icon>
              Logout
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-menu>
      <v-btn v-else color="success" to="/connect">
        <v-icon class="mr-2">fa-user</v-icon>
        <span>Connect</span>
      </v-btn>
    </v-toolbar>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { Action, State } from 'vuex-class';
import AddFund from './addFund.vue';
import Blockies from './blockies.vue';
import { Balances } from '../types';

@Component({
  components: { AddFund, Blockies },
})
export default class Header extends Vue {
  public addFundDialog = false;
  public addFundSnackbar = false;

  @Action('destroy', { namespace: 'identity' }) private destroyIdentity!: () => void;
  @State('address', { namespace: 'identity' }) private address!: string;
  @State('ensName', { namespace: 'identity' }) private ensName!: string;
  @State('balances', { namespace: 'identity' }) private balances!: Balances;

  @Action('destroy', { namespace: 'wallet' }) private destroyWallet!: () => void;

  @State('prices') private prices!: object;

  public async logout() {
    await this.destroyIdentity();
    await this.destroyWallet();
  }
}
</script>
