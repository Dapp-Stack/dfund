<template>
  <v-container grid-list-xl>
    <v-layout align-center justify-center row>
      <v-flex>
        <v-data-table
          :headers="headers"
          :items="funds"
          class="elevation-1 mt-5"
        >
          <template slot="no-data">
            <v-alert :value="true" color="warning" icon="fa fa-warning" class="text-xs-center my-5">
              There is no funds to sign yet, why not adding one.
            </v-alert>
          </template>
          <template slot="items" slot-scope="props">
            <router-link tag="tr" class="tr-link" :to="`/funds/${props.item.address}`">
              <td>{{ props.item.title }}</td>
              <td>{{ props.item.expireOn | moment("dddd, MMMM Do YYYY, h:mm:ss a") }}</td>
              <td>{{ props.item.signers.length }}</td>
            </router-link>
          </template>
        </v-data-table>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script lang="ts">
import Vue from 'vue';
import { Action, State } from 'vuex-class';
import { Component, Watch } from 'vue-property-decorator';

@Component
export default class Funds extends Vue {
  public headers = [
    { text: 'Title', value: 'title' },
    { text: 'Expire On', value: 'expireOn' },
    { text: 'Signers', value: 'signers' },
  ];

  @State('list', { namespace: 'fund' }) private funds!: any[];
  @Action('list', { namespace: 'fund' }) private fetch!: () => void;

  public async mounted() {
    this.fetch();
  }
}
</script>

<style lang="scss" scoped>
.tr-link {
  cursor: pointer;
}
</style>