<template>
  <div>
    <ModalConfirmDialog :show="showConfirmRecording" @cancel="showConfirmRecording=false" @confirm="record">
      <template #header>
        <span v-if="isRecording">Stop Recording</span>
        <span v-else>Resume Recording</span>
      </template>
      <template #body>
        <div v-if="isRecording">
          Do you want to stop recording?
        </div>
        <div v-else>
          Do you want to continue recording?
        </div>
      </template>
    </ModalConfirmDialog>

    <nav class="navbar navbar-dark navbar-expand-lg fixed-top m-0 d-flex bg-primary">
      <div class="container-fluid">
        <AppBrand class="mr-auto" :title="title"/>

        <span class="text-danger fw-bold d-none d-sm-inline">
          <i v-if="heartBeatNextUpdate>=0" class="bi blink bi-heart-pulse-fill"/>
          <i v-else class="bi bi-heart-pulse"></i>
        </span>

        <div class="offcanvas offcanvas-end bg-dark" :class="{'show': showNav}" data-bs-backdrop="static" tabindex="-1" aria-labelledby="collapsibleNavbarLabel" id="collapsibleNavbar">
          <div class="offcanvas-header bg-primary text-white">
            <AppBrand class="mr-auto" :title="title"/>
            <button type="button" class="btn-close btn-close-white" @click="showNav = !showNav"></button>
          </div>
          <div class="offcanvas-body">
            <ul class="navbar-nav justify-content-end flex-grow-1">
              <li class="nav-item" style="cursor: pointer" v-for="link in props.routes" :key="link.url" @click="() => {showNav=false; router.push(link.url);}">
                <a :class="{active: route.path === link.url}" @click="collapseNav=true" class="nav-link">
                  <span data-bs-dismiss="offcanvas" data-bs-target="#collapsibleNavbar">{{ link.title }}</span>
                </a>
              </li>
              <li class="nav-item d-flex align-items-center">
                <DiskStatus :pcent="diskInfo.pcent"/>
              </li>
              <li class="nav-item d-none d-lg-block">
                <RecordingControls :jobs="jobs" :total-count="jobsCount" :recording="isRecording" @add="emit('add')" @record="showConfirmRecording=true" :show-logout="showLogout" @logout="emit('logout')"/>
              </li>
            </ul>
          </div>
        </div>

        <div class="d-lg-none">
          <RecordingControls :jobs="jobs" :total-count="jobsCount" :recording="isRecording" @add="emit('add')" @record="showConfirmRecording=true" :show-logout="showLogout" @logout="emit('logout')"/>
        </div>

        <button class="navbar-toggler d-l-none" type="button" @click="showNav = !showNav">
          <span class="navbar-toggler-icon"></span>
        </button>
      </div>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { computed, defineEmits, defineProps, onMounted, reactive, ref, watch } from 'vue';
import { createClient } from '../../services/api/v1/ClientFactory';
import DiskStatus from '../DiskStatus.vue';
import RecordingControls from '../RecordingControls.vue';
import AppBrand from '../AppBrand.vue';
import { useRoute, useRouter } from 'vue-router';
import { useStore } from '../../store';
import { createSocket, MessageType } from '../../utils/socket.ts';
import ModalConfirmDialog from '../modals/ModalConfirmDialog.vue';
import { ChannelMutation } from "../../store/modules/channel.ts";

// --------------------------------------------------------------------------------------
// Props
// --------------------------------------------------------------------------------------

const props = defineProps<{
  routes: { icon: string, url: string, title: string }[]
  title: string
  showLogout: boolean
}>();

// --------------------------------------------------------------------------------------
// Emits
// --------------------------------------------------------------------------------------

const emit = defineEmits<{
  (e: 'add'): void
  (e: 'logout'): void
}>();

// --------------------------------------------------------------------------------------
// Declarations
// --------------------------------------------------------------------------------------

const diskInfo = reactive({ avail: '', pcent: '', size: '', used: '' });
const collapseNav = ref(true);
const isRecording = ref(false);
const heartBeatNextUpdate = ref<number>(-1);
const route = useRoute();
const store = useStore();
const showNav = ref(false);
const showConfirmRecording = ref(false);

const router = useRouter();
const socket = createSocket();

let thread: undefined | ReturnType<typeof setInterval> = undefined;

// --------------------------------------------------------------------------------------
// Computes
// --------------------------------------------------------------------------------------

const jobs = computed(() => store.getters['job/getOpen']);
const jobsCount = computed(() => store.state.job.jobsCount);
const loggedIn = computed(() => store.getters['auth/isLoggedIn']);

// --------------------------------------------------------------------------------------
// Methods
// --------------------------------------------------------------------------------------

const query = async () => {
  const api = createClient();
  const res = await Promise.all([ api.isRecording(), api.info.diskList() ]);

  isRecording.value = res[0];
  const diskRes = res[1];
  diskInfo.avail = diskRes.data.availFormattedGb!;
  diskInfo.pcent = diskRes.data.pcent!;
  diskInfo.size = diskRes.data.sizeFormattedGb!;
  diskInfo.used = diskRes.data.usedFormattedGb!;
};

const record = async () => {
  try {
    const api = createClient();
    if (isRecording.value) {
      await api.recorder.pauseCreate();
      store.commit(ChannelMutation.Stop);
      isRecording.value = false;
    } else {
      await api.recorder.resumeCreate();
      isRecording.value = true;
    }
  } catch (err) {
    console.error(err);
  } finally {
    showConfirmRecording.value = false;
  }
};

const connector = async (isLoggedIn: boolean) => {
  if (isLoggedIn) {
    socket.connect();

    socket.on(MessageType.HeartBeat, nextUpdate => {
      heartBeatNextUpdate.value = nextUpdate as number;
      const id = setInterval(() => {
        heartBeatNextUpdate.value -= 1;
        if (heartBeatNextUpdate.value <= 0) {
          clearInterval(id);
        }
      }, 1000);
    });

    await query();
    // The catch stops the polling when the query is rejected because of 401 unauthorized.
    thread = setInterval(async () => {
      try {
        await query();
      } catch (e) {
        clearInterval(thread);
      }
    }, 1000 * 10);

  } else {
    socket.close();
  }
};

// --------------------------------------------------------------------------------------
// Watchers
// --------------------------------------------------------------------------------------

watch(route, () => collapseNav.value = true);
watch(loggedIn, connector);

onMounted(() => {
  connector(loggedIn.value);
});
</script>
