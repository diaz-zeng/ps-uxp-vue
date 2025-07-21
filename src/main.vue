<script setup lang="ts">
import { uxp, photoshop, } from './globals'; import { reactive, ref } from 'vue';
import { FormInstance } from 'element-plus';
;

const uploadImage = async () => {


  const fs = uxp.storage.localFileSystem
  const file = await fs.getFileForOpening({
    types: ['jpg', 'jpeg', 'png', 'gif', 'psd', 'tiff', 'bmp'],
    allowMultiple: false
  })



  if (file) {

    moduleExecute(async (cxt) => {


      console.log(uxp.versions.uxp, file, file.nativePath);

      const entry = await fs.getEntryWithUrl(`file:${file.nativePath}`)
      let token = fs.createSessionToken(entry);
      await photoshop.action.batchPlay([{
        _obj: "placeEvent",
        "target": {
          _path: token, // Rather than a system path, this expects a session token
          _kind: "local",
        },
      }
      ], {});


    }, 'insertImage')


  }

}
const moduleExecute = (func: (executionContext: ExecutionContext) => Promise<unknown>, commandName: string) => {

  photoshop.core.executeAsModal(func, { commandName })
}

const form = reactive({ content: '', fontSize: 24, fontColor: '#FF0000' })

const formRef = ref<FormInstance>()

const onSubmit = () => {
  formRef.value?.validate().then(res => {
    moduleExecute(async (cxt) => {
      const color = new photoshop.app.SolidColor(photoshop.constants.ColorModel.RGB)

      color.rgb.hexValue = form.fontColor
      photoshop.app.activeDocument.createTextLayer({ contents: form.content, fontSize: form.fontSize, textColor: color })
    }, 'Create Text Layer')

  })
}


const exportAsPNG = async (targetFilePath: string) => {
  moduleExecute(async () => {
    await photoshop.action.batchPlay(
      [
        {
          "_obj": "save",
          "as": {
            "_obj": "PNGFormat",
            "compression": 6,
            "interlaced": false
          },
          "in": {
            "_path": targetFilePath,
            "_kind": "local"
          },
          "copy": true,
          "lowerCase": true,
          "saveStage": {
            "_enum": "saveStageType",
            "_value": "saveBegin"
          },
          "_options": {
            "dialogOptions": "dontDisplay"
          }
        }
      ],
      { "synchronousExecution": false }
    );
  }, 'Export Image')
}

const exportCurrentDocAsPng = async () => {
  const file = await uxp.storage.localFileSystem.getFileForSaving("导出.png", { types: ['png'] });
  if (file) {
    await exportAsPNG(file.nativePath);
  }
}

</script>

<template>
  <main>
    <el-card>
      <el-form ref="formRef" :model="form">
        <el-form-item :rules="[{ required: true }]" name="content" label="文本内容">
          <el-input v-model="form.content" size="small"></el-input>
        </el-form-item>

        <el-form-item :rules="[{ required: true }]" name="fontSize" label="文本大小">
          <el-input-number type="color" v-model="form.fontSize"></el-input-number>
        </el-form-item>
        <el-form-item :rules="[{ required: true }]" name="fontColor" label="文本颜色">
          <el-input v-model="form.fontColor"></el-input>
        </el-form-item>
        <el-form-item>

          <el-button @click="uploadImage">Add image</el-button>
          <el-button @click="onSubmit">Create text layer</el-button>
          <el-button @click="exportCurrentDocAsPng">Export to PNG</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </main>


</template>

<style lang="scss">
@use "./variables.scss" as *;
</style>
