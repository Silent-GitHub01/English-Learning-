<script setup lang="tsx">
import { nextTick, onMounted, useSlots } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  BaseButton,
  BaseIcon,
  BaseInput,
  BaseOptionButton,
  Checkbox,
  DeleteIcon,
  Dialog,
  MiniDialog,
  Pagination,
  PopConfirm,
  UploadButton,
} from '@typewords/base'
import { debounce } from '../utils'
import Empty from '../components/Empty.vue'
import { ENV } from '../config/env.ts'
import { Sort } from '../types'
import saveAs from 'file-saver'

const { t: $t } = useI18n()

const props = withDefaults(
  defineProps<{
    loading?: boolean
    showToolbar?: boolean
    showCheckbox?: boolean
    showPagination?: boolean
    exportXlsxLoading?: boolean
    exportJsonLoading?: boolean
    importLoading?: boolean
    request?: Function
    list?: any[]
  }>(),
  {
    loading: true,
    showCheckbox: false,
    showToolbar: true,
    showPagination: true,
    exportXlsxLoading: false,
    exportJsonLoading: false,
    importLoading: false,
  }
)

const emit = defineEmits<{
  add: []
  click: [
    val: {
      item: any
      index: number
    },
  ]
  importXlsx: [e: Event]
  importJson: [e: Event]
  exportXlsx: []
  exportJson: []
  del: [ids: number[]]
  sort: [type: Sort, pageNo: number, pageSize: number]
}>()

let listRef: any = $ref()
let showCheckbox = $ref(false)

function scrollToBottom() {
  nextTick(() => {
    listRef?.scrollTo(0, listRef.scrollHeight)
  })
}

function scrollToTop() {
  nextTick(() => {
    listRef?.scrollTo(0, 0)
  })
}

function scrollToItem(index: number) {
  nextTick(() => {
    listRef?.children[index]?.scrollIntoView({ block: 'center', behavior: 'smooth' })
  })
}

let selectIds = $ref([])
let selectAll = $computed(() => {
  return !!selectIds.length
})

function toggleSelect(item) {
  let rIndex = selectIds.findIndex(v => v === item.id)
  if (rIndex > -1) {
    selectIds.splice(rIndex, 1)
  } else {
    selectIds.push(item.id)
  }
}

function toggleSelectAll() {
  if (selectAll) {
    selectIds = []
  } else {
    selectIds = params.list.map(v => v.id)
  }
}

let showSortDialog = $ref(false)
let showSearchInput = $ref(false)
let showImportDialog = $ref(false)

const closeImportDialog = () => (showImportDialog = false)

function sort(type: Sort) {
  if ([Sort.reverse, Sort.random].includes(type)) {
    emit('sort', type, params.pageNo, params.pageSize)
  } else {
    emit('sort', type, 1, params.total)
  }
  showSortDialog = false
}

function handleBatchDel() {
  emit('del', selectIds)
  selectIds = []
}

const s = useSlots()

defineExpose({
  scrollToBottom,
  scrollToItem,
  closeImportDialog,
  getData,
})

let loading2 = $ref(false)

let params = $ref({
  pageNo: 1,
  pageSize: 50,
  total: 0,
  list: [],
  sortType: null,
  searchKey: '',
})

function search(key: string) {
  if (!params.searchKey) {
    params.pageNo = 1
  }
  params.searchKey = key
  getData()
}

function cancelSearch() {
  params.searchKey = ''
  showSearchInput = false
  getData()
}

async function getData() {
  if (props.request) {
    loading2 = true
    let { list, total } = await props.request(params)
    params.list = list
    params.total = total
    loading2 = false
  } else {
    params.list = props.list ?? []
  }
}

function handlePageNo(e) {
  params.pageNo = e
  getData()
  scrollToTop()
}

onMounted(async () => {
  getData()
})

function downloadJsonTemplate() {
  let data = {
    word: 'remote',
    phonetic0: ' rɪˈməʊt ',
    phonetic1: ' rɪˈmoʊt ',
    trans: [
      {
        pos: 'adj.',
        cn: '边远的，偏僻的；（距离或空间上）遥远的；（时间上）久远的；（机会或可能性）渺茫的；差别很大的，很不相同的；不友好的，冷漠的；远亲关系的；（电子设备）遥控的；（计算机）远程的，远程连接的',
      },
      {
        pos: 'n.',
        cn: '遥控装置，遥控器',
      },
    ],
    sentences: [
      {
        c: "I can't find the remote control.",
        cn: '我找不到遥控器。',
      },
      {
        c: 'It works by remote control.',
        cn: '它通过遥控工作。',
      },
      {
        c: 'The bomb was detonated by remote control.',
        cn: '炸弹通过遥控引爆。',
      },
    ],
    phrases: [
      {
        c: 'remote sensing',
        cn: '遥感；远距离读出',
      },
      {
        c: 'remote control',
        cn: 'n. 遥控；遥控装置',
      },
      {
        c: 'remote monitoring',
        cn: '远距离遥控',
      },
    ],
    synos: [
      {
        pos: 'adj.',
        cn: '遥远的；偏僻的；疏远的',
        ws: ['distant', 'lonely'],
      },
    ],
    relWords: {
      root: 'remote',
      rels: [
        {
          pos: 'adv.',
          words: [
            {
              c: 'remotely',
              cn: '遥远地；偏僻地',
            },
          ],
        },
        {
          pos: 'n.',
          words: [
            {
              c: 'remoteness',
              cn: '遥远；偏僻；细微；时间久远',
            },
          ],
        },
      ],
    },
    etymology: [
      {
        t: 'remote:遥远的；偏僻的',
        d: '词根词缀： re-向后,相反 + -mot-移动 + -e',
      },
      {
        t: 'remote:遥远的，远程的',
        d: 're-,向后，往回，-mot,移动，词源同 motion,remove.比喻用法。',
      },
    ],
  }
  const blob = new Blob([JSON.stringify([data], null, 2)], { type: 'application/json' })
  saveAs(blob, `单词json模板.json`)
}

defineRender(() => {
  const d = item => (
    <Checkbox modelValue={selectIds.includes(item.id)} onChange={() => toggleSelect(item)} size="large" />
  )

  return (
    <div class="base-table flex flex-col gap-3">
      {props.showToolbar && (
        <div>
          {showSearchInput ? (
            <div class="flex gap-4">
              <BaseInput
                clearable
                modelValue={params.searchKey}
                onUpdate:modelValue={debounce(e => search(e), 500)}
                class="flex-1"
                autofocus
              >
                {{
                  subfix: () => <IconFluentSearch24Regular class="text-lg text-gray" />,
                }}
              </BaseInput>
              <BaseButton onClick={cancelSearch}>{$t('cancel')}</BaseButton>
            </div>
          ) : (
            <div class="flex justify-between items-center">
              {showCheckbox ? (
                <div class="flex gap-2 items-center">
                  <Checkbox
                    disabled={!params.list.length}
                    onChange={() => toggleSelectAll()}
                    modelValue={selectAll}
                    size="large"
                  />
                  <span>
                    {selectIds.length} / {params.total}
                  </span>
                </div>
              ) : (
                <div>
                  {params.total}
                  {$t('total_items')}
                </div>
              )}

              <div class="flex gap-2 relative">
                {selectIds.length && showCheckbox ? (
                  <PopConfirm title={$t('confirm_delete_selected')} onConfirm={handleBatchDel}>
                    <BaseButton type="info">{$t('confirm')}</BaseButton>
                  </PopConfirm>
                ) : null}

                <BaseIcon onClick={() => (showCheckbox = !showCheckbox)} title={$t('batch_delete')}>
                  <DeleteIcon />
                </BaseIcon>
                <BaseIcon onClick={() => (showImportDialog = true)} title={$t('import')}>
                  <IconSystemUiconsImport />
                </BaseIcon>
                <BaseOptionButton
                  v-slots={{
                    options: () => (
                      <div class="flex flex-col gap-2">
                        <BaseButton class="w-full" onClick={() => emit('exportXlsx')}>
                          {props.exportXlsxLoading ? <IconEosIconsLoading /> : $t('export_as_xlsx')}
                        </BaseButton>
                        <BaseButton class="w-full" onClick={() => emit('exportJson')}>
                          {props.exportJsonLoading ? <IconEosIconsLoading /> : $t('export_as_json')}
                        </BaseButton>
                      </div>
                    ),
                  }}
                >
                  <BaseIcon>
                    <IconPhExportLight />
                  </BaseIcon>
                </BaseOptionButton>
                <BaseIcon onClick={() => emit('add')} title={$t('add_word')}>
                  <IconFluentAdd20Regular />
                </BaseIcon>
                <BaseIcon
                  disabled={!params.list.length}
                  title={$t('change_order')}
                  onClick={() => (showSortDialog = !showSortDialog)}
                >
                  <IconFluentArrowSort20Regular />
                </BaseIcon>
                <BaseIcon
                  disabled={!params.list.length}
                  onClick={() => (showSearchInput = !showSearchInput)}
                  title={$t('search')}
                >
                  <IconFluentSearch20Regular />
                </BaseIcon>
                <MiniDialog
                  modelValue={showSortDialog}
                  onUpdate:modelValue={e => (showSortDialog = e)}
                  style="width: 8rem;"
                >
                  <div class="mini-row-title">{$t('list_order_setting')}</div>
                  <div class="flex flex-col gap2 btn-no-margin">
                    <BaseButton onClick={() => sort(Sort.reverse)}>{$t('reverse_current_page')}</BaseButton>
                    <BaseButton onClick={() => sort(Sort.reverseAll)}>{$t('reverse_all')}</BaseButton>
                    <div class="line"></div>
                    <BaseButton onClick={() => sort(Sort.random)}>{$t('random_current_page')}</BaseButton>
                    <BaseButton onClick={() => sort(Sort.randomAll)}>{$t('random_all')}</BaseButton>
                  </div>
                </MiniDialog>
              </div>
            </div>
          )}
        </div>
      )}

      <div class="relative flex-1 overflow-hidden">
        {params.list.length ? (
          <div class="overflow-auto h-full" ref={e => (listRef = e)}>
            {params.list.map((item, index) => {
              return (
                <div class="list-item-wrapper" key={item.word}>
                  {s.default({
                    checkbox: showCheckbox ? d : () => void 0,
                    item,
                    index: params.pageSize * (params.pageNo - 1) + index + 1,
                  })}
                </div>
              )
            })}
          </div>
        ) : !loading2 ? (
          <Empty />
        ) : null}
        {loading2 && (
          <div class="absolute top-0 left-0 bottom-0 right-0 bg-black bg-op-10  center text-4xl">
            <IconEosIconsLoading color="gray" />
          </div>
        )}
      </div>

      {props.showPagination && (
        <div class="flex justify-end">
          <Pagination
            currentPage={params.pageNo}
            onUpdate:current-page={handlePageNo}
            pageSize={params.pageSize}
            onUpdate:page-size={e => (params.pageSize = e)}
            pageSizes={[20, 50, 100, 200]}
            layout="total,sizes"
            total={params.total}
          />
        </div>
      )}

      <Dialog modelValue={showImportDialog} onUpdate:modelValue={closeImportDialog} title={$t('import_tutorial')}>
        <div className="w-100 p-4 pt-0">
          <div>{$t('import_follow_template')}</div>
          <div class="color-red">{$t('import_word_required')}</div>
          <div>{$t('import_translation_hint')}</div>
          <div>
            {$t('import_example_hint')}
            <span class="color-red">{$t('two')}</span>
            {$t('lines')}
          </div>
          <div>
            {$t('import_phrase_hint')}
            <span class="color-red">{$t('two')}</span>
            {$t('lines')}
          </div>
          <div>{$t('import_other_hint')}</div>
          <div class="mt-6">
            {$t('xlsx_template_download')}：
            <a href={`${ENV.RESOURCE_URL}/libs/单词导入模板.xlsx`}>{$t('word_import_template')}</a>
          </div>
          <div class="mt-6">
            json模板下载地址：
            <a onClick={downloadJsonTemplate} class="cursor-pointer">
              单词json模板
            </a>
          </div>
          <div class="mt-4">
            <UploadButton
              accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
              onChange={e => emit('importXlsx', e)}
              loading={props.importLoading}
            >
              {$t('import_xlsx')}
            </UploadButton>
            <UploadButton accept=".json" onChange={e => emit('importJson', e)} loading={props.importLoading}>
              {$t('import_json')}
            </UploadButton>
          </div>
        </div>
      </Dialog>
    </div>
  )
})
</script>
<style scoped lang="scss"></style>
