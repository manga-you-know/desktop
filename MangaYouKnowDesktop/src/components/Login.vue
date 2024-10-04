<script setup lang="ts">
import { object, string, type InferType } from 'yup'
import type { FormSubmitEvent } from '#ui/types'
import type { User } from '~/models'
import { migrationQuery, UserDB } from '~/database';
import Database from '@tauri-apps/plugin-sql';

const user = useState<User>('user')
const isLogged = useState<Boolean>('isLogged', () => false)
const schema = object({
  username: string()
    .required('Required')
    .max(20, 'Must be at most 20 characters'),
  email: string()
    .email('Invalid email')
    .required('Required'),
  password: string()
    .min(8, 'Must be at least 8 characters')
    .required('Required')
})

type Schema = InferType<typeof schema>

const state = reactive({
  username: undefined,
  email: undefined,
  password: undefined
})


async function onSubmit (event: FormSubmitEvent<Schema>) {
  // Do something with event.data
  console.log(event.data)
}

async function onSubmitDefault () {
  const db = await Database.load('sqlite:mykdata.db');
  await db.execute(migrationQuery);
  const defaultuser = await UserDB.getDefaultUser()
  user.value = defaultuser
  console.log(defaultuser)
  isLogged.value = true
}
</script>

<template>
  <div class="h-screen flex flex-col items-center justify-center">
    <UForm :schema="schema" :state="state" class="gap-4" @submit="onSubmit">
      <UInput color="cyan" disabled v-model="state.username" />
      <UInput color="cyan" disabled v-model="state.email" />
      <UInput color="cyan" disabled v-model="state.password" type="password" />
      <UButton 
        color="cyan"
        disabled 
        type="submit"
      >
        Submit
      </UButton>
      <UButton color="cyan" variant="link" @click="onSubmitDefault"> 
        Use default local account
      </UButton>
    </UForm>
  </div>
</template>
