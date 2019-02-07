<template>
  <v-container grid-list-xl>
    <v-snackbar v-model="snackbar" bottom multi-line>
      Fund Signed
      <v-btn color="pink" flat @click="snackbar = false">
        Close
      </v-btn>
    </v-snackbar>
    <v-dialog v-model="loading" hide-overlay persistent width="300">
      <v-card color="primary" dark>
        <v-card-text>
          Please stand by while your transaction is mined
          <v-progress-linear
            indeterminate
            color="white"
            class="mb-0"
          ></v-progress-linear>
        </v-card-text>
      </v-card>
    </v-dialog>
    <v-layout v-if="fund" align-center justify-center row>
      <v-flex xs12>
        <v-card class="mt-5">
          <v-card-title>
            <v-icon large left>fa-header</v-icon>
            <span class="title font-weight-light">{{fund.title}}</span>
            <v-spacer></v-spacer>
            <p class="title font-weight-light">{{fund.signers.length}} signer(s)</p>
          </v-card-title>
          <v-card-text v-html="fund.description"></v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn v-if="!isSigner()" @click="sign" color="success" :disabled="loading" :loading="loading">
              <v-icon class="mr-2">fa-pencil</v-icon>
              <span>Sign (0.00014 PPT / ${{0.00014 * ethUsdPrice}})</span>
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script lang="ts">
import Vue from 'vue';
import { Action, State } from 'vuex-class';
import { Component, Watch } from 'vue-property-decorator';
import { Fund } from '@dfund/lib';

@Component
export default class ShowFund extends Vue {
  public fund: Fund | null = null;
  public snackbar = false;
  public loading = false;

  @Action('list', { namespace: 'fund' }) private fetch!: () => void;
  @Action('sign', { namespace: 'fund' }) private signFund!: (fund: Fund) => void;
  @State('list', { namespace: 'fund' }) private funds!: Fund[];
  @State('address', { namespace: 'identity' }) private address!: string;
  @State('ethUsdPrice') private ethUsdPrice!: number;

  public async mounted() {
    if (this.funds.length === 0) {
      await this.fetch();
    }
    this.fund = this.funds.find((p) => p.address === this.$route.params.address) || null;
  }

  public async sign() {
    if (!this.fund) {
      return;
    }
    this.loading = true;
    await this.signFund(this.fund);
    this.snackbar = true;
    this.loading = false;
  }

  public isSigner() {
    return this.fund && this.fund.signers.includes(this.address);
  }
}
</script>