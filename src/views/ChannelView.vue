<template>
  <LoadIndicator :busy="busy">
    <BusyOverlay :visible="busyOverlay"/>
    <div ref="upload" style="display: none" class="modal modal-dialog modal-dialog-centered" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header bg-primary text-white">
            <h5 class="modal-title">Uploading Video</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <h5>
              Progress: {{ (uploadProgress * 100).toFixed(0) }}%
            </h5>
            <div class="progress">
              <div class="progress-bar progress-bar-animated progress-bar-striped bg-warning" role="progressbar" :style="{width: `${uploadProgress*100}%`}" aria-valuemax="1" aria-valuemin="0" aria-valuenow="0.4"></div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-warning" @click="cancelUpload">Cancel Upload</button>
          </div>
        </div>
      </div>
    </div>

    <nav class="navbar fixed-bottom navbar-light bg-light border-info border-top">
      <div class="container-fluid justify-content-between">
        <div class="btn-group dropup" v-if="!areItemsSelected">
          <button type="button" class="btn btn-primary dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
            Options
          </button>
          <ul class="dropdown-menu">
            <li>
              <button type="button" class="dropdown-item d-flex justify-content-between" @click="clickFile">
                <input ref="file" name="file" v-show="false" accept="video/mp4" @change="submit" type="file">
                <span>Upload video</span>
                <i class="bi text-primary bi-upload"/>
              </button>
            </li>
            <li>
              <button type="button" class="dropdown-item d-flex justify-content-between">
                <span>Edit channel</span>
                <i class="bi bi-pencil text-info"/>
              </button>
            </li>
            <li>
              <button type="button" class="dropdown-item d-flex justify-content-between" @click="deleteChannel">
                <span class="me-2">Delete channel</span>
                <i class="bi text-danger bi-trash3-fill"/>
              </button>
            </li>
            <li>
              <div class="dropdown-item form-check form-switch d-flex justify-content-between" v-if="selectedRecordings.length === 0">
                <label class="form-check-label m-0 p-0 me-2" for="flexSwitchCheckDefault">Enabled?</label>
                <input class="form-check-input m-0 my-1 p-0" type="checkbox" role="switch" id="flexSwitchCheckDefault" :checked="!channel?.isPaused" @change="pauseChannel($event.target as HTMLInputElement)">
              </div>
            </li>
          </ul>
        </div>

        <div class="btn-group">
          <button type="button" v-if="areItemsSelected" class="btn btn-danger justify-content-between me-2" @click="destroySelection">
            <span class="me-2">Delete selection</span>
            <i class="bi bi-trash3-fill"/>
          </button>
          <button type="button" v-if="areItemsSelected" class="btn btn-primary justify-content-between me-2" @click="cancelSelection">
            <span class="me-2">Cancel</span>
            <i class="bi bi-stop-fill"/>
          </button>
          <button v-if="selectedRecordings.length === 0" type="button" class="btn d-flex justify-content-between" :class="{'btn-warning' : channel?.fav, 'btn-secondary' : !channel?.fav}" @click="bookmark">
            <span class="me-2">Bookmark</span>
            <i style="color: black" class="bi" :class="{'bi-star-fill' : channel?.fav, 'bi-star' : !channel?.fav}"/>
          </button>
        </div>
      </div>
    </nav>

    <div class="d-flex align-items-center mb-3 justify-content-between pb-2 border-bottom">
      <div class="text-primary  fs-5 fw-bolder">{{ channel?.displayName }}</div>
      <div class="d-flex align-items-center fs-5">
        <button type="button" class="btn btn-secondary" disabled>Count: {{ channel?.recordingsCount }}</button>
        <button type="button" class="btn btn-secondary ms-2" disabled>
          Size: {{ (channel?.recordingsSize! / 1024 / 1024 / 1024).toFixed(1) }}GB
        </button>
      </div>
    </div>

    <div class="row mb-5">
      <div v-for="recording in channel?.recordings" :key="recording.filename" class="mb-3 col-lg-5 col-xl-4 col-xxl-4 col-md-10">
        <RecordingItem
            @destroyed="destroyRecording"
            @checked="selectRecording"
            :select="selectedRecordings.some(x => x.recordingId === recording.recordingId)"
            :show-selection="true"
            :recording="recording"
            :show-title="false"/>
      </div>
    </div>
  </LoadIndicator>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import RecordingItem from '../components/RecordingItem.vue';
import { createClient } from '../services/api/v1/ClientFactory';
import { DatabaseRecording } from '../services/api/v1/StreamSinkClient';
import {
  DatabaseChannel as ChannelResponse,
  DatabaseRecording as RecordingResponse
} from '../services/api/v1/StreamSinkClient';
import { AxiosError, CancelTokenSource } from 'axios';
import { onBeforeRouteLeave, useRoute, useRouter } from 'vue-router';
import { useStore } from '../store';
import { createSocket, MessageType, SocketManager } from '../utils/socket.ts';
import BusyOverlay from '../components/BusyOverlay.vue';
import { ToastMutation } from '../store/modules/toast.ts';
import { ChannelMutation } from '../store/modules/channel.ts';
import LoadIndicator from '../components/LoadIndicator.vue';
import { JobAction, JobMutation } from '../store/modules/job.ts';
import { RecordingAction } from '../store/modules/recording.ts';

// --------------------------------------------------------------------------------------
// Declarations
// --------------------------------------------------------------------------------------

const route = useRoute();
const router = useRouter();
const store = useStore();

// Elements
const file = ref<HTMLInputElement | null>(null);
const upload = ref<HTMLDivElement | null>(null);

const selectedRecordings = ref<RecordingResponse[]>([]);
const uploadProgress = ref(0);
const busyOverlay = ref(false);
const busy = ref(true);
const channel = ref<ChannelResponse | null>(null);
const channelId = (+route.params.id) as unknown as number;
let cancellationToken: CancelTokenSource | null = null;
const showModal = ref(false);

// --------------------------------------------------------------------------------------
// Computes
// --------------------------------------------------------------------------------------

const areItemsSelected = computed(() => selectedRecordings.value.length > 0);

// --------------------------------------------------------------------------------------
// Methods
// --------------------------------------------------------------------------------------

const pauseChannel = (element: HTMLInputElement): void => {
  const client = createClient();
  const fn = element.checked ? client.channels.resumeCreate : client.channels.pauseCreate;
  fn(channel.value!.channelId).then(() => {
    store.commit(element.checked ? ChannelMutation.Resume : ChannelMutation.Pause, channel.value?.channelId);
    store.commit(ToastMutation.Add, {
      title: element.checked ? 'Channel resume' : 'Channel pause',
      message: `Channel ${channel.value?.displayName}`
    });
  }).catch(err => store.commit('error', err));
};

const clickFile = () => file.value?.click();

const cancelSelection = () => selectedRecordings.value = [];

const destroySelection = async () => {
  if (!window.confirm('Delete selection?')) {
    return;
  }
  const api = createClient();
  for (let i = 0; i < selectedRecordings.value.length; i++) {
    const rec = selectedRecordings.value[i];
    await api.recordings.recordingsDelete(rec.recordingId);
    const j = channel.value?.recordings?.findIndex(r => r.filename === rec.filename);
    if (j && j !== -1) {
      channel.value?.recordings?.splice(j, 1);
    }
  }
  selectedRecordings.value = [];
};

const selectRecording = (data: { checked: boolean, recording: RecordingResponse }) => {
  if (data.checked) {
    selectedRecordings.value.push(data.recording);
  } else {
    selectedRecordings.value = selectedRecordings.value.filter(x => x.recordingId !== data.recording.recordingId);
  }
};

const deleteChannel = () => {
  if (window.confirm(`Delete channel "${channelId}"?`)) {
    busyOverlay.value = true;
    const api = createClient();
    api.channels.channelsDelete(channelId)
        .then(() => store.commit(ChannelMutation.Destroy, channelId))
        .catch(err => alert(err))
        .finally(() => {
          busyOverlay.value = false;
          store.commit(ToastMutation.Add, {
            title: 'Channel deleted',
            message: `Channel ${channel.value?.displayName}`
          });
          router.replace('/');
        });
  }
};

const cancelUpload = () => {
  if (cancellationToken) {
    cancellationToken.cancel();
  }
  showModal.value = false;
};

const submit = () => {
  const el = file as unknown as HTMLInputElement;
  if (el.files && el.files!.length > 0) {
    uploadProgress.value = 0;
    showModal.value = true;
    const api = createClient();
    const [req, cancelToken] = api.channelUpload(channelId, el.files![0], pcent => uploadProgress.value = pcent);
    req.then(res => {
      uploadProgress.value = 0;
      channel.value?.recordings?.unshift(res.data);
      cancellationToken = null;
      showModal.value = false;
      // clear old file
      el.value = '';
    }).catch(res => {
      alert(res.error);
      showModal.value = false;
    });
    cancellationToken = cancelToken;
  }
};

const destroyRecording = (recording: RecordingResponse) => {
  if (channel.value?.recordings) {
    for (let i = 0; i < channel.value?.recordings?.length; i += 1) {
      if (channel.value?.recordings && channel.value?.recordings[i].recordingId === recording.recordingId) {
        store.dispatch(RecordingAction.Destroy, recording);
        channel.value?.recordings?.splice(i, 1);
        break;
      }
    }
  }
};

const bookmark = () => {
  const api = createClient();
  const fn = channel.value!.fav ? api.channels.unfavPartialUpdate : api.channels.favPartialUpdate;

  fn(channel.value!.channelId)
      .then(() => channel.value!.fav = !channel.value!.fav)
      .catch(err => store.commit('error', err));
};

let socket: SocketManager | null = null;

// --------------------------------------------------------------------------------------
// Hooks
// --------------------------------------------------------------------------------------

onBeforeRouteLeave((to, from) => {
  socket?.close();
});

onMounted(async () => {
  try {
    socket = createSocket();
    socket?.connect();

    socket.on(MessageType.RecordingAdd, recording => {
      const r = recording as DatabaseRecording;
      console.log(r);
    });

    window.scrollTo(0, 0);

    const api = createClient();
    const res = await api.channels.channelsDetail(channelId);
    channel.value = res.data;
    busy.value = false;
  } catch (error: any) {
    const err = error as AxiosError;
    alert(err.response?.data);
    router.back();
  }
});
</script>
