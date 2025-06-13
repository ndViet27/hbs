<script setup>
import { ref, onMounted, computed, watch } from "vue";
import { useAppStore } from "@/stores";
const props = defineProps({
  pageInput: {
    type: Number,
    default: 0,
  },
  pageCount: {
    type: Number,
    default: 0,
  },
  total: {
    type: Number,
    default: 0,
  },
  currentNumberPage: {
    type: Number,
    default: 15,
  },
  showTong: {
    type: Boolean,
    default: true,
  },
  listNumberPage: {
    type: Array,
    default: [],
  },
});

const appStore = useAppStore();
const emit = defineEmits(["changePage", "changeNumberPage"]);
const currentPage = ref(0);
const currentPagePagination = ref(1);
const listPage = ref([]);
const listNumberPage = ref(props.listNumberPage && props.listNumberPage.length > 0 ? props.listNumberPage : [
  {
    name: "10",
    value: 10,
  },
  {
    name: "15",
    value: 15,
  },
  {
    name: "30",
    value: 30,
  },
  {
    name: "50",
    value: 50,
  },
  {
    name: "100",
    value: 100,
  }
]);
const type = ref("");
const breakpointName = computed(() => appStore.getBreakpointName);
const currentNumberPage = ref(props.currentNumberPage);
const prevPage = function () {
  currentPage.value -= 1;
  currentPagePagination.value = currentPage.value;
};
const nextPage = function () {
  currentPage.value += 1;
  currentPagePagination.value = currentPage.value;
};
const firstPage = function () {
  currentPage.value = 1;
  currentPagePagination.value = currentPage.value;
};
const lastPage = function () {
  currentPage.value = props.pageCount;
  currentPagePagination.value = currentPage.value;
};

watch(
  () => props.pageCount,
  (newPageCount) => {
    let items = [];
    for (let i = 1; i <= newPageCount; i++) {
      let item = {
        name: "Trang" + " " + i,
        value: i,
      };
      items.push(item);
    }
    listPage.value = items;
  },
  { immediate: true }
);

watch(
  () => props.pageInput,
  (newPageCount) => {
    currentPage.value = newPageCount;
    currentPagePagination.value = newPageCount;
  },
  { immediate: true }
);

watch(currentPagePagination, async (newPagePagination, oldPagePagination) => {
  currentPage.value = newPagePagination;
  emit("changePage", currentPage);
});

const updatePage = function (value) {
  currentPage.value = value;
  currentPagePagination.value = value;
  emit("changePage", currentPage);
};

const updateNumberPage = function (value) {
  currentNumberPage.value = value;
  emit("changeNumberPage", currentNumberPage);
};

watch(
  () => props.currentNumberPage,
  (newNumberPage) => {
    // Check if the current number page exists in the list
    const exists = listNumberPage.value.some(item => item.value === newNumberPage);
    
    // If it doesn't exist, add it to the list
    if (!exists && newNumberPage) {
      listNumberPage.value.push({
        name: newNumberPage.toString(),
        value: newNumberPage
      });
    }
    
    // Sort the list by value
    listNumberPage.value.sort((a, b) => a.value - b.value);
  },
  { immediate: true }
);
</script>

<template>
  <v-row v-if="props.pageCount"
    class="my-0 mx-0"
    style="align-items: center; border: 1px solid #dedede; border-top: none"
  >
    <v-col
      v-if="showTong && breakpointName !== 'xs'"
      class="flex py-0"
      style="max-width: 150px"
    >
      <span style="color: var(--main-color); font-weight: 700">Tổng số:</span>&nbsp;
      <span style="color: var(--main-color); font-weight: 700">{{ props.total }}</span>
    </v-col>

    <v-col class="py-0">
      <div class="flex text-center justify-center">
        <nav
          role="navigation"
          aria-label="Pagination Navigation"
          style="position: initial"
        >
          <ul class="v-pagination theme--light">
            <li>
              <button
                @click="firstPage"
                type="button"
                aria-label="Previous page"
                style="width: 32px; height: 32px"
                :title="`Trang đầu tiên: 1`"
                :class="
                  currentPage == 1
                    ? 'mx-0 v-pagination__navigation v-pagination__navigation--disabled'
                    : 'mx-0 v-pagination__navigation'
                "
              >
                <i
                  aria-hidden="true"
                  class="v-icon notranslate mdi mdi-chevron-double-left theme--light"
                ></i>
              </button>
            </li>
            <li>
              <button
                @click="prevPage"
                type="button"
                aria-label="Previous page"
                style="width: 32px; height: 32px"
                :class="
                  currentPage == 1
                    ? 'v-pagination__navigation v-pagination__navigation--disabled'
                    : 'v-pagination__navigation'
                "
                :title="`Trang trước: ${currentPage - 1}`"
              >
                <i
                  aria-hidden="true"
                  class="v-icon notranslate mdi mdi-chevron-left theme--light"
                ></i>
              </button>
            </li>
            <li class="v-pagination__item v-pagination__item--active primary">
              <!-- <button
                style="background: #fff"
                type="button"
                aria-current="true"
                class="px-2 v-pagination__item v-pagination__item--active primary"
              >
                {{ currentPage }} / {{ props.pageCount }}
              </button> -->
              <v-autocomplete
                class="input-form select-page"
                hide-no-data
                :items="listPage"
                @update:modelValue="updatePage"
                v-model="currentPagePagination"
                item-title="name"
                item-value="value"
                dense
                outlined
                hide-details="auto"
              >
              </v-autocomplete> 
              <!-- <span style="color: var(--main-color);"> / {{ props.pageCount }}</span> -->
            </li>
            <li>
              <button
                @click="nextPage"
                type="button"
                aria-label="Next page"
                style="width: 32px; height: 32px"
                :title="`Trang tiếp: ${currentPage + 1}`"
                :class="
                  currentPage == props.pageCount
                    ? 'v-pagination__navigation v-pagination__navigation--disabled'
                    : 'v-pagination__navigation'
                "
              >
                <i
                  aria-hidden="true"
                  class="v-icon notranslate mdi mdi-chevron-right theme--light"
                ></i>
              </button>
            </li>
            <li>
              <button
                @click="lastPage"
                type="button"
                aria-label="Next page"
                style="width: 32px; height: 32px"
                :title="`Trang cuối cùng: ${props.pageCount}`"
                :class="
                  currentPage == props.pageCount
                    ? 'mx-0 v-pagination__navigation v-pagination__navigation--disabled'
                    : 'mx-0 v-pagination__navigation'
                "
              >
                <i
                  aria-hidden="true"
                  class="v-icon notranslate mdi mdi-chevron-double-right theme--light"
                ></i>
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </v-col>
    <v-col v-if="breakpointName !== 'xs'" class="py-1" style="max-width: 160px; flex-direction: row;  display: flex; align-items: center;">
      <span style="color: var(--main-color); font-weight: 700">Hiển thị </span>
      <v-autocomplete
        class="input-form list-number-page"
        hide-no-data
        :items="listNumberPage"
        @update:modelValue="updateNumberPage" 
        :model-value="currentNumberPage"
        item-title="name"
        item-value="value"
        dense
        outlined
        hide-details="auto"
      >
      </v-autocomplete>
    </v-col>
  </v-row>
</template>


