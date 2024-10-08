<template>
  <div class="row my-2">
    <div v-for="recording in recordings" :key="recording.filename" class="mb-3 col-lg-5 col-xl-4 col-xxl-4 col-md-10">
      <RecordingItem
          :recording="recording"
          @destroyed="destroyRecording"
          @bookmark="bookmark"
          :show-selection="false"
          :show-title="false"/>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { createClient } from '../services/api/v1/ClientFactory';
import { DatabaseRecording } from '../services/api/v1/StreamSinkClient';
import RecordingItem from '../components/RecordingItem.vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const recordings = ref<DatabaseRecording[]>([]);

// --------------------------------------------------------------------------------------
// Methods
// --------------------------------------------------------------------------------------

const removeItem = (recording: DatabaseRecording) => {
  const i = recordings.value.findIndex(r => r.filename === recording.filename);
  if (i !== -1) {
    recordings.value.splice(i, 1);
  }
};

const bookmark = (recording: DatabaseRecording) => {
  if (!recording.bookmark) {
    removeItem(recording);
  }
};

const destroyRecording = async (recording: DatabaseRecording) => {
  if (!window.confirm(t('crud.destroy', [ recording.filename ]))) {
    return;
  }

  try {
    const api = createClient();
    await api.recordings.recordingsDelete(recording.recordingId);
    removeItem(recording);
  } catch (ex) {
    alert(ex);
  }
};

// --------------------------------------------------------------------------------------
// Hooks
// --------------------------------------------------------------------------------------

onMounted(async () => {
  const api = createClient();
  const res = await api.recordings.bookmarksList();
  recordings.value = res.data;
});
</script>