<template>
  <v-card>
    <v-dialog v-model="loading" hide-overlay persistent width="300">
      <v-card color="primary" dark>
        <v-card-text>Please stand by while your transaction is mined
          <v-progress-linear indeterminate color="white" class="mb-0"></v-progress-linear>
        </v-card-text>
      </v-card>
    </v-dialog>
    <v-form v-model="valid">
      <v-toolbar dark color="primary">
        <v-btn icon dark @click="$emit('close')">
          <v-icon>fa-close fa-2x</v-icon>
        </v-btn>
        <v-toolbar-title>Add Fund</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-toolbar-items>
          <v-btn
            :disabled="!valid || loading"
            :loading="loading"
            color="success"
            large
            @click="create"
          >
            <v-icon class="mr-2">fa-plus</v-icon>
            Create (0.0015 PPT / ${{0.0015 * prices.ETH}})
          </v-btn>
        </v-toolbar-items>
      </v-toolbar>
      <v-stepper v-model="el" alt-labels>
        <v-stepper-header>
          <v-divider></v-divider>

          <v-stepper-step :complete="el > 1" step="1">Fund details</v-stepper-step>

          <v-divider></v-divider>

          <v-stepper-step :complete="el > 2" step="2">Strategy</v-stepper-step>

          <v-divider></v-divider>

          <!-- <v-stepper-step step="3">Democracy</v-stepper-step> -->
        </v-stepper-header>

        <v-stepper-items>
          <v-stepper-content step="1">
            <v-card-text>
              <v-container grid-list-xl>
                <v-layout wrap>
                  <v-flex xs12 sm8>
                    <v-text-field
                      v-model="name"
                      :rules="nameRules"
                      :counter="50"
                      label="Fund Name"
                      prepend-icon="fa-money"
                      class="mt-5"
                      required
                    ></v-text-field>
                    <v-text-field
                      v-model="symbol"
                      :rules="symbolRules"
                      :counter="5"
                      label="Symbol"
                      prepend-icon="fa-sort-alpha-asc"
                      class="mt-5"
                      required
                    ></v-text-field>
                  </v-flex>
                </v-layout>
              </v-container>
            </v-card-text>
            <v-btn color="primary" @click="el = 2">Continue</v-btn>

            <v-btn flat>Cancel</v-btn>
          </v-stepper-content>

          <v-stepper-content step="2">
            <v-layout row>
              <v-flex xs12 sm6 offset-sm3>
                <v-list two-line>
                  <template v-for="(item, index) in items">
                    <v-subheader v-if="item.header" :key="item.header">{{ item.header }}</v-subheader>

                    <v-divider v-else-if="item.divider" :key="index" :inset="item.inset"></v-divider>

                    <v-list-tile v-else :key="item.token_symbol" avatar @click>
                      <v-list-tile-avatar>
                        <img :src="item.avatar">
                      </v-list-tile-avatar>

                      <v-list-tile-content>
                        <v-list-tile-title v-html="item.token_symbol"></v-list-tile-title>
                        <v-list-tile-sub-title v-html="item.description"></v-list-tile-sub-title>
                      </v-list-tile-content>
                      <v-text-field
                        v-model="percentage"
                        :rules="percentageRules"
                        type="number"
                        suffix="%"
                        @onChange="tokens[token_symbol] = percentage"
                      ></v-text-field>
                    </v-list-tile>
                  </template>
                </v-list>
              </v-flex>
            </v-layout>
            <v-btn color="primary" @click="el = 3">Create</v-btn>

            <v-btn flat>Cancel</v-btn>
          </v-stepper-content>

          <!-- <v-stepper-content step="3">
            <v-card class="mb-5" color="grey lighten-1" height="200px"></v-card>

            <v-btn color="primary" @click="el = 1">Continue</v-btn>

            <v-btn flat>Cancel</v-btn>
          </v-stepper-content>-->
        </v-stepper-items>
      </v-stepper>
    </v-form>
  </v-card>
</template>

<script lang="ts">
import Vue from "vue";
import { Action, State } from "vuex-class";
import { Component, Watch, Prop } from "vue-property-decorator";
import { Fund } from "@dfund/lib";

const nameRequired = (v: string) => !!v || "Fund name is required";
const nameLength = (v: string) =>
  (v && v.length <= 50) || "Fund name must be less than 50 characters";
const symbolRequired = (v: string) => !!v || "Fund symbol is required";
const symbolLength = (v: string) =>
  (v && v.length <= 5) || "Fund symbol must be less than 5 characters";
const percentageMaxValue = (v: number) =>
  (v && v <= 100) || "The maximum percentage is 100%";

@Component
export default class AddFund extends Vue {
  public valid: boolean = false;
  public name: string = "";
  public nameRules = [nameRequired, nameLength];
  public symbol: string = "";
  public symbolRules = [symbolRequired, symbolLength];
  public percentageRules = [percentageMaxValue];
  public loading = false;
  public el: number = 0;
  public tokens = {};
  public items = [
    { header: "Available Tokens" },
    {
      avatar: "https://cdn.vuetifyjs.com/images/lists/1.jpg",
      token_symbol: "AAPL",
      description:
        "<span class='text--primary'>$3.022</span> &mdash; Apple stocks tokenApple stocks tokenApple stocks tokenApple stocks tokenApple stocks token"
    },
    { divider: true, inset: true },
    {
      avatar: "https://cdn.vuetifyjs.com/images/lists/2.jpg",
      token_symbol: "DAS",
      description:
        "<span class='text--primary'>$5.022</span> &mdash; Das tokenApple stocks tokenApple stocks tokenApple stocks tokenApple stocks token"
    },
    { divider: true, inset: true },
    {
      avatar: "https://cdn.vuetifyjs.com/images/lists/3.jpg",
      token_symbol: "SNT",
      description:
        "<span class='text--primary'>$1.022</span> &mdash; Status tokenApple stocks tokenApple stocks tokenApple stocks tokenApple stocks token"
    }
  ];

  @Action("create", { namespace: "fund" }) private createFund!: (
    fund: Fund
  ) => void;
  @State("prices") private prices!: any;

  public async create() {
    const fund = {
      name: this.name,
      symbol: this.symbol
    };
  }
}
</script>

<style lang="scss">
$color-black: #000000;
$color-white: #ffffff;
$color-grey: #dddddd;

.menubar {
  margin-bottom: 1rem;
  transition: visibility 0.2s 0.4s, opacity 0.2s 0.4s;

  &.is-hidden {
    visibility: hidden;
    opacity: 0;
  }

  &.is-focused {
    visibility: visible;
    opacity: 1;
    transition: visibility 0.2s, opacity 0.2s;
  }

  &__button {
    font-weight: bold;
    display: inline-flex;
    background: transparent;
    border: 0;
    color: $color-black;
    padding: 0.2rem 0.5rem;
    margin-right: 0.2rem;
    border-radius: 3px;
    cursor: pointer;

    &:hover {
      background-color: rgba($color-black, 0.05);
    }

    &.is-active {
      background-color: rgba($color-black, 0.1);
    }
  }
}
</style>
