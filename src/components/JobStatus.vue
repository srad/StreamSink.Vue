<template>
  <button @click="router.push('/jobs')" type="button" class="d-flex position-relative me-2 btn btn-info">
    <span class="me-2">{{ props.totalCount }}</span> <span class="me-2">{{ t('menu.jobs') }}</span>
  </button>
</template>

<script setup lang="ts">
import { defineProps } from 'vue';
import { DatabaseJob } from '../services/api/v1/StreamSinkClient.ts';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const router = useRouter();
const props = defineProps<{ jobs: DatabaseJob[], totalCount: number }>();
</script>
